/**
 * Channel credential verification.
 *
 * Verifies that the provided credentials are valid for each channel type
 * by making lightweight API calls to the respective services.
 *
 * Field names match the OpenClaw config schema (not arbitrary SunClaw names):
 *   - Telegram: botToken
 *   - Discord: token (NOT botToken)
 *   - Slack: botToken + appToken
 *   - WhatsApp: no credentials (Baileys QR pairing at runtime)
 *   - Signal: optional account + httpUrl
 *   - MS Teams: appId + appPassword
 */

export async function verifyChannelCredentials(
  channel: string,
  credentials: Record<string, unknown>
): Promise<boolean> {
  try {
    switch (channel) {
      case "telegram":
        return await verifyTelegram(credentials);
      case "discord":
        return await verifyDiscord(credentials);
      case "slack":
        return await verifySlack(credentials);
      case "whatsapp":
        // WhatsApp uses Baileys (WhatsApp Web protocol) — no API credentials to verify.
        // Pairing happens at runtime via QR code on the OpenClaw instance.
        return true;
      case "signal":
        return await verifySignal(credentials);
      case "msteams":
        return await verifyMSTeams(credentials);
      case "webchat":
        // WebChat is built into the OpenClaw Gateway — always valid.
        return true;
      default:
        // Unknown channel — pass if any credentials exist
        return Object.keys(credentials).length > 0;
    }
  } catch (error) {
    console.error(`[ChannelVerify] ${channel} verification failed:`, error);
    return false;
  }
}

/* ─── Telegram ─── */

async function verifyTelegram(creds: Record<string, unknown>): Promise<boolean> {
  const botToken = creds.botToken as string | undefined;
  if (!botToken) {
    console.log("[Telegram Verify] No botToken provided. Keys:", Object.keys(creds));
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      const text = await res.text();
      console.log(`[Telegram Verify] getMe failed (${res.status}):`, text);
      return false;
    }
    const data = await res.json();
    if (data.ok === true) {
      console.log(`[Telegram Verify] Bot verified: @${data.result?.username}`);
      return true;
    }
    return false;
  } catch (err: any) {
    console.error(`[Telegram Verify] Error:`, err?.message);
    return false;
  }
}

/* ─── Discord ─── */

async function verifyDiscord(creds: Record<string, unknown>): Promise<boolean> {
  // OpenClaw uses "token" (not "botToken") for Discord
  const token = (creds.token as string) ?? (creds.botToken as string);
  if (!token) {
    console.log("[Discord Verify] No token provided. Keys:", Object.keys(creds));
    return false;
  }

  try {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[Discord Verify] Bot verified: ${data.username}#${data.discriminator}`);
      return true;
    }
    console.log(`[Discord Verify] Failed (${res.status})`);
    return false;
  } catch (err: any) {
    console.error(`[Discord Verify] Error:`, err?.message);
    return false;
  }
}

/* ─── Slack ─── */

async function verifySlack(creds: Record<string, unknown>): Promise<boolean> {
  const botToken = creds.botToken as string | undefined;
  if (!botToken) {
    console.log("[Slack Verify] No botToken provided. Keys:", Object.keys(creds));
    return false;
  }

  // Verify bot token
  try {
    const res = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.ok !== true) {
      console.log(`[Slack Verify] auth.test failed:`, data.error);
      return false;
    }
    console.log(`[Slack Verify] Bot verified: ${data.bot_id} in ${data.team}`);
  } catch (err: any) {
    console.error(`[Slack Verify] Error:`, err?.message);
    return false;
  }

  // Check appToken exists (required for Socket Mode, but we can't verify it via API)
  const appToken = creds.appToken as string | undefined;
  if (!appToken) {
    console.log("[Slack Verify] Warning: No appToken provided. Socket Mode requires xapp-... token.");
    // Still return true since botToken is valid — appToken is needed at runtime
  }

  return true;
}

/* ─── Signal ─── */

async function verifySignal(creds: Record<string, unknown>): Promise<boolean> {
  const httpUrl = creds.httpUrl as string | undefined;
  const account = creds.account as string | undefined;

  // Signal requires signal-cli daemon running. If httpUrl is provided, try to reach it.
  if (httpUrl) {
    try {
      const res = await fetch(`${httpUrl}/v1/about`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        console.log(`[Signal Verify] signal-cli daemon reachable at ${httpUrl}`);
        return true;
      }
    } catch {
      console.log(`[Signal Verify] signal-cli daemon unreachable at ${httpUrl}`);
    }
    return false;
  }

  // If no httpUrl, just check that an account number is provided
  if (account) {
    console.log(`[Signal Verify] Account provided: ${account} (will be verified at runtime)`);
    return true;
  }

  console.log("[Signal Verify] No httpUrl or account provided");
  return false;
}

/* ─── MS Teams ─── */

async function verifyMSTeams(creds: Record<string, unknown>): Promise<boolean> {
  const appId = creds.appId as string | undefined;
  const appPassword = creds.appPassword as string | undefined;

  if (!appId || !appPassword) {
    console.log("[MSTeams Verify] Missing appId or appPassword. Keys:", Object.keys(creds));
    return false;
  }

  // Try to get an OAuth token to verify the credentials
  try {
    const tenantId = (creds.tenantId as string) ?? "botframework.com";
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: appId,
      client_secret: appPassword,
      scope: "https://api.botframework.com/.default",
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      console.log(`[MSTeams Verify] Credentials verified for app ${appId}`);
      return true;
    }
    console.log(`[MSTeams Verify] Token request failed (${res.status})`);
    return false;
  } catch (err: any) {
    console.error(`[MSTeams Verify] Error:`, err?.message);
    return false;
  }
}
