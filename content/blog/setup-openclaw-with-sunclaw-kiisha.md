# How to Set Up OpenClaw the KIISHA Way: SunClaw Setup Guide for Renewable Energy Professionals

**No CLI. No terminal. 4 steps. 8 deployment platforms. 11 renewable energy AI skills. Here's how KIISHA does it.**

---

If you've been following the AI agent space, you've probably heard of **OpenClaw** — the open-source personal AI assistant that's taken the developer world by storm. It can run shell commands, browse the web, manage files, and talk to you through WhatsApp, Telegram, Slack, Discord, and more. People are calling it "Claude with Hands."

But here's the thing most guides don't tell you: **setting up OpenClaw for a specific industry is a completely different game.** The generic setup gets you a general-purpose chatbot. What if you need an AI that actually understands solar PV design, battery storage sizing, LCOE calculations, and power purchase agreements?

That's exactly why **KIISHA** built **SunClaw**.

In this guide, I'm going to walk you through how KIISHA sets up OpenClaw — not the generic way, but the purpose-built way. With a web-based wizard. No CLI. No terminal commands. No Docker knowledge. Just 4 steps, and you'll have a fully functional renewable energy AI assistant running across every messaging channel your team uses.

---

## What is SunClaw and How Does It Relate to OpenClaw?

Let's clear up the architecture first, because this is important.

**OpenClaw** is the open-source AI agent runtime. It's the engine — the thing that connects LLMs to tools, manages conversations, handles plugins, and routes messages across channels. Think of it as the operating system for AI agents.

**SunClaw** is KIISHA's management and deployment layer built on top of OpenClaw, purpose-built for renewable energy professionals. It's the mission control.

Here's how the three layers work together:

```
Layer 1: SunClaw (Management Dashboard)
├── Config Manager — Deploy & Sync
├── LLM Selector — 16+ AI Providers
├── Channel Control — 5 Messaging Platforms
└── Skill Registry — 11 RE + 50+ OpenClaw Skills
         │
         ▼
Layer 2: OpenClaw Gateway (Agent Runtime)
├── Agent Engine — Reasoning & Tool Use
├── Plugin System — 50+ Built-in Skills
├── KIISHA Bridge — Enterprise API
└── Memory System — Persistent Context
         │
         ▼
Layer 3: External Services
├── Channels: Telegram, WhatsApp, Slack, Discord, Web Chat
├── LLM Providers: Kimi, Groq, OpenAI, Claude, Gemini, Venice...
└── KIISHA Enterprise: Portfolio, VATR, Tickets, Payments
```

**In plain English:** You configure everything through SunClaw's web UI. SunClaw generates the OpenClaw configuration, deploys it to your chosen platform, and gives you a dashboard to monitor and manage everything. Your API keys stay on your server — never sent to SunClaw.

---

## Two Modes, One Agent

SunClaw works in two modes, and this is one of the things that makes it unique:

### Mode 1: Standalone (FREE)

No account needed. Deploy SunClaw and immediately get a fully functional AI assistant with **11 purpose-built renewable energy skills** powered by OpenClaw. This includes:

- Solar irradiance lookup for any location worldwide (PVGIS & NREL APIs)
- LCOE calculations with IRENA benchmark comparison
- Solar PV design — module selection, string sizing, tilt/azimuth optimization
- Financial modeling — IRR/NPV, sensitivity analysis, debt sizing, DSCR
- BESS sizing — AC/DC coupling, capacity modeling, degradation curves
- Wind turbine technical database (10+ major models)
- Grid status for 12+ countries (Ember API)
- PPA analyzer — tariff structure, bankability, DSCR waterfall
- O&M diagnostics — performance ratio, fault detection, inverter errors
- IRENA search — curated policy documents index
- Carbon emissions calculator with credit value estimates

Plus all of OpenClaw's 50+ built-in general-purpose skills (web search, file operations, calculator, etc.).

**Price: $0/month.** You bring your own infrastructure and API keys.

### Mode 2: KIISHA-Connected (ENTERPRISE)

Paste your KIISHA API token and unlock enterprise-grade portfolio management:

- **Portfolio Summary** — Real-time overview of renewable energy asset portfolios
- **Document Compliance** — VATR-enforced document status and gap analysis
- **Work Orders** — Create and track maintenance tickets
- **Alert Management** — View and acknowledge operational alerts in real-time
- **Payments** — Initiate and track payments through KIISHA

**Price: $29/month (Pro) or custom (Enterprise).** SunClaw manages the hosting for you.

---

## The 4-Step Setup Wizard: How KIISHA Does It

This is the heart of the SunClaw experience. Where other OpenClaw guides start with `git clone` and a wall of terminal commands, SunClaw gives you a web-based wizard at `sunclaw.kiisha.io/setup`.

**No CLI. No terminal. No Docker. Just click through 4 steps.**

---

### Step 1: Choose Your AI Provider

SunClaw supports **16+ LLM providers** out of the box, and this is where it gets interesting — many of them have generous free tiers. You don't need to spend a dime to get started.

#### Free Tier Providers (Recommended for Getting Started)

| Provider | Model | Free Tier | API Key URL |
|----------|-------|-----------|-------------|
| **Moonshot AI (Kimi)** | Kimi K2.5 | 500K tokens/day | [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys) |
| **Kimi Code** | Kimi for Coding | Free tier | [kimi.com/code](https://www.kimi.com/code/en) |
| **Groq** | Llama 3.3 70B | Generous free tier | [console.groq.com](https://console.groq.com/keys) |
| **Cerebras** | Llama 3.3 70B | 30 RPM free | [cloud.cerebras.ai](https://cloud.cerebras.ai/) |
| **Google Gemini** | Gemini 2.0 Flash | Generous limits | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Mistral** | Mistral Large | Free tier | [console.mistral.ai](https://console.mistral.ai/api-keys) |
| **Z.AI (GLM)** | GLM-4.7 | Free tier | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| **Qwen (Alibaba)** | Qwen Max | Free via DashScope | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/apiKey) |
| **Qianfan (Baidu)** | ERNIE Bot 4 | Free tier | [cloud.baidu.com](https://cloud.baidu.com/product/wenxinworkshop) |
| **MiniMax** | MiniMax M2.1 | Free coding plan | [platform.minimax.io](https://platform.minimax.io) |

**My recommendation for beginners:** Start with **Moonshot AI (Kimi)**. 500K free tokens per day is extremely generous, and Kimi K2.5 is excellent for technical conversations. It's the default selection in SunClaw's wizard for a reason.

#### Premium Providers

| Provider | Model | Starting Price | Best For |
|----------|-------|---------------|----------|
| **Venice AI** | Llama 3.3 70B, DeepSeek R1 | Pay-per-token | Privacy-first, zero data retention |
| **Anthropic** | Claude Opus 4, Sonnet 4, Haiku | Pay-per-token | Best reasoning and safety |
| **OpenAI** | GPT-4o, o3-mini, GPT-5.1 Codex | Pay-per-token | Industry standard |
| **DeepSeek** | DeepSeek V3, R1 | Pay-per-token | Strong reasoning at low cost |
| **xAI (Grok)** | Grok-2 | Pay-per-token | Real-time knowledge |

#### Model Gateways & Aggregators

| Provider | What It Does | API Key URL |
|----------|-------------|-------------|
| **OpenRouter** | 200+ models through one API. Free models available. | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Vercel AI Gateway** | Vercel's unified gateway to multiple providers | [vercel.com/dashboard/ai](https://vercel.com/dashboard/ai) |
| **GitHub Copilot** | GPT-4o via Copilot subscription | [github.com/settings/tokens](https://github.com/settings/tokens) |
| **Amazon Bedrock** | AWS-managed Claude, Llama, Mistral | [AWS Console](https://console.aws.amazon.com/bedrock/) |

#### Local (Free Forever)

| Provider | Models | Notes |
|----------|--------|-------|
| **Ollama** | Llama 3.3, Code Llama, Mistral 7B, DeepSeek R1 14B, Gemma 2 9B | No API key needed. Runs on your own machine. Free forever. |

**How the wizard works:** You click on a provider card, paste your API key, select a model (each provider has 2-6 model options with tags like "default", "fast", "reasoning", "code"), and you're done. The key format is `provider/model-id` — for example, `moonshot/kimi-k2.5` or `anthropic/claude-sonnet-4-20250514`.

**Security note:** Your API key never leaves your server. SunClaw stores it as an environment variable on your deployment platform, not in SunClaw's database.

---

### Step 2: Connect Messaging Channels

This is where SunClaw's multi-channel architecture shines. Your team uses different apps — SunClaw talks to all of them from a single brain.

#### WhatsApp (Enabled by Default)

- Connects via WhatsApp Web using a QR code scan **after deployment**
- Use a dedicated phone number for your SunClaw bot
- No API key needed — just scan the QR code from the SunClaw dashboard post-deploy

#### Telegram (Recommended for First-Timers)

SunClaw has a **built-in BotFather setup wizard** that walks you through creating a Telegram bot step by step:

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts to name your bot
3. BotFather gives you a bot token (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
4. Paste the token into SunClaw's wizard
5. Done. Your bot is connected.

If you're not very technical, **Telegram is by far the easiest channel to set up.** No QR scans, no browser pairing, no device-level permissions. You create a bot, paste the token, and you're live.

#### Slack

- Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
- Enable Bot User and get the Bot User OAuth Token
- Paste the token into SunClaw

#### Discord

- Create a Discord bot at the [Discord Developer Portal](https://discord.com/developers/applications)
- Get the bot token
- Paste it into SunClaw

#### Web Chat (Enabled by Default)

- Built-in web chat widget — zero setup needed
- Available at your SunClaw instance URL
- Great for internal use and testing

**Pro tip:** Start with just Telegram and Web Chat. You can add WhatsApp, Slack, and Discord later from the SunClaw dashboard without redeploying.

---

### Step 3: Connect to KIISHA (Optional)

This step is **optional**. If you just want the 11 standalone renewable energy skills and OpenClaw's 50+ built-in skills, skip this step entirely. You'll still have a powerful AI assistant.

But if you're part of a renewable energy company using the [KIISHA platform](https://kiisha.io) for portfolio management, here's how to connect:

1. **Get your KIISHA API Key**
   - Go to [KIISHA Settings → API Keys](https://app.kiisha.io/settings/api)
   - Generate a new API key
   - Copy it

2. **Paste into SunClaw**
   - Toggle "KIISHA Enterprise" on in the wizard
   - The KIISHA URL defaults to `https://app.kiisha.io`
   - Paste your API key

3. **Webhook Secret**
   - SunClaw auto-generates a 64-character hex webhook secret
   - This is used for secure communication between your OpenClaw instance and KIISHA
   - You'll need to set this same value as `OPENCLAW_WEBHOOK_SECRET` in your KIISHA environment

**What this unlocks:**
- Portfolio summaries across all your renewable energy assets
- VATR document compliance checks and gap analysis
- Ability to create maintenance work orders from chat
- Operational alert management in real-time
- Payment initiation and tracking through KIISHA

All KIISHA write operations (creating tickets, initiating payments) require explicit user confirmation before execution. The AI will show you a preview and ask for approval. No surprise actions.

---

### Step 4: Deploy

Now for the fun part. SunClaw supports **8 deployment platforms**, and the wizard generates all the environment variables from Steps 1-3 automatically. You just pick a platform and go.

Before deploying, you can name your instance (default: `my-sunclaw`). This becomes part of your deployment URL.

Let's go through each platform in detail.

---

## 8 Deployment Options: Pick Your Path

### 1. Railway — The KIISHA Recommended Path

**Setup Time:** ~2 minutes | **Pricing:** $0 free tier ($5 trial credit) | **Complexity:** Beginner | **Best For:** Everyone

Railway is SunClaw's primary deployment platform and the one KIISHA recommends for most users. It has the tightest integration — including zero-touch managed deployments for Pro/Enterprise users.

#### Free Tier Flow (Self-Hosted)

If you're on SunClaw's free plan, you deploy using Railway's template system:

**Sub-step 1: Create a Railway Account**
- Go to [railway.com](https://railway.com)
- Sign up with your GitHub account for the fastest setup
- Railway gives you $5 of free trial credit — enough to run SunClaw for several days

**Sub-step 2: Review Your Configuration**
- SunClaw shows you all the environment variables generated from Steps 1-3
- These will be automatically pre-filled in the Railway template
- Review them and make sure your API key and channel tokens look correct

**Sub-step 3: Deploy from Template**
- Click "Deploy to Railway" — this opens Railway with your config pre-filled
- Click "Deploy" on Railway's page
- Wait ~2 minutes for the Docker image to build
- Your SunClaw instance is live

The generated `.env` configuration looks like this:

```env
# SunClaw Configuration — Generated by Setup Wizard
# --- AI Provider ---
LLM_PROVIDER=moonshot
LLM_API_KEY=sk-your-key-here
LLM_MODEL=moonshot/kimi-k2.5

# --- Channels ---
WHATSAPP_ENABLED=true
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
SLACK_ENABLED=false
DISCORD_ENABLED=false

# --- KIISHA Enterprise ---
KIISHA_ENABLED=false

# --- Dashboard ---
DASHBOARD_PORT=3001
GATEWAY_PORT=3000
INSTANCE_NAME=my-sunclaw
```

**Railway Template Defaults** (auto-configured for you):

| Variable | Default |
|----------|---------|
| PORT | 18789 |
| NODE_ENV | production |
| CORS_ORIGIN | * |
| DASHBOARD_ENABLED | true |
| HELMET_ENABLED | true |
| HEALTH_CHECK_ENABLED | true |
| HEALTH_CHECK_PATH | /health |
| OPENCLAW_LOG_LEVEL | info |
| OPENCLAW_TIMEOUT_MS | 30000 |
| RATE_LIMIT_MAX_REQUESTS | 100 |

#### Pro/Enterprise Flow (Managed — Zero-Touch)

If you're on SunClaw's Pro ($29/mo) or Enterprise plan, the deploy is even simpler:

1. Click **"Deploy to Railway Now"**
2. SunClaw automatically:
   - Creates a new Railway project
   - Connects the GitHub repository
   - Sets all environment variables
   - Creates a public domain
   - Triggers the first deployment
3. Watch the progress bar as it builds and deploys
4. When it says "SunClaw is live!" — click to open your instance

The entire process takes about 90 seconds. Zero touch. Zero terminal.

**After deploy:** You get a Railway dashboard link and your SunClaw instance URL. The first request might take 1-2 minutes to warm up.

---

### 2. Render — Infrastructure as Code

**Setup Time:** ~5 minutes | **Pricing:** Free tier, paid from $7/mo | **Complexity:** Beginner | **Best For:** Developers who love clean dashboards

Render uses a blueprint-based deployment system. If you're a developer who prefers declarative infrastructure, this is a great option.

**Step-by-Step:**

1. **Click the Deploy to Render link** — SunClaw's wizard provides a pre-configured button that opens `render.com/deploy?repo=https://github.com/kaykluz/sunclaw`
2. **Set environment variables** — Render will prompt you to add your `SETUP_PASSWORD` and any other env vars from the wizard
3. **Build and Deploy** — Render automatically builds the Docker image and deploys
4. **Complete the setup wizard** — Navigate to `https://your-service.onrender.com/setup`, enter your password, and configure channels

**Features:**
- Free tier available
- Auto-deploy from GitHub
- Built-in SSL & CDN
- Easy environment variable management

---

### 3. Hostinger — Dedicated VPS

**Setup Time:** ~10 minutes | **Pricing:** From $5.99/mo | **Complexity:** Intermediate | **Best For:** Long-term production use

If you want full control with a dedicated IP address and guaranteed resources, Hostinger's VPS is the way to go. They have a pre-built OpenClaw Docker template.

**Step-by-Step:**

1. **Pick a Plan** — Go to [hostinger.com/vps](https://www.hostinger.com/vps) and select a KVM VPS plan (KVM 2 recommended)
2. **Select the OpenClaw Template** — During checkout, choose the "OpenClaw" Docker template at [hostinger.com/vps/docker/openclaw](https://www.hostinger.com/vps/docker/openclaw)
3. **Get Your Token** — Once deployed, check your dashboard for the `OPENCLAW_GATEWAY_TOKEN`
4. **Access the UI** — Navigate to your VPS IP address and paste the token
5. **Connect Channels** — Go to the Channels tab and configure Telegram, WhatsApp, etc.

**Features:**
- Dedicated IP & resources
- 99.9% uptime guarantee
- Full root SSH access
- OpenClaw Docker template pre-installed

---

### 4. Emergent.sh — The Fastest Path

**Setup Time:** ~5 minutes | **Pricing:** Free tier available | **Complexity:** Beginner | **Best For:** Absolute beginners who want to test immediately

Emergent.sh is the "I want it now" option. They've turned OpenClaw into a pre-built "chip" that launches instantly.

**Step-by-Step:**

1. **Go to [emergent.sh](https://emergent.sh)**
2. **Select the MoltBot Chip** — Look for the OpenClaw/MoltBot chip
3. **Hit Launch** — Emergent automatically provisions a VM, installs everything, and sets up the runtime
4. **Connect LLM** — Paste your API key (or use Emergent's managed keys)
5. **Publish** — Click "Publish" to keep your bot online 24/7

**Tutorial:** [emergent.sh/tutorial/moltbot-on-emergent](https://emergent.sh/tutorial/moltbot-on-emergent)

**Features:**
- No terminal required at all
- Free tier available
- Pre-built OpenClaw image
- Instant provisioning

**Pro tip:** This is the best option if you just want to test SunClaw and see what it can do without any commitment. Five minutes, done.

---

### 5. Northflank — One-Click Template

**Setup Time:** ~7 minutes | **Pricing:** Free tier, paid ~$5-10/mo | **Complexity:** Beginner | **Best For:** Balance of simplicity and control

Northflank provides a streamlined one-click template for OpenClaw with persistent storage included — meaning your AI won't forget everything when the server restarts.

**Step-by-Step:**

1. **Click the Deploy OpenClaw button** — Opens the [Northflank template](https://northflank.com/stacks/deploy-openclaw)
2. **Create an account** if you don't have one
3. **Deploy the stack** — Set the `SETUP_PASSWORD` environment variable
4. **Complete setup** — Open the public URL and configure at `/setup`

**Features:**
- One-click deploy stack
- Free tier available
- Persistent storage included
- Easy environment management

---

### 6. Cloudflare Workers — Serverless Edge

**Setup Time:** ~15 minutes | **Pricing:** $5/mo (Workers Paid plan) | **Complexity:** Developer | **Best For:** Developers who want serverless architecture

If you're already in the Cloudflare ecosystem, you can run OpenClaw as a serverless agent on Cloudflare's global edge network using MoltWorker.

**Step-by-Step:**

1. **Clone the MoltWorker repository** locally
2. **Run `npm install`**
3. **Set your API key:** `npx wrangler secret put ANTHROPIC_API_KEY`
4. **Generate a gateway token:**
   ```bash
   export MOLTBOT_GATEWAY_TOKEN=$(openssl rand -hex 32)
   echo "$MOLTBOT_GATEWAY_TOKEN" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
   ```
5. **Deploy:** `npm run deploy`
6. **Access the Control UI** at `https://your-worker.workers.dev/?token=YOUR_GATEWAY_TOKEN`

**Features:**
- Global edge network (low latency worldwide)
- Serverless architecture (scales automatically)
- Cloudflare Access security
- Sandbox SDK integration

**Note:** This is the most technical option. If "Wrangler CLI" and "Workers Paid plan" sound unfamiliar, pick Railway or Emergent instead.

---

### 7. Alibaba Cloud — Asia-Optimized

**Setup Time:** ~10 minutes | **Pricing:** From $0.99/mo (promo) | **Complexity:** Intermediate | **Best For:** APAC-facing enterprises

Deploy on Alibaba Cloud's Simple Application Server with the OpenClaw image. Best for teams in Asia-Pacific who want low-latency access and integration with Alibaba's Model Studio (Qwen).

**Step-by-Step:**

1. **Go to the [Alibaba Cloud OpenClaw template](https://www.alibabacloud.com/en/campaign/ai-openclaw)**
2. **Select the OpenClaw image** during setup
3. **Configure environment variables** — paste your API key, channel tokens
4. **Deploy** and access the setup wizard at your server URL

**Features:**
- Starting at $0.99/mo promotional pricing for new users
- Pre-built OpenClaw image
- Qwen (Alibaba's LLM) Model Studio integration
- Multi-region deployment

---

### 8. Docker Self-Hosted — Full Control

**Setup Time:** ~10 minutes | **Pricing:** $0 (bring your own server) | **Complexity:** Intermediate | **Best For:** Full control and maximum privacy

If you want everything on your own hardware — a VPS, a spare laptop, a Mac Mini, a Raspberry Pi — the Docker self-hosted option gives you a one-line install script.

**Step-by-Step:**

1. **Copy the install command** from SunClaw's wizard — it includes all your environment variables from Steps 1-3
2. **Run it on any Linux or macOS server** — the script auto-installs Docker and all dependencies
3. **Wait for the build** — takes 2-5 minutes depending on your server
4. **Access SunClaw** at `http://your-server-ip:3000`

**Features:**
- Works on any Linux/macOS server
- Auto-installs all dependencies
- Full filesystem access
- No vendor lock-in — you own everything

**Pro tip:** This is the ultimate privacy option. Your data never touches any third-party cloud. Perfect for organizations with strict data residency requirements.

---

## Pricing Comparison

### Deployment Platforms

| Platform | Starting Price | Setup Time | Free Tier | Best For |
|----------|---------------|------------|-----------|----------|
| **Railway** | $0 | ~2 min | Yes ($5 credit) | Everyone (KIISHA recommended) |
| **Render** | $0 | ~5 min | Yes | Developers, clean dashboards |
| **Emergent.sh** | $0 | ~5 min | Yes | Absolute beginners |
| **Northflank** | $0 | ~7 min | Yes | Balance of simplicity & control |
| **Hostinger** | $5.99/mo | ~10 min | No | Long-term production |
| **Alibaba Cloud** | $0.99/mo | ~10 min | Promo only | APAC enterprises |
| **Docker** | $0 | ~10 min | N/A (BYO server) | Full control & privacy |
| **Cloudflare** | $5/mo | ~15 min | No | Serverless developers |

### SunClaw Plans

| Feature | Free ($0/mo) | Pro ($29/mo) | Enterprise (Custom) |
|---------|-------------|-------------|-------------------|
| RE AI Skills (11) | Yes | Yes | Yes |
| OpenClaw Skills (50+) | Yes | Yes | Yes |
| Guided Setup Wizard | Yes | Yes | Yes |
| Telegram BotFather Wizard | Yes | Yes | Yes |
| All Channel Templates | Yes | Yes | Yes |
| Infrastructure | Your own Railway | Managed Railway | Dedicated |
| API Keys | Your own keys | BYO (or add-on) | Managed included |
| Managed Railway Hosting | - | Yes | Yes |
| Telegram Click-and-Go | - | Yes | Yes |
| Live Logs Dashboard | - | Yes | Yes |
| Persistent Memory | - | Yes | Yes |
| Managed LLM Keys | - | +$19/mo add-on | Included |
| KIISHA Enterprise Skills | - | - | Yes |
| VATR Compliance | - | - | Yes |
| Dedicated Infrastructure | - | - | Yes |
| Bot Instances | Self-hosted | Up to 3 | Unlimited |
| Support | Community | Priority Email | Dedicated |

### Add-On: Managed LLM Keys

Don't want to manage your own API keys? SunClaw offers a **Managed LLM Keys add-on for $19/month**. They provide and manage keys for OpenAI, Anthropic, and other providers so you can focus on using the AI, not managing billing across 5 different API dashboards.

**Bundle deal:** Pro + Managed Keys = **$48/month** (saves you the hassle of managing both infrastructure and API keys).

---

## What Happens After You Deploy

Once your SunClaw instance is live, you get access to a full **Command Center dashboard** with 13 sections:

### Dashboard Overview

| Section | What It Does |
|---------|-------------|
| **Overview** | Stats, active deployments, recent activity at a glance |
| **Chat** | Direct chat with your deployed AI — test it right from the browser |
| **Channels** | View, add, and manage Telegram/WhatsApp/Slack/Discord connections |
| **Skills** | Enable or disable any of the 11 RE skills and 50+ OpenClaw skills |
| **Config** | View and edit the full OpenClaw configuration (openclaw.json) |
| **Sessions** | Active conversation sessions with device info |
| **Logs** | Real-time service logs streamed from Railway |
| **Analytics** | Message volume, channel breakdown, skill usage over time |
| **Notifications** | Real-time WebSocket notifications from your agent |
| **API Keys** | Manage model provider keys with priority and failover settings |
| **Memory** | View and edit persistent agent memory and journal entries |
| **Conversations** | Full conversation history across all channels |
| **Enterprise Tokens** | (Enterprise only) KIISHA enterprise API token management |

### First Things to Do After Deploy

1. **Test with Chat** — Open the Chat section and ask: "What's the solar irradiance for Lagos, Nigeria?" You should get back GHI/DNI/DHI data within seconds.

2. **Connect Telegram** — If you set up Telegram in the wizard, go to your bot in Telegram and send `/start`. It should respond with a greeting.

3. **Connect WhatsApp** — Go to Channels → WhatsApp and scan the QR code with your phone. Use a dedicated number for the bot.

4. **Browse Skills** — Check the Skills section to see all 11 RE skills and 50+ OpenClaw skills. Toggle any you don't need off.

5. **Check Logs** — If anything doesn't work, the Logs section streams real-time output from your Railway deployment. This is your debugging lifeline.

---

## SunClaw's AI Personality: The Soul

One of the most underrated features of SunClaw is its **Soul.md** — a detailed system prompt that gives the AI a specific identity and expertise profile. This isn't a generic chatbot. Here's what makes it different:

### Deep Domain Expertise

SunClaw's AI has been prompted with expert-level knowledge in:

- **Solar PV Design** — Module selection, string sizing (Voc/Vmp temperature corrections), tilt/azimuth optimization, shading analysis, DC:AC ratio, BOS specification
- **Battery Energy Storage (BESS)** — AC/DC coupling topology, capacity sizing, degradation modeling, round-trip efficiency, thermal management, cycling strategy
- **Power Purchase Agreements** — Tariff structures (fixed, escalating, ToU, capacity+energy), bankability, waterfall analysis, DSCR targets, offtaker risk
- **Financial Modeling** — LCOE, IRR/NPV, sensitivity analysis, debt sizing, DSCR, tariff comparison, investment memo preparation
- **Operations & Maintenance** — Performance ratio analysis, fault detection, inverter error codes, cleaning schedules, degradation tracking
- **Grid Connection** — Grid code compliance by jurisdiction, protection relay settings, fault level calculations, interconnection requirements
- **Carbon Credits** — Emission reduction calculations, Gold Standard/Verra/I-REC registry requirements, MRV guidance
- **Wind Energy** — Wind rose analysis, Weibull distribution, wake effects, hub height extrapolation, turbine selection, AEP estimation

### Regional Focus: Sub-Saharan Africa

SunClaw has deep knowledge of renewable energy markets in:

- **Kenya** — EPRA regulations, KPLC grid connection, ERC requirements, FiT policy
- **South Africa** — NERSA licensing, Eskom grid code, REIPPP procurement, wheeling frameworks
- **Nigeria** — NERC regulations, TCN grid access, MYTO tariff methodology, mini-grid regulations

It also adapts for any global jurisdiction when you provide local parameters.

### Persistent Memory

SunClaw remembers your projects, preferences, and past conversations:

- **memory.md** — Running knowledge base: your name, role, company, active projects, equipment preferences, regulatory context
- **todo.md** — Ongoing task tracker with deadlines and follow-ups
- **daily-log.md** — End-of-day summaries of what was accomplished and what's pending

At the start of every conversation, the AI reviews its memory to restore context. It will proactively remind you of pending items: *"By the way, the EPRA license renewal you mentioned last week is coming up."*

### Channel-Aware Communication

SunClaw adapts its style based on where you're chatting:

- **WhatsApp/Telegram** — Concise. Leads with the answer, then shows working. Uses line breaks for readability.
- **Web Chat/Slack** — More detailed. Tables, structured outputs, longer explanations.

It never uses unnecessary jargon. "The performance ratio dropped" beats "the PR metric experienced a negative delta."

---

## Security & Architecture

This is critical, especially for enterprise users handling sensitive project data.

### Self-Hosted Gateway

Your OpenClaw Gateway runs on **your own Railway instance** (or your chosen platform). Data stays under your control. SunClaw's management layer sends configuration — it doesn't store or relay your conversations.

### Authenticated API Calls

All enterprise API calls between SunClaw and KIISHA require valid, scoped API keys. No open endpoints.

### Encrypted Credentials

Channel tokens (Telegram, WhatsApp, Slack, Discord) and LLM API keys are encrypted at rest in the SunClaw database. They're injected as environment variables at deploy time and never exposed through the UI.

### Full Audit Trail

Every interaction is logged through KIISHA's telemetry pipeline. You have complete visibility into what the AI did, when, and for whom.

---

## My Verdict: Which Path Should You Take?

After testing all 8 deployment options, here's my recommendation matrix:

### If you're a beginner who just wants to try it:

**Emergent.sh** or **Railway free tier.** Both are free, take under 5 minutes, and require zero technical knowledge. Emergent is slightly easier (no Railway account needed), but Railway gives you more control long-term.

### If you're running this for a real team:

**Railway Pro ($29/mo).** The zero-touch managed deployment is worth every penny. You click one button, SunClaw creates the Railway project, injects your config, assigns a domain, and deploys. It's live in 90 seconds. Plus you get the full dashboard with live logs, analytics, and persistent memory.

### If you're an enterprise with KIISHA:

**Railway Enterprise + KIISHA connection.** Dedicated infrastructure, managed LLM keys included, VATR compliance, portfolio management — the full package. This is what SunClaw was built for.

### If you're a developer who wants full control:

**Docker self-hosted** or **Cloudflare Workers.** Docker gives you complete control on your own hardware. Cloudflare gives you serverless scale on the edge. Both require more technical skill but offer maximum flexibility.

### If you're APAC-based:

**Alibaba Cloud.** The $0.99/mo promotional pricing is hard to beat, and the integration with Qwen (Alibaba's LLM) gives you a fully local AI stack.

---

## Quick Start: The Fastest Path from Zero to Running

If you just want to get SunClaw running right now, here's the absolute fastest path:

1. Go to [sunclaw.kiisha.io](https://sunclaw.kiisha.io)
2. Create an account (email + password)
3. Select the **Free** plan
4. In the Setup Wizard:
   - **Step 1:** Select "Moonshot AI (Kimi)" → paste your API key from [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys) → select "Kimi K2.5"
   - **Step 2:** Enable Telegram → follow the BotFather wizard to get a bot token
   - **Step 3:** Skip (you don't need KIISHA enterprise to start)
   - **Step 4:** Select Railway → follow the 3-step template flow
5. Wait ~2 minutes for Railway to build
6. Open Telegram, find your bot, send `/start`
7. Ask: *"What's the solar irradiance for Nairobi, Kenya?"*
8. Watch the magic happen.

**Total time: under 10 minutes. Total cost: $0.**

---

## Links & Resources

- **SunClaw Website:** [sunclaw.kiisha.io](https://sunclaw.kiisha.io)
- **KIISHA Platform:** [kiisha.io](https://kiisha.io)
- **OpenClaw GitHub:** [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- **OpenClaw Docs:** [docs.openclaw.ai](https://docs.openclaw.ai)

### Deploy Links

| Platform | Deploy Link |
|----------|-----------|
| Railway | [Railway Template](https://railway.com/workspace/templates/9e2a5d49-837a-40e7-b90a-c1c8b8512c87) |
| Render | [Deploy to Render](https://render.com/deploy?repo=https://github.com/kaykluz/sunclaw) |
| Hostinger | [Hostinger VPS Docker Template](https://www.hostinger.com/vps/docker/openclaw) |
| Emergent.sh | [MoltBot on Emergent](https://emergent.sh/tutorial/moltbot-on-emergent) |
| Northflank | [Deploy on Northflank](https://northflank.com/stacks/deploy-openclaw) |
| Alibaba Cloud | [Alibaba OpenClaw Campaign](https://www.alibabacloud.com/en/campaign/ai-openclaw) |

### API Key Dashboards

| Provider | Get Your Key |
|----------|-------------|
| Moonshot AI (Kimi) | [platform.moonshot.cn/console/api-keys](https://platform.moonshot.cn/console/api-keys) |
| Kimi Code | [kimi.com/code/en](https://www.kimi.com/code/en) |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Cerebras | [cloud.cerebras.ai](https://cloud.cerebras.ai/) |
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Mistral | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| Venice AI | [venice.ai/settings/api](https://venice.ai/settings/api) |
| Anthropic | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| DeepSeek | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |
| xAI (Grok) | [console.x.ai](https://console.x.ai/) |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |
| MiniMax | [platform.minimax.io](https://platform.minimax.io) |

---

## What's Next?

Once you've deployed SunClaw, the real fun begins:

- **Ask it to calculate LCOE** for your next solar project
- **Get irradiance data** for any site location in the world
- **Run a financial model** with IRR, NPV, and DSCR analysis
- **Check grid status** for any of the 12+ supported countries
- **Estimate carbon credits** for your renewable energy assets
- **Analyze a PPA** for bankability and tariff structure

And if you connect to KIISHA, you can manage your entire renewable energy portfolio through chat — across WhatsApp, Telegram, Slack, Discord, or the web.

The AI agent revolution isn't just for developers anymore. SunClaw makes it accessible to every renewable energy professional.

---

*Built by [KIISHA Technologies](https://kiisha.io). Powered by [OpenClaw](https://openclaw.ai).*
