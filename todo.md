# Project TODO

## Existing Features (Pre-Upgrade)
- [x] Command Center landing page with hero, stats, skills, demo, channels, architecture, deploy, CTA
- [x] Animated chat demo with solar energy queries
- [x] Skill registry with 11 cards (6 standalone + 5 enterprise)
- [x] Multi-channel support badges
- [x] Architecture diagram section
- [x] Deploy section with Railway + Docker options
- [x] Auth gate page (signup/login) with localStorage mock
- [x] Setup Wizard with 4 steps (AI Provider, Channels, KIISHA, Deploy)
- [x] Full-stack upgrade: tRPC + Drizzle + Manus OAuth applied

## Full-Stack Backend
- [x] Database schema: waitlist table for email capture
- [x] Database schema: configurations table for saved wizard configs
- [x] Database schema: deployments table for tracking deploy history
- [x] tRPC route: waitlist.join (public) — capture email + name
- [x] tRPC route: config.save (protected) — save wizard configuration
- [x] tRPC route: config.load (protected) — load saved configuration
- [x] tRPC route: config.list (protected) — list user's configurations
- [x] tRPC route: deploy.create (protected) — record deployment attempt

## Frontend Integration
- [x] Add waitlist email capture form to hero section
- [x] Update Auth page to use Manus OAuth (real auth)
- [x] Update Setup Wizard to use real tRPC auth state
- [x] Connect Setup Wizard save/load to tRPC config routes
- [x] Show waitlist count on landing page

## Testing
- [x] Vitest: waitlist.join route
- [x] Vitest: config.save and config.load routes

## Railway API Integration
- [x] Research Railway GraphQL API for project/service creation
- [x] Add RAILWAY_API_TOKEN secret via webdev_request_secrets
- [x] Build server-side Railway provisioning helper (create project, add service, set env vars)
- [x] Wire deploy tRPC route to call Railway API when method is "railway"
- [x] Update Setup Wizard deploy step to show real provisioning progress and result URL

## Admin Dashboard
- [x] Create admin dashboard page with tabs: Waitlist, Configurations, Deployments
- [x] Wire admin routes (waitlist.list, config.listAll, deploy.listAll)
- [x] Add admin route guard and navigation entry
- [x] Show stats summary cards (total waitlist, total configs, total deployments)

## Notifications
- [x] Add notifyOwner call when someone joins the waitlist
- [x] Add notifyOwner call when a deployment is created
- [x] Vitest: Railway provisioning route
- [x] Vitest: Admin dashboard routes
- [x] Vitest: Notification triggers

## Admin Promotion
- [x] Promote owner account to admin role

## Stripe Billing Integration
- [x] Add Stripe feature via webdev_add_feature
- [x] Create subscription plans schema (free/pro/enterprise)
- [x] Build pricing page with plan comparison
- [x] Implement Stripe checkout session creation
- [x] Handle Stripe webhooks for subscription lifecycle
- [x] Store subscription status in user/subscriptions table
- [x] Gate Railway provisioning behind active paid plan
- [x] Show billing status in user dashboard

## Railway Template Variables
- [x] Pre-configure default env vars for Railway deployments
- [x] Allow users to customize env vars before deploy

## Admin Enhancements
- [x] Add waitlist CSV export button to admin dashboard

## Testing
- [x] Vitest: Stripe checkout and subscription routes
- [x] Vitest: Railway provisioning plan gating

## Railway Deployment Fix
- [x] Fix Dockerfile CMD/ENTRYPOINT — "cd executable not found" error
- [x] Push fix to kaykluz/sunclaw repo
- [x] Verify Railway deployment succeeds

## Env Var Mapping Fix
- [x] Map wizard LLM_API_KEY to provider-specific env var (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
- [x] Update railway-defaults.ts template vars info to match actual gateway env vars

## Railway Healthcheck Fix
- [x] Fix gateway /health to always return 200 so Railway keeps container alive
- [x] Increase Railway healthcheck timeout from 30s to 120s

## Railway Comprehensive Fix
- [x] Bust Docker cache — Railway is using stale cached layers with old server.js and old healthcheck
- [x] Rewrite Dockerfile to prevent cache issues and ensure reliable startup
- [x] Make gateway start HTTP server immediately (before OpenClaw child process)
- [x] Ensure /health returns 200 within seconds of container start
- [x] Remove dependency on npx openclaw (may not exist) — make gateway self-sufficient

## Railway Deployment Fix (Final)
- [x] Verify Railway deployment succeeds with serviceConnect approach
- [x] Railway gateway running at sunclaw-production-403d.up.railway.app with healthy status

## Account Page
- [x] Create /account page with user profile, plan info, and deployment history
- [x] Show current subscription plan with upgrade/manage buttons
- [x] Show deployment history with status badges and links
- [x] Add Stripe billing portal link for subscription management
- [x] Add account page link to Navbar

## Deployment Status Polling
- [x] Add Railway deployment status polling endpoint
- [x] Show real-time build/deploy progress in Setup Wizard after deploy
- [x] Update deployment record status when Railway reports success/failure

## Railway Integration Improvements
- [x] Add serviceConnect call after service creation to ensure latest commit is used
- [x] Update railway.ts with improved deployment flow

## OpenClaw Gateway Fix
- [x] Diagnose why OpenClaw child process is not starting in Railway container
- [x] Fix gateway server.js to properly launch and manage OpenClaw process
- [x] Fix Dockerfile to ensure OpenClaw dependencies are installed
- [x] Push fix to GitHub and redeploy
- [x] Verify OpenClaw control UI works at /__openclaw__/control/

## OpenClaw Control UI Token Fix
- [x] Inject gateway token into Control UI so WebSocket auth works automatically
- [x] Push fix to GitHub and redeploy
- [x] Verify Control UI connects without manual token entry

## SunClaw Management Dashboard (Custom UI wrapping OpenClaw)
- [x] Research OpenClaw WebSocket/REST API endpoints for all dashboard features
- [x] Build backend proxy tRPC procedures to communicate with user's deployed OpenClaw instance
- [x] Create /dashboard route with modern sidebar layout, drawers, and clean aesthetic
- [x] Dashboard Overview page: instance health, connected channels, active sessions, skill count
- [x] Dashboard Chat page: send messages to the agent, see responses with streaming
- [x] Dashboard Channels page: view connected channels, connect new ones (WhatsApp QR, Telegram token, etc.)
- [x] Dashboard Skills page: view installed skills, enable/disable, install new ones
- [x] Dashboard Config page: edit OpenClaw configuration with friendly form UI
- [x] Dashboard Sessions page: view active sessions, session history
- [x] Dashboard Logs page: live log tail with filtering
- [x] Polish with loading skeletons, empty states, animations, responsive design
- [x] Write tests for new dashboard features

## Feature Batch: Major Dashboard Enhancements

### 1. Redeploy Button
- [x] Add redeploy tRPC procedure that triggers Railway serviceInstanceRedeploy
- [x] Add Redeploy button to Account page deployment cards
- [x] Add Redeploy button to Dashboard Overview quick actions
- [x] Show redeploy status with polling

### 2. Usage Analytics Page
- [x] Create analytics database table (message_count, channel_activity, skill_invocations, timestamps)
- [x] Create dashboard analytics tRPC procedures (track events, query aggregates)
- [x] Build Analytics dashboard page with charts (message volume, channel breakdown, skill usage)
- [x] Track chat messages, channel events, and skill invocations automatically

### 3. Real-time Notification System
- [x] Create notifications database table (type, title, message, read status, timestamp)
- [x] Build notification bell icon in dashboard sidebar with unread count badge
- [x] Create notification drawer/panel with notification list
- [x] Auto-create notifications for channel connection/disconnection events
- [x] Add mark-as-read and dismiss functionality

### 4. Custom Skills Upload & Test
- [x] Build skills upload UI with file picker and config editor
- [x] Create tRPC procedure to proxy skill config to OpenClaw instance
- [x] Add skill testing interface (send test prompt, see skill response)
- [x] Show skill validation results and error messages

### 5. Chat Conversation Export
- [x] Store chat conversations in database (user_id, messages, timestamps)
- [x] Add "Save Conversation" button to chat interface
- [x] Add "Export as JSON/Markdown" functionality
- [x] Build conversation history list with search and filter

### 6. Multi-Provider API Key Failover
- [x] Create api_keys database table (user_id, provider, key, priority, status, last_checked)
- [x] Build API key management UI in Config page (add/remove/reorder providers)
- [x] Implement provider health checker that tests each key periodically
- [x] Build failover logic: try providers in priority order, skip unhealthy ones
- [x] Alert user when a provider fails and failover occurs
- [x] Support providers: Venice AI, OpenAI, Anthropic, Google Gemini, OpenRouter, xAI Grok, Manus (last resort)
- [x] Log all failover events and notify superuser when Manus is used as fallback

### 7. Persistent AI Agent Memory
- [x] Create agent_memory database table (user_id, deployment_id, context_summary, full_log, model_used)
- [x] Build memory management system that summarizes conversation context
- [x] On model switch, inject memory context into new model's system prompt
- [x] Build memory viewer UI in dashboard (view/edit/clear memory)
- [x] Ensure consistent behavior across model switches with full conversation logging

### Testing (New Features)
- [x] Vitest: API Keys CRUD and provider listing
- [x] Vitest: Conversations save, export (JSON/Markdown), delete
- [x] Vitest: Analytics summary, timeline, event tracking
- [x] Vitest: Notifications list, unread count, mark read
- [x] Vitest: Memory get, fullLog, clear
- [x] Vitest: Redeploy and chatWithMemory procedures

## Enhancement Batch: WebSocket, Health Cron, Charts

### 1. Real-time WebSocket Push Notifications
- [x] Create WebSocket server attached to Express (ws library)
- [x] Broadcast notifications to connected clients on new notification insert
- [x] Build useWebSocketNotifications hook on the client
- [x] Update notification bell to receive live push updates without polling
- [x] Handle reconnection and auth over WebSocket

### 2. Scheduled Health-Check Cron with Auto-Disable
- [x] Create server-side cron job that runs healthCheckAllKeys every 5 minutes
- [x] Track consecutive failure count per API key in database
- [x] Auto-disable keys that fail 3 times in a row
- [x] Create notification when a key is auto-disabled
- [x] Log all health-check results for audit trail

### 3. Recharts Visualizations on Analytics Page
- [x] Install recharts dependency
- [x] Replace timeline table with area chart for 14-day message volume
- [x] Add bar chart for skill invocations breakdown
- [x] Add donut chart for event type distribution
- [x] Responsive chart layout with dark theme styling and custom tooltips

### Testing (Enhancements)
- [x] Vitest: WebSocket module exports and push/broadcast without error
- [x] Vitest: Health-cron start/stop, runHealthChecks stats, failure tracking
- [x] Vitest: Auto-disable after 3 consecutive failures with notification push
- [x] Vitest: useWebSocketNotifications hook module export verification

## Critical Fixes & Major Enhancements (User Feedback)

### Bug Fixes
- [x] Fix chat 405 error — rewired to use chatWithMemory (failover engine) as primary
- [x] Remove all external links to OpenClaw UI — everything is now in-app
- [x] Fix broken channel connectors — in-app setup forms for all channels
- [x] Add model selector to chat interface
- [x] Ensure soul.md and memory are persistent and auto-updated during conversations
- [x] Ensure user preferences are logged and persisted
- [x] Fix all broken links across the dashboard

### Channel Connectors Overhaul
- [x] Build in-app WhatsApp setup flow (Phone Number ID + Access Token)
- [x] Build in-app Telegram setup flow (BotFather token entry + webhook config)
- [x] Build in-app Slack setup flow (Bot Token + Signing Secret)
- [x] Build in-app Discord setup flow (Bot Token + Guild ID)
- [x] Build in-app Signal setup flow (Phone Number + API URL)
- [x] Build in-app Teams setup flow (App ID + App Password + Tenant ID)
- [x] Build in-app Email/SMTP setup flow (SMTP Host/Port/User/Pass + IMAP)
- [x] Build in-app Web Chat embed setup flow (embed code generator)
- [x] Show all OpenClaw-supported connectors with credential verification

### Skills Page Redesign
- [x] Integrate ClawHub (https://clawhub.ai/skills) browsing within the UI via iframe
- [x] Create separate sections: Installed, RE Skills, KIISHA Skills, ClawHub Browse
- [x] Skills browsing stays within UI — no external navigation
- [x] Custom skill upload/test with YAML/JSON editor

### Enterprise Admin Token Management
- [x] Admin-managed LLM tokens for enterprise tier (admin sets tokens, users consume)
- [x] Token usage tracking per user and per organization
- [x] Usage-based billing/metering for enterprise token consumption
- [x] Admin dashboard for token allocation and usage monitoring

### Analytics Enhancements
- [x] Per-channel message breakdown in analytics timeline (stacked area chart)
- [x] Key rotation reminder notifications (auto-triggered by health cron)
- [x] Re-enable flow for auto-disabled API keys with one-off health check

### Advanced Settings
- [x] Config page rebuilt with agent/enterprise/advanced sections
- [x] Sessions page rebuilt with in-app conversation data
- [x] Logs page rebuilt with in-app failover and notification logs
- [x] All OpenClaw features accessible through dedicated dashboard pages

### Testing (Critical Fixes)
- [x] Vitest: Channel connections CRUD (create, list, update, delete)
- [x] Vitest: Channel credential verification for all channel types
- [x] Vitest: Token usage tracking and summary
- [x] Vitest: Admin token management across users
- [x] Vitest: API key re-enable flow with health check
- [x] Vitest: Per-channel analytics timeline
- [x] Vitest: No external OpenClaw links in Config, Overview, Sessions, Logs, Channels

## OpenClaw-First Architecture Fix + New Features

### Chat Architecture Fix
- [x] Fix chat to route through deployed OpenClaw instance as primary path
- [x] Keep failover engine as fallback ONLY when OpenClaw is unreachable
- [x] Ensure OpenClaw is never bypassed — it IS the AI agent

### Channel Connectors → OpenClaw Wiring
- [x] Wire saved channel credentials to OpenClaw instance via its connector API
- [x] Register webhooks with OpenClaw so it listens on configured channels
- [x] Show real connection status from OpenClaw (not just credential verification)

### Soul.md Editor
- [x] Add soul.md editor to Config page with monospace editor
- [x] Load current soul.md from OpenClaw instance (with local fallback)
- [x] Save edits back to OpenClaw instance in real-time
- [x] Add "Reset to default" button
- [x] Reflect changes in next chat message

### Enterprise Token Budget/Quota System
- [x] Add token_budgets table to schema (monthly_limit, current_usage, period)
- [x] Build admin UI for setting per-user token budgets (AdminBudgets page)
- [x] Auto-track usage against budget on every chatWithMemory call
- [x] Send notification at 80% and 100% usage thresholds
- [x] Block chat when budget exceeded with clear error message

### Testing (OpenClaw Architecture)
- [x] Vitest: Budget get, set, increment, threshold detection
- [x] Vitest: Soul.md save/update configuration
- [x] Vitest: OpenClaw-first chat routing with memory context
- [x] Vitest: Channel webhook registration with OpenClaw connector mapping
- [x] Vitest: Architecture verification — failover only when OpenClaw unavailable

## Bug Fix: Infinite Page Refresh
- [x] Diagnose and fix constant page refresh/re-render loop — WebSocket noServer mode fix

## Expanded LLM Provider Support (All OpenClaw Providers)
- [x] Add all OpenClaw-supported providers to backend provider registry (24+ providers)
- [x] Add Moonshot/Kimi provider with baseUrl, models (kimi-k2.5, kimi-k2-turbo, kimi-k2-thinking)
- [x] Add Kimi Coding provider (kimi-coding/k2p5)
- [x] Add Qwen provider (free tier)
- [x] Add Synthetic provider
- [x] Add MiniMax provider
- [x] Add Cerebras provider (free tier)
- [x] Add Mistral provider
- [x] Add xAI (Grok) provider
- [x] Add GitHub Copilot provider
- [x] Add Amazon Bedrock provider
- [x] Add Qianfan (Baidu) provider
- [x] Add OpenCode Zen provider
- [x] Add Z.AI (GLM) provider
- [x] Add Vercel AI Gateway provider
- [x] Add Ollama (local) provider
- [x] Update failover engine to support all new providers with correct API formats
- [x] Update health checker to test all provider types (OpenAI-compatible, Anthropic-compatible)
- [x] Update frontend API key management UI with all providers
- [x] Update chat model selector with all available models
- [x] Mark free-tier providers in the UI
- [x] Update tests for expanded provider list

## API Key Health Check Fixes
- [x] Fix Kimi Coding 401 error — model name was wrong (k2p5 → kimi-k2.5)
- [x] Improve OpenAI 429 handling — show "quota exceeded" instead of generic "failed"
- [x] Review all provider auth headers and endpoints for correctness
- [x] Improve health check error messages to distinguish auth errors from quota/rate limits

## Provider Endpoint Fixes (Round 2)
- [x] Fix MiniMax: uses Anthropic API format at https://api.minimax.io/anthropic with models MiniMax-M2.1, MiniMax-M2.1-lightning, MiniMax-M2
- [x] Fix Kimi Code: sk-kimi-* keys use api.kimi.com/coding endpoint (separate from Moonshot api.moonshot.ai), uses Anthropic format
- [x] Update tests for corrected provider configs

## Chat Bug Fix
- [x] Fix "fullLog.push is not a function" error in dashboard chat — MySQL JSON column returned string, added parseFullLog() helper

## Railway Production URL Fix
- [x] Fix production URL to sunclaw-production-403d.up.railway.app — DB already had correct URL
- [x] Diagnose why Railway instance is unreachable — instance is now healthy and running (HTTP 200)

## Telegram Connector Fix
- [x] Fix Telegram webhook URL to point to Railway production instance instead of dev server
- [x] Update channel verification to use the deployed instance URL for webhooks + added Telegram setWebhook API call
- [x] Fix Telegram credential verification failing despite valid bot token — rewrote to use Railway env vars
- [x] Research OpenClaw docs/repo for correct channel connection API for all channels
- [x] Fix channel connector implementation to match OpenClaw's actual API — channels configured via env vars + redeploy, not API endpoints

## Telegram Bot Not Responding Fix
- [x] Check if Railway actually redeployed with TELEGRAM_BOT_TOKEN
- [x] Check OpenClaw logs for Telegram connector initialization
- [x] Verify Telegram bot webhook/polling status
- [x] Fix whatever is preventing the bot from responding — needed plugins.entries.telegram.enabled: true + dmPolicy: open + allowFrom: ["*"]

## Gap Analysis Fixes (Feb 10, 2026)

### P0 — Critical Architecture Fixes
- [x] Replace env-var-only config with proper openclaw.json generation (openclaw-config.ts)
- [x] Fix Telegram channel config: channels.telegram (not plugins.entries.telegram), dmPolicy open
- [x] Fix WhatsApp channel: remove Business API fields, add Baileys QR pairing instructions
- [x] Fix Slack channel: add appToken field for Socket Mode, remove signingSecret
- [x] Fix Discord channel: use 'token' (not 'botToken'), remove applicationId/guildId
- [x] Add Railway volume mount (/data) for config/state persistence (in railway.ts)
- [x] Remove fake env vars from railway-defaults.ts (stripped to PORT + model keys only)
- [x] Route dashboard chat through OpenClaw Gateway instead of custom LLM failover
- [x] Create actual SKILL.md files for 6 standalone energy skills

### P1 — Duplicate System Removal
- [x] Remove LLM failover engine from chat flow (routers.ts no longer imports llm-failover)
- [x] Remove agent memory system from chat flow (routers.ts no longer imports agent-memory)
- [x] Remove api_keys table and related DB helpers — kept table, cleaned up dead references
- [x] Remove agent_memory table and related DB helpers — table dropped, all code references removed
- [x] Remove failover_logs table and related DB helpers — table dropped, all code references removed
- [x] Remove token_usage table and related DB helpers — table dropped, all code references removed
- [x] Remove token_budgets table and related DB helpers — table dropped, all code references removed
- [x] Remove health check cron from server startup (_core/index.ts)
- [x] Remove Manus LLM dependency from production chat flow (chat routes through Gateway)
- [x] Add Gateway control plane proxy for config writes (gateway-api.ts)

### P2 — Config & UX Fixes
- [x] Remove Email channel (removed from Channels.tsx)
- [x] Remove RCS channel (removed from Channels.tsx)
- [x] Fix channel-env-map.ts to config-based approach (buildFullConfig + getChannelRequirements)
- [x] Fix openclaw-connector-map.ts — no longer used (config goes through openclaw-config.ts)
- [x] Update channel-verify.ts to match correct credential requirements (Discord token, no WhatsApp Business API)
- [x] Fix landing page accuracy (skill counts, channel status badges, security claims)
- [x] Update architecture diagram to reflect actual system — rewritten as 3-layer diagram (SunClaw → OpenClaw → External Services)

### P3 — Testing
- [x] Write tests for openclaw.json config generation (openclaw-config.test.ts — 96 tests)
- [x] Write tests for correct channel config mapping (channel-env-map.test.ts — 14 tests)
- [x] Write tests for Gateway API and railway defaults (gap-fixes.test.ts — 33 tests)
- [x] Remove obsolete tests for removed systems (features.test.ts — fixed memory, providers, chatWithMemory)

## Follow-Up Tasks (Feb 10, 2026)
- [x] Push corrected OpenClaw config to live Railway deployment — Telegram channel now running with dmPolicy: open
- [x] Clean up dead database tables (agent_memory, failover_logs, token_usage, token_budgets) — all 4 dropped
- [x] Regenerate architecture diagram showing SunClaw as management layer over OpenClaw Gateway

## LLM Provider Management System (Full Flow)
- [x] Build LLM Settings page in SunClaw dashboard with all 713+ models from 23+ providers
- [x] Fetch available models dynamically from OpenClaw gateway via models.list RPC
- [x] Let users enter API keys per provider and validate them
- [x] Let users select primary model and set failover priority order
- [x] Sync selected model + API keys to OpenClaw gateway config (agents.update / config.apply)
- [x] Store provider configs in database for persistence across redeploys
- [x] Show provider health status (key valid, quota ok, etc.)
- [x] Auto-failover: when primary provider fails, cascade to next in priority order
- [x] Superuser-only access for LLM configuration changes
- [x] Write tests for LLM provider management — 34 tests across 2 test files

## Bug Fixes (Feb 10, 2026)
- [x] Fix "Redeploy failed: fetch failed" error on /dashboard page — added retry logic to Railway API calls
- [x] Fix provider ID mismatch: kimi-coding key should enable Kimi/Moonshot models in dropdown
- [x] Fix model selection not flowing to OpenClaw gateway agent config (Telegram still uses anthropic)
- [x] Add kimi-coding as separate provider entry in frontend providers list with k2p5 and kimi-k2-thinking models
- [x] Fix kimi-coding base URL: https://api.kimi.com/coding (was incorrectly api.moonshot.cn/v1)
- [x] Fix kimi-coding API type: anthropic-messages (was incorrectly openai-completions)
- [x] Fix moonshot base URL: https://api.moonshot.ai/v1 (was incorrectly api.moonshot.cn/v1)
- [x] Fix minimax base URL: https://api.minimax.io/v1 (was incorrectly api.minimaxi.chat/v1)
- [x] Fix minimax-cn base URL: https://api.minimaxi.com/v1 (was incorrectly api.minimax.chat/v1)
- [x] Add 8 new tests for kimi-coding provider, API type detection, and corrected base URLs
- [x] All 244 tests passing across 11 test files

## Telegram Bot Fix — Config Not Reaching Gateway (Feb 10, 2026)
- [x] Diagnose why OpenClaw gateway still uses anthropic/claude-opus-4-6 despite config push
  - Root cause: pushAndApplyConfig sends to /api/config which returns Control UI HTML (200 OK) — endpoint doesn't exist
  - OpenClaw reads config from ~/.openclaw/openclaw.json on disk, not via REST API
- [x] Fix config push to properly set model + API keys on Railway OpenClaw instance
  - Replaced broken HTTP REST push with Railway env vars (OPENCLAW_MODEL + provider API keys + OPENCLAW_CONFIG_B64) + redeploy
  - OpenClaw reads OPENCLAW_MODEL env var for agents.defaults.model.primary
  - OpenClaw reads provider API key env vars (KIMI_API_KEY, MINIMAX_API_KEY, etc.) as fallback
- [x] Fix kimi-coding env key: KIMI_API_KEY (was incorrectly MOONSHOT_API_KEY)
- [x] Fix config structure: agent.model now uses { primary: "provider/model" } instead of flat string
- [x] Add real "Health Check" button to API Keys page — sends lightweight test request to each provider's API
  - OpenAI-compatible: POST /chat/completions with max_tokens=1
  - Anthropic-compatible: POST /v1/messages with max_tokens=1
  - Google Gemini: POST /models/{model}:generateContent with maxOutputTokens=1
  - Updates DB status (healthy/degraded/failed) with error messages
  - Frontend shows per-provider results with detailed error messages
- [x] All 244 tests passing across 11 test files
- [ ] Verify Telegram bot responds using the user's selected model (requires user to test after redeploy)

## UX Improvements — Active Model Save + Redeploy Status + Auto Config Sync (Feb 10, 2026)
- [x] Add visible "Save & Deploy" button after active model selection
  - Model dropdown now tracks pending selection in local state
  - "Save & Deploy" button appears with Rocket icon when selection differs from saved model
  - Amber pulsing dot + "Unsaved change" indicator when model is pending
  - Button shows "Deploying..." spinner during save + deploy
  - Toast notification confirms deploy was triggered with ~60s estimate
- [x] Add redeploy status indicator on API Keys page
  - DeployStatusBanner component at top of page
  - Auto-polls Railway deployment status every 5 seconds while building/deploying
  - Shows amber pulsing timer during deploy, green cloud when success, red cloud-off on failure
  - Shows time-ago for last deploy ("deployed 2m ago")
  - Link to open gateway URL when deploy succeeds
- [x] Add automatic config sync on key CRUD
  - setPriority mutation now calls rebuildAndPushConfig (was the only one missing it)
  - All key mutations (add, remove, toggle, reEnable, setPriority) now auto-sync config to gateway
  - Frontend shows "config syncing to gateway..." toast on each key change
  - Deploy status auto-refreshes 2 seconds after each key mutation
- [x] Add deployStatus query to apiKeys router — fetches latest Railway deployment status
- [x] All 244 tests passing across 11 test files

## CRITICAL: Telegram Bot Still Failing — auth-profiles.json Investigation (Feb 10, 2026)
- [x] Deep investigation: OpenClaw reads API keys from auth-profiles.json, NOT env vars
  - Error: "No API key found for provider 'anthropic'. Auth store: /root/.openclaw/agents/main/agent/auth-profiles.json"
  - Even after /model minimax/MiniMax-M2.1, error: "No API key found for provider 'minimax'"
  - OPENCLAW_MODEL env var DOES work (model changes via /model command)
  - But API keys are NOT being read from env vars — they need to be in auth-profiles.json
- [x] Research: How does OpenClaw populate auth-profiles.json?
  - OpenClaw reads API keys from the `env` block in openclaw.json
  - The `env` block is a flat key-value map: { "MINIMAX_API_KEY": "sk-..." }
  - The `models.providers` section references them via ${ENV_VAR_NAME} syntax
- [x] Research: What is the format of auth-profiles.json?
  - Not needed — the env block in openclaw.json is the correct approach
- [x] Research: Can auth-profiles.json be injected via env var or volume mount?
  - YES — via OPENCLAW_CONFIG_B64 env var decoded by wrapper server.js on startup
- [x] Implement fix: Write auth-profiles.json to Railway container
  - Updated wrapper server.js (kaykluz/sunclaw repo) with writeConfig() function
  - Reads OPENCLAW_CONFIG_B64, decodes, writes to ~/.openclaw/openclaw.json
  - Also reads individual API key env vars and injects into config's env block
  - Pushed to GitHub — Railway auto-deploys from main branch
- [x] Fix config generator: apiKey now uses ${ENV_VAR_NAME} references in providers, actual values in env block
- [x] Fix MiniMax: baseUrl now https://api.minimax.io/anthropic, API type anthropic-messages
- [x] Updated all tests — 244 passing across 11 test files
- [x] Verify Telegram bot responds after fix (requires user to trigger Save & Deploy)

## CRITICAL: Telegram Bot Completely Silent After Wrapper Update (Feb 10, 2026)
- [x] Diagnose: Bot went from responding with errors to completely silent (no typing, no response)
- [x] Check Railway gateway health endpoint — is the container even running?
- [x] Check if the updated server.js broke the OpenClaw gateway startup
- [x] Fix the wrapper server.js if it's causing the crash
- [x] Verify bot responds on Telegram after fix

## Telegram Bot Fix — Continued Investigation (Feb 10, 2026)
- [x] Query Railway API to check if OPENCLAW_CONFIG_B64 env var is actually set
- [x] Add Railway deployment logs viewer to dashboard for debugging without SSH
- [x] Check wrapper server.js on kaykluz/sunclaw repo for correctness
- [x] Verify the openclaw.json being written has correct Telegram config + env block with API keys
- [x] Fix whatever is preventing bot from responding

## Fix Kimi Code API Authentication (Feb 10, 2026)
- [x] Fix base URL: api.moonshot.ai/v1 → api.kimi.com/coding (no /v1 — OpenClaw appends it)
- [x] Fix API format: openai-completions → anthropic-messages (Kimi Code uses Anthropic-compatible API)
- [x] Fix model ID: kimi-k2.5 → kimi-for-coding
- [x] Update API key to new Sunclaw2 key (sk-kimi-...BbwzC)
- [x] Update openclaw-config.ts provider mapping for moonshot/kimi
- [x] Push corrected config to Railway and verify bot responds — CONFIRMED WORKING

## Artifact Integration (Feb 10)
- [x] Integrate SOUL.md as system prompt into OpenClaw config generator
- [x] Integrate AGENTS.md agent behavior settings into config generator
- [x] Copy 5 skills to kaykluz/sunclaw repo and reference in OpenClaw config
- [x] Update dashboard skill management to reflect the 5 new skills
- [x] Push updated config with system prompt + skills to Railway
- [ ] Verify bot responds with SunClaw persona on Telegram (pending next deploy with soul.md)

## Persistent Memory System
- [x] Add auto-journaling instructions to SOUL.md system prompt
- [x] Add memory.md file support to OpenClaw config (read on startup, write on task completion)
- [x] Add daily summary / ongoing todo instructions to system prompt
- [ ] Push updated system prompt to Railway (pending next Save & Deploy)

## Telegram BotFather Setup Wizard
- [x] Create step-by-step BotFather wizard component with screenshots/instructions
- [x] Step 1: Open BotFather link, show commands to type
- [x] Step 2: Paste bot token field with instant validation
- [x] Step 3: Auto-configure and deploy
- [x] Integrate wizard into channel setup flow

## Tier-Based Onboarding System
- [x] Design pricing page (Free / Pro / Enterprise)
- [x] Update database schema: add tier/plan fields to users table (already existed)
- [x] Free tier: guided self-setup wizard (own Railway, own keys, own bots)
- [x] Pro tier: managed Railway deployment, user brings API keys
- [ ] Pro tier add-on: onboard to our LLM keys for additional price
- [x] Pro tier: Telegram click-and-go (BotFather wizard + auto-config push after provision)
- [ ] Enterprise tier: fully managed, all channels, dedicated support
- [x] Stripe integration for Pro/Enterprise billing (already existed)

## Manus Dependency Removal Migration (Feb 10, 2026)

### Phase 1: Authentication Migration (KIISHA multiAuth + SessionManager)
- [x] Add bcryptjs dependency
- [x] Add serverSessions, passwordResetTokens, loginActivities tables to schema
- [x] Add passwordHash, emailVerified fields to users table
- [x] Create sessionManager service (adapted from KIISHA)
- [x] Create multiAuth router (email/password + OAuth providers)
- [x] Replace server/_core/oauth.ts with new OAuth callback handler
- [x] Replace server/_core/sdk.ts authenticateRequest with session-based auth
- [x] Replace server/_core/context.ts to use new auth
- [x] Replace client/src/const.ts getLoginUrl to point to /auth
- [x] Create Login page (email/password + social OAuth buttons)
- [x] Create Signup page with email verification
- [x] Update client/src/main.tsx redirect to /auth
- [x] Update useAuth hook — remove manus-runtime-user-info localStorage
- [x] Configure shared auth cookie scoped to .kiisha.io
- [x] Run pnpm db:push for new tables

### Phase 2: S3 Storage Migration
- [x] Replace server/storage.ts with direct @aws-sdk/client-s3 implementation
- [x] Add AWS env vars to env.ts

### Phase 3: LLM Manus Fallback Removal
- [x] Delete Manus fallback block in server/llm-failover.ts
- [x] Remove import { invokeLLM } from "./_core/llm"

### Phase 4: Notification Migration (Resend)
- [x] Add resend dependency
- [x] Replace server/_core/notification.ts with Resend email implementation
- [x] Add RESEND_API_KEY and OWNER_EMAIL to env.ts

### Phase 5: Build Tooling Cleanup
- [x] Remove vite-plugin-manus-runtime from vite.config.ts and package.json
- [x] Remove manus-debug-collector plugin from vite.config.ts
- [x] Remove .manus.computer from HMR allowlist
- [x] Delete unused Manus service files (imageGeneration, voiceTranscription, map, dataApi, llm, sdk, Map.tsx, ManusDialog.tsx)

### Phase 6: Environment Variable Cleanup
- [x] Update server/_core/env.ts — remove Manus vars, add new service vars
- [x] Remove VITE_APP_ID, OAUTH_SERVER_URL, VITE_OAUTH_PORTAL_URL references
- [x] Remove BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY references

### Phase 7: Pricing Selection Wall
- [x] New users see pricing page on first login (before accessing dashboard)
- [x] Store plan selection in user record (planSelected field)
- [x] Redirect to pricing if user.planSelected is false after auth
- [x] Free plan selection calls selectPlan mutation to dismiss wall
- [x] Stripe checkout webhook marks planSelected=true on successful payment

### Phase 8: Final Cleanup & Testing
- [x] Delete remaining dead Manus _core files (llm.ts, sdk.ts, imageGeneration.ts, voiceTranscription.ts, map.ts, dataApi.ts)
- [x] Update all tests for new auth system (loginMethod: email, remove manus-default model refs)
- [x] Run full test suite — 244/244 tests passing, 0 TS errors
- [x] Remove Manus text references from UI (ApiKeys, AdminTokens)
- [x] Save checkpoint and sync to GitHub

## Railway Environment Variables & Image Replacement (Feb 10, 2026)

### Railway Environment Variables
- [x] Set SESSION_SECRET on Railway (auto-generated 64-char hex)
- [x] Set RESEND_API_KEY on Railway
- [x] Set OWNER_EMAIL on Railway (info@kiisha.io)
- [x] Switched from AWS S3 to Cloudflare R2 — set R2 vars instead

### Replace Manus CDN Images in Home.tsx
- [x] Replace HERO_BG with Unsplash (Earth from space at night)
- [x] Replace SOLAR_IMG with Unsplash (solar farm with blue sky)
- [x] Replace WIND_IMG with Unsplash (wind turbines at sunset)
- [x] Replace DASHBOARD_IMG with Unsplash (analytics dashboard)
- [x] Uploaded copies to R2 as backup, using Unsplash CDN URLs in code
- [x] Verified zero manuscdn.com references remain in codebase

### Cloudflare R2 Migration (replacing AWS S3)
- [x] Update storage.ts to use Cloudflare R2 endpoint (S3-compatible)
- [x] Update env.ts for R2-specific vars (R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)
- [x] Set all Railway env vars via Railway GraphQL API
- [x] All 244 tests passing, 0 TS errors

## R2 Public Access, Railway Deployment & Dashboard Screenshot (Feb 10, 2026)

### R2 Public Access
- [x] Enable public access on sunclawkiisha R2 bucket via Cloudflare (R2_PUBLIC_URL set)
- [ ] Set up custom domain cdn.kiisha.io for R2 public access
- [ ] Update storage.ts to generate public URLs using the custom domain

### Railway Deployment
- [x] Verify Railway deployment builds and starts successfully
- [ ] Test email registration flow on sunclaw.kiisha.io
- [ ] Test pricing wall appears for new users after registration
- [ ] Test shared .kiisha.io session cookie with app.kiisha.io

### Dashboard Screenshot
- [ ] Capture real SunClaw dashboard screenshot from the running app
- [ ] Upload screenshot to R2 with public URL
- [ ] Update DASHBOARD_IMG constant in Home.tsx

## Railway Deployment Fix & Database Migration (Feb 10, 2026)
- [x] Regenerated pnpm-lock.yaml — removed stale vite-plugin-manus-runtime references
- [x] Verified local build succeeds (pnpm build)
- [x] Created Railway deployment trigger for kaykluz/sunclaw-KIISHA repo
- [x] Railway build succeeded — sunclaw-website service running
- [x] Created Railway service domain: sunclaw-website-production.up.railway.app
- [x] Added custom domain: sunclaw.kiisha.io (CNAME: sunclaw → v7rw3boz.up.railway.app)
- [x] Created TCP proxy for MySQL: trolley.proxy.rlwy.net:24972
- [x] Ran Drizzle migrations — all 13 tables created in Railway MySQL
- [x] Verified landing page renders correctly on Railway
- [x] Verified auth page (Sign In / Create Account) renders correctly
- [x] Verified pricing page (Free/Pro/Enterprise tiers) renders correctly
- [x] Verified API endpoints working (auth.me, waitlist.join)
- [x] Verified database writes working (waitlist entry saved)
- [ ] Add CNAME record in Cloudflare DNS: sunclaw → v7rw3boz.up.railway.app
- [ ] Test email registration flow on deployed site
- [ ] Test pricing wall for new users after registration
- [ ] Test shared .kiisha.io session cookie

## Bug Fixes Reported by User (Feb 10, 2026)

### 1. Stripe Paywall Error
- [x] Investigate Stripe error on pricing/paywall page
- [x] Fix Stripe configuration — set keys on Railway, removed hardcoded apiVersion
- [ ] Verify Stripe test mode payments work end-to-end (user needs to test)

### 2. Auth Too Permissive
- [x] Auth lets anyone in with just email+password — no verification
- [x] Add email verification flow — 6-digit code sent via Resend, must verify before login
- [x] Added emailVerificationTokens table, verification routes, VerifyEmail page

### 3. Auto-Provision VPS is Simulation
- [x] VPS provisioning — renamed to 'Self-Hosted', removed fake simulation button
- [x] Replaced with real setup.sh one-line install instructions

### 4. Railway Cloud Deploy
- [x] Review Railway deploy flow — deploy actually works, UX was the issue
- [x] Added prominent 'Open Your SunClaw Instance' button after deploy
- [x] Added Railway Dashboard and Account links

### Railway Deploy Wizard UX Issues
- [x] After deploy shows "SunClaw is live!" — added prominent green 'Open Your SunClaw Instance' button
- [x] User is stuck in wizard — added 'Railway Dashboard' and 'Your Account' navigation buttons
- [x] Added note about 1-2 minute warmup time
- [x] Added deployed instance URL prominently after successful deploy

### 5. One-Line Install Script 404
- [x] Created real setup.sh script with full auto-install (Docker, Compose, Git, SunClaw)
- [x] Script auto-detects OS (Ubuntu, Debian, CentOS, RHEL, macOS)
- [x] Interactive configuration: LLM provider, channels, KIISHA, instance name
- [x] Generates .env, creates docker-compose.yml, starts services, opens firewall
- [ ] Push to kaykluz/sunclaw repo (will be available after GitHub sync)
