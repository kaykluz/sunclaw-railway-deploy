# Conversational Landing Funnel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace landing page hero CTAs with a Boardy-style conversational chat flow that routes users, collects lead data, and soft-gates the Telegram bot link.

**Architecture:** Single stateful React component (`ConversationalFunnel.tsx`) with internal step state machine. CSS styles injected via the existing landing page `<style>` tag pattern. Backend extended to accept new fields and generate Telegram deep links.

**Tech Stack:** React, TypeScript, tRPC, Drizzle ORM, MySQL, CSS keyframe animations (no Framer Motion)

---

## Task 1: Extend Database Schema

**Files:**
- Modify: `drizzle/schema.ts:149-157`
- Create: `drizzle/0011_funnel_fields.sql`
- Modify: `drizzle/meta/_journal.json`

**Step 1.1: Add new columns to waitlist table schema**

In `drizzle/schema.ts`, replace lines 149-157 with:

```typescript
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  role: varchar("userRole", { length: 128 }),
  source: varchar("source", { length: 64 }).default("website"),
  phone: varchar("phone", { length: 32 }),
  intent: varchar("intent", { length: 32 }),
  region: varchar("region", { length: 64 }),
  telegramDeepLink: varchar("telegramDeepLink", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**Step 1.2: Create migration file**

Create `drizzle/0011_funnel_fields.sql`:

```sql
ALTER TABLE `waitlist` ADD COLUMN `phone` varchar(32);
ALTER TABLE `waitlist` ADD COLUMN `intent` varchar(32);
ALTER TABLE `waitlist` ADD COLUMN `region` varchar(64);
ALTER TABLE `waitlist` ADD COLUMN `telegramDeepLink` varchar(128);
```

**Step 1.3: Update migration journal**

In `drizzle/meta/_journal.json`, add new entry after line 80:

```json
    {
      "idx": 11,
      "version": "5",
      "when": 1771635600000,
      "tag": "0011_funnel_fields",
      "breakpoints": true
    }
```

**Step 1.4: Run migration locally to verify**

```bash
cd /Users/sojoawo/sunclaw-railway-deploy
railway run npx drizzle-kit push
```

Expected: Migration applies successfully, no errors.

**Step 1.5: Commit**

```bash
git add drizzle/schema.ts drizzle/0011_funnel_fields.sql drizzle/meta/_journal.json
git commit -m "feat(db): add funnel fields to waitlist table

Added phone, intent, region, telegramDeepLink columns for conversational funnel.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Extend Backend Waitlist Endpoint

**Files:**
- Modify: `server/routers.ts:514-540`

**Step 2.1: Add crypto import at top of file**

Check if `crypto` is already imported. If not, add near the top imports:

```typescript
import crypto from "crypto";
```

**Step 2.2: Extend waitlist.join input schema and mutation**

Replace lines 514-540 in `server/routers.ts`:

```typescript
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
        // Generate unique deep-link reference
        const deepLink = `ref_${crypto.randomBytes(6).toString("hex")}`;

        const result = await addToWaitlist({
          email: input.email,
          name: input.name ?? null,
          company: input.company ?? null,
          role: input.role ?? null,
          source: input.source ?? "website",
          phone: input.phone ?? null,
          intent: input.intent ?? null,
          region: input.region ?? null,
          telegramDeepLink: deepLink,
        });

        notifyOwner({
          title: "New Lead",
          content: `${input.email}${input.name ? ` (${input.name})` : ""}${input.company ? ` from ${input.company}` : ""} — intent: ${input.intent ?? "unknown"}, region: ${input.region ?? "unknown"}`,
        }).catch(() => {});

        return { ...result, telegramDeepLink: deepLink };
      }),
```

**Step 2.3: Verify TypeScript compiles**

```bash
cd /Users/sojoawo/sunclaw-railway-deploy
pnpm tsc --noEmit
```

Expected: No type errors.

**Step 2.4: Commit**

```bash
git add server/routers.ts
git commit -m "feat(api): extend waitlist.join with funnel fields

Added phone, intent, region inputs. Generate telegramDeepLink on each signup.
Updated notifyOwner message to include intent and region.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create ConversationalFunnel Component

**Files:**
- Create: `client/src/components/ConversationalFunnel.tsx`

**Step 3.1: Create the component file**

Create `client/src/components/ConversationalFunnel.tsx`:

```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SunClawIcon } from "@/components/SunClawLogo";

type Step = "intent" | "role" | "region" | "form" | "complete";
type Intent = "need_services" | "offer_services" | "deploy" | null;

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const INTENT_OPTIONS = [
  { id: "need_services", icon: "☀️", label: "I need RE advisory / services" },
  { id: "offer_services", icon: "🔧", label: "I offer RE services" },
  { id: "deploy", icon: "🤖", label: "I want to deploy my own agent" },
] as const;

const ROLE_OPTIONS_NEED = [
  "Project Developer",
  "Asset Owner",
  "C&I Client",
  "Utility",
  "Government",
  "Other",
];

const ROLE_OPTIONS_OFFER = [
  "Installer / EPC",
  "Financier / Investor",
  "Consultant",
  "Equipment Supplier",
  "Recruiter",
  "Other",
];

const REGION_OPTIONS = [
  { id: "west_africa", label: "West Africa" },
  { id: "east_africa", label: "East Africa" },
  { id: "southern_africa", label: "Southern Africa" },
  { id: "north_africa_mena", label: "North Africa / MENA" },
  { id: "europe", label: "Europe" },
  { id: "asia_pacific", label: "Asia-Pacific" },
  { id: "americas", label: "Americas" },
  { id: "other", label: "Other" },
];

export default function ConversationalFunnel() {
  const [step, setStep] = useState<Step>("intent");
  const [intent, setIntent] = useState<Intent>(null);
  const [role, setRole] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  const joinMutation = trpc.waitlist.join.useMutation({
    onSuccess: (data) => {
      if (data.telegramDeepLink) {
        setTelegramLink(
          `https://t.me/sunclaw_KIISHA_bot?start=${data.telegramDeepLink}`
        );
      }
      setStep("complete");
      if (data.alreadyExists) {
        toast.info("Welcome back! You're already on the list.");
      } else {
        toast.success("You're in! SunClaw is ready to talk.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleIntentSelect = (selectedIntent: Intent) => {
    setIntent(selectedIntent);
    if (selectedIntent === "deploy") {
      setStep("region");
    } else {
      setStep("role");
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep("region");
  };

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    setStep("form");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    joinMutation.mutate({
      email: formData.email,
      name: formData.name || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      role: role || undefined,
      intent: intent || undefined,
      region: region || undefined,
      source: "funnel",
    });
  };

  const handleDeployRedirect = () => {
    window.location.href = "/agent/setup";
  };

  // Message components
  const BotMessage = ({
    children,
    animate = true,
  }: {
    children: React.ReactNode;
    animate?: boolean;
  }) => (
    <div
      className="sc-funnel-bot-row"
      style={animate ? { animation: "scFunnelFadeUp 0.3s ease forwards" } : {}}
    >
      <div className="sc-funnel-bot-avatar">
        <SunClawIcon size={24} />
      </div>
      <div className="sc-funnel-bot-bubble">{children}</div>
    </div>
  );

  const UserMessage = ({ children }: { children: React.ReactNode }) => (
    <div
      className="sc-funnel-user-row"
      style={{ animation: "scFunnelFadeUp 0.3s ease forwards" }}
    >
      <div className="sc-funnel-user-bubble">{children}</div>
    </div>
  );

  const ChoiceCard = ({
    icon,
    label,
    onClick,
    delay = 0,
  }: {
    icon?: string;
    label: string;
    onClick: () => void;
    delay?: number;
  }) => (
    <button
      type="button"
      className="sc-funnel-choice"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && <span className="sc-funnel-choice-icon">{icon}</span>}
      <span className="sc-funnel-choice-label">{label}</span>
    </button>
  );

  return (
    <div className="sc-funnel">
      {/* Step 1: Intent */}
      <BotMessage animate={false}>What brings you here today?</BotMessage>

      {step === "intent" && (
        <div className="sc-funnel-choices">
          {INTENT_OPTIONS.map((opt, i) => (
            <ChoiceCard
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              onClick={() => handleIntentSelect(opt.id as Intent)}
              delay={i * 50}
            />
          ))}
        </div>
      )}

      {/* Show user's intent selection */}
      {intent && step !== "intent" && (
        <UserMessage>
          {INTENT_OPTIONS.find((o) => o.id === intent)?.label}
        </UserMessage>
      )}

      {/* Step 2: Role (conditional) */}
      {step === "role" && intent && intent !== "deploy" && (
        <>
          <BotMessage>
            {intent === "need_services"
              ? "What best describes you?"
              : "What type of services do you offer?"}
          </BotMessage>
          <div className="sc-funnel-choices">
            {(intent === "need_services"
              ? ROLE_OPTIONS_NEED
              : ROLE_OPTIONS_OFFER
            ).map((r, i) => (
              <ChoiceCard
                key={r}
                label={r}
                onClick={() => handleRoleSelect(r)}
                delay={i * 50}
              />
            ))}
          </div>
        </>
      )}

      {/* Show user's role selection */}
      {role && (step === "region" || step === "form" || step === "complete") && (
        <UserMessage>{role}</UserMessage>
      )}

      {/* Step 3: Region */}
      {step === "region" && (
        <>
          <BotMessage>Where are you based?</BotMessage>
          <div className="sc-funnel-choices sc-funnel-choices-grid">
            {REGION_OPTIONS.map((r, i) => (
              <ChoiceCard
                key={r.id}
                icon="🌍"
                label={r.label}
                onClick={() => handleRegionSelect(r.id)}
                delay={i * 30}
              />
            ))}
          </div>
        </>
      )}

      {/* Show user's region selection */}
      {region && (step === "form" || step === "complete") && (
        <UserMessage>
          {REGION_OPTIONS.find((r) => r.id === region)?.label}
        </UserMessage>
      )}

      {/* Step 4: Form */}
      {step === "form" && (
        <>
          <BotMessage>Almost there. Let me know how to reach you.</BotMessage>
          <form className="sc-funnel-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="tel"
              placeholder="Phone / WhatsApp (optional)"
              value={formData.phone}
              onChange={(e) =>
                setFormData((f) => ({ ...f, phone: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="text"
              placeholder="Company (optional)"
              value={formData.company}
              onChange={(e) =>
                setFormData((f) => ({ ...f, company: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <button
              type="submit"
              disabled={joinMutation.isPending || !formData.email}
              className="sc-funnel-submit"
            >
              {joinMutation.isPending ? "Submitting..." : "Let's Go"}
            </button>
          </form>
        </>
      )}

      {/* Step 5: Completion */}
      {step === "complete" && (
        <>
          {intent === "deploy" ? (
            <>
              <BotMessage>
                Great choice. Let's set up your own SunClaw agent.
              </BotMessage>
              <div className="sc-funnel-cta-row">
                <button
                  type="button"
                  className="sc-funnel-submit"
                  onClick={handleDeployRedirect}
                >
                  Launch Setup Wizard
                </button>
              </div>
            </>
          ) : (
            <>
              <BotMessage>
                SunClaw is ready to talk. Message the bot to start your
                conversation.
              </BotMessage>
              <div className="sc-funnel-cta-row">
                <a
                  href={telegramLink || "https://t.me/sunclaw_KIISHA_bot"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sc-funnel-submit"
                >
                  Open Telegram
                </a>
              </div>
              <p className="sc-funnel-note">
                You're on the marketplace waitlist. We'll notify you when it
                launches.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

**Step 3.2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: No type errors.

**Step 3.3: Commit**

```bash
git add client/src/components/ConversationalFunnel.tsx
git commit -m "feat(ui): create ConversationalFunnel component

Boardy-style chat flow with 5 steps: intent, role, region, form, complete.
Routes users to Telegram bot or deploy wizard based on intent.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add Funnel CSS to Landing Page

**Files:**
- Modify: `client/src/pages/LandingPage.tsx` (the `landingCSS` string, lines ~97-292)

**Step 4.1: Add funnel CSS to the landingCSS string**

Find the end of the `landingCSS` string (before the closing backtick) and add:

```css
/* CONVERSATIONAL FUNNEL */
.sc-funnel {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sc-funnel-bot-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sc-funnel-bot-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.sc-funnel-bot-bubble {
  background: rgba(255,255,255,0.06);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 380px;
}

.sc-funnel-user-row {
  display: flex;
  justify-content: flex-end;
}

.sc-funnel-user-bubble {
  background: rgba(245,166,35,0.15);
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  max-width: 320px;
}

.sc-funnel-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 36px;
}

.sc-funnel-choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.sc-funnel-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  opacity: 0;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-funnel-choice:hover {
  border-color: rgba(245,166,35,0.2);
  background: rgba(255,255,255,0.04);
  transform: translateY(-2px);
}

.sc-funnel-choice-icon {
  font-size: 20px;
}

.sc-funnel-choice-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-primary);
}

.sc-funnel-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 36px;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-funnel-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.sc-funnel-input::placeholder {
  color: var(--text-muted);
}

.sc-funnel-input:focus {
  border-color: rgba(245,166,35,0.4);
}

.sc-funnel-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 100px;
  background: var(--sun-gold);
  color: var(--deep-earth);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.sc-funnel-submit:hover {
  background: #FFB840;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(245,166,35,0.3);
}

.sc-funnel-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.sc-funnel-cta-row {
  margin-left: 36px;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-funnel-note {
  margin-left: 36px;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

@keyframes scFunnelFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .sc-funnel { max-width: 100%; }
  .sc-funnel-choices { margin-left: 0; }
  .sc-funnel-choices-grid { grid-template-columns: 1fr; }
  .sc-funnel-form { margin-left: 0; }
  .sc-funnel-cta-row { margin-left: 0; }
  .sc-funnel-note { margin-left: 0; }
  .sc-funnel-bot-bubble { max-width: 280px; }
  .sc-funnel-user-bubble { max-width: 260px; }
}
```

**Step 4.2: Commit**

```bash
git add client/src/pages/LandingPage.tsx
git commit -m "style: add ConversationalFunnel CSS to landing page

Scoped styles under .sc-landing for chat bubbles, choice cards, form inputs.
Includes fadeUp animation and mobile responsive breakpoints.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Integrate Funnel into Landing Page Hero

**Files:**
- Modify: `client/src/pages/LandingPage.tsx`

**Step 5.1: Import ConversationalFunnel**

At top of file, add import:

```tsx
import ConversationalFunnel from "@/components/ConversationalFunnel";
```

**Step 5.2: Replace hero CTAs with funnel**

Find lines 327-330 (the hero-ctas div):

```tsx
        <div className="hero-ctas">
          <a href="/marketplace" className="btn-primary">Get Early Access</a>
          <a href="/agent/setup" className="btn-secondary">Deploy Your Own Agent</a>
        </div>
```

Replace with:

```tsx
        <div id="talk" className="hero-ctas" style={{ width: '100%', maxWidth: 560 }}>
          <ConversationalFunnel />
        </div>
```

**Step 5.3: Update nav CTA**

Find line 317:

```tsx
          <li><a href="/marketplace" className="nav-cta">Get Early Access</a></li>
```

Replace with:

```tsx
          <li><a href="#talk" className="nav-cta">Talk to SunClaw</a></li>
```

**Step 5.4: Update bottom CTA section**

Find lines 507-509:

```tsx
          <a href="/marketplace" className="btn-primary" style={{ display: "inline-block" }}>Get Early Access</a>
          <a href="/agent/setup" className="btn-secondary" style={{ display: "inline-block", marginLeft: 12 }}>Deploy Your Own Agent</a>
```

Replace with:

```tsx
          <a href="#talk" className="btn-primary" style={{ display: "inline-block" }}>Talk to SunClaw</a>
          <a href="/agent/setup" className="btn-secondary" style={{ display: "inline-block", marginLeft: 12 }}>Deploy Your Own Agent</a>
```

**Step 5.5: Add scroll-to-anchor effect**

At the top of the component function (after the useEffect for CSS injection), add:

```tsx
  useEffect(() => {
    // Smooth scroll to #talk if hash is present
    if (window.location.hash === "#talk") {
      setTimeout(() => {
        document.getElementById("talk")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);
```

**Step 5.6: Verify app compiles and runs**

```bash
pnpm dev
```

Open http://localhost:3000 and verify the funnel appears in the hero.

**Step 5.7: Commit**

```bash
git add client/src/pages/LandingPage.tsx
git commit -m "feat: integrate ConversationalFunnel into landing page hero

Replaced CTA buttons with chat funnel. Updated nav and bottom CTAs to #talk.
Added smooth scroll behavior for direct #talk links.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Marketplace Page to Redirect

**Files:**
- Modify: `client/src/pages/Marketplace.tsx`

**Step 6.1: Replace entire file content**

Replace `client/src/pages/Marketplace.tsx` with:

```tsx
import { useEffect } from "react";

export default function Marketplace() {
  useEffect(() => {
    // Redirect to landing page funnel section
    window.location.replace("/#talk");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1A1612",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9E958B",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Redirecting...
    </div>
  );
}
```

**Step 6.2: Commit**

```bash
git add client/src/pages/Marketplace.tsx
git commit -m "feat: redirect /marketplace to landing page funnel

Users visiting /marketplace directly are redirected to /#talk.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Test End-to-End Flow

**Step 7.1: Start dev server**

```bash
pnpm dev
```

**Step 7.2: Test funnel flow**

1. Go to http://localhost:3000
2. Verify funnel appears in hero section
3. Click "I need RE advisory / services"
4. Select a role (e.g., "Project Developer")
5. Select a region (e.g., "West Africa")
6. Fill in email (required), optionally name/phone/company
7. Click "Let's Go"
8. Verify Telegram link appears

**Step 7.3: Test deploy intent**

1. Refresh page
2. Click "I want to deploy my own agent"
3. Select region
4. Fill in email
5. Click "Let's Go"
6. Verify "Launch Setup Wizard" button appears and redirects to /agent/setup

**Step 7.4: Test /marketplace redirect**

1. Go to http://localhost:3000/marketplace
2. Verify it redirects to /#talk and scrolls to funnel

**Step 7.5: Check database**

```bash
railway run mysql -e "SELECT email, intent, region, telegramDeepLink FROM waitlist ORDER BY id DESC LIMIT 5;"
```

Verify new entries have intent, region, and telegramDeepLink populated.

---

## Task 8: Final Commit and Push

**Step 8.1: Push all changes**

```bash
git push origin main
```

**Step 8.2: Verify Railway deployment**

Watch Railway dashboard for successful build and deployment.

**Step 8.3: Test production**

1. Go to https://sunclaw.kiisha.io
2. Complete funnel flow
3. Verify Telegram link works
4. Check database for new entry

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Extend database schema | schema.ts, migration, journal |
| 2 | Extend backend endpoint | routers.ts |
| 3 | Create funnel component | ConversationalFunnel.tsx |
| 4 | Add funnel CSS | LandingPage.tsx (CSS) |
| 5 | Integrate into landing page | LandingPage.tsx |
| 6 | Redirect marketplace | Marketplace.tsx |
| 7 | Test end-to-end | Manual testing |
| 8 | Deploy | git push |
