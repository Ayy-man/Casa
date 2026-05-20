# Casa Command Center

## What This Is

Casa Command Center is the human supervisor layer for Casa Properties' AI agents
(Pricing, Guest, Ops, SOP). It is the single-tenant operator dashboard that
Carlos Robles (CEO) and Denika Patel (Portfolio Manager) open to review and act
on agent decisions across 26 short-term rental homes in Vancouver, BC.

The UI skin shipped as a demo. This milestone replaces the mock data and fake
action buttons with a real Supabase backend, wires the dashboard to n8n-hosted
agent workflows, and makes the dashboard the operational surface that lets
Carlos let his day-shift VA go on May 15.

## Core Value

Carlos can resolve a day's exceptions in under 10 minutes and never feels the
need to open Hostaway, PriceLabs, or WhatsApp directly — because the agents do
the routine work and Carlos approves or overrides only the few decisions that
require judgment.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Existing demo skin — proven in stakeholder buy-in. -->

- ✓ Editorial design system — Playfair Display + Inter, ink-on-white, single
  blue accent, generous whitespace — existing
- ✓ Dashboard shell — sidebar nav, top bar, command palette (⌘K),
  notification bell, route group `(dashboard)` — existing
- ✓ Home screen — status banner, KPI cards, 4 exception cards sorted by
  urgency, right-rail panels (cleanings, check-ins/outs, agent activity),
  action toast surface — existing
- ✓ Pricing page — shadow-mode banner, bulk approve/reject, week selector,
  per-property recommendation rows — existing UI
- ✓ Cleanings page — today's board, detail sheet with WhatsApp thread mock,
  quality score, dispatch actions — existing UI
- ✓ Claims page — Pending/Submitted/Resolved tabs, before/after photo strips,
  edit sheet — existing UI
- ✓ Properties list + detail — searchable grid, hero image, specs, channel
  listings, Reviews tab, Activity tab — existing UI
- ✓ Bookings list + detail — table view, guest conversation thread, agent
  decisions log — existing UI
- ✓ Pricing Agent detail page — At a Glance, Live Activity, Configuration,
  Performance charts, Decisions table, Property Breakdown, Validation, Prompt
  History, Controls — existing UI (the exemplar for other agent pages)
- ✓ Reports page — Cumulative validation alignment KPIs, per-agent accordion —
  existing (Cumulative tab only)
- ✓ Settings page — Profile, Notifications, Agents quick controls, API Status,
  Branding — existing UI
- ✓ Hardcoded demo auth — Carlos + Denika share demo password — sufficient
  through May/June shadow validation
- ✓ Casa 360 Redesign — 13 routes collapsed to a 3-tab IA (Exception Board /
  Vault / Assistant), Owner/Operations roles via `useRole()`, the rich Pricing
  Agent detail page preserved under `/vault/agent-logs/pricing`, narrative
  operator-grade mock data — **Phase 1 (validated 2026-05-20)**. This redesign
  restructured the dashboard-shell, home-screen, and standalone-page items
  above: the left sidebar is now a sticky top nav, the KPI/right-rail home is
  now the urgency-sorted Exception Board, and the standalone Pricing /
  Cleanings / Claims / Properties / Bookings routes now live under `/vault/*`
  (legacy paths kept as `redirect()` stubs). Casa blue stays; sage green out.

### Active

<!-- May 15 deadline drives ordering. Carlos lets his day VA go May 15. -->

**Build order (priority):**

- [ ] **REQ-DATA-01** Real Supabase data layer — design and deploy 12-table
      schema + pgvector knowledge base, seed with 26 properties matching
      existing mock data shapes, generate TypeScript types via
      `supabase gen types typescript`, replace every page's mock-data import
      with a Supabase query module
- [ ] **REQ-DATA-02** Realtime data refresh on the dashboard — Supabase
      `postgres_changes` subscriptions on `exceptions`, `agent_logs`,
      `pricing_recs`, `turnovers` via a centralized `useRealtimeChannel` hook
      with channel cleanup. 30-second polling reserved for Settings → API
      Status (external health data) only.
- [ ] **REQ-INT-01** Outbound integration plumbing — `vercel.json` cron
      config, `/api/cron/{weekly-pricing,daily-event-scan}` routes,
      `/api/actions/{domain}/{verb}` routes, HMAC signing helper
      (`src/lib/n8n/sign.ts`), `N8N_WEBHOOK_BASE_URL` env wiring,
      idempotency-key generation on every cross-system call
- [ ] **REQ-INT-02** Inbound integration plumbing — `/api/webhooks/n8n/{event}`
      handler with HMAC verification, timestamp replay window, `idempotency_key
      UNIQUE` dedup; refresh affected exception/decision rows on callback
- [ ] **REQ-INT-03** Functional action buttons end-to-end — every console.log
      stub on exception cards, claim sheets, pricing rows, cleaning dispatch,
      and agent control panels routes through `/api/actions/*`: writes to
      Supabase and (where applicable) fires an HMAC-signed n8n action webhook
- [ ] **REQ-AGENT-01** Pricing Agent backend wired — first integration test of
      the Casa ↔ n8n pattern. Replaces math-generated decisions in the Pricing
      Agent detail page with real `agent_logs` reads. Mode toggle
      (Shadow / Live) actually persists and gates dispatch.
- [ ] **REQ-AGENT-02** Ops Agent cleaner dispatch wired — checkout → WhatsApp
      Andrea → 60min fallback to Carly → 120min escalation as exception card.
      Cleaner-reply parser marks turnover claimed. Real Meta WhatsApp Business
      API once Rachit forwards access; mocked until then.
- [ ] **REQ-AGENT-03** Guest Agent wired — handles inbound guest messages via
      Hostaway, drafts replies in Casa's brand voice ("premium concierge with
      a warm, polished edge"), responds in guest's language
      (EN/Mandarin/Japanese/French), escalates sensitive
      (refunds/cancellations/damage/security) as exception cards. 12 scheduled
      booking touchpoints + inbound inquiry handling.
- [ ] **REQ-AGENT-04** SOP Agent wired — listing-push workflow for new
      properties. Lowest urgency; ships after May 15.
- [ ] **REQ-UI-01** Guest / Ops / SOP agent detail pages — replace
      `<AgentSkeleton>` stubs with full structure modeled on the Pricing Agent
      page, pulling from `agent_logs` once real data layer is live
- [ ] **REQ-UI-02** Replace hardcoded date strings — `"Today · Friday, May 1"`
      and `"Today, May 1 · 7 cleanings scheduled."` rendered from current date
      and live data counts
- [ ] **REQ-UI-03** Functional Undo on exception action toast — reverses the
      Supabase write and any n8n trigger within the undo window

**Per-agent shadow-vs-autonomous bar is TBD** — system supports either mode
per agent; decision deferred to each agent's go-live moment.

### Out of Scope

<!-- Explicit boundaries with reasoning. -->

- **Agent logic / n8n workflow JSON / Claude prompt engineering** — Agent
  logic lives in n8n (visual workflow representation). The flows live in
  fyi-media.app.n8n.cloud and are built separately. This codebase owns
  schema, cron triggers, action routes, webhook receivers, realtime
  subscriptions, and UI — but never embeds an LLM call or prompt.
- **Real Supabase Auth migration** — Phase 2 concern. Carlos + Denika share
  hardcoded demo password through May/June shadow validation. Real auth is a
  go-live cutover task.
- **Supabase Row-Level Security policies** — Phase 2, right before real-user
  cutover. Single-tenant + shared demo creds means RLS is premature today.
- **Multi-tenant productization (Plan Insurance as second HumanOS instance)** —
  Future milestone. Build `NEXT_PUBLIC_WORKSPACE_NAME` env-driven branding so
  the path stays open, but do not extract a tenant abstraction now.
- **casaaccommodations.com website redesign** — Separate codebase, Months 2-3.
  Out of this repo entirely.
- **Test suite** — No tests today; not adding a test framework as Phase 1
  scope. Manual UAT against the existing mock-data shapes + a smoke test of
  the n8n integration is the QA bar through May 15. Revisit after cutover.
- **Removing scaffolded shadcn Radix dependencies** — Defer the cleanup until
  we know which primitives the dialog/focus-trap accessibility work will need.
- **All-pages-to-RSC refactor** — The "all pages are `use client`" finding
  from the codebase map is real, but a wholesale conversion is its own
  project. Convert pages opportunistically when their data-fetching gets
  rewired to Supabase.

## Context

**Operating context.** Casa Properties runs 26 short-term rental homes in
Vancouver (Yaletown, Downtown, West End, Olympic Village, Pt Grey, Kitsilano,
adjacent). The Command Center is single-tenant. Three users: Carlos (CEO,
opens 5–10x/day), Denika (Portfolio Manager, continuous business-hours use),
and 1–2 additional portfolio managers as the team grows.

**Architecture.** n8n hosts the agent workflows (visual workflow
representation) and Claude API calls via OpenRouter
(`anthropic/claude-sonnet-4.5`). Supabase is the durable state store — 12
tables + pgvector for per-property knowledge bases. This Next.js 14 app reads
from Supabase and routes work through three API-route families. Agent logic
never lives in this codebase.

- **`/api/cron/*`** — Vercel Cron-triggered (config in `vercel.json`).
  Authenticates the cron, then fans out HMAC-signed POSTs to n8n via
  `process.env.N8N_WEBHOOK_BASE_URL`. Initial jobs:
  - `weekly-pricing` — Monday 06:00 → Pricing Agent run trigger
  - `daily-event-scan` — Daily 07:00 → event-window scan (FIFA week, etc.)
  - `cleaner-escalation` — Every 1 min (added Phase 3) → evaluates
    `turnovers.dispatch_state` for 60/120min escalation boundaries
- **`/api/actions/*`** — Dashboard button handlers (Approve Resolution, Call
  Cleaner, Dispatch Backup, Reject Rate, Override, etc.). Auth check →
  Supabase write → optionally fire HMAC-signed POST to n8n action webhook.
- **`/api/webhooks/*`** — Inbound. `/api/webhooks/n8n/{event}` is required
  (n8n callbacks confirm vendor side-effects). Vendor-direct webhooks
  (`/api/webhooks/hostaway/*`, `/api/webhooks/breezeway/*`) are optional and
  used only where Casa-side logging is wanted before forwarding to n8n —
  direct-to-n8n is acceptable for most events.

Realtime subscriptions on `exceptions`, `agent_logs`, `pricing_recs`,
`turnovers` keep Carlos's dashboard live without manual refresh. Polling is
reserved for Settings → API Status (external health data).

**Codebase starting point.** Demo skin is complete (12 dashboard routes, full
editorial design system in `globals.css`, Playfair + Inter fonts, mock data
layer in `src/lib/mock-data/`). Supabase SSR clients are scaffolded in
`src/utils/supabase/` but never called from any page. Auth context in
`src/lib/auth/context.tsx` is fake demo creds in localStorage. Detailed
inventory in `.planning/codebase/`.

**Known issues to address as Phase 1 work proceeds.** Env var name mismatch
(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vs canonical `NEXT_PUBLIC_SUPABASE_ANON_KEY`);
mock-data → real-data boundary has no abstraction layer; 13+ action buttons
fire `console.log`; hardcoded date strings; no error boundaries; tabs and
side-sheets need ARIA roles and focus traps; "Undo" toast is cosmetic; mode
toggle in Pricing Agent is UI-only. The codebase map has the full list
(`.planning/codebase/CONCERNS.md`).

**Credentials state (2026-05-14).**
- Supabase: env vars in `.env.local`, schema not yet deployed
- OpenRouter: API key in hand, ready to wire (n8n side)
- n8n: workspace `fyi-media.app.n8n.cloud` configured, public API key in hand,
  Supabase + OpenRouter creds set, smoke-test workflow passes
- Hostaway, Breezeway, PriceLabs, Meta WhatsApp Business: BLOCKED on Rachit
  forwarding access. Build against mocks until they land.

**Brand voice.** Two voices, deliberately distinct:
- *Dashboard chrome (this codebase):* editorial, restrained, premium —
  considered, quiet, authoritative. PRODUCT.md and DESIGN.md are the source of
  truth.
- *Guest Agent outbound messages:* premium concierge with a warm, polished
  edge. Per-language (EN / Mandarin / Japanese / French).

## Constraints

- **Tech stack**: Next.js 14.2.18 App Router · TypeScript · Tailwind +
  globals.css component classes · Supabase (Postgres + pgvector + realtime) ·
  Vercel Cron · n8n (external, fyi-media.app.n8n.cloud) · Claude Sonnet 4.5
  via OpenRouter (external, called from n8n only) — Decided; changing the
  stack would invalidate the demo skin. Add `zod@^3.23.8` + `nanoid@^5.0.7`
  this milestone; everything else stays pinned.
- **Timeline**: May 15 hard deadline — Carlos's day-shift VA leaves that day.
  Guest Agent + Ops Agent cleaner dispatch must replace VA's work by then.
- **Brand**: PRODUCT.md and DESIGN.md are binding. Editorial, restrained,
  premium. No SaaS dashboard tropes, no dark-mode AI aesthetic, no consumer
  Airbnb-warm. Anti-references: Hostaway / Lodgify / PriceLabs / Guesty UI
  patterns are explicitly rejected.
- **Accessibility**: WCAG 2.1 AA pragmatic across daily flows (Home, Pricing,
  Cleanings, Claims, Properties, Bookings). Status colors always carry a
  textual label, never color alone. Keyboard reachable. `:focus-visible` 3px
  ring. `prefers-reduced-motion` honored.
- **Auth**: Hardcoded demo creds through May/June. Two accounts:
  `carlos@casa.com` / `denika@casa.com`, both password `demo`. No real auth
  this milestone.
- **Multi-tenant future-proofing**: `NEXT_PUBLIC_WORKSPACE_NAME` env-driven so
  Plan Insurance can be deployed as a second HumanOS instance later. Do not
  extract tenant abstractions now; just keep the door open.
- **Dependencies**: External integrations (Hostaway, Breezeway, PriceLabs,
  Meta WhatsApp) are gated on Rachit's access forwarding. Build against
  Supabase mocks and n8n smoke flows until creds land.
- **Scope discipline**: This is a working-product milestone, not a polish
  milestone. The UI is good enough. Substance beats polish until May 15.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Agent logic lives in n8n; this codebase owns everything else | n8n's visual workflow representation is the right surface for agent flows. This codebase owns schema, cron triggers, action routes, webhook receivers, realtime, UI. No LLM calls or prompt engineering in this repo. | — Pending |
| Three API-route families: `/api/cron/*`, `/api/actions/*`, `/api/webhooks/*` | Clean separation by trigger source: Vercel Cron, dashboard buttons, external callers. Each family has its own auth + signing convention. | — Pending |
| Vercel Cron triggers Casa, Casa triggers n8n | Cron config lives in `vercel.json` (versioned with code). Casa's `/api/cron/*` route adds idempotency + audit log before firing n8n. Direct Vercel→n8n would lose the audit trail. | — Pending |
| 12-table Supabase schema designed inside Phase 1 (not pre-specced) | User will dictate entities during data-layer phase; schema design + migrations + seed = single coherent phase | — Pending |
| Per-agent shadow-vs-autonomous mode deferred to each agent's go-live moment | Different agents have different risk profiles (Ops cleaner dispatch is autonomous-with-escalation; Guest may need draft+approval). System supports either mode; decision is per-agent. | — Pending |
| Hardcoded auth stays this milestone | Three users, all known, no production data yet. Real Supabase Auth is a cutover concern for Phase 2. | — Pending |
| Pricing Agent is the integration validation target | Cleanest, fully buildable today (no Rachit dependency). Proves the Casa ↔ Supabase ↔ n8n pattern before Guest/Ops critical path. | — Pending |
| Build order: data layer → Pricing → Ops cleaner dispatch + claims → Guest → SOP | May 15 forces Guest + Ops to be live, but Pricing is the integration testbed because it has no blocked dependencies | — Pending |
| Defer RSC conversion and shadcn-Radix cleanup | Real-data wiring is the higher-leverage refactor; touch RSC opportunistically per page when its data-fetching is rewritten | — Pending |
| Build with `NEXT_PUBLIC_WORKSPACE_NAME` env-driven branding | Plan Insurance as a future second tenant is a known direction; keep the path open without paying the abstraction cost today | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 — Phase 1 (Casa 360 Redesign) complete: 3-tab IA, Owner/Operations roles, narrative mock data.*
