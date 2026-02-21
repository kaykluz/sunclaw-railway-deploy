import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  addToWaitlist,
  getWaitlistCount,
  getWaitlistEntries,
  saveConfiguration,
  updateConfiguration,
  getUserConfigurations,
  getConfigurationById,
  deleteConfiguration,
  createDeployment,
  updateDeploymentStatus,
  getUserDeployments,
  getAllDeployments,
  getAllConfigurations,
  getUserById,
  updateUserStripeCustomer,
  countUserDeployments,
  createApiKey,
  getUserApiKeys,
  getUserApiKeysWithSecrets,
  deleteApiKey,
  updateApiKeyPriority,
  toggleApiKey,
  saveConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  trackEvent,
  getAnalyticsSummary,
  getAnalyticsTimeline,
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  createChannelConnection,
  getUserChannelConnections,
  updateChannelConnectionStatus,
  updateChannelCredentials,
  deleteChannelConnection,
  getAllApiKeys,
  getAllUsers,
  updateApiKeyStatus,
  getUserByEmail,
  createLocalUser,
  updateUserPassword,
  updateUserPlanSelected,
  createPasswordResetToken,
  getPasswordResetToken,
  markPasswordResetTokenUsed,
  logAuthEvent,
  createEmailVerificationToken,
  getEmailVerificationToken,
  getEmailVerificationTokenRaw,
  markEmailVerificationTokenUsed,
  setEmailVerified,
} from "./db";
import bcrypt from "bcryptjs";
import * as sessionManager from "./services/sessionManager";
import crypto from "crypto";
import { provisionRailway, getDeploymentStatus, getLatestDeployment, listProjects, redeployService, setVariables, getVariables, getDeploymentLogs, getBuildLogs } from "./railway";
import { verifyChannelCredentials } from "./channel-verify";
import { notifyOwner } from "./_core/notification";
import { sendEmail, buildVerificationEmail, buildPasswordResetEmail } from "./email";
import {
  createCheckoutSession,
  createAddOnCheckoutSession,
  createBundleCheckoutSession,
  getActiveSubscription,
  createBillingPortalSession,
  findOrCreateCustomer,
} from "./stripe";
import { PLANS, ADD_ONS, canDeployRailway, hasDeploymentSlots, getPlan, isEligibleForAddOn } from "./stripe-products";
import { buildFullConfig, getChannelRequirements } from "./channel-env-map";
import { generateOpenClawConfig, getOpenClawEnvVars, wizardConfigToInput, validateOpenClawConfig, getProviderModels, PROVIDER_BASE_URLS, getApiType, PROVIDER_MODELS } from "./openclaw-config";
import { checkGatewayHealth, pushAndApplyConfig, chatViaGateway, getChannelStatus, type GatewayConnection } from "./gateway-api";
import { mergeWithDefaults } from "./railway-defaults";
import { DEFAULT_SUNCLAW_SOUL } from "./sunclaw-soul";

/* ─── Helper: get user's active deployment + gateway connection ─── */
async function getUserGateway(userId: number): Promise<GatewayConnection | null> {
  const deps = await getUserDeployments(userId);
  const active = deps.find(d => d.status === "success" && d.externalUrl);
  if (!active) return null;
  const meta = active.metadata as Record<string, any> | null;
  return {
    url: active.externalUrl!,
    token: meta?.gatewayToken ?? meta?.OPENCLAW_TOKEN ?? "",
  };
}

/** Get full Railway deployment details for env var updates */
async function getUserRailwayInfo(userId: number): Promise<{
  url: string;
  token: string | undefined;
  projectId: string;
  serviceId: string;
  environmentId: string;
} | null> {
  const deps = await getUserDeployments(userId);
  const active = deps.find(d => d.status === "success" && d.externalUrl);
  if (!active) return null;
  const meta = active.metadata as Record<string, any> | null;
  if (!meta?.railwayProjectId || !meta?.railwayServiceId || !meta?.railwayEnvironmentId) return null;
  return {
    url: active.externalUrl!,
    token: meta.gatewayToken ?? meta.OPENCLAW_TOKEN ?? undefined,
    projectId: meta.railwayProjectId,
    serviceId: meta.railwayServiceId,
    environmentId: meta.railwayEnvironmentId,
  };
}

/**
 * Rebuild the full OpenClaw config from DB state and push it to the Gateway.
 *
 * OpenClaw does NOT have a REST API for config updates. Instead:
 *   1. Model API keys + OPENCLAW_MODEL are set as Railway env vars
 *   2. Channel config is embedded in the openclaw.json via OPENCLAW_CONFIG_B64 env var
 *   3. A Railway redeploy is triggered so the container picks up the new env vars
 *
 * OpenClaw reads model API keys from env vars as fallback (e.g. KIMI_API_KEY,
 * MINIMAX_API_KEY). The OPENCLAW_MODEL env var sets agents.defaults.model.primary.
 */
async function rebuildAndPushConfig(userId: number): Promise<{
  pushed: boolean;
  error?: string;
  config?: Record<string, unknown>;
}> {
  const railwayInfo = await getUserRailwayInfo(userId);
  if (!railwayInfo) return { pushed: false, error: "No active deployment" };

  // Gather all active channels
  const connections = await getUserChannelConnections(userId);
  const activeChannels = connections
    .filter(c => c.status === "connected")
    .map(c => ({
      channel: c.channel,
      credentials: (c.credentials as Record<string, unknown>) ?? {},
    }));

  // Gather model providers from user's API keys (with secrets for config building)
  const apiKeysWithSecrets = await getUserApiKeysWithSecrets(userId);
  const models = apiKeysWithSecrets
    .filter(k => k.enabled)
    .map(k => ({
      provider: k.provider,
      apiKey: k.apiKey,
      baseUrl: k.baseUrl || undefined,
      model: k.model || undefined,
    }));

  // Get user's latest config for soul.md and other settings
  const configs = await getUserConfigurations(userId);
  const latestConfig = configs[0]?.config as Record<string, any> | null;

  // Get the active model selection from user's config
  const activeModel = latestConfig?.active_model as string | undefined;

  const fullConfig = buildFullConfig({
    activeChannels,
    models,
    activeModel,
    agent: {
      name: "SunClaw",
      avatar: "☀️",
      soulMd: (latestConfig?.system_prompt as string | undefined) || getDefaultSoulMd(),
    },
    gateway: {
      bind: "lan",
      token: railwayInfo.token,
    },
  });

  // Build Railway env vars: model API keys + config JSON
  const envVars: Record<string, string> = {
    ...fullConfig.envVars,
  };

  // NOTE: Do NOT set OPENCLAW_MODEL env var — the wrapper script injects it as
  // a root-level "model" key in openclaw.json, which is invalid. The model is
  // already correctly configured via agents.defaults.model.primary in the config.

  // Encode the full openclaw.json as base64 for the startup script to decode
  // The Railway template's entrypoint decodes OPENCLAW_CONFIG_B64 and writes it
  // to ~/.openclaw/openclaw.json before starting the gateway
  const configJson = JSON.stringify(fullConfig.config, null, 2);
  envVars.OPENCLAW_CONFIG_B64 = Buffer.from(configJson).toString("base64");

  // Push env vars to Railway
  try {
    await setVariables(
      railwayInfo.projectId,
      railwayInfo.environmentId,
      railwayInfo.serviceId,
      envVars
    );
    console.log(`[ConfigPush] Set ${Object.keys(envVars).length} env vars on Railway (model: ${activeModel ?? "default"})`);
  } catch (err: any) {
    return { pushed: false, error: `Failed to set Railway env vars: ${err?.message}`, config: fullConfig.config };
  }

  // Trigger a Railway redeploy so the container picks up the new env vars
  try {
    await redeployService(railwayInfo.serviceId, railwayInfo.environmentId);
    console.log(`[ConfigPush] Triggered Railway redeploy`);
  } catch (err: any) {
    // Env vars are set even if redeploy fails — next manual deploy will pick them up
    console.warn(`[ConfigPush] Redeploy failed (env vars were set): ${err?.message}`);
  }

  return { pushed: true, config: fullConfig.config };
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => {
      // Strip passwordHash from the response
      if (opts.ctx.user) {
        const { passwordHash, ...safeUser } = opts.ctx.user;
        return safeUser;
      }
      return null;
    }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1).optional(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await createLocalUser({
          email: input.email,
          name: input.name || input.email.split("@")[0],
          passwordHash,
        });

        if (!user) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create account" });
        }

        // Create email verification token and send verification email
        const token = await createEmailVerificationToken(user.id);
        const origin = input.origin || ctx.req?.headers?.origin || "";
        const verifyUrl = `${origin}/verify-email?token=${token}`;

        const emailSent = await sendEmail({
          to: input.email,
          subject: "Verify your SunClaw account",
          html: buildVerificationEmail(verifyUrl, input.name || input.email.split("@")[0]),
        });

        const ipAddress = ctx.req?.ip || ctx.req?.headers?.["x-forwarded-for"]?.toString() || null;

        await logAuthEvent({
          eventType: "register",
          userId: user.id,
          ipHash: ipAddress ? crypto.createHash("sha256").update(ipAddress).digest("hex") : null,
          success: true,
          details: { method: "register", emailSent },
        });

        return {
          success: true,
          requiresVerification: true,
          emailSent,
          message: emailSent
            ? "Account created! Please check your email to verify your account."
            : "Account created! Email verification is pending — please contact support if you don't receive a verification email.",
        };
      }),

    /** Verify email address from token link */
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const record = await getEmailVerificationTokenRaw(input.token);
        if (!record) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid verification link" });
        }
        if (record.expiresAt < new Date()) {
          throw new TRPCError({ code: "NOT_FOUND", message: "This verification link has expired" });
        }

        const ipAddress = ctx.req?.ip || ctx.req?.headers?.["x-forwarded-for"]?.toString() || null;
        const userAgent = ctx.req?.headers?.["user-agent"] || null;

        // If token was already used, check if the user is already verified
        if (record.usedAt) {
          const user = await getUserById(record.userId);
          if (user?.emailVerified) {
            // Already verified — auto-login and return success
            const { sessionId } = await sessionManager.createSession({
              userId: record.userId,
              ip: ipAddress,
              userAgent,
              rememberMe: false,
            });
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionId, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
            return { success: true, message: "Email already verified. You are now logged in." };
          }
          throw new TRPCError({ code: "NOT_FOUND", message: "This verification link has already been used" });
        }

        // Mark token as used and set email as verified
        await markEmailVerificationTokenUsed(input.token);
        await setEmailVerified(record.userId);

        // Auto-login the user after verification
        const { sessionId } = await sessionManager.createSession({
          userId: record.userId,
          ip: ipAddress,
          userAgent,
          rememberMe: false,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionId, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

        await logAuthEvent({
          eventType: "email_verified",
          userId: record.userId,
          sessionId,
          ipHash: ipAddress ? crypto.createHash("sha256").update(ipAddress).digest("hex") : null,
          success: true,
        });

        return { success: true, message: "Email verified! You are now logged in." };
      }),

    /** Resend verification email */
    resendVerification: publicProcedure
      .input(z.object({
        email: z.string().email(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        // Always return success to avoid email enumeration
        if (!user || user.emailVerified) {
          return { success: true, message: "If an unverified account exists, a new verification email has been sent." };
        }

        const token = await createEmailVerificationToken(user.id);
        const origin = input.origin || ctx.req?.headers?.origin || "";
        const verifyUrl = `${origin}/verify-email?token=${token}`;

        await sendEmail({
          to: input.email,
          subject: "Verify your SunClaw account",
          html: buildVerificationEmail(verifyUrl, user.name || undefined),
        });

        return { success: true, message: "If an unverified account exists, a new verification email has been sent." };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
        rememberMe: z.boolean().optional().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        const ipAddress = ctx.req?.ip || ctx.req?.headers?.["x-forwarded-for"]?.toString() || null;
        const userAgent = ctx.req?.headers?.["user-agent"] || null;
        const ipHash = ipAddress ? crypto.createHash("sha256").update(ipAddress).digest("hex") : null;

        if (!user || !user.passwordHash) {
          await logAuthEvent({ eventType: "login_failed", ipHash, success: false, failureReason: "User not found" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          await logAuthEvent({ eventType: "login_failed", userId: user.id, ipHash, success: false, failureReason: "Invalid password" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Block login for unverified email accounts (email/password only, not OAuth)
        if (user.loginMethod === "email" && !user.emailVerified) {
          await logAuthEvent({ eventType: "login_failed", userId: user.id, ipHash, success: false, failureReason: "Email not verified" });
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Please verify your email before signing in. Check your inbox for the verification link.",
          });
        }

        const { sessionId } = await sessionManager.createSession({
          userId: user.id,
          ip: ipAddress,
          userAgent,
          rememberMe: input.rememberMe,
        });

        const sessionDuration = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionId, { ...cookieOptions, maxAge: sessionDuration });

        await logAuthEvent({
          eventType: "login_success",
          userId: user.id,
          sessionId,
          ipHash,
          success: true,
          details: { method: "email", rememberMe: input.rememberMe },
        });

        return {
          success: true,
          user: { id: user.id, email: user.email, name: user.name },
        };
      }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      const sessionId = ctx.req.cookies?.[COOKIE_NAME];
      if (sessionId) {
        await sessionManager.revokeSession(sessionId, "user_logout");
        await logAuthEvent({
          eventType: "logout",
          userId: ctx.user?.id ?? null,
          sessionId,
          success: true,
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        // Always return success to avoid email enumeration
        if (!user) return { success: true };

        const token = await createPasswordResetToken(user.id);
        const origin = input.origin || ctx.req?.headers?.origin || "";
        const resetUrl = `${origin}/reset-password?token=${token}`;

        await sendEmail({
          to: input.email,
          subject: "Reset your SunClaw password",
          html: buildPasswordResetEmail(resetUrl, user.name || undefined),
        });

        await logAuthEvent({
          eventType: "password_reset_requested",
          userId: user.id,
          success: true,
        });

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        const record = await getPasswordResetToken(input.token);
        if (!record) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired reset link" });
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 12);
        await updateUserPassword(record.userId, passwordHash);
        await markPasswordResetTokenUsed(input.token);

        // Revoke all existing sessions for security
        await sessionManager.revokeAllUserSessions(record.userId, "password_reset");

        await logAuthEvent({
          eventType: "password_reset_completed",
          userId: record.userId,
          success: true,
        });

        return { success: true };
      }),

    /** Mark that the user has selected a plan (dismisses the pricing wall) */
    selectPlan: protectedProcedure
      .input(z.object({ plan: z.string() }))
      .mutation(async ({ ctx }) => {
        await updateUserPlanSelected(ctx.user.id, true);
        return { success: true };
      }),
  }),

  /* ─── Waitlist ─── */
  waitlist: router({
    join: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().max(255).optional(),
          company: z.string().max(255).optional(),
          role: z.string().max(128).optional(),
          source: z.string().max(64).optional(),
          phone: z.string().max(32).optional(),
          intent: z.string().max(32).optional(),
          region: z.string().max(64).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate unique deep-link reference for Telegram
        const deepLink = `ref_${crypto.randomBytes(6).toString("hex")}`;

        // Convert empty strings to null explicitly for nullable fields
        const toNull = (v: string | undefined | null): string | null =>
          (v && v.trim().length > 0) ? v.trim() : null;

        const result = await addToWaitlist({
          email: input.email.trim(),
          name: toNull(input.name),
          company: toNull(input.company),
          role: toNull(input.role),
          source: input.source || "website",
          phone: toNull(input.phone),
          intent: toNull(input.intent),
          region: toNull(input.region),
          telegramDeepLink: deepLink,
        });

        notifyOwner({
          title: "New Lead",
          content: `${input.email}${input.name ? ` (${input.name})` : ""}${input.company ? ` from ${input.company}` : ""} — intent: ${input.intent ?? "unknown"}, region: ${input.region ?? "unknown"}`,
        }).catch(() => {});

        return { ...result, telegramDeepLink: result.telegramDeepLink ?? deepLink };
      }),

    count: publicProcedure.query(async () => {
      const total = await getWaitlistCount();
      return { count: total };
    }),

    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(500).optional(),
            offset: z.number().min(0).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const entries = await getWaitlistEntries(
          input?.limit ?? 100,
          input?.offset ?? 0
        );
        return entries;
      }),
  }),

  /* ─── Configurations ─── */
  config: router({
    save: protectedProcedure
      .input(
        z.object({
          name: z.string().max(255).optional(),
          config: z.record(z.string(), z.unknown()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await saveConfiguration({
          userId: ctx.user.id,
          name: input.name ?? "My SunClaw",
          config: input.config,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().max(255).optional(),
          config: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateConfiguration(input.id, ctx.user.id, {
          name: input.name,
          config: input.config,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserConfigurations(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getConfigurationById(input.id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConfiguration(input.id, ctx.user.id);
        return { success: true };
      }),

    listAll: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(500).optional(),
            offset: z.number().min(0).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getAllConfigurations(input?.limit ?? 100, input?.offset ?? 0);
      }),
  }),

  /* ─── Billing (Stripe) ─── */
  billing: router({
    plans: publicProcedure.query(() => {
      return Object.values(PLANS);
    }),

    addOns: publicProcedure.query(() => {
      return Object.values(ADD_ONS);
    }),

    status: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      let subscription = null;
      if (user.stripeCustomerId) {
        try {
          subscription = await getActiveSubscription(user.stripeCustomerId);
        } catch {
          // Stripe might not be configured yet
        }
      }

      return {
        plan: user.plan ?? "free",
        stripeCustomerId: user.stripeCustomerId,
        subscription,
        managedKeysActive: user.managedKeysActive ?? false,
      };
    }),

    checkout: protectedProcedure
      .input(
        z.object({
          planId: z.enum(["pro", "enterprise"]),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const result = await createCheckoutSession({
          planId: input.planId,
          userId: ctx.user.id,
          userEmail: user.email ?? "",
          userName: user.name,
          stripeCustomerId: user.stripeCustomerId,
          origin: input.origin,
        });

        if (!user.stripeCustomerId) {
          const customerId = await findOrCreateCustomer({
            userId: ctx.user.id,
            email: user.email ?? "",
            name: user.name,
          });
          await updateUserStripeCustomer(ctx.user.id, customerId);
        }

        return { url: result.url, sessionId: result.sessionId };
      }),

    checkoutAddOn: protectedProcedure
      .input(
        z.object({
          addOnId: z.enum(["managed_keys"]),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        if (!isEligibleForAddOn(user.plan ?? "free", input.addOnId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your current plan is not eligible for this add-on. Upgrade to Pro first.",
          });
        }

        const result = await createAddOnCheckoutSession({
          addOnId: input.addOnId,
          userId: ctx.user.id,
          userEmail: user.email ?? "",
          userName: user.name,
          stripeCustomerId: user.stripeCustomerId,
          origin: input.origin,
        });

        if (!user.stripeCustomerId) {
          const customerId = await findOrCreateCustomer({
            userId: ctx.user.id,
            email: user.email ?? "",
            name: user.name,
          });
          await updateUserStripeCustomer(ctx.user.id, customerId);
        }

        return { url: result.url, sessionId: result.sessionId };
      }),

    checkoutBundle: protectedProcedure
      .input(
        z.object({
          planId: z.enum(["pro", "enterprise"]),
          addOnId: z.enum(["managed_keys"]),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const result = await createBundleCheckoutSession({
          planId: input.planId,
          addOnId: input.addOnId,
          userId: ctx.user.id,
          userEmail: user.email ?? "",
          userName: user.name,
          stripeCustomerId: user.stripeCustomerId,
          origin: input.origin,
        });

        if (!user.stripeCustomerId) {
          const customerId = await findOrCreateCustomer({
            userId: ctx.user.id,
            email: user.email ?? "",
            name: user.name,
          });
          await updateUserStripeCustomer(ctx.user.id, customerId);
        }

        return { url: result.url, sessionId: result.sessionId };
      }),

    portal: protectedProcedure
      .input(z.object({ origin: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user?.stripeCustomerId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No billing account found. Subscribe to a plan first.",
          });
        }

        const url = await createBillingPortalSession({
          stripeCustomerId: user.stripeCustomerId,
          origin: input.origin,
        });

        return { url };
      }),
  }),

  /* ─── Deployments (Railway API Integration) ─── */
  deploy: router({
    /**
     * Full zero-touch Railway provisioning.
     * FIXED: Now generates openclaw.json and sets only model API keys as env vars.
     * Channel config goes in openclaw.json, NOT env vars.
     */
    provision: protectedProcedure
      .input(
        z.object({
          configurationId: z.number().optional(),
          instanceName: z.string().max(255),
          repo: z.string().default("kaykluz/sunclaw"),
          envVars: z.record(z.string(), z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // ── Plan gating ──
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const userPlan = user.plan ?? "free";

        if (!canDeployRailway(userPlan)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Railway deployment requires a Pro or Enterprise plan. Please upgrade to continue.",
          });
        }

        const currentDeployCount = await countUserDeployments(ctx.user.id);
        if (!hasDeploymentSlots(userPlan, currentDeployCount)) {
          const plan = getPlan(userPlan);
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You've reached the maximum of ${plan.maxDeployments} deployments for the ${plan.name} plan. Upgrade to Enterprise for unlimited deployments.`,
          });
        }

        // ── Provisioning ──
        const deployId = await createDeployment({
          userId: ctx.user.id,
          configurationId: input.configurationId ?? null,
          method: "railway",
          status: "pending",
          instanceName: input.instanceName,
        });

        try {
          await updateDeploymentStatus(deployId, "deploying");

          // Build the minimal env vars: only model API keys + gateway token
          const userEnvVars = input.envVars ?? {};
          const mergedEnv = mergeWithDefaults(userEnvVars);
          const gatewayToken = mergedEnv.OPENCLAW_TOKEN ?? "";

          const result = await provisionRailway({
            projectName: input.instanceName,
            repo: input.repo,
            envVars: mergedEnv,
          });

          await updateDeploymentStatus(deployId, "deploying", {
            railwayProjectId: result.projectId,
            railwayServiceId: result.serviceId,
            railwayEnvironmentId: result.environmentId,
            railwayDeploymentId: result.deploymentId,
            domain: result.domain,
            gatewayToken,
            OPENCLAW_TOKEN: gatewayToken,
          });

          // Update externalId and externalUrl
          const { getDb } = await import("./db");
          const db = await getDb();
          if (db) {
            const { deployments } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db
              .update(deployments)
              .set({
                externalId: result.projectId,
                externalUrl: `https://${result.domain}`,
                status: "deploying",
              })
              .where(eq(deployments.id, deployId));
          }

          notifyOwner({
            title: "New Railway Deployment",
            content: `User ${ctx.user.name ?? ctx.user.openId} (${userPlan} plan) deployed "${input.instanceName}" to Railway.\nDomain: https://${result.domain}\nProject ID: ${result.projectId}`,
          }).catch(() => {});

          // Push full OpenClaw config (system prompt, skills, channels, model) to the new Railway service
          // This ensures the bot starts with the correct identity and configuration
          rebuildAndPushConfig(ctx.user.id).catch(err => {
            console.warn(`[Provision] Failed to push OpenClaw config after provisioning: ${err?.message}`);
          });

          return {
            success: true,
            deploymentId: deployId,
            domain: result.domain,
            railwayProjectId: result.projectId,
            railwayUrl: `https://${result.domain}`,
          };
        } catch (error: any) {
          await updateDeploymentStatus(deployId, "failed", {
            error: error?.message ?? "Unknown error",
          });

          notifyOwner({
            title: "Railway Deployment Failed",
            content: `User ${ctx.user.name ?? ctx.user.openId} attempted to deploy "${input.instanceName}" but it failed: ${error?.message ?? "Unknown error"}`,
          }).catch(() => {});

          throw error;
        }
      }),

    status: protectedProcedure
      .input(z.object({ deploymentId: z.string() }))
      .query(async ({ input }) => {
        return getDeploymentStatus(input.deploymentId);
      }),

    pollStatus: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await import("./db").then(m => m.getDb());
        if (!db) return null;

        const { deployments } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");

        const result = await db
          .select()
          .from(deployments)
          .where(
            and(
              eq(deployments.id, input.id),
              eq(deployments.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (result.length === 0) return null;

        const deployment = result[0];
        const metadata = deployment.metadata as Record<string, any> | null;

        if (
          deployment.status === "deploying" &&
          metadata?.railwayServiceId &&
          metadata?.railwayEnvironmentId
        ) {
          try {
            const latest = await getLatestDeployment(
              metadata.railwayServiceId,
              metadata.railwayEnvironmentId
            );

            if (latest) {
              const statusMap: Record<string, string> = {
                SUCCESS: "success",
                FAILED: "failed",
                CRASHED: "failed",
                BUILDING: "deploying",
                DEPLOYING: "deploying",
                INITIALIZING: "deploying",
              };

              const mappedStatus = statusMap[latest.status] ?? "deploying";

              if (mappedStatus !== deployment.status) {
                const { updateDeploymentStatus } = await import("./db");
                await updateDeploymentStatus(deployment.id, mappedStatus as any, {
                  ...metadata,
                  railwayDeploymentStatus: latest.status,
                });
                deployment.status = mappedStatus as any;
              }

              return {
                ...deployment,
                railwayStatus: latest.status,
                railwayUrl: latest.url ? `https://${latest.url}` : null,
              };
            }
          } catch {
            // Railway API might be temporarily unavailable
          }
        }

        return {
          ...deployment,
          railwayStatus: null,
          railwayUrl: deployment.externalUrl,
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          configurationId: z.number().optional(),
          method: z.enum(["railway", "docker", "render", "hostinger", "emergent", "northflank", "cloudflare", "alibaba"]),
          instanceName: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await createDeployment({
          userId: ctx.user.id,
          configurationId: input.configurationId ?? null,
          method: input.method,
          status: "pending",
          instanceName: input.instanceName ?? null,
        });
        return { id };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserDeployments(ctx.user.id);
    }),

    listAll: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(500).optional(),
            offset: z.number().min(0).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getAllDeployments(input?.limit ?? 100, input?.offset ?? 0);
      }),

    railwayProjects: adminProcedure.query(async () => {
      return listProjects();
    }),

    /**
     * Register a self-hosted instance (Docker, Render, etc.) so it
     * appears on the dashboard and can proxy health / chat.
     */
    registerSelfHosted: protectedProcedure
      .input(
        z.object({
          instanceName: z.string().min(1).max(255),
          gatewayUrl: z.string().url().max(512),
          gatewayToken: z.string().min(1).max(512),
          method: z.enum(["docker", "render", "hostinger", "emergent", "northflank", "cloudflare", "alibaba"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate the gateway is reachable before saving
        try {
          const testConn: GatewayConnection = {
            url: input.gatewayUrl,
            token: input.gatewayToken,
          };
          const healthResult = await checkGatewayHealth(testConn);
          if (!healthResult.healthy) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not reach the gateway at the provided URL. Make sure your SunClaw instance is running and the URL/token are correct.",
            });
          }
        } catch (err: any) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Could not connect to gateway: ${err?.message ?? "Connection failed"}. Ensure your instance is running and publicly accessible.`,
          });
        }

        // Create deployment record
        const deployId = await createDeployment({
          userId: ctx.user.id,
          configurationId: null,
          method: input.method,
          status: "success",
          instanceName: input.instanceName,
        });

        // Set externalUrl and metadata
        const { getDb } = await import("./db");
        const db = await getDb();
        if (db) {
          const { deployments } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db
            .update(deployments)
            .set({
              externalUrl: input.gatewayUrl,
              metadata: {
                gatewayToken: input.gatewayToken,
                OPENCLAW_TOKEN: input.gatewayToken,
                selfHosted: true,
              },
            })
            .where(eq(deployments.id, deployId));
        }

        notifyOwner({
          title: "Self-Hosted Instance Registered",
          content: `User ${ctx.user.name ?? ctx.user.openId} registered a ${input.method} instance "${input.instanceName}" at ${input.gatewayUrl}`,
        }).catch(() => {});

        return {
          success: true,
          deploymentId: deployId,
          url: input.gatewayUrl,
        };
      }),
  }),

  /* ─── Dashboard (proxy to deployed OpenClaw Gateway) ─── */
  dashboard: router({
    instance: protectedProcedure.query(async ({ ctx }) => {
      const deps = await getUserDeployments(ctx.user.id);
      const active = deps.find(d => d.status === "success" && d.externalUrl);
      if (!active) return null;
      const meta = active.metadata as Record<string, any> | null;
      return {
        id: active.id,
        name: active.instanceName,
        url: active.externalUrl,
        domain: active.externalUrl?.replace("https://", ""),
        gatewayToken: meta?.gatewayToken ?? meta?.OPENCLAW_TOKEN ?? "",
        createdAt: active.createdAt,
      };
    }),

    /** Proxy health check to the deployed Gateway */
    health: protectedProcedure.query(async ({ ctx }) => {
      const gw = await getUserGateway(ctx.user.id);
      if (!gw) return { status: "no_deployment", healthy: false };
      return checkGatewayHealth(gw);
    }),

    /**
     * Send a chat message through the deployed OpenClaw Gateway.
     * FIXED: Routes exclusively through OpenClaw — no split-brain fallback.
     * The Gateway handles model selection, skills, memory, and tool use.
     */
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        agentId: z.string().default("main"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify active subscription before proxying chat
        const chatUser = await getUserById(ctx.user.id);
        if (!chatUser || !canDeployRailway(chatUser.plan ?? "free")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "An active Pro or Enterprise subscription is required to use the dashboard.",
          });
        }

        const gw = await getUserGateway(ctx.user.id);
        if (!gw) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No active deployment found. Deploy SunClaw first.",
          });
        }

        try {
          const result = await chatViaGateway(gw, input.messages, input.agentId);

          // Track analytics
          await trackEvent({
            userId: ctx.user.id,
            eventType: "message_sent",
            eventData: { model: result.model, provider: "openclaw", usage: result.usage },
          });

          return result;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to reach OpenClaw Gateway: ${err.message}`,
          });
        }
      }),

    /**
     * Chat with memory — routes through OpenClaw Gateway.
     * FIXED: Removed the split-brain LLM failover engine.
     * OpenClaw handles memory, skills, and model selection natively.
     */
    chatWithMemory: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(10000),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify active subscription before proxying chat
        const memChatUser = await getUserById(ctx.user.id);
        if (!memChatUser || !canDeployRailway(memChatUser.plan ?? "free")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "An active Pro or Enterprise subscription is required to use the dashboard.",
          });
        }

        const gw = await getUserGateway(ctx.user.id);
        if (!gw) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No active deployment found. Deploy SunClaw to start chatting.",
          });
        }

        try {
          const result = await chatViaGateway(gw, [
            { role: "user", content: input.message },
          ]);

          // Track analytics
          await trackEvent({
            userId: ctx.user.id,
            eventType: "message_sent",
            eventData: { model: result.model, provider: "openclaw", usage: result.usage },
          });

          return {
            content: result.content,
            model: result.model,
            provider: "openclaw",
            usage: result.usage,
            failoverChain: ["OpenClaw Gateway"],
            usedManusFallback: false,
          };
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `OpenClaw Gateway error: ${err.message}`,
          });
        }
      }),

    /** Redeploy the user's active Railway service */
    redeploy: protectedProcedure.mutation(async ({ ctx }) => {
      const deps = await getUserDeployments(ctx.user.id);
      const active = deps.find(d => d.status === "success" && d.externalUrl);
      if (!active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No active deployment found" });
      }
      const meta = active.metadata as Record<string, any> | null;
      if (!meta?.railwayServiceId || !meta?.railwayEnvironmentId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing Railway service info for redeployment" });
      }

      try {
        const deploymentId = await redeployService(meta.railwayServiceId, meta.railwayEnvironmentId);
        await updateDeploymentStatus(active.id, "deploying", {
          ...meta,
          redeployTriggeredAt: Date.now(),
          railwayDeploymentId: deploymentId,
        });

        await trackEvent({
          userId: ctx.user.id,
          deploymentId: active.id,
          eventType: "redeploy_triggered",
          eventData: { deploymentId },
        });

        return { success: true, deploymentId: active.id };
      } catch (error: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Redeploy failed: ${error?.message ?? "Unknown"}` });
      }
    }),

    /** Get channel status from the deployed Gateway */
    channelStatus: protectedProcedure.query(async ({ ctx }) => {
      const gw = await getUserGateway(ctx.user.id);
      if (!gw) return null;
      return getChannelStatus(gw);
    }),

    /** Push current config to the deployed Gateway */
    pushConfig: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await rebuildAndPushConfig(ctx.user.id);
      return result;
    }),
  }),

  /* ─── API Keys (Model Provider Keys) ─── */
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserApiKeys(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          provider: z.string(),
          label: z.string().optional(),
          apiKey: z.string(),
          priority: z.number().optional(),
          baseUrl: z.string().url().optional(),
          model: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await createApiKey({
          userId: ctx.user.id,
          provider: input.provider,
          label: input.label ?? null,
          apiKey: input.apiKey,
          priority: input.priority,
          baseUrl: input.baseUrl,
          model: input.model,
        });

        // After adding a key, push updated config to Gateway
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after adding key: ${err?.message}`);
        });

        return { id };
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteApiKey(input.id, ctx.user.id);

        // After removing a key, push updated config to Gateway
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after removing key: ${err?.message}`);
        });

        return { success: true };
      }),

    setPriority: protectedProcedure
      .input(z.object({ id: z.number(), priority: z.number().min(0).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await updateApiKeyPriority(input.id, ctx.user.id, input.priority);

        // Auto-sync config to gateway after priority change
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after priority change: ${err?.message}`);
        });

        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await toggleApiKey(input.id, ctx.user.id, input.enabled);

        // After toggling a key, push updated config to Gateway
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after toggling key: ${err?.message}`);
        });

        return { success: true };
      }),

    /** Re-enable a previously failed key after user fixes it */
    reEnable: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Simply re-enable the key and mark as unchecked
        await toggleApiKey(input.id, ctx.user.id, true);
        // Push updated config
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after re-enabling key: ${err?.message}`);
        });
        return { healthy: true, error: null };
      }),

    /** Run health check on all user's API keys by sending a lightweight test request */
    healthCheck: protectedProcedure
      .mutation(async ({ ctx }) => {
        const keysWithSecrets = await getUserApiKeysWithSecrets(ctx.user.id);
        if (keysWithSecrets.length === 0) return [];

        const results = await Promise.allSettled(
          keysWithSecrets.filter(k => k.enabled).map(async (k) => {
            const provider = k.provider;
            const apiKey = k.apiKey;
            const baseUrl = k.baseUrl || PROVIDER_BASE_URLS[provider] || "https://api.openai.com/v1";
            const apiType = getApiType(provider);
            const testModel = k.model || PROVIDER_MODELS[provider]?.[0]?.id || "gpt-4o-mini";

            if (!apiKey) {
              return { id: k.id, provider, healthy: false, error: "API key is missing" };
            }

            try {
              let response: Response;
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);

              if (apiType === "anthropic-messages") {
                // Anthropic-style: POST /v1/messages with max_tokens=1
                const url = baseUrl.endsWith("/") ? `${baseUrl}v1/messages` : `${baseUrl}/v1/messages`;
                response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                  },
                  body: JSON.stringify({
                    model: testModel,
                    max_tokens: 1,
                    messages: [{ role: "user", content: "hi" }],
                  }),
                  signal: controller.signal,
                });
              } else if (apiType === "google-generative-ai") {
                // Google Gemini: POST with API key in query string
                const url = `${baseUrl}/models/${testModel}:generateContent?key=${apiKey}`;
                response = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: "hi" }] }],
                    generationConfig: { maxOutputTokens: 1 },
                  }),
                  signal: controller.signal,
                });
              } else {
                // OpenAI-compatible: POST /chat/completions with max_tokens=1
                const url = baseUrl.endsWith("/") ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
                response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: testModel,
                    max_tokens: 1,
                    messages: [{ role: "user", content: "hi" }],
                  }),
                  signal: controller.signal,
                });
              }

              clearTimeout(timeout);

              if (response.ok || response.status === 200) {
                await updateApiKeyStatus(k.id, "healthy");
                return { id: k.id, provider, healthy: true, error: null };
              }

              // Parse error response
              let errorMsg = `HTTP ${response.status}`;
              try {
                const body = await response.json();
                errorMsg = body?.error?.message ?? body?.message ?? JSON.stringify(body).slice(0, 200);
              } catch {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
              }

              // 401/403 = invalid key, others = degraded
              const status = response.status === 401 || response.status === 403 ? "failed" : "degraded";
              await updateApiKeyStatus(k.id, status, errorMsg);
              return { id: k.id, provider, healthy: false, error: errorMsg };
            } catch (err: any) {
              const errorMsg = err?.name === "AbortError" ? "Connection timed out (15s)" : (err?.message ?? "Unknown error");
              await updateApiKeyStatus(k.id, "degraded", errorMsg);
              return { id: k.id, provider, healthy: false, error: errorMsg };
            }
          })
        );

        return results.map((r) => {
          if (r.status === "fulfilled") return r.value;
          return { id: 0, provider: "unknown", healthy: false, error: String(r.reason) };
        });
      }),

    /** List available model providers */
    providers: publicProcedure.query(() => {
      return [
        { id: "openai", name: "OpenAI", description: "GPT-4o and GPT-4o-mini models", category: "premium", keyPlaceholder: "sk-...", freeTier: false, models: [{ id: "gpt-4o", name: "GPT-4o", tag: "flagship" }, { id: "gpt-4o-mini", name: "GPT-4o Mini" }, { id: "o3-mini", name: "o3-mini", tag: "reasoning" }], url: "https://platform.openai.com/api-keys" },
        { id: "anthropic", name: "Anthropic", description: "Claude Sonnet and Haiku models", category: "premium", keyPlaceholder: "sk-ant-...", freeTier: false, models: [{ id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", tag: "flagship" }, { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" }], url: "https://console.anthropic.com/settings/keys" },
        { id: "moonshot", name: "Kimi (Moonshot)", description: "Kimi K2.5 — 256k context, multimodal reasoning", category: "premium", keyPlaceholder: "sk-...", freeTier: false, models: [{ id: "kimi-k2.5", name: "Kimi K2.5", tag: "flagship" }], url: "https://platform.moonshot.ai/console/api-keys" },
        { id: "kimi-coding", name: "Kimi Coding", description: "Kimi K2.5 (Coding) — optimized for coding tasks via Anthropic-compatible API", category: "premium", keyPlaceholder: "sk-kimi-...", freeTier: false, models: [{ id: "kimi-for-coding", name: "Kimi K2.5 (Coding)", tag: "flagship" }], url: "https://platform.moonshot.cn/console/api-keys" },
        { id: "minimax", name: "MiniMax", description: "MiniMax M2.1 — 204k context, reasoning", category: "premium", keyPlaceholder: "eyJ...", freeTier: false, models: [{ id: "MiniMax-M2.1", name: "MiniMax M2.1", tag: "flagship" }, { id: "MiniMax-M2", name: "MiniMax M2" }], url: "https://www.minimaxi.com/platform" },
        { id: "google", name: "Google", description: "Gemini 2.0 Flash and Gemini 2.5 Pro", category: "premium", keyPlaceholder: "AIza...", freeTier: true, models: [{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" }, { id: "gemini-2.5-pro-preview-06-05", name: "Gemini 2.5 Pro", tag: "reasoning" }], url: "https://aistudio.google.com/apikey" },
        { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3 and R1 reasoning models", category: "standard", keyPlaceholder: "sk-...", freeTier: false, models: [{ id: "deepseek-chat", name: "DeepSeek V3" }, { id: "deepseek-reasoner", name: "DeepSeek R1", tag: "reasoning" }], url: "https://platform.deepseek.com/api_keys" },
        { id: "xai", name: "xAI", description: "Grok models from xAI", category: "premium", keyPlaceholder: "xai-...", freeTier: false, models: [{ id: "grok-3-mini", name: "Grok 3 Mini", tag: "reasoning" }], url: "https://console.x.ai/" },
        { id: "venice", name: "Venice AI", description: "Privacy-focused AI with uncensored models", category: "standard", keyPlaceholder: "venice-...", freeTier: true, models: [{ id: "llama-3.3-70b", name: "Llama 3.3 70B" }], url: "https://venice.ai/settings/api" },
        { id: "openrouter", name: "OpenRouter", description: "Access 200+ models through a single API", category: "aggregator", keyPlaceholder: "sk-or-...", freeTier: true, models: [{ id: "auto", name: "200+ models", tag: "aggregator" }], url: "https://openrouter.ai/keys" },
        { id: "groq", name: "Groq", description: "Ultra-fast inference with Groq hardware", category: "standard", keyPlaceholder: "gsk_...", freeTier: true, models: [{ id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" }], url: "https://console.groq.com/keys" },
        { id: "together", name: "Together AI", description: "Open-source model hosting", category: "standard", keyPlaceholder: "...", freeTier: true, models: [{ id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo" }], url: "https://api.together.xyz/settings/api-keys" },
        { id: "mistral", name: "Mistral", description: "European AI models", category: "premium", keyPlaceholder: "...", freeTier: false, models: [{ id: "mistral-large-latest", name: "Mistral Large" }], url: "https://console.mistral.ai/api-keys" },
        { id: "cerebras", name: "Cerebras", description: "Ultra-fast inference on Cerebras hardware", category: "standard", keyPlaceholder: "csk-...", freeTier: true, models: [{ id: "llama-3.3-70b", name: "Llama 3.3 70B" }], url: "https://cloud.cerebras.ai/" },
        { id: "perplexity", name: "Perplexity", description: "Search-augmented AI models", category: "premium", keyPlaceholder: "pplx-...", freeTier: false, models: [{ id: "sonar-pro", name: "Sonar Pro" }], url: "https://www.perplexity.ai/settings/api" },
        { id: "fireworks", name: "Fireworks AI", description: "Fast open-source model hosting", category: "standard", keyPlaceholder: "fw_...", freeTier: true, models: [{ id: "accounts/fireworks/models/llama-v3p3-70b-instruct", name: "Llama 3.3 70B" }], url: "https://fireworks.ai/account/api-keys" },
        { id: "cohere", name: "Cohere", description: "Enterprise AI with Command R+", category: "premium", keyPlaceholder: "...", freeTier: true, models: [{ id: "command-r-plus", name: "Command R+" }], url: "https://dashboard.cohere.com/api-keys" },
        { id: "sambanova", name: "SambaNova", description: "Fast inference on SambaNova hardware", category: "standard", keyPlaceholder: "...", freeTier: true, models: [{ id: "Meta-Llama-3.3-70B-Instruct", name: "Llama 3.3 70B" }], url: "https://cloud.sambanova.ai/" },
        { id: "novita", name: "Novita AI", description: "Affordable model hosting", category: "standard", keyPlaceholder: "...", freeTier: false, models: [{ id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" }], url: "https://novita.ai/dashboard/key" },
        { id: "hyperbolic", name: "Hyperbolic", description: "Open-access AI compute", category: "standard", keyPlaceholder: "...", freeTier: true, models: [{ id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B" }], url: "https://app.hyperbolic.xyz/" },
        { id: "zhipu", name: "Zhipu AI (GLM)", description: "GLM-4 Plus multimodal models", category: "standard", keyPlaceholder: "...", freeTier: false, models: [{ id: "glm-4-plus", name: "GLM-4 Plus" }], url: "https://open.bigmodel.cn/" },
      ];
    }),

    /** Get all available models grouped by provider (from openclaw-config) */
    allModels: publicProcedure.query(() => {
      return getProviderModels();
    }),

    /** Get the user's active model selection */
    activeModel: protectedProcedure.query(async ({ ctx }) => {
      const configs = await getUserConfigurations(ctx.user.id);
      const latestConfig = configs[0]?.config as Record<string, any> | null;
      return {
        activeModel: (latestConfig?.active_model as string) ?? null,
      };
    }),

    /** Set the user's active model and push to gateway */
    setActiveModel: protectedProcedure
      .input(z.object({
        /** Model identifier: "provider/model-id" (e.g. "moonshot/kimi-k2.5") */
        model: z.string().min(1).max(256),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get or create user's configuration
        const configs = await getUserConfigurations(ctx.user.id);
        if (configs.length > 0) {
          const existing = configs[0].config as Record<string, any>;
          await updateConfiguration(configs[0].id, ctx.user.id, {
            config: {
              ...existing,
              active_model: input.model,
            },
          });
        } else {
          await saveConfiguration({
            userId: ctx.user.id,
            name: "My SunClaw",
            config: { active_model: input.model },
          });
        }

        // Push updated config to gateway and AWAIT result so frontend knows deploy status
        const pushResult = await rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[ApiKeys] Failed to push config after setting active model: ${err?.message}`);
          return { pushed: false, error: err?.message };
        });

        return {
          success: true,
          model: input.model,
          deployed: pushResult.pushed,
          deployError: pushResult.error,
        };
      }),

    /** Get Railway environment variables (keys only, values masked for security) */
    railwayEnvVars: protectedProcedure
      .query(async ({ ctx }) => {
        const railwayInfo = await getUserRailwayInfo(ctx.user.id);
        if (!railwayInfo) return { error: "No active deployment", vars: {} as Record<string, string> };

        try {
          const vars = await getVariables(
            railwayInfo.projectId,
            railwayInfo.environmentId,
            railwayInfo.serviceId
          );
          // Mask sensitive values but show key names and partial values
          const masked: Record<string, string> = {};
          for (const [key, value] of Object.entries(vars)) {
            if (!value) {
              masked[key] = "(empty)";
            } else if (key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") || key.toLowerCase().includes("password")) {
              masked[key] = value.slice(0, 8) + "..." + value.slice(-4);
            } else if (key === "OPENCLAW_CONFIG_B64") {
              // Show decoded config for debugging
              try {
                const decoded = Buffer.from(value, "base64").toString("utf-8");
                masked[key] = decoded.slice(0, 500) + (decoded.length > 500 ? "..." : "");
              } catch {
                masked[key] = `(base64, ${value.length} chars)`;
              }
            } else {
              masked[key] = value.length > 80 ? value.slice(0, 80) + "..." : value;
            }
          }
          return { vars: masked, count: Object.keys(vars).length };
        } catch (err: any) {
          return { error: err?.message ?? "Failed to fetch vars", vars: {} as Record<string, string> };
        }
      }),

    /** Get Railway deployment runtime logs */
    railwayLogs: protectedProcedure
      .input(z.object({
        type: z.enum(["runtime", "build"]).default("runtime"),
        limit: z.number().min(10).max(500).default(100),
      }).optional())
      .query(async ({ ctx, input }) => {
        const railwayInfo = await getUserRailwayInfo(ctx.user.id);
        if (!railwayInfo) return { error: "No active deployment", logs: [] as Array<{ timestamp: string; message: string; severity: string }> };

        try {
          const latest = await getLatestDeployment(
            railwayInfo.serviceId,
            railwayInfo.environmentId
          );
          if (!latest) return { error: "No deployments found", logs: [] as Array<{ timestamp: string; message: string; severity: string }> };

          const logType = input?.type ?? "runtime";
          const limit = input?.limit ?? 100;

          const logs = logType === "build"
            ? await getBuildLogs(latest.id, limit)
            : await getDeploymentLogs(latest.id, limit);

          return {
            deploymentId: latest.id,
            deploymentStatus: latest.status,
            logType,
            logs,
          };
        } catch (err: any) {
          return { error: err?.message ?? "Failed to fetch logs", logs: [] as Array<{ timestamp: string; message: string; severity: string }> };
        }
      }),

    /** Check the current Railway deployment status */
    deployStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const railwayInfo = await getUserRailwayInfo(ctx.user.id);
        if (!railwayInfo) return { status: "no_deployment" as const, message: "No active deployment" };

        try {
          const latest = await getLatestDeployment(
            railwayInfo.serviceId,
            railwayInfo.environmentId
          );
          if (!latest) return { status: "unknown" as const, message: "No deployments found" };

          const statusMap: Record<string, "deploying" | "success" | "failed" | "building"> = {
            SUCCESS: "success",
            FAILED: "failed",
            CRASHED: "failed",
            BUILDING: "building",
            DEPLOYING: "deploying",
            INITIALIZING: "deploying",
            REMOVING: "deploying",
            SLEEPING: "success",
          };

          return {
            status: statusMap[latest.status] ?? "unknown" as const,
            rawStatus: latest.status,
            deploymentId: latest.id,
            createdAt: latest.createdAt,
            url: latest.url ? `https://${latest.url}` : null,
          };
        } catch (err: any) {
          return { status: "error" as const, message: err?.message ?? "Failed to check status" };
        }
      }),
  }),

  /* ─── Conversations (Chat Export) ─── */
  conversations: router({
    save: protectedProcedure
      .input(z.object({
        title: z.string().max(512).optional(),
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        model: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const deps = await getUserDeployments(ctx.user.id);
        const active = deps.find(d => d.status === "success");
        const id = await saveConversation({
          userId: ctx.user.id,
          deploymentId: active?.id,
          title: input.title ?? `Chat ${new Date().toLocaleDateString()}`,
          messages: input.messages,
          model: input.model,
        });
        return { id };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserConversations(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getConversationById(input.id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConversation(input.id, ctx.user.id);
        return { success: true };
      }),

    export: protectedProcedure
      .input(z.object({
        id: z.number(),
        format: z.enum(["json", "markdown"]).default("markdown"),
      }))
      .query(async ({ ctx, input }) => {
        const convo = await getConversationById(input.id, ctx.user.id);
        if (!convo) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });

        const messages = convo.messages as Array<{ role: string; content: string }>;

        if (input.format === "json") {
          return {
            content: JSON.stringify({ title: convo.title, model: convo.model, messages, exportedAt: new Date().toISOString() }, null, 2),
            filename: `${convo.title.replace(/[^a-z0-9]/gi, "_")}.json`,
            mimeType: "application/json",
          };
        }

        let md = `# ${convo.title}\n\n`;
        md += `**Model:** ${convo.model ?? "Unknown"}  \n`;
        md += `**Date:** ${convo.createdAt?.toISOString?.() ?? "Unknown"}  \n`;
        md += `**Messages:** ${convo.messageCount}\n\n---\n\n`;

        for (const msg of messages) {
          const label = msg.role === "user" ? "**You**" : msg.role === "assistant" ? "**SunClaw**" : "*System*";
          md += `### ${label}\n\n${msg.content}\n\n`;
        }

        return {
          content: md,
          filename: `${convo.title.replace(/[^a-z0-9]/gi, "_")}.md`,
          mimeType: "text/markdown",
        };
      }),
  }),

  /* ─── Analytics ─── */
  analytics: router({
    summary: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        return getAnalyticsSummary(ctx.user.id, input?.days ?? 30);
      }),

    timeline: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).default(7) }).optional())
      .query(async ({ ctx, input }) => {
        return getAnalyticsTimeline(ctx.user.id, input?.days ?? 7);
      }),

    track: protectedProcedure
      .input(z.object({
        eventType: z.string().max(64),
        eventData: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const deps = await getUserDeployments(ctx.user.id);
        const active = deps.find(d => d.status === "success");
        await trackEvent({
          userId: ctx.user.id,
          deploymentId: active?.id,
          eventType: input.eventType,
          eventData: input.eventData,
        });
        return { success: true };
      }),

  }),

  /* ─── Notifications ─── */
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return getUserNotifications(ctx.user.id, input?.limit ?? 50);
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return { count: await getUnreadNotificationCount(ctx.user.id) };
    }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  /* ─── Channels (Config-Based Setup) ─── */
  channels: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserChannelConnections(ctx.user.id);
    }),

    /** Get requirements for setting up a specific channel */
    requirements: publicProcedure
      .input(z.object({ channel: z.string() }))
      .query(({ input }) => {
        return getChannelRequirements(input.channel);
      }),

    /**
     * Connect a channel.
     * FIXED: Uses config-based approach instead of env vars.
     * 1. Verify credentials locally
     * 2. Save to DB
     * 3. Rebuild full openclaw.json from all active channels
     * 4. Push config to Gateway via control plane API
     * 5. Gateway reloads channels without full redeploy
     */
    connect: protectedProcedure
      .input(z.object({
        channel: z.string().max(64),
        label: z.string().max(255).optional(),
        credentials: z.record(z.string(), z.unknown()),
        config: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Step 1: Verify credentials
        let verified = false;
        try {
          console.log(`[Channels] Verifying ${input.channel} credentials, keys: ${Object.keys(input.credentials).join(", ")}`);
          verified = await verifyChannelCredentials(input.channel, input.credentials);
          console.log(`[Channels] Verification result for ${input.channel}: ${verified}`);
        } catch (verifyErr: any) {
          console.error(`[Channels] Verification threw for ${input.channel}:`, verifyErr?.message);
          verified = false;
        }

        // Step 2: Save to DB
        const id = await createChannelConnection({
          userId: ctx.user.id,
          channel: input.channel,
          label: input.label,
          credentials: input.credentials,
          webhookUrl: "", // No webhook needed — OpenClaw uses long-polling/socket mode
          config: input.config,
        });

        if (!verified) {
          await updateChannelConnectionStatus(id, ctx.user.id, "error", "Failed to verify credentials");
          return { id, status: "error", pushed: false };
        }

        await updateChannelConnectionStatus(id, ctx.user.id, "connected", "Credentials verified");

        // Step 3: Rebuild and push config to Gateway
        let pushed = false;
        let pushError = "";
        try {
          const result = await rebuildAndPushConfig(ctx.user.id);
          pushed = result.pushed;
          pushError = result.error ?? "";
          if (pushed) {
            await updateChannelConnectionStatus(id, ctx.user.id, "connected", "Live on OpenClaw Gateway");
          }
        } catch (err: any) {
          pushError = err?.message ?? "Unknown error";
          console.warn(`[Channels] Failed to push config: ${pushError}`);
        }

        // Notifications
        await createNotification({
          userId: ctx.user.id,
          type: "channel_status",
          title: `${input.channel} Connected`,
          message: pushed
            ? `Your ${input.channel} channel is live on OpenClaw. No restart needed.`
            : `Your ${input.channel} credentials are verified. ${pushError || "Deploy to Railway to activate."}`,
          severity: "success",
        });

        await trackEvent({
          userId: ctx.user.id,
          eventType: "channel_connected",
          eventData: { channel: input.channel, pushed },
        });

        return { id, status: "connected", pushed };
      }),

    updateCredentials: protectedProcedure
      .input(z.object({
        id: z.number(),
        credentials: z.record(z.string(), z.unknown()),
        config: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateChannelCredentials(input.id, ctx.user.id, input.credentials, input.config);

        // Rebuild and push config
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[Channels] Failed to push config after credential update: ${err?.message}`);
        });

        return { success: true };
      }),

    /**
     * Disconnect a channel.
     * FIXED: Rebuilds config without this channel and pushes to Gateway.
     * No env var removal or redeploy needed.
     */
    disconnect: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await updateChannelConnectionStatus(input.id, ctx.user.id, "disconnected", "Manually disconnected");

        // Rebuild config without this channel
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[Channels] Failed to push config after disconnect: ${err?.message}`);
        });

        await createNotification({
          userId: ctx.user.id,
          type: "channel_status",
          title: "Channel Disconnected",
          message: "Channel removed from OpenClaw configuration.",
          severity: "warning",
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteChannelConnection(input.id, ctx.user.id);

        // Rebuild config without this channel
        rebuildAndPushConfig(ctx.user.id).catch(err => {
          console.warn(`[Channels] Failed to push config after removal: ${err?.message}`);
        });

        return { success: true };
      }),

    /** Re-verify a channel and push config */
    verify: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const connections = await getUserChannelConnections(ctx.user.id);
        const conn = connections.find(c => c.id === input.id);
        if (!conn) throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" });

        const creds = conn.credentials as Record<string, unknown> | null;
        if (!creds) throw new TRPCError({ code: "BAD_REQUEST", message: "No credentials stored" });

        const verified = await verifyChannelCredentials(conn.channel, creds);

        let pushed = false;
        if (verified) {
          await updateChannelConnectionStatus(input.id, ctx.user.id, "connected", "Re-verified");
          const result = await rebuildAndPushConfig(ctx.user.id);
          pushed = result.pushed;
        } else {
          await updateChannelConnectionStatus(input.id, ctx.user.id, "error", "Verification failed");
        }

        return { verified, pushed };
      }),
  }),

  /* ─── Admin Token Management ─── */
  adminTokens: router({
    allKeys: adminProcedure.query(async () => {
      return getAllApiKeys();
    }),

    users: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    addKeyForUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        provider: z.string().min(1),
        apiKey: z.string().min(1),
        label: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createApiKey({
          userId: input.userId,
          provider: input.provider,
          apiKey: input.apiKey,
          label: input.label ?? null,
        });
      }),
  }),

  /* ─── Soul.md (System Prompt Editor) ─── */
  soul: router({
    /** Get the current soul.md content */
    get: protectedProcedure.query(async ({ ctx }) => {
      // Check user's saved config first
      const configs = await getUserConfigurations(ctx.user.id);
      const latestConfig = configs[0];
      const configData = latestConfig?.config as Record<string, any> | null;
      if (configData?.system_prompt) {
        return { content: configData.system_prompt as string, source: "config" as const };
      }

      return { content: getDefaultSoulMd(), source: "default" as const };
    }),

    /** Update the soul.md and push to Gateway via config */
    update: protectedProcedure
      .input(z.object({
        content: z.string().min(1).max(50000),
      }))
      .mutation(async ({ ctx, input }) => {
        // Save to user's configuration
        const configs = await getUserConfigurations(ctx.user.id);
        if (configs.length > 0) {
          const configData = (configs[0].config as Record<string, any>) ?? {};
          configData.system_prompt = input.content;
          await updateConfiguration(configs[0].id, ctx.user.id, configData);
        } else {
          await saveConfiguration({
            userId: ctx.user.id,
            name: "SunClaw Config",
            config: { system_prompt: input.content },
          });
        }

        // Push updated config to Gateway (includes the new soul.md)
        const pushResult = await rebuildAndPushConfig(ctx.user.id);

        return { success: true, pushedToOpenClaw: pushResult.pushed };
      }),

    reset: protectedProcedure.mutation(async ({ ctx }) => {
      const defaultContent = getDefaultSoulMd();

      const configs = await getUserConfigurations(ctx.user.id);
      if (configs.length > 0) {
        const configData = (configs[0].config as Record<string, any>) ?? {};
        configData.system_prompt = defaultContent;
        await updateConfiguration(configs[0].id, ctx.user.id, configData);
      }

      // Push updated config to Gateway
      rebuildAndPushConfig(ctx.user.id).catch(() => {});

      return { success: true, content: defaultContent };
    }),
  }),


  /* ─── Gateway Config (Direct Access) ─── */
  gatewayConfig: router({
    /** Generate the openclaw.json config from current DB state */
    generate: protectedProcedure.query(async ({ ctx }) => {
      const result = await rebuildAndPushConfig(ctx.user.id);
      return { config: result.config, pushed: result.pushed, error: result.error };
    }),

    /** Validate a config object */
    validate: publicProcedure
      .input(z.object({ config: z.record(z.string(), z.unknown()) }))
      .query(({ input }) => {
        return validateOpenClawConfig(input.config);
      }),
  }),
});

/** Default soul.md content — imported from curated artifact */
function getDefaultSoulMd(): string {
  return DEFAULT_SUNCLAW_SOUL;
}

export type AppRouter = typeof appRouter;
