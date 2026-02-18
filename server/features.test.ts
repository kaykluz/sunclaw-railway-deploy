import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createAuthContext({ role: "admin" });
}

// Mock the database helpers
vi.mock("./db", () => {
  const waitlistStore: Array<{
    id: number;
    email: string;
    name?: string | null;
    company?: string | null;
    role?: string | null;
    source?: string | null;
    createdAt: Date;
  }> = [];
  const configStore: Array<{
    id: number;
    userId: number;
    name: string;
    config: unknown;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const deployStore: Array<{
    id: number;
    userId: number;
    configurationId?: number | null;
    method: string;
    status: string;
    instanceName?: string | null;
    externalId?: string | null;
    externalUrl?: string | null;
    metadata?: unknown;
    createdAt: Date;
  }> = [];
  let waitlistIdCounter = 0;
  let configIdCounter = 0;
  let deployIdCounter = 0;

  return {
    addToWaitlist: vi.fn(
      async (entry: { email: string; name?: string | null }) => {
        const existing = waitlistStore.find((e) => e.email === entry.email);
        if (existing) {
          return { success: true, alreadyExists: true };
        }
        waitlistIdCounter++;
        waitlistStore.push({
          id: waitlistIdCounter,
          ...entry,
          createdAt: new Date(),
        });
        return { success: true, alreadyExists: false };
      }
    ),
    getWaitlistCount: vi.fn(async () => waitlistStore.length),
    getWaitlistEntries: vi.fn(async (limit?: number, offset?: number) => {
      return waitlistStore.slice(
        offset ?? 0,
        (offset ?? 0) + (limit ?? 100)
      );
    }),
    saveConfiguration: vi.fn(
      async (entry: { userId: number; name: string; config: unknown }) => {
        configIdCounter++;
        configStore.push({
          id: configIdCounter,
          userId: entry.userId,
          name: entry.name,
          config: entry.config,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return configIdCounter;
      }
    ),
    updateConfiguration: vi.fn(async () => {}),
    getUserConfigurations: vi.fn(async (userId: number) => {
      return configStore.filter((c) => c.userId === userId);
    }),
    getConfigurationById: vi.fn(async (id: number, userId: number) => {
      return configStore.find((c) => c.id === id && c.userId === userId);
    }),
    deleteConfiguration: vi.fn(async () => {}),
    createDeployment: vi.fn(
      async (entry: {
        userId: number;
        method: string;
        status: string;
        instanceName?: string | null;
        configurationId?: number | null;
      }) => {
        deployIdCounter++;
        deployStore.push({
          id: deployIdCounter,
          ...entry,
          createdAt: new Date(),
        });
        return deployIdCounter;
      }
    ),
    updateDeploymentStatus: vi.fn(async () => {}),
    getUserDeployments: vi.fn(async (userId: number) => {
      return deployStore.filter((d) => d.userId === userId);
    }),
    getAllDeployments: vi.fn(async (limit?: number, offset?: number) => {
      return deployStore.slice(
        offset ?? 0,
        (offset ?? 0) + (limit ?? 100)
      );
    }),
    getAllConfigurations: vi.fn(async (limit?: number, offset?: number) => {
      return configStore.slice(
        offset ?? 0,
        (offset ?? 0) + (limit ?? 100)
      );
    }),
    getDb: vi.fn(async () => null),
    upsertUser: vi.fn(async () => {}),
    getUserByOpenId: vi.fn(async () => undefined),
    getUserById: vi.fn(async (id: number) => ({
      id,
      openId: "test-user-123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      plan: "free",
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateUserStripeCustomer: vi.fn(async () => {}),
    countUserDeployments: vi.fn(async () => 0),
    // New feature mocks
    createApiKey: vi.fn(async () => 1),
    getUserApiKeys: vi.fn(async () => []),
    getUserApiKeysWithSecrets: vi.fn(async () => []),
    deleteApiKey: vi.fn(async () => {}),
    updateApiKeyPriority: vi.fn(async () => {}),
    updateApiKeyStatus: vi.fn(async () => {}),
    toggleApiKey: vi.fn(async () => {}),
    saveConversation: vi.fn(async () => 1),
    getUserConversations: vi.fn(async () => []),
    getConversationById: vi.fn(async (id: number) => ({
      id,
      userId: 1,
      title: "Test Conversation",
      messages: [{role:"user",content:"Hello"},{role:"assistant",content:"Hi!"}],
      messageCount: 2,
      model: "gpt-4",
      createdAt: new Date(),
    })),
    deleteConversation: vi.fn(async () => {}),
    trackEvent: vi.fn(async () => {}),
    getAnalyticsSummary: vi.fn(async () => ({
      totalMessages: 42,
      totalEvents: 100,
      eventsByType: { message_sent: 42, skill_invoked: 30, failover_triggered: 5 },
    })),
    getAnalyticsTimeline: vi.fn(async (_userId: number, days: number) => {
      return Array.from({ length: days ?? 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        messages: 5,
        skills: 2,
        failovers: 0,
        channels: 1,
      }));
    }),
    createNotification: vi.fn(async () => 1),
    getUserNotifications: vi.fn(async () => []),
    getUnreadNotificationCount: vi.fn(async () => 3),
    markNotificationRead: vi.fn(async () => {}),
    markAllNotificationsRead: vi.fn(async () => {}),
    getFailoverLogs: vi.fn(async () => []),
    // Channel connections
    createChannelConnection: vi.fn(async () => 1),
    getUserChannelConnections: vi.fn(async () => []),
    updateChannelConnectionStatus: vi.fn(async () => {}),
    updateChannelCredentials: vi.fn(async () => {}),
    deleteChannelConnection: vi.fn(async () => {}),
    // Token usage
    recordTokenUsage: vi.fn(async () => 1),
    getTokenUsageSummary: vi.fn(async () => ({ totalTokens: 0, totalCost: 0, byProvider: [] })),
    getAdminTokenUsageSummary: vi.fn(async () => []),
    getAllApiKeys: vi.fn(async () => []),
    getAllUsers: vi.fn(async () => []),
    // Budget
    getOrCreateBudget: vi.fn(async () => ({ id: 1, userId: 1, period: "2026-02", monthlyLimit: 100000, currentUsage: 0 })),
    incrementBudgetUsage: vi.fn(async () => ({ allowed: true, currentUsage: 500, monthlyLimit: 100000, percentUsed: 0.5, thresholdCrossed: null })),
    setUserBudgetLimit: vi.fn(async () => ({ id: 1, userId: 1, period: "2026-02", monthlyLimit: 200000, currentUsage: 0 })),
    getAllBudgets: vi.fn(async () => []),
    getUserBudget: vi.fn(async () => ({ id: 1, userId: 1, period: "2026-02", monthlyLimit: 100000, currentUsage: 0 })),
  };
});

// Mock Railway API
vi.mock("./railway", () => ({
  provisionRailway: vi.fn(
    async (opts: { projectName: string; repo: string; envVars: Record<string, string> }) => ({
      projectId: "proj-test-123",
      serviceId: "svc-test-456",
      environmentId: "env-test-789",
      deploymentId: "deploy-test-abc",
      domain: `${opts.projectName}.up.railway.app`,
    })
  ),
  getDeploymentStatus: vi.fn(async () => ({
    id: "deploy-test-abc",
    status: "SUCCESS",
    createdAt: new Date().toISOString(),
  })),
  listProjects: vi.fn(async () => [
    { id: "proj-1", name: "sunclaw-prod" },
    { id: "proj-2", name: "sunclaw-staging" },
  ]),
  getLatestDeployment: vi.fn(async () => null),
  redeployService: vi.fn(async () => "deploy-redeploy-123"),
}));

// Mock LLM failover
vi.mock("./llm-failover", () => {
  const mockProviders: Record<string, any> = {
    openai: { id: "openai", name: "OpenAI", defaultModel: "gpt-4o-mini", freeTier: false, description: "GPT-4o", keyUrl: "", keyPlaceholder: "sk-...", models: [{ id: "gpt-4o-mini", name: "GPT-4o Mini" }], category: "builtin", envKey: "OPENAI_API_KEY" },
    anthropic: { id: "anthropic", name: "Anthropic", defaultModel: "claude-sonnet-4-20250514", freeTier: false, description: "Claude", keyUrl: "", keyPlaceholder: "sk-ant-...", models: [{ id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" }], category: "builtin", envKey: "ANTHROPIC_API_KEY" },
    google: { id: "google", name: "Google Gemini", defaultModel: "gemini-2.0-flash", freeTier: true, description: "Gemini", keyUrl: "", keyPlaceholder: "AIza...", models: [{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" }], category: "builtin", envKey: "GEMINI_API_KEY" },
    moonshot: { id: "moonshot", name: "Moonshot AI (Kimi)", defaultModel: "kimi-k2.5", freeTier: true, description: "Kimi K2.5", keyUrl: "", keyPlaceholder: "sk-...", models: [{ id: "kimi-k2.5", name: "Kimi K2.5" }], category: "custom", envKey: "MOONSHOT_API_KEY" },
    groq: { id: "groq", name: "Groq", defaultModel: "llama-3.3-70b-versatile", freeTier: true, description: "Fast inference", keyUrl: "", keyPlaceholder: "gsk_...", models: [{ id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" }], category: "builtin", envKey: "GROQ_API_KEY" },
    venice: { id: "venice", name: "Venice AI", defaultModel: "llama-3.3-70b", freeTier: false, description: "Privacy-first", keyUrl: "", keyPlaceholder: "venice-...", models: [{ id: "llama-3.3-70b", name: "Llama 3.3 70B" }], category: "builtin", envKey: "VENICE_API_KEY" },
    openrouter: { id: "openrouter", name: "OpenRouter", defaultModel: "anthropic/claude-sonnet-4-5", freeTier: true, description: "200+ models", keyUrl: "", keyPlaceholder: "sk-or-...", models: [{ id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5" }], category: "gateway", envKey: "OPENROUTER_API_KEY" },
    xai: { id: "xai", name: "xAI Grok", defaultModel: "grok-2-latest", freeTier: false, description: "Grok-2", keyUrl: "", keyPlaceholder: "xai-...", models: [{ id: "grok-2-latest", name: "Grok-2" }], category: "builtin", envKey: "XAI_API_KEY" },
    deepseek: { id: "deepseek", name: "DeepSeek", defaultModel: "deepseek-chat", freeTier: false, description: "DeepSeek V3", keyUrl: "", keyPlaceholder: "sk-...", models: [{ id: "deepseek-chat", name: "DeepSeek V3" }], category: "builtin", envKey: "DEEPSEEK_API_KEY" },
  };
  return {
    chatWithFailover: vi.fn(async () => ({
      content: "Mock response from failover",
      model: "gpt-4o-mini",
      provider: "openai",
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      failoverChain: ["OpenAI"],
      usedManusFallback: false,
    })),
    healthCheckAllKeys: vi.fn(async () => [
      { provider: "openai", healthy: true, latencyMs: 200 },
    ]),
    PROVIDERS: mockProviders,
    getProviderList: vi.fn(() => Object.values(mockProviders).map((p: any) => ({
      id: p.id,
      name: p.name,
      defaultModel: p.defaultModel,
      freeTier: p.freeTier,
      description: p.description,
      keyUrl: p.keyUrl,
      keyPlaceholder: p.keyPlaceholder,
      models: p.models,
      category: p.category,
      envKey: p.envKey,
    }))),
  };
});

// Mock agent memory
vi.mock("./agent-memory", () => ({
  getOrCreateMemory: vi.fn(async () => ({
    id: 1,
    contextSummary: null,
    fullLog: [],
    lastModelUsed: null,
    messageCount: 0,
  })),
  buildContextWindow: vi.fn(() => [
    { role: "system", content: "You are SunClaw" },
    { role: "user", content: "test" },
  ]),
  appendToMemory: vi.fn(async () => {}),
  clearMemory: vi.fn(async () => {}),
  getFullLog: vi.fn(async () => []),
}));

// Mock invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: "Mocked LLM response" } }],
    model: "default",
  })),
}));

// Mock notification helper
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

// Mock channel verification
vi.mock("./channel-verify", () => ({
  verifyChannelCredentials: vi.fn(async () => ({ valid: true, message: "OK" })),
}));

// Mock OpenClaw connector mapping
vi.mock("./openclaw-connector-map", () => ({
  mapToOpenClawConnector: vi.fn(() => ({
    type: "whatsapp",
    config: { phone_number_id: "123", access_token: "tok" },
  })),
}));

/* ─── Waitlist Tests ─── */
describe("waitlist routes", () => {
  it("waitlist.join — accepts a valid email and returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.waitlist.join({
      email: "alice@energy.com",
      name: "Alice",
      source: "hero",
    });
    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(false);
  });

  it("waitlist.join — returns alreadyExists for duplicate email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.waitlist.join({
      email: "alice@energy.com",
    });
    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(true);
  });

  it("waitlist.join — rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.waitlist.join({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("waitlist.count — returns the current count", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.waitlist.count();
    expect(typeof result.count).toBe("number");
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("waitlist.list — requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.waitlist.list()).rejects.toThrow();
  });

  it("waitlist.list — works for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.waitlist.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("waitlist.join — triggers owner notification", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const caller = appRouter.createCaller(createPublicContext());
    await caller.waitlist.join({
      email: "notify-test@energy.com",
      name: "Notify Test",
      company: "TestCorp",
    });
    expect(notifyOwner).toHaveBeenCalled();
    const lastCall = (notifyOwner as any).mock.calls.at(-1)?.[0];
    expect(lastCall?.title).toContain("Waitlist");
    expect(lastCall?.content).toContain("notify-test@energy.com");
  });
});

/* ─── Config Tests ─── */
describe("config routes", () => {
  it("config.save — saves a configuration for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.config.save({
      name: "Test Config",
      config: {
        llmProvider: "openai",
        llmApiKey: "sk-test",
        whatsappEnabled: true,
      },
    });
    expect(result.id).toBeGreaterThan(0);
  });

  it("config.save — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.config.save({
        name: "Fail Config",
        config: { llmProvider: "openai" },
      })
    ).rejects.toThrow();
  });

  it("config.list — returns user's configurations", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.config.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("config.update — updates an existing configuration", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const saveResult = await caller.config.save({
      name: "Update Me",
      config: { llmProvider: "anthropic" },
    });
    const updateResult = await caller.config.update({
      id: saveResult.id,
      name: "Updated Config",
      config: { llmProvider: "venice" },
    });
    expect(updateResult.success).toBe(true);
  });

  it("config.delete — deletes a configuration", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const saveResult = await caller.config.save({
      name: "Delete Me",
      config: { llmProvider: "ollama" },
    });
    const deleteResult = await caller.config.delete({ id: saveResult.id });
    expect(deleteResult.success).toBe(true);
  });

  it("config.listAll — requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.config.listAll()).rejects.toThrow();
  });

  it("config.listAll — works for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.config.listAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ─── Deploy Tests ─── */
describe("deploy routes", () => {
  it("deploy.create — creates a deployment record", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.deploy.create({
      method: "railway",
      instanceName: "test-instance",
    });
    expect(result.id).toBeGreaterThan(0);
  });

  it("deploy.create — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.deploy.create({ method: "docker" })
    ).rejects.toThrow();
  });

  it("deploy.list — returns user's deployments", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.deploy.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deploy.listAll — requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.deploy.listAll()).rejects.toThrow();
  });

  it("deploy.listAll — works for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.deploy.listAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ─── Railway Provisioning Tests ─── */
describe("Railway provisioning", () => {
  it("deploy.provision — creates project and returns domain", async () => {
    // Mock canDeployRailway to allow the test user (free plan) to deploy
    const { canDeployRailway } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(true);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.deploy.provision({
      instanceName: "my-sunclaw",
      repo: "kaykluz/sunclaw",
      envVars: {
        LLM_PROVIDER: "openai",
        INSTANCE_NAME: "my-sunclaw",
      },
    });

    expect(result.success).toBe(true);
    expect(result.domain).toContain("my-sunclaw");
    expect(result.railwayProjectId).toBe("proj-test-123");
    expect(result.railwayUrl).toContain("https://");
    expect(result.deploymentId).toBeGreaterThan(0);
  });

  it("deploy.provision — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.deploy.provision({
        instanceName: "fail-deploy",
        repo: "kaykluz/sunclaw",
      })
    ).rejects.toThrow();
  });

  it("deploy.provision — triggers owner notification on success", async () => {
    const { canDeployRailway } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(true);
    const { notifyOwner } = await import("./_core/notification");
    (notifyOwner as any).mockClear();

    const caller = appRouter.createCaller(createAuthContext());
    await caller.deploy.provision({
      instanceName: "notify-test-deploy",
      repo: "kaykluz/sunclaw",
    });

    expect(notifyOwner).toHaveBeenCalled();
    const lastCall = (notifyOwner as any).mock.calls.at(-1)?.[0];
    expect(lastCall?.title).toContain("Railway Deployment");
    expect(lastCall?.content).toContain("notify-test-deploy");
  });

  it("deploy.status — checks Railway deployment status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.deploy.status({
      deploymentId: "deploy-test-abc",
    });
    expect(result.status).toBe("SUCCESS");
  });

  it("deploy.railwayProjects — requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.deploy.railwayProjects()).rejects.toThrow();
  });

  it("deploy.railwayProjects — returns projects for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.deploy.railwayProjects();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("sunclaw-prod");
  });
});

/* ─── Railway Provisioning Failure Tests ─── */
describe("Railway provisioning failure handling", () => {
  it("deploy.provision — handles Railway API failure gracefully", async () => {
    const { canDeployRailway } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(true);
    const { provisionRailway } = await import("./railway");
    (provisionRailway as any).mockRejectedValueOnce(
      new Error("Railway API rate limit exceeded")
    );

    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.deploy.provision({
        instanceName: "fail-instance",
        repo: "kaykluz/sunclaw",
      })
    ).rejects.toThrow("Railway API rate limit exceeded");
  });

  it("deploy.provision — notifies owner on failure", async () => {
    const { canDeployRailway } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(true);
    const { provisionRailway } = await import("./railway");
    const { notifyOwner } = await import("./_core/notification");
    (notifyOwner as any).mockClear();
    (provisionRailway as any).mockRejectedValueOnce(
      new Error("Service creation failed")
    );

    const caller = appRouter.createCaller(createAuthContext());
    await caller.deploy
      .provision({
        instanceName: "fail-notify-instance",
        repo: "kaykluz/sunclaw",
      })
      .catch(() => {});

    expect(notifyOwner).toHaveBeenCalled();
    const lastCall = (notifyOwner as any).mock.calls.at(-1)?.[0];
    expect(lastCall?.title).toContain("Failed");
  });
});

/* ─── Billing Tests ─── */
vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn(async (opts: { planId: string; userId: number; origin: string }) => ({
    url: `https://checkout.stripe.com/test-session-${opts.planId}`,
    sessionId: `cs_test_${opts.planId}_${opts.userId}`,
  })),
  getActiveSubscription: vi.fn(async () => null),
  createBillingPortalSession: vi.fn(async (opts: { origin: string }) => `${opts.origin}/billing-portal`),
  findOrCreateCustomer: vi.fn(async () => "cus_test_123"),
}));

vi.mock("./stripe-products", () => ({
  PLANS: {
    free: { id: "free", name: "Free", priceMonthly: 0, maxDeployments: 0, features: [] },
    pro: { id: "pro", name: "Pro", priceMonthly: 49, maxDeployments: 5, features: [], stripePriceId: "price_test_pro" },
    enterprise: { id: "enterprise", name: "Enterprise", priceMonthly: 199, maxDeployments: -1, features: [], stripePriceId: "price_test_ent" },
  },
  canDeployRailway: vi.fn((plan: string) => plan === "pro" || plan === "enterprise"),
  hasDeploymentSlots: vi.fn((_plan: string, _count: number) => true),
  getPlan: vi.fn((id: string) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    maxDeployments: id === "enterprise" ? -1 : 5,
  })),
}));

describe("billing routes", () => {
  it("billing.plans — returns available plans (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.billing.plans();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });

  it("billing.status — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.billing.status()).rejects.toThrow();
  });

  it("billing.checkout — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.billing.checkout({ planId: "pro", origin: "https://example.com" })
    ).rejects.toThrow();
  });

  it("billing.portal — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.billing.portal({ origin: "https://example.com" })
    ).rejects.toThrow();
  });
});

/* ─── Deploy pollStatus Tests ─── */
describe("deploy.pollStatus", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.deploy.pollStatus({ id: 1 })).rejects.toThrow();
  });

  it("returns null when db is not available", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.deploy.pollStatus({ id: 999 });
    // With mocked getDb returning null, should return null
    expect(result).toBeNull();
  });
});

/* ─── Railway Module Exports ─── */
describe("railway module exports", () => {
  it("exports all required functions", async () => {
    const railway = await import("./railway");
    expect(typeof railway.provisionRailway).toBe("function");
    expect(typeof railway.getDeploymentStatus).toBe("function");
    expect(typeof railway.listProjects).toBe("function");
  });
});

/* ─── Railway Defaults ─── */
describe("railway-defaults", () => {
  it("mergeWithDefaults adds default env vars", async () => {
    const { mergeWithDefaults } = await import("./railway-defaults");
    const result = mergeWithDefaults({ CUSTOM_VAR: "test" });
    expect(result.CUSTOM_VAR).toBe("test");
    expect(result).toHaveProperty("PORT");
    expect(result.PORT).toBe("18789");
  });

  it("user vars override defaults", async () => {
    const { mergeWithDefaults } = await import("./railway-defaults");
    const result = mergeWithDefaults({ PORT: "8080" });
    expect(result.PORT).toBe("8080");
  });
});

/* ─── Dashboard Proxy Tests ─── */
describe("dashboard routes", () => {
  it("dashboard.instance — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.instance()).rejects.toThrow();
  });

  it("dashboard.instance — returns null when no active deployment", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.instance();
    // With mocked getUserDeployments returning empty array, should return null
    expect(result).toBeNull();
  });

  it("dashboard.health — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.health()).rejects.toThrow();
  });

  it("dashboard.health — returns no_deployment when no active deployment", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.health();
    expect(result.status).toBe("no_deployment");
    expect(result.healthy).toBe(false);
  });

  it("dashboard.chat — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.dashboard.chat({
        messages: [{ role: "user", content: "Hello" }],
      })
    ).rejects.toThrow();
  });

  it("dashboard.chat — throws when no deployment exists", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.dashboard.chat({
        messages: [{ role: "user", content: "Hello" }],
      })
    ).rejects.toThrow("No active deployment found");
  });

});

/* ─── Plan Gating Tests ─── */
describe("Railway plan gating", () => {
  it("deploy.provision — rejects free plan users", async () => {
    const { canDeployRailway } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(false);

    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.deploy.provision({
        instanceName: "gated-instance",
        repo: "kaykluz/sunclaw",
      })
    ).rejects.toThrow("Railway deployment requires a Pro or Enterprise plan");
  });

  it("deploy.provision — rejects when deployment slots exhausted", async () => {
    const { canDeployRailway, hasDeploymentSlots, getPlan } = await import("./stripe-products");
    (canDeployRailway as any).mockReturnValueOnce(true); // pass plan check
    (hasDeploymentSlots as any).mockReturnValueOnce(false);
    (getPlan as any).mockReturnValueOnce({ id: "pro", name: "Pro", maxDeployments: 5 });

    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.deploy.provision({
        instanceName: "maxed-out-instance",
        repo: "kaykluz/sunclaw",
      })
    ).rejects.toThrow("maximum of 5 deployments");
  });
});

/* ─── API Keys Tests ─── */
describe("apiKeys routes", () => {
  it("apiKeys.providers — returns list of supported providers (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const providers = await caller.apiKeys.providers();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
    const ids = providers.map((p: any) => p.id);
    expect(ids).toContain("openai");
    expect(ids).toContain("anthropic");
    expect(ids).toContain("google");
    for (const p of providers) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("name");
      // OpenClaw-aligned providers use 'models' array instead of 'defaultModel'
      expect(p).toHaveProperty("models");
    }
  });

  it("apiKeys.add — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.apiKeys.add({ provider: "openai", apiKey: "sk-test" })
    ).rejects.toThrow();
  });

  it("apiKeys.add — creates a key and returns id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.add({
      provider: "openai",
      label: "Test Key",
      apiKey: "sk-test-12345",
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("apiKeys.list — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.apiKeys.list()).rejects.toThrow();
  });

  it("apiKeys.list — returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("apiKeys.remove — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.apiKeys.remove({ id: 1 })).rejects.toThrow();
  });

  it("apiKeys.remove — returns success", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.remove({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("apiKeys.toggle — toggles a key", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.toggle({ id: 1, enabled: false });
    expect(result.success).toBe(true);
  });

  it("apiKeys.setPriority — sets priority", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.setPriority({ id: 1, priority: 5 });
    expect(result.success).toBe(true);
  });

  it("apiKeys.healthCheck — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.apiKeys.healthCheck()).rejects.toThrow();
  });

  it("apiKeys.healthCheck — returns results array", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.apiKeys.healthCheck();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ─── Conversations (Chat Export) Tests ─── */
describe("conversations routes", () => {
  it("conversations.save — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.conversations.save({
        title: "Test",
        messages: [{ role: "user", content: "Hi" }],
      })
    ).rejects.toThrow();
  });

  it("conversations.save — saves and returns id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversations.save({
      title: "Test Conversation",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
      model: "gpt-4",
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("conversations.list — returns array", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversations.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("conversations.get — returns conversation by id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const convo = await caller.conversations.get({ id: 1 });
    expect(convo).toBeDefined();
    expect(convo!.title).toBe("Test Conversation");
    expect(convo!.messageCount).toBe(2);
  });

  it("conversations.export — returns markdown format", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversations.export({ id: 1, format: "markdown" });
    expect(result.content).toContain("# Test Conversation");
    expect(result.filename).toContain(".md");
    expect(result.mimeType).toBe("text/markdown");
  });

  it("conversations.export — returns JSON format", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversations.export({ id: 1, format: "json" });
    expect(result.mimeType).toBe("application/json");
    const parsed = JSON.parse(result.content);
    expect(parsed.title).toBe("Test Conversation");
    expect(parsed.messages).toHaveLength(2);
  });

  it("conversations.delete — returns success", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversations.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

/* ─── Analytics Tests ─── */
describe("analytics routes", () => {
  it("analytics.summary — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.analytics.summary()).rejects.toThrow();
  });

  it("analytics.summary — returns summary with eventsByType", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.analytics.summary({ days: 30 });
    expect(result).toHaveProperty("totalMessages");
    expect(result).toHaveProperty("totalEvents");
    expect(result).toHaveProperty("eventsByType");
    expect(result.totalMessages).toBe(42);
    expect(result.totalEvents).toBe(100);
  });

  it("analytics.timeline — returns array of days", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.analytics.timeline({ days: 7 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(7);
    for (const day of result) {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("messages");
      expect(day).toHaveProperty("skills");
      expect(day).toHaveProperty("failovers");
      expect(day).toHaveProperty("channels");
    }
  });

  it("analytics.track — tracks a custom event", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.analytics.track({
      eventType: "test_event",
      eventData: { foo: "bar" },
    });
    expect(result.success).toBe(true);
  });

});

/* ─── Notifications Tests ─── */
describe("notifications routes", () => {
  it("notifications.list — requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.list()).rejects.toThrow();
  });

  it("notifications.list — returns array", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("notifications.unreadCount — returns count object", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notifications.unreadCount();
    expect(result).toHaveProperty("count");
    expect(result.count).toBe(3);
  });

  it("notifications.markRead — returns success", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notifications.markRead({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("notifications.markAllRead — returns success", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notifications.markAllRead();
    expect(result.success).toBe(true);
  });
});

/* ─── Agent Memory Tests ─── */
// REMOVED: Memory router was removed in gap analysis fixes.
// OpenClaw manages its own memory internally — SunClaw no longer
// maintains a parallel memory system.
describe("memory routes (removed)", () => {
  it("memory router no longer exists — OpenClaw manages memory internally", () => {
    // Verify the memory router was properly removed
    const routerKeys = Object.keys((appRouter as any)._def.procedures);
    const memoryRoutes = routerKeys.filter((k: string) => k.startsWith("memory."));
    expect(memoryRoutes).toHaveLength(0);
  });
});

/* ─── Redeploy Tests ─── */
describe("dashboard.redeploy", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.redeploy()).rejects.toThrow();
  });

  it("throws when no active deployment", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.dashboard.redeploy()).rejects.toThrow(
      "No active deployment found"
    );
  });
});

/* ─── ChatWithMemory Tests ─── */
describe("dashboard.chatWithMemory", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.dashboard.chatWithMemory({ message: "Hello" })
    ).rejects.toThrow();
  });

  it("throws when no active deployment exists (routes through OpenClaw Gateway)", async () => {
    // With mocked getUserDeployments returning empty array, should throw
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.dashboard.chatWithMemory({
        message: "What is solar irradiance?",
      })
    ).rejects.toThrow("No active deployment found");
  });
});
