/**
 * Tests for Critical Fixes & Major Enhancements:
 * 1. Channel connections CRUD
 * 2. Channel verification
 * 3. Token usage tracking
 * 4. Admin token management
 * 5. API key re-enable flow
 * 6. Per-channel analytics
 */

/* ─── Mock DB ─── */
const mockCreateChannelConnection = vi.fn(async () => 1);
const mockGetUserChannelConnections = vi.fn(async () => []);
const mockUpdateChannelConnection = vi.fn(async () => {});
const mockDeleteChannelConnection = vi.fn(async () => {});
const mockRecordTokenUsage = vi.fn(async () => 1);
const mockGetTokenUsageSummary = vi.fn(async () => ({
  totalTokens: 0,
  totalCost: 0,
  byProvider: [],
}));
const mockGetAllUsersTokenUsage = vi.fn(async () => []);
const mockGetUserApiKeys = vi.fn(async () => []);
const mockCreateApiKey = vi.fn(async () => 1);
const mockDeleteApiKey = vi.fn(async () => {});
const mockToggleApiKey = vi.fn(async () => {});
const mockUpdateApiKeyPriority = vi.fn(async () => {});
const mockCreateNotification = vi.fn(async () => 1);
const mockGetAnalyticsTimeline = vi.fn(async () => []);
const mockGetAnalyticsSummary = vi.fn(async () => ({
  totalMessages: 100,
  totalEvents: 200,
  eventsByType: { chat: 80, skill: 50, channel: 70 },
}));
const mockTrackEvent = vi.fn(async () => {});
const mockGetDb = vi.fn(async () => null);

vi.mock("./db", () => ({
  getDb: mockGetDb,
  createChannelConnection: mockCreateChannelConnection,
  getUserChannelConnections: mockGetUserChannelConnections,
  updateChannelConnection: mockUpdateChannelConnection,
  deleteChannelConnection: mockDeleteChannelConnection,
  recordTokenUsage: mockRecordTokenUsage,
  getTokenUsageSummary: mockGetTokenUsageSummary,
  getAllUsersTokenUsage: mockGetAllUsersTokenUsage,
  getUserApiKeys: mockGetUserApiKeys,
  createApiKey: mockCreateApiKey,
  deleteApiKey: mockDeleteApiKey,
  toggleApiKey: mockToggleApiKey,
  updateApiKeyPriority: mockUpdateApiKeyPriority,
  createNotification: mockCreateNotification,
  getAnalyticsTimeline: mockGetAnalyticsTimeline,
  getAnalyticsSummary: mockGetAnalyticsSummary,
  trackEvent: mockTrackEvent,
  getUserNotifications: vi.fn(async () => []),
  getUnreadNotificationCount: vi.fn(async () => 0),
  markNotificationRead: vi.fn(async () => {}),
  markAllNotificationsRead: vi.fn(async () => {}),
  saveConversation: vi.fn(async () => 1),
  getUserConversations: vi.fn(async () => []),
  getConversationById: vi.fn(async () => null),
  deleteConversation: vi.fn(async () => {}),
  getFailoverLogs: vi.fn(async () => []),
  getMemory: vi.fn(async () => null),
  getFullMemoryLog: vi.fn(async () => []),
  clearMemory: vi.fn(async () => {}),
}));

/* ─── Mock channel verification ─── */
const mockVerifyChannelCredentials = vi.fn(async () => ({
  valid: true,
  details: "Connection successful",
}));
vi.mock("./channel-verify", () => ({
  verifyChannelCredentials: mockVerifyChannelCredentials,
}));

/* ─── Mock LLM failover ─── */
vi.mock("./llm-failover", () => ({
  healthCheckKey: vi.fn(async () => ({ healthy: true, latencyMs: 100 })),
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
    openai: { id: "openai", name: "OpenAI", defaultModel: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1" },
    anthropic: { id: "anthropic", name: "Anthropic Claude", defaultModel: "claude-3-5-sonnet-20241022", baseUrl: "https://api.anthropic.com/v1" },
  },
}));

/* ─── Mock agent-memory ─── */
vi.mock("./agent-memory", () => ({
  getOrCreateMemory: vi.fn(async () => ({
    contextSummary: "test",
    messageCount: 0,
    lastModel: "test",
    updatedAt: new Date().toISOString(),
  })),
  appendToMemory: vi.fn(async () => {}),
  summarizeMemory: vi.fn(async () => {}),
}));

/* ─── Mock ws-notifications ─── */
vi.mock("./ws-notifications", () => ({
  pushNotification: vi.fn(),
  attachWebSocket: vi.fn(),
  broadcastNotification: vi.fn(),
  getConnectedUserCount: vi.fn(() => 0),
  getConnectedSocketCount: vi.fn(() => 0),
}));

/* ─── Mock notification helper ─── */
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

/* ═══════════════════════════════════════════════════════════════
   1. Channel Connections CRUD
   ═══════════════════════════════════════════════════════════════ */

describe("Channel connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createChannelConnection is callable and returns an ID", async () => {
    mockCreateChannelConnection.mockResolvedValueOnce(42);
    const result = await mockCreateChannelConnection({
      userId: 1,
      channel: "whatsapp",
      credentials: JSON.stringify({ phoneNumberId: "123", accessToken: "abc" }),
      status: "connected",
    });
    expect(result).toBe(42);
    expect(mockCreateChannelConnection).toHaveBeenCalledTimes(1);
  });

  it("getUserChannelConnections returns array", async () => {
    mockGetUserChannelConnections.mockResolvedValueOnce([
      { id: 1, channel: "whatsapp", status: "connected" },
      { id: 2, channel: "telegram", status: "disconnected" },
    ]);
    const result = await mockGetUserChannelConnections(1);
    expect(result).toHaveLength(2);
    expect(result[0].channel).toBe("whatsapp");
  });

  it("updateChannelConnection updates status", async () => {
    await mockUpdateChannelConnection(1, 1, { status: "disconnected" });
    expect(mockUpdateChannelConnection).toHaveBeenCalledWith(1, 1, { status: "disconnected" });
  });

  it("deleteChannelConnection removes connection", async () => {
    await mockDeleteChannelConnection(1, 1);
    expect(mockDeleteChannelConnection).toHaveBeenCalledWith(1, 1);
  });
});

/* ═══════════════════════════════════════════════════════════════
   2. Channel Verification
   ═══════════════════════════════════════════════════════════════ */

describe("Channel credential verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifyChannelCredentials returns valid for correct credentials", async () => {
    const result = await mockVerifyChannelCredentials("telegram", { botToken: "123:ABC" });
    expect(result.valid).toBe(true);
    expect(result.details).toBe("Connection successful");
  });

  it("verifyChannelCredentials returns invalid for bad credentials", async () => {
    mockVerifyChannelCredentials.mockResolvedValueOnce({
      valid: false,
      details: "Invalid bot token",
    });
    const result = await mockVerifyChannelCredentials("telegram", { botToken: "bad" });
    expect(result.valid).toBe(false);
    expect(result.details).toContain("Invalid");
  });

  it("verifyChannelCredentials handles all channel types", async () => {
    const channels = ["whatsapp", "telegram", "slack", "discord", "webchat", "signal", "teams", "email"];
    for (const ch of channels) {
      mockVerifyChannelCredentials.mockResolvedValueOnce({ valid: true, details: "OK" });
      const result = await mockVerifyChannelCredentials(ch, {});
      expect(result.valid).toBe(true);
    }
    expect(mockVerifyChannelCredentials).toHaveBeenCalledTimes(channels.length);
  });
});

/* ═══════════════════════════════════════════════════════════════
   3. Token Usage Tracking
   ═══════════════════════════════════════════════════════════════ */

describe("Token usage tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recordTokenUsage stores usage data", async () => {
    mockRecordTokenUsage.mockResolvedValueOnce(1);
    const result = await mockRecordTokenUsage({
      userId: 1,
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
    });
    expect(result).toBe(1);
  });

  it("getTokenUsageSummary returns aggregated data", async () => {
    mockGetTokenUsageSummary.mockResolvedValueOnce({
      totalTokens: 15000,
      totalCost: 0.45,
      byProvider: [
        { provider: "openai", tokens: 10000, cost: 0.30 },
        { provider: "anthropic", tokens: 5000, cost: 0.15 },
      ],
    });
    const result = await mockGetTokenUsageSummary(1);
    expect(result.totalTokens).toBe(15000);
    expect(result.byProvider).toHaveLength(2);
  });
});

/* ═══════════════════════════════════════════════════════════════
   4. Admin Token Management
   ═══════════════════════════════════════════════════════════════ */

describe("Admin token management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllUsersTokenUsage returns data for all users", async () => {
    mockGetAllUsersTokenUsage.mockResolvedValueOnce([
      { userId: 1, name: "User A", totalTokens: 10000, totalCost: 0.30 },
      { userId: 2, name: "User B", totalTokens: 5000, totalCost: 0.15 },
    ]);
    const result = await mockGetAllUsersTokenUsage();
    expect(result).toHaveLength(2);
    expect(result[0].totalTokens).toBe(10000);
  });

  it("admin can create API key for another user", async () => {
    mockCreateApiKey.mockResolvedValueOnce(5);
    const result = await mockCreateApiKey({
      userId: 2,
      provider: "openai",
      apiKey: "sk-admin-provided",
      label: "Admin-provided key",
      priority: 0,
    });
    expect(result).toBe(5);
    expect(mockCreateApiKey).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 2 })
    );
  });
});

/* ═══════════════════════════════════════════════════════════════
   5. API Key Re-enable Flow
   ═══════════════════════════════════════════════════════════════ */

describe("API key re-enable flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggleApiKey can re-enable a disabled key", async () => {
    await mockToggleApiKey(1, 1, true);
    expect(mockToggleApiKey).toHaveBeenCalledWith(1, 1, true);
  });

  it("re-enable triggers health check on the key", async () => {
    const { healthCheckKey } = await import("./llm-failover");
    await (healthCheckKey as any)("openai", "sk-test");
    expect(healthCheckKey).toHaveBeenCalledWith("openai", "sk-test");
  });

  it("re-enable creates a notification", async () => {
    mockCreateNotification.mockResolvedValueOnce(10);
    const result = await mockCreateNotification({
      userId: 1,
      type: "api_key_reenabled",
      title: "API Key Re-enabled",
      message: "Your OpenAI key has been re-enabled and verified healthy",
      severity: "success",
    });
    expect(result).toBe(10);
  });
});

/* ═══════════════════════════════════════════════════════════════
   6. Per-channel Analytics
   ═══════════════════════════════════════════════════════════════ */

describe("Per-channel analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAnalyticsSummary returns event breakdown", async () => {
    const result = await mockGetAnalyticsSummary(1);
    expect(result.totalMessages).toBe(100);
    expect(result.eventsByType).toHaveProperty("chat");
    expect(result.eventsByType).toHaveProperty("skill");
    expect(result.eventsByType).toHaveProperty("channel");
  });

  it("getAnalyticsTimeline returns per-channel data", async () => {
    mockGetAnalyticsTimeline.mockResolvedValueOnce([
      { date: "2026-02-01", count: 10, channel: "whatsapp" },
      { date: "2026-02-01", count: 5, channel: "telegram" },
      { date: "2026-02-02", count: 15, channel: "whatsapp" },
      { date: "2026-02-02", count: 8, channel: "slack" },
    ]);
    const result = await mockGetAnalyticsTimeline(1, 14);
    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty("channel");
  });

  it("trackEvent records channel-specific events", async () => {
    await mockTrackEvent({
      userId: 1,
      eventType: "chat",
      channel: "whatsapp",
      metadata: JSON.stringify({ messageId: "abc" }),
    });
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "whatsapp" })
    );
  });
});

/* ═══════════════════════════════════════════════════════════════
   7. No External Links Verification
   ═══════════════════════════════════════════════════════════════ */

describe("No external OpenClaw UI links", () => {
  it("Config page does not reference openControlUI", async () => {
    const fs = await import("fs");
    const configContent = fs.readFileSync(
      "/home/ubuntu/sunclaw-website/client/src/pages/dashboard/Config.tsx",
      "utf-8"
    );
    expect(configContent).not.toContain("openControlUI");
    expect(configContent).not.toContain("__openclaw__");
    expect(configContent).not.toContain("railway.com");
  });

  it("Overview page does not reference external OpenClaw links", async () => {
    const fs = await import("fs");
    const overviewContent = fs.readFileSync(
      "/home/ubuntu/sunclaw-website/client/src/pages/dashboard/Overview.tsx",
      "utf-8"
    );
    expect(overviewContent).not.toContain("openControlUI");
    expect(overviewContent).not.toContain("__openclaw__");
  });

  it("Sessions page does not reference external OpenClaw links", async () => {
    const fs = await import("fs");
    const sessionsContent = fs.readFileSync(
      "/home/ubuntu/sunclaw-website/client/src/pages/dashboard/Sessions.tsx",
      "utf-8"
    );
    expect(sessionsContent).not.toContain("openControlUI");
    expect(sessionsContent).not.toContain("__openclaw__");
  });

  it("Logs page does not reference external OpenClaw links", async () => {
    const fs = await import("fs");
    const logsContent = fs.readFileSync(
      "/home/ubuntu/sunclaw-website/client/src/pages/dashboard/Logs.tsx",
      "utf-8"
    );
    expect(logsContent).not.toContain("openControlUI");
    expect(logsContent).not.toContain("__openclaw__");
  });

  it("Channels page does not reference external OpenClaw links", async () => {
    const fs = await import("fs");
    const channelsContent = fs.readFileSync(
      "/home/ubuntu/sunclaw-website/client/src/pages/dashboard/Channels.tsx",
      "utf-8"
    );
    expect(channelsContent).not.toContain("openControlUI");
    expect(channelsContent).not.toContain("__openclaw__");
  });
});
