# Roadmap: Casa Command Center — Agent Integration Milestone

## Overview

Casa Command Center's demo skin is complete and trusted. This milestone replaces every mock-data import with real Supabase queries, wires bidirectional HMAC-signed webhooks to n8n-hosted agent workflows, and makes the dashboard the operational surface that lets Carlos release his day-shift VA on May 15. Five phases follow the only viable ordering: schema gates everything, Pricing is the integration testbed (no Rachit dependency), Ops and Guest are the May-15-critical agents, and Phase 5 is the pre-cutover verification pass that catches "looks done but isn't" failures before the VA leaves.

**Deadline:** May 15, 2026 (4 days from 2026-05-14). Hard.

**Architectural commitment:** Agent logic lives in n8n. This codebase owns schema, cron triggers, action-button handlers, webhook receivers, realtime subscriptions, and UI. Three API-route families: `/api/cron/*`, `/api/actions/*`, `/api/webhooks/*`.

## Phases

**Phase Numbering:**
- Integer phases (1-5): Planned milestone work
- Decimal phases (e.g., 2.1): Reserved for urgent insertions if discovered mid-execution

- [ ] **Phase 1: Data Foundation** - Deploy schema, generate types, build 8 `src/lib/data/*` modules, migrate Phase 1 pages (Home, Pricing, Pricing Agent detail) to real Supabase reads. **36-hour sprint.**
- [ ] **Phase 2: Integration Contracts + Pricing Agent** - HMAC + idempotency + three-state lifecycle, realtime, Pricing Agent end-to-end as the integration testbed
- [ ] **Phase 3: Ops Agent — Cleaner Dispatch** - May 15 critical. Supabase state machine, 60/120min escalation cron, Cleanings + Claims actions wired; Cleanings/Claims pages migrate to `src/lib/data/*`
- [ ] **Phase 4: Guest Agent** - May 15 critical. Inbound guest messages, sensitive-escalation, per-language fonts, Guest + Ops + SOP detail pages at Pricing parity; pgvector + KB RPC for KB-grounded replies; Bookings detail page migrates to `src/lib/data/*`
- [ ] **Phase 5: Pre-Cutover Verification + SOP Scaffold + Polish** - Top-level error boundary, SOP agent scaffolding, "Looks Done But Isn't" checklist sign-off, hardcoded-date sweep, ESLint mock-data guard

## Phase Details

### Phase 1: Data Foundation (36-hour sprint)
**Goal**: The 12-table Supabase schema is deployed; the Pricing Agent's path-to-paint pages (Home, Pricing, Pricing Agent detail) read from real Supabase data through an 8-module `src/lib/data/*` seam; the n8n Pricing flow (`gIcYI8N1i1ljtCnW`) can write rows that surface in the UI.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-03, DATA-04, DATA-06, DATA-07, DATA-08 (6 — pgvector/ESLint/dates/RSC sliced out)
**Success Criteria** (what must be TRUE):
  1. 12-table schema deployed to Supabase project `aqsitrzbjokkkpcohple` via `supabase/migrations/0001_initial_schema.sql`; `properties`, `bookings`, `guests`, `agents`, `agent_runs`, `agent_logs`, `pricing_recs`, `exceptions`, `action_log`, `turnovers`, `claims`, `knowledge_chunks` all exist with the agreed columns; `agent_runs.idempotency_key` is UNIQUE.
  2. `npm run gen:types` produces `src/types/database.types.ts`; `src/lib/env.ts` throws a readable error if any required Supabase env var is missing; env var rename to `NEXT_PUBLIC_SUPABASE_ANON_KEY` complete across `src/utils/supabase/{client,server,middleware}.ts`; cookie handler uses `getAll`/`setAll` shape.
  3. Eight data modules built: `src/lib/data/{properties,bookings,agents,agent_runs,agent_logs,pricing_recs,exceptions,action_log}.ts`. Home, Pricing, and Pricing Agent detail pages migrated to read from these modules; the other pages (Cleanings, Claims, Bookings detail, Properties detail, agent skeleton pages, Reports, Settings) keep their mock imports until their phases land.
  4. Seed: 26 properties (matching `src/lib/mock-data/properties.ts` shape) + 4 agents (Pricing/Ops/Guest/SOP with `mode='shadow'`) + ~20 sample `pricing_recs` + ~30 sample `agent_logs` + ~6 sample `exceptions`. Inserting an `agent_logs` row via Supabase Studio makes it appear on the Pricing Agent detail page on next navigation.
  5. The n8n Pricing workflow (`gIcYI8N1i1ljtCnW`) executes against real Supabase and writes a complete `agent_runs` + `agent_logs` + `pricing_recs` trace; the Pricing Agent detail page surfaces those rows (proves Phase 2's Casa↔Supabase↔n8n path is unblocked).
**Plans**: TBD
**UI hint**: yes

### Phase 2: Integration Contracts + Pricing Agent (Integration Testbed)
**Goal**: Carlos can approve, reject, or override a Pricing recommendation and trust the dashboard state — every action carries HMAC + idempotency, every callback updates the row, the mode toggle actually gates dispatch, and two operators cannot double-fire the same exception.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, INT-06, INT-07, RT-01, RT-02, RT-03, RT-05, ACT-01, ACT-02, ACT-06, ACT-07, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, AGENT-01, UI-05
**Success Criteria** (what must be TRUE):
  1. Carlos clicks Approve on a Pricing rec → row enters `pending` (button disabled, "Submitting…") → n8n receives the HMAC-signed webhook with idempotency key → row flips to `accepted` → n8n callback within ~8s flips it to `dispatched` with `executed_at` set — all without a manual refresh, visible on Denika's tab too via Realtime.
  2. With Pricing Agent mode = Shadow, clicking Approve writes the `agent_logs` row but fires zero n8n action webhooks (verified in n8n execution log); switching to Live and re-approving fires the dispatch.
  3. Carlos clicks Undo within 6 seconds of an exception action → Supabase write reverses → if `executed_at IS NULL` the n8n cancel webhook fires; if `executed_at` is set, Undo is rejected with "Use Override" guidance.
  4. Denika and Carlos both click Dispatch Backup on the same Home exception card within 1 second of each other → exactly one Supabase write succeeds (`claimed_by` atomic guard), the loser's UI rolls back and shows "Carlos is handling this" within 2s via Realtime.
  5. An n8n run that started >5 minutes ago with no callback is flagged by `/api/cron/agent-stall-watchdog` as an "agent stalled" exception card on the Home page; a callback with a wrong HMAC signature or >5min timestamp skew returns 401 and writes nothing.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Ops Agent — Cleaner Dispatch (May 15 Critical)
**Goal**: Checkout at any of the 26 properties triggers Andrea via n8n → if no reply in 60 minutes, Carly is dispatched → if no reply in 120 minutes, an exception card surfaces — and the entire state machine lives in Supabase, not in n8n Wait nodes that lose state on cold start. Cleanings and Claims pages migrate from mock-data to `src/lib/data/{cleanings|turnovers,claims}.ts`.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: AGENT-02, ACT-03, ACT-04, ACT-05, RT-04 (plus migrating Cleanings + Claims pages — bundled into AGENT-02 scope)
**Success Criteria** (what must be TRUE):
  1. A test checkout written to `turnovers` triggers a `dispatch_state` transition to `dispatched`; n8n receives the WhatsApp send action (mocked until Rachit forwards Meta access) with `dispatch_state` visible on the Cleanings page within 2s via Realtime.
  2. `/api/cron/cleaner-escalation` runs every 1 minute and atomically transitions `dispatch_state='dispatched' AND dispatched_at < now() - 60min` to `fallback_sent` (Carly dispatch); a row already in `claimed` state is no-op'd by the atomic guard so Andrea-replying-at-59:59 does not produce a duplicate Carly dispatch.
  3. After 120 minutes of `dispatched`/`fallback_sent` with no reply, the watchdog inserts a high-urgency exception card visible on Home; Carlos can click "Dispatch Backup" or "Call Cleaner" on the Cleanings detail sheet and the action writes `turnovers.dispatch_state`, fires the Ops Agent action webhook, and lands in `action_log` with `actor_type='human'`.
  4. The Claims page Save Draft, Submit, and Resolve buttons persist to the `claims` table (no `console.log` survivors); Property Detail's "Flag for Correction" writes an `action_log` row routable to the SOP queue.
  5. The Cleanings board shows live dispatch status — "Dispatched 2:34 PM · Andrea has 47 min · escalates 3:34 PM" — driven by `turnovers.whatsapp_thread` JSONB and Realtime, not polling.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Guest Agent (May 15 Critical)
**Goal**: Inbound guest messages from Hostaway surface in the Bookings detail conversation thread; the Guest Agent drafts (shadow) or auto-sends (live) replies in the guest's language with the right font stack, grounded by per-property knowledge chunks; sensitive content (refunds, cancellations, damage, security) creates exception cards instead of auto-replying — and the Guest, Ops, and SOP agent detail pages now have full structural parity with the Pricing Agent page.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: AGENT-03, UI-02, DATA-02 (pgvector + `match_knowledge_for_property` RPC moved here; Guest Agent is the first KB consumer). Bookings detail + Guest/Ops/SOP agent detail pages migrate from mock-data to `src/lib/data/*` as part of this phase's scope.
**Success Criteria** (what must be TRUE):
  1. pgvector extension enabled + HNSW index on `knowledge_chunks` live; `match_knowledge_for_property(property_id, query_embedding, k)` RPC callable from `supabase.rpc()` and from the n8n Guest workflow; KB chunks for at least 3 sample properties seeded.
  2. A test Mandarin guest message inserted into `agent_logs` for an active booking renders in the Bookings detail thread with `:lang(zh)` CSS font stack (PingFang SC / Microsoft YaHei fallback) — no `□□□`, no horizontal scroll, no Playfair leaking into guest content.
  3. A Guest Agent draft with `decision_type='guest_reply_draft'` and a sensitive trigger (refund / cancellation / damage / security keyword) inserts a row into `exceptions` with urgency `high` instead of dispatching the reply; non-sensitive Live-mode drafts auto-send and the dispatch callback marks them `executed_at`. The draft surfaces which `knowledge_chunks` it retrieved via `kb_chunks_used[]` array.
  4. The Guest, Ops, and SOP agent detail pages each render the full Pricing-parity section structure (At a Glance, Live Activity, Decisions, Property Breakdown, Validation, Controls) reading from `agent_logs` / `agent_runs` via `src/lib/data/*` — no `<AgentSkeleton>` remaining in the nav.
  5. With Hostaway credentials still mocked (Rachit pending), the inbound message flow is exercised via a manually-POSTed test payload that flows through `/api/webhooks/n8n/guest-inbound` → Supabase row → Realtime → Bookings detail update; flipping to real Hostaway is a credential swap, not a code change.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Pre-Cutover Verification + SOP Scaffold + Polish
**Goal**: Before Carlos's VA leaves on May 15, every "Looks Done But Isn't" checklist item passes manual verification, an unhandled exception in any n8n callback does not blank the whole dashboard, the SOP Agent's detail page is scaffolded in `agents` so post-cutover work can begin without a UI rewrite, hardcoded dates are dead, and the ESLint mock-data guard is active.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: AGENT-04, UI-04, UI-01 (hardcoded dates moved here from Phase 1), DATA-05 (ESLint mock-data guard moved here from Phase 1)
**Success Criteria** (what must be TRUE):
  1. A test error thrown inside a route handler that bubbles to the dashboard tree is caught by `src/app/(dashboard)/error.tsx` — Carlos sees a styled "Something went wrong" surface with a recovery action, not a blank white screen.
  2. The SOP Agent has a row in `agents` (`mode = 'shadow'`, prompt_version set), the `/agents/sop` page renders the Pricing-parity section structure reading from `agent_logs` (empty state acceptable), and the nav link is no longer guarded with "coming soon".
  3. Hardcoded date strings are gone: Home (`src/app/(dashboard)/page.tsx:214`) and Cleanings (`src/app/(dashboard)/cleanings/page.tsx:42`) render from `new Date()` and `turnovers.length`. ESLint guard fails the build on any `@/lib/mock-data` import outside `src/lib/data/` (DATA-05).
  4. All 18 "Looks Done But Isn't" checklist items (PITFALLS.md) sign off green via manual UAT walkthrough — mock-data grep, env var canonical, cookie handler shape, idempotency keys, HMAC verify, action three-state lifecycle, mode-toggle dispatch gate, realtime cleanup soak, cleaner state machine, stalled-agent detection, validation sample-size guards, per-language rendering, multi-operator race, functional Undo, hardcoded dates gone, no agent stubs visible, no `NEXT_PUBLIC_*_SECRET` env, per-agent mode isolation.
  5. A full end-to-end smoke test of the May-15 critical path runs against the staging Supabase + n8n: checkout → Andrea dispatch → 60min Carly fallback → exception card → Carlos resolves; inbound guest inquiry → draft → Carlos approves → reply sent → callback confirms; all visible on a second operator's tab within 2s of each transition. Carlos completes a "10 minutes to inbox zero" exercise without opening Hostaway, PriceLabs, or WhatsApp directly — the core value proof point.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5. Decimal phases (e.g., 2.1) would sequence between their surrounding integers if inserted.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 0/TBD | Not started | - |
| 2. Integration Contracts + Pricing Agent | 0/TBD | Not started | - |
| 3. Ops Agent — Cleaner Dispatch | 0/TBD | Not started | - |
| 4. Guest Agent | 0/TBD | Not started | - |
| 5. Pre-Cutover Verification + SOP Scaffold | 0/TBD | Not started | - |
