/**
 * Tests for Enhancement Batch:
 * 1. WebSocket notification server (unit tests for module logic)
 * 2. Health-check cron with auto-disable
 * 3. Recharts analytics (covered by existing tRPC procedure tests — no server-side changes)
 */

/* ─── Mock DB ─── */
vi.mock("./db", () => ({
  getDb: vi.fn(async () => null),
  createNotification: vi.fn(async () => 1),
  getUserNotifications: vi.fn(async () => []),
  getUnreadNotificationCount: vi.fn(async () => 0),
  markNotificationRead: vi.fn(async () => {}),
  markAllNotificationsRead: vi.fn(async () => {}),
  getUserApiKeys: vi.fn(async () => []),
  createApiKey: vi.fn(async () => 1),
  deleteApiKey: vi.fn(async () => {}),
  updateApiKeyPriority: vi.fn(async () => {}),
  toggleApiKey: vi.fn(async () => {}),
  trackEvent: vi.fn(async () => {}),
  getAnalyticsSummary: vi.fn(async () => ({
    totalMessages: 0,
    totalEvents: 0,
    eventsByType: {},
  })),
  getAnalyticsTimeline: vi.fn(async () => []),
  getFailoverLogs: vi.fn(async () => []),
  saveConversation: vi.fn(async () => 1),
  getUserConversations: vi.fn(async () => []),
  getConversationById: vi.fn(async () => null),
  deleteConversation: vi.fn(async () => {}),
}));

/* ─── Mock LLM failover ─── */
const mockHealthCheckKey = vi.fn(async () => ({
  healthy: true,
  latencyMs: 100,
}));

vi.mock("./llm-failover", () => ({
  healthCheckKey: mockHealthCheckKey,
  healthCheckAllKeys: vi.fn(async () => []),
  chatWithFailover: vi.fn(async () => ({
    content: "test",
    model: "test",
    provider: "test",
    usage: {},
    failoverChain: [],
    usedManusFallback: false,
  })),
  PROVIDERS: {
    openai: {
      id: "openai",
      name: "OpenAI",
      defaultModel: "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
    },
    anthropic: {
      id: "anthropic",
      name: "Anthropic Claude",
      defaultModel: "claude-3-5-sonnet-20241022",
      baseUrl: "https://api.anthropic.com/v1",
    },
  },
}));

/* ─── Mock notification helper ─── */
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

/* ─── Mock ws-notifications ─── */
const mockPushNotification = vi.fn();
vi.mock("./ws-notifications", () => ({
  pushNotification: mockPushNotification,
  attachWebSocket: vi.fn(),
  broadcastNotification: vi.fn(),
  getConnectedUserCount: vi.fn(() => 0),
  getConnectedSocketCount: vi.fn(() => 0),
}));

/* ═══════════════════════════════════════════════════════════════
   1. WebSocket Notification Server Tests
   ═══════════════════════════════════════════════════════════════ */

describe("WebSocket notification module", () => {
  it("exports required functions", async () => {
    const ws = await import("./ws-notifications");
    expect(typeof ws.attachWebSocket).toBe("function");
    expect(typeof ws.pushNotification).toBe("function");
    expect(typeof ws.broadcastNotification).toBe("function");
    expect(typeof ws.getConnectedUserCount).toBe("function");
    expect(typeof ws.getConnectedSocketCount).toBe("function");
  });

  it("getConnectedUserCount returns a number", async () => {
    const ws = await import("./ws-notifications");
    const count = ws.getConnectedUserCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("getConnectedSocketCount returns a number", async () => {
    const ws = await import("./ws-notifications");
    const count = ws.getConnectedSocketCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("pushNotification can be called without error when no sockets connected", async () => {
    const ws = await import("./ws-notifications");
    // Should not throw even with no connected sockets
    expect(() =>
      ws.pushNotification(1, {
        id: 1,
        userId: 1,
        type: "test",
        title: "Test",
        message: "Test message",
        severity: "info",
        createdAt: new Date().toISOString(),
      })
    ).not.toThrow();
  });

  it("broadcastNotification can be called without error", async () => {
    const ws = await import("./ws-notifications");
    expect(() =>
      ws.broadcastNotification({
        id: 1,
        type: "system",
        title: "System Alert",
        message: "Test broadcast",
        severity: "warning",
        createdAt: new Date().toISOString(),
      })
    ).not.toThrow();
  });
});

/* ═══════════════════════════════════════════════════════════════
   2. Health-Check Cron Tests
   ═══════════════════════════════════════════════════════════════ */

describe("Health-check cron module", () => {
  it("exports required functions", async () => {
    const cron = await import("./health-cron");
    expect(typeof cron.startHealthCheckCron).toBe("function");
    expect(typeof cron.stopHealthCheckCron).toBe("function");
    expect(typeof cron.runHealthChecks).toBe("function");
    expect(typeof cron.getFailureCount).toBe("function");
    expect(typeof cron.resetFailureCounts).toBe("function");
  });

  it("runHealthChecks returns stats object when DB is null", async () => {
    const cron = await import("./health-cron");
    const stats = await cron.runHealthChecks();
    expect(stats).toHaveProperty("checked");
    expect(stats).toHaveProperty("healthy");
    expect(stats).toHaveProperty("failed");
    expect(stats).toHaveProperty("autoDisabled");
    // With null DB, nothing is checked
    expect(stats.checked).toBe(0);
    expect(stats.healthy).toBe(0);
    expect(stats.failed).toBe(0);
    expect(stats.autoDisabled).toBe(0);
  });

  it("getFailureCount returns 0 for unknown key", async () => {
    const cron = await import("./health-cron");
    expect(cron.getFailureCount(999)).toBe(0);
  });

  it("resetFailureCounts clears all counters", async () => {
    const cron = await import("./health-cron");
    cron.resetFailureCounts();
    expect(cron.getFailureCount(1)).toBe(0);
    expect(cron.getFailureCount(2)).toBe(0);
  });

  it("startHealthCheckCron and stopHealthCheckCron do not throw", async () => {
    const cron = await import("./health-cron");
    expect(() => cron.startHealthCheckCron()).not.toThrow();
    expect(() => cron.stopHealthCheckCron()).not.toThrow();
  });

  it("runHealthChecks with mock DB and keys processes correctly", async () => {
    // This test verifies the function shape works with a mock DB
    // The actual DB interaction is mocked, so we test the control flow
    const { getDb } = await import("./db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([
            {
              id: 1,
              userId: 1,
              provider: "openai",
              apiKey: "sk-test",
              label: "Test Key",
              priority: 0,
              status: "unchecked",
              enabled: 1,
            },
          ]),
        }),
      }),
    });
    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    });

    (getDb as any).mockResolvedValueOnce({
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
    });

    // Mock healthCheckKey to return healthy
    mockHealthCheckKey.mockResolvedValueOnce({
      healthy: true,
      latencyMs: 150,
    });

    const cron = await import("./health-cron");
    cron.resetFailureCounts();
    const stats = await cron.runHealthChecks();

    expect(stats.checked).toBe(1);
    expect(stats.healthy).toBe(1);
    expect(stats.failed).toBe(0);
    expect(stats.autoDisabled).toBe(0);
  });

  it("runHealthChecks increments failure count on unhealthy key", async () => {
    const { getDb } = await import("./db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([
            {
              id: 42,
              userId: 1,
              provider: "openai",
              apiKey: "sk-bad",
              label: "Bad Key",
              priority: 0,
              status: "unchecked",
              enabled: 1,
            },
          ]),
        }),
      }),
    });
    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });

    (getDb as any).mockResolvedValueOnce({
      select: mockSelect,
      update: mockUpdate,
    });

    mockHealthCheckKey.mockResolvedValueOnce({
      healthy: false,
      latencyMs: 5000,
      error: "Timeout",
    });

    const cron = await import("./health-cron");
    cron.resetFailureCounts();
    const stats = await cron.runHealthChecks();

    expect(stats.checked).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.autoDisabled).toBe(0); // Only 1 failure, need 3
    expect(cron.getFailureCount(42)).toBe(1);
  });

  it("runHealthChecks auto-disables after 3 consecutive failures", async () => {
    const { getDb } = await import("./db");
    const cron = await import("./health-cron");
    cron.resetFailureCounts();

    const keyRecord = {
      id: 99,
      userId: 1,
      provider: "openai",
      apiKey: "sk-dying",
      label: "Dying Key",
      priority: 0,
      status: "unchecked",
      enabled: 1,
    };

    // Run 3 consecutive failures
    for (let i = 0; i < 3; i++) {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([keyRecord]),
          }),
        }),
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: i + 1 }]),
      });

      (getDb as any).mockResolvedValueOnce({
        select: mockSelect,
        update: mockUpdate,
        insert: mockInsert,
      });

      mockHealthCheckKey.mockResolvedValueOnce({
        healthy: false,
        latencyMs: 5000,
        error: `Failure #${i + 1}`,
      });

      const stats = await cron.runHealthChecks();

      if (i < 2) {
        expect(stats.autoDisabled).toBe(0);
        expect(cron.getFailureCount(99)).toBe(i + 1);
      } else {
        // 3rd failure triggers auto-disable
        expect(stats.autoDisabled).toBe(1);
        // Counter should be cleared after auto-disable
        expect(cron.getFailureCount(99)).toBe(0);
      }
    }

    // Verify WebSocket push was called for the auto-disable notification
    expect(mockPushNotification).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        type: "api_key_disabled",
        userId: 1,
      })
    );

    // Verify owner was notified
    const { notifyOwner } = await import("./_core/notification");
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Auto-Disabled"),
      })
    );
  });
});

/* ═══════════════════════════════════════════════════════════════
   3. Client-side hook (structure test — verify export shape)
   ═══════════════════════════════════════════════════════════════ */

describe("useWebSocketNotifications hook file", () => {
  it("hook module exists and exports useWebSocketNotifications", async () => {
    // We can't render React hooks in vitest without jsdom, but we can
    // verify the module exports the right shape
    const hookModule = await import(
      "../client/src/hooks/useWebSocketNotifications"
    );
    expect(typeof hookModule.useWebSocketNotifications).toBe("function");
  });
});
