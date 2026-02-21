# Conversational Landing Funnel — Design Document

**Date:** 2026-02-21
**Status:** Approved
**Author:** Claude + Solomon

---

## Overview

Replace the landing page hero CTAs with a Boardy.ai-style conversational chat flow that:
- Routes users to the right product based on intent (marketplace, deploy, services)
- Collects structured lead data (name, email, role, region, intent)
- Soft-gates the Telegram bot link behind flow completion
- Saves all data to the existing waitlist table via tRPC

## Architecture

### Component: ConversationalFunnel.tsx

Single stateful component with internal step state machine. No URL routing, no context providers.

```
State Shape:
{
  step: 'intent' | 'role' | 'region' | 'form' | 'complete',
  intent: 'need_services' | 'offer_services' | 'deploy' | null,
  role: string | null,
  region: string | null,
  formData: { name, email, phone, company },
  isSubmitting: boolean,
  telegramDeepLink: string | null
}
```

### Step Flow

```
STEP 1: Intent Selection
├─ "I need RE advisory / services" → intent = "need_services" → STEP 2a
├─ "I offer RE services" → intent = "offer_services" → STEP 2b
└─ "I want to deploy my own agent" → intent = "deploy" → STEP 3

STEP 2a: Role (need_services)
├─ Project Developer / Asset Owner / C&I Client / Utility / Government / Other
└─ → STEP 3

STEP 2b: Role (offer_services)
├─ Installer/EPC / Financier/Investor / Consultant / Equipment Supplier / Recruiter / Other
└─ → STEP 3

STEP 3: Region
├─ West Africa / East Africa / Southern Africa / North Africa-MENA
├─ Europe / Asia-Pacific / Americas / Other
└─ → STEP 4

STEP 4: Form (name, email, phone*, company*)
├─ Submit → tRPC waitlist.join mutation
└─ → STEP 5

STEP 5: Completion
├─ If intent = "deploy" → Show message + redirect to /agent/setup
└─ Otherwise → Show Telegram deep link
```

### Visual Design

The funnel renders as a chat interface embedded in the hero section:
- Bot messages: SunClawIcon (24px) + speech bubble (left-aligned)
- User messages: Right-aligned bubbles showing their selections
- Choice cards: Dark surface cards with gold hover glow
- Form: Inline inputs styled to match existing landing page

Styling uses CSS injection into the existing `landingCSS` string, scoped under `.sc-landing`. No Tailwind utilities, no shadcn components, no Framer Motion.

### Animation

CSS keyframes matching existing `fadeUp` pattern:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```
Duration: 300ms ease, staggered delays for sequential messages.

## Database Changes

Extend `waitlist` table with 4 new columns:

```sql
ALTER TABLE `waitlist` ADD COLUMN `phone` varchar(32);
ALTER TABLE `waitlist` ADD COLUMN `intent` varchar(32);
ALTER TABLE `waitlist` ADD COLUMN `region` varchar(64);
ALTER TABLE `waitlist` ADD COLUMN `telegramDeepLink` varchar(128);
```

## Backend Changes

Extend `waitlist.join` tRPC endpoint:
- Accept new fields: `phone`, `intent`, `region`
- Generate unique `telegramDeepLink` using `crypto.randomBytes(6).toString("hex")`
- Return `telegramDeepLink` in response for frontend to construct Telegram URL

## Landing Page Integration

1. Add `id="talk"` to funnel container
2. Replace hero CTA buttons with `<ConversationalFunnel />`
3. Update "Get Early Access" links throughout to `href="#talk"`
4. Add `useEffect` to smooth-scroll to `#talk` on mount if hash present
5. Bottom CTA section embeds funnel or links to `#talk`

## Marketplace Page

Redirect `/marketplace` to `/#talk`:
```tsx
useEffect(() => {
  window.location.replace('/#talk');
}, []);
```

This preserves the anchor and triggers smooth scroll on the landing page.

## Files to Modify

| File | Action |
|------|--------|
| `client/src/components/ConversationalFunnel.tsx` | Create (new component) |
| `client/src/pages/LandingPage.tsx` | Integrate funnel, update CTAs, add scroll handling |
| `client/src/pages/Marketplace.tsx` | Redirect to /#talk |
| `drizzle/schema.ts` | Add 4 columns to waitlist |
| `drizzle/0011_funnel_fields.sql` | Create migration |
| `drizzle/meta/_journal.json` | Add migration entry |
| `server/routers.ts` | Extend waitlist.join endpoint |

## Files NOT to Modify

- `server/_core/*` (auth, tRPC setup)
- `server/stripe*.ts` (billing)
- `server/railway.ts` (deployment)
- Dashboard pages, Auth pages, Setup wizard
- `client/src/App.tsx` routing
- Test files

## Success Criteria

1. User can complete full funnel flow in <30 seconds
2. All form data saved to waitlist table with correct intent/region
3. Telegram deep link shown on completion (non-deploy intents)
4. Deploy intent redirects to /agent/setup
5. Mobile responsive (works on 375px width)
6. Animations feel snappy (300ms transitions)
7. Visual style matches existing landing page exactly
