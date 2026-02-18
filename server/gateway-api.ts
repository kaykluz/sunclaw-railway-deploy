/**
 * OpenClaw Gateway Control Plane API Client
 *
 * The OpenClaw Gateway exposes a control plane UI and API at the gateway's HTTP port.
 * This module communicates with the deployed OpenClaw instance to:
 *   - Push/pull the openclaw.json config
 *   - Reload channels without full redeploy
 *   - Check gateway health and channel status
 *   - Proxy chat messages through the OpenAI-compatible API
 *
 * The control plane is protected by the OPENCLAW_TOKEN (Bearer auth).
 *
 * Key endpoints (from OpenClaw source):
 *   GET  /health                    — Health check
 *   GET  /api/config                — Get current config
 *   POST /api/config                — Update config (JSON body)
 *   POST /api/config/apply          — Reload channels/skills without restart
 *   POST /v1/chat/completions       — OpenAI-compatible chat API
 *   GET  /api/channels              — List active channels and their status
 */

export interface GatewayConnection {
  /** Base URL of the deployed OpenClaw instance (e.g. https://sunclaw-xxx.up.railway.app) */
  url: string;
  /** Bearer token for gateway auth (OPENCLAW_TOKEN) */
  token: string;
}

export interface GatewayHealthResponse {
  status: "ok" | "unhealthy" | "unreachable" | "no_deployment";
  healthy: boolean;
  version?: string;
  uptime?: number;
  channels?: Record<string, { connected: boolean; error?: string }>;
}

export interface GatewayConfigResponse {
  success: boolean;
  config?: Record<string, unknown>;
  error?: string;
}

export interface GatewayChatResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

const TIMEOUT_MS = 15000;
const CHAT_TIMEOUT_MS = 120000;

/* ─── Health ─── */

export async function checkGatewayHealth(gw: GatewayConnection): Promise<GatewayHealthResponse> {
  try {
    const res = await fetch(`${gw.url}/health`, {
      headers: authHeaders(gw.token),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { status: "unhealthy", healthy: false };
    const data = await res.json();
    return { status: "ok", healthy: true, ...data };
  } catch {
    return { status: "unreachable", healthy: false };
  }
}

/* ─── Config: Get ─── */

export async function getGatewayConfig(gw: GatewayConnection): Promise<GatewayConfigResponse> {
  try {
    const res = await fetch(`${gw.url}/api/config`, {
      headers: authHeaders(gw.token),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }
    const config = await res.json();
    return { success: true, config };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to reach gateway" };
  }
}

/* ─── Config: Push ─── */

export async function pushGatewayConfig(
  gw: GatewayConnection,
  config: Record<string, unknown>
): Promise<GatewayConfigResponse> {
  try {
    const res = await fetch(`${gw.url}/api/config`, {
      method: "POST",
      headers: {
        ...authHeaders(gw.token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to reach gateway" };
  }
}

/* ─── Config: Apply (reload channels without restart) ─── */

export async function applyGatewayConfig(gw: GatewayConnection): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${gw.url}/api/config/apply`, {
      method: "POST",
      headers: authHeaders(gw.token),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to reach gateway" };
  }
}

/* ─── Config: Push + Apply (convenience) ─── */

export async function pushAndApplyConfig(
  gw: GatewayConnection,
  config: Record<string, unknown>
): Promise<GatewayConfigResponse> {
  // Step 1: Push the config
  const pushResult = await pushGatewayConfig(gw, config);
  if (!pushResult.success) return pushResult;

  // Step 2: Apply (reload channels/skills)
  const applyResult = await applyGatewayConfig(gw);
  if (!applyResult.success) {
    return { success: false, error: `Config saved but apply failed: ${applyResult.error}` };
  }

  return { success: true };
}

/* ─── Chat (OpenAI-compatible) ─── */

export async function chatViaGateway(
  gw: GatewayConnection,
  messages: Array<{ role: string; content: string }>,
  agentId: string = "main"
): Promise<GatewayChatResponse> {
  const res = await fetch(`${gw.url}/v1/chat/completions`, {
    method: "POST",
    headers: {
      ...authHeaders(gw.token),
      "Content-Type": "application/json",
      "x-openclaw-agent-id": agentId,
    },
    body: JSON.stringify({
      model: `openclaw:${agentId}`,
      messages,
      stream: false,
    }),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway chat failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "No response",
    model: data.model ?? `openclaw:${agentId}`,
    usage: data.usage,
  };
}

/* ─── Channel Status ─── */

export async function getChannelStatus(
  gw: GatewayConnection
): Promise<Record<string, { connected: boolean; error?: string }> | null> {
  try {
    const res = await fetch(`${gw.url}/api/channels`, {
      headers: authHeaders(gw.token),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ─── Helpers ─── */

function authHeaders(token: string): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
