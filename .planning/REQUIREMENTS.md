# Requirements: Casa Command Center — Agent Integration Milestone

**Defined:** 2026-05-14
**Deadline:** May 15, 2026 (4 days)
**Core Value:** Carlos resolves a day's exceptions in under 10 minutes and never opens Hostaway, PriceLabs, or WhatsApp directly — because agents do the routine work and Carlos approves only the few decisions that require judgment.

---

## v1 Requirements

### Data Foundation

- [x] **DATA-01**: 12-table Supabase schema deployed via versioned migrations
      in `supabase/migrations/*.sql` (tables: properties, bookings, guests,
      turnovers, claims, agents, agent_runs, agent_logs, exceptions,
      pricing_recs, action_log, knowledge_chunks; column-level design
      finalized in Phase 1 design session with Carlos)
- [ ] **DATA-02**: pgvector extension + HNSW index + cosine ops live; expose
      `match_knowledge_for_property(property_id, query_embedding, k)` RPC
- [x] **DATA-03**: 26 properties seeded matching existing mock-data shapes;
      sample bookings, exceptions, agent_logs, pricing_recs, turnovers,
      claims, guests seeded for UI testing
- [x] **DATA-04**: `database.types.ts` generated via
      `supabase gen types typescript`; `npm run gen:types` script committed
- [ ] **DATA-05**: `src/lib/data/*.ts` is the ONLY entity-data import path;
      build fails on `@/lib/mock-data` imports outside `src/lib/data/`
- [ ] **DATA-06**: Eight data modules built —
      `src/lib/data/{properties,bookings,agents,agent_runs,agent_logs,pricing_recs,exceptions,action_log}.ts`.
      Phase 1 pages (Home, Pricing, Pricing Agent detail) migrated to read
      from these modules in Phase 1. Remaining pages (Cleanings, Claims,
      Bookings detail, Properties detail, agent skeleton pages, Reports,
      Settings) migrate to `src/lib/data/*` as their respective phases land
      (bundled into each phase's scope, not a separate requirement).
- [x] **DATA-07**: Env var rename
      `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      across `src/utils/supabase/{client,server,middleware}.ts`;
      `src/lib/env.ts` Zod validation throws readable error on missing vars
- [x] **DATA-08**: `@supabase/ssr` cookie handler uses `getAll`/`setAll`
      shape exclusively (legacy `get`/`set`/`remove` removed)

### Integration Plumbing

- [ ] **INT-01**: `vercel.json` cron config with
      `weekly-pricing` (Mon 06:00) and `daily-event-scan` (daily 07:00)
- [ ] **INT-02**: `/api/cron/weekly-pricing` and `/api/cron/daily-event-scan`
      routes authenticate via `CRON_SECRET`, write a `cron_invocations` audit
      row, and fan out HMAC-signed POSTs to `${N8N_WEBHOOK_BASE_URL}/{flow}`
- [ ] **INT-03**: `src/lib/n8n/sign.ts` HMAC-SHA256 helper used by every
      Casa → n8n call and every `/api/webhooks/n8n/*` verifier
- [ ] **INT-04**: `/api/webhooks/n8n/{event}` Route Handler with
      `runtime = 'nodejs'`, `request.text()` before parse,
      `crypto.timingSafeEqual` HMAC compare, ±5-min timestamp replay window,
      `idempotency_key UNIQUE` dedup, Zod payload validation
- [ ] **INT-05**: Every Casa → n8n call carries a nanoid `idempotency_key` in
      header and body; UNIQUE index on `agent_runs.idempotency_key` rejects
      duplicates
- [ ] **INT-06**: `/api/actions/{domain}/{verb}` route family — auth check →
      `src/lib/data/*` Supabase write → optional HMAC-signed n8n action
      webhook fire with 8s `AbortSignal.timeout`
- [ ] **INT-07**: `N8N_WEBHOOK_BASE_URL`, `N8N_WEBHOOK_SECRET`,
      `CRON_SECRET` env vars wired and Zod-validated at startup

### Functional Action Buttons (replace console.log stubs)

- [ ] **ACT-01**: Home exception cards — Approve Resolution / Reject /
      Dispatch Backup / Open in Guest write to `exceptions.state` and fire
      the appropriate n8n action webhook
- [ ] **ACT-02**: Pricing page — Approve / Reject / Edit / Override write to
      `pricing_recs.status` and fire Pricing Agent action webhook
- [ ] **ACT-03**: Cleanings page — Call Cleaner / Dispatch Backup / Mark
      Claimed / Open Sheet handlers write to `turnovers.dispatch_state` and
      fire Ops Agent action webhook
- [ ] **ACT-04**: Claims page — Save Draft / Submit / Resolve persist to
      `claims` table (no `console.log("save draft")`)
- [ ] **ACT-05**: Property Detail — Flag for Correction dialog writes to a
      real `flags` queue (`action_log` row with `actor_type='human'`)
- [ ] **ACT-06**: Action toast Undo reverses Supabase write within 6s and is
      rejected with "Use Override" guidance if `executed_at IS NOT NULL`
- [ ] **ACT-07**: Top-bar buttons (Help / Add Property / Open Calendar /
      Message Owner) either gain real handlers, link to existing pages, or
      are removed from this milestone's surface — no console.log survivors

### Realtime

- [ ] **RT-01**: `src/lib/hooks/useRealtimeChannel.ts` centralized hook with
      `removeChannel` cleanup on unmount
- [ ] **RT-02**: Home subscribed to `exceptions`, `agent_logs`,
      `pricing_recs`; new rows appear within 2s without manual refresh
- [ ] **RT-03**: Pricing page subscribed to `pricing_recs`, `agent_logs`
- [ ] **RT-04**: Cleanings page subscribed to `turnovers`
- [ ] **RT-05**: Settings → API Status uses 30s polling (external health
      data — not in Supabase, so realtime doesn't apply)

### Cross-cutting Safety

- [ ] **SAFE-01**: Shadow-mode three-layer mechanic: `agents.mode`
      (per-agent default) → `agent_runs.mode_at_run` (immutable snapshot) →
      `agent_logs.shadow_mode` (UI-read flag). Every dispatch reads
      `agents.mode` BEFORE firing.
- [ ] **SAFE-02**: Pricing Agent mode toggle (Shadow / Live) persists to
      `agents.mode` and actually gates whether action routes fire n8n
      webhooks (current UI-only toggle is the cautionary tale)
- [ ] **SAFE-03**: Action button three-state lifecycle: `pending` (clicked,
      disabled) → `accepted` (Supabase + n8n 202) → `dispatched` (callback
      sets `executed_at`). UI distinguishes all three. Never optimistic-flip
      to terminal success.
- [ ] **SAFE-04**: Two-operator exception race — `exceptions.claimed_by` set
      via atomic `UPDATE ... WHERE claimed_by IS NULL RETURNING *`;
      auto-expires after 10 min; realtime broadcasts claim state within 2s
- [ ] **SAFE-05**: Callback watchdog — `/api/cron/agent-stall-watchdog` runs
      every 5 min, flags `agent_runs` rows where
      `now() > expected_callback_by AND status = 'pending'` as
      "agent stalled" exception cards

### Agents (Casa-side wiring only — n8n flow definitions out of scope)

- [ ] **AGENT-01 (Pricing)**: Pricing Agent detail page reads real
      `agent_logs` rows (not math-generated). Every section (At a Glance,
      Live Activity, Configuration, Performance, Decisions, Property
      Breakdown, Validation, Prompt History, Controls) binds to real
      Supabase data. Mode toggle gates dispatch (SAFE-02). Integration
      testbed for the Casa ↔ n8n pattern.
- [ ] **AGENT-02 (Ops cleaner dispatch)** — May 15 critical: Cleanings page
      driven by real `turnovers` data. Casa state machine handles 60min
      fallback (Andrea → Carly) and 120min escalation (→ exception card)
      via `/api/cron/cleaner-escalation` 1-min Vercel cron. WhatsApp thread
      persisted in `turnovers.whatsapp_thread` JSONB. WhatsApp Business API
      credentials mocked until Rachit forwards Meta access.
- [ ] **AGENT-03 (Guest)** — May 15 critical: Bookings detail page
      conversation thread reads from real data. Inbound guest messages
      surface as drafts (shadow) or auto-send with sensitive-only escalation
      (live). Per-language CSS font stacks for EN / Mandarin / Japanese /
      French via `:lang(...)`. Hostaway credentials mocked until Rachit
      forwards.
- [ ] **AGENT-04 (SOP)**: Casa-side scaffolding only this milestone — agent
      record in `agents` table, `agent_logs` reads on detail page (no real
      decisions yet). Detail page replaces `<AgentSkeleton>` with
      Pricing-parity structure (content arrives post-May 15).

### UI Polish

- [ ] **UI-01**: Hardcoded date strings replaced
      (`src/app/(dashboard)/page.tsx:214`,
      `src/app/(dashboard)/cleanings/page.tsx:42`) with `new Date()` and
      live counts from `turnovers.length`
- [ ] **UI-02**: Guest, Ops, SOP agent detail pages at structural parity
      with Pricing Agent — replace `<AgentSkeleton>` with full section
      structure (At a Glance, Live Activity, Decisions, Property Breakdown,
      Validation, Controls)
- [ ] **UI-04**: `src/app/(dashboard)/error.tsx` top-level error boundary
      prevents blank-screen crashes from n8n callback exceptions
- [ ] **UI-05**: Sonner `<Toaster />` wired in dashboard layout; all action
      toasts flow through one surface (replaces inline toasts in Home and
      Claims)

---

## v2 Requirements

### Auth & Tenancy (post-May 15, before real-user cutover)

- **V2-AUTH-01**: Real Supabase Auth replaces hardcoded demo creds in
  `src/lib/auth/context.tsx`
- **V2-AUTH-02**: Server-side auth gate in `src/middleware.ts` using
  `getClaims()` or `getUser()` — never `getSession()`
- **V2-AUTH-03**: Login labels properly associated with inputs (WCAG 1.3.1)
- **V2-RLS-01**: Row-Level Security policies on all 12 tables
- **V2-TENANT-01**: `NEXT_PUBLIC_WORKSPACE_NAME` env-driven branding lights
  up; document the multi-tenant extraction path (do not extract yet)

### Trust Deepening

- **V2-VAL-01**: Cumulative validation alignment report wired to real data
  with sample-size guards (`(N decisions)` shown; "Not enough data" if N < 10)
- **V2-VAL-02**: Per-agent drift areas with comparison tables
- **V2-CATCHUP-01**: Async "since you last opened" catch-up view on first
  load of the day
- **V2-KB-01**: KB citation provenance — Guest Agent replies surface which
  `knowledge_chunks` were retrieved and which influenced the draft
- **V2-PROMOTE-01**: One-click "promote agent to autonomous" with
  eligibility check (alignment threshold + minimum sample size)
- **V2-PREVIEW-01**: Per-language guest message side-by-side preview
  (original + English back-translation)

### Filling UI Stubs

- **V2-PROP-01**: Property Detail tabs — House Rules, Cleaning, Pricing
  History (currently stub-text)
- **V2-CLEAN-01**: Cleanings — Tomorrow and This Week tabs
  (currently "Demo focuses on today" placeholder)
- **V2-REPORTS-01**: Reports — Weeks 1–4 tabs (currently `<WeekStub>`)
- **V2-AGENT-SOP-01**: SOP Agent fully wired (listing push for new properties)

### Accessibility (deferred per PROJECT.md Out of Scope)

- **V2-A11Y-01**: Side-sheets get `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`, focus traps (Cleanings, Claims, Property Flag, Command
  Palette)
- **V2-A11Y-02**: Sidebar user menu + notification bell get `aria-expanded`
  + `aria-haspopup`
- **V2-A11Y-03**: Tab bars get `role="tab"` / `aria-selected` /
  `role="tabpanel"`
- **V2-A11Y-04**: Home "Today's Cleanings" rail dot gets a textual status
  label (color-alone violation)

### Performance

- **V2-PERF-01**: Split large page files (Pricing Agent 687 lines, Settings
  437, Claims 445, Property Detail 488); lazy-load below-the-fold sections
- **V2-PERF-02**: `loading.tsx` files + Suspense boundaries on data-heavy
  routes
- **V2-PERF-03**: Remove unused Radix + sonner-overlap dependencies once
  focus-trap a11y work locks in which Radix primitives stay
- **V2-PERF-04**: All-pages-to-RSC pass — including the Home page conversion
  from `"use client"` (deferred from v1's UI-03). The existing client-component
  Home page works fine with the Phase 2 `useRealtimeChannel` hook; RSC
  conversion is a performance/architecture cleanup, not a correctness
  requirement for the May 15 milestone.

### Testing

- **V2-TEST-01**: Test framework selected (Vitest likely)
- **V2-TEST-02**: Critical-path tests — auth migration, action route
  idempotency, HMAC verification, mode-gate dispatch

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| n8n agent workflow JSON / Claude prompt engineering | Agent logic lives in n8n. This codebase owns schema, cron, actions, webhooks, realtime, UI — not LLM calls. |
| casaaccommodations.com website redesign | Separate codebase, Months 2-3 |
| Multi-tenant productization (Plan Insurance) | Future milestone; keep `NEXT_PUBLIC_WORKSPACE_NAME` env door open without extraction |
| Confidence scores on decisions | LLM confidence is unreliable; show reasoning instead |
| Chat-with-agent ("ask Pricing Agent why") | Post-hoc rationalization, not decision-time reasoning |
| Star ratings on decisions | Approve/Reject/Override IS the feedback signal |
| Bulk-approve on Home | Degrades supervision discipline (OK on Pricing where recs are homogeneous) |
| Prominent cost/token dashboards | Trains Carlos to optimize spend, not judgment |
| Removing scaffolded Radix dependencies this milestone | Defer until focus-trap a11y work decides which primitives stay |

---

## Traceability

Each v1 requirement maps to exactly one phase. Filled by roadmapper 2026-05-14.

| Requirement | Phase | Status | Notes |
|-------------|-------|--------|-------|
| DATA-01 | Phase 1 | Complete | 12-table schema deploy |
| DATA-02 | Phase 4 | Pending | Moved from Phase 1 — pgvector + KB RPC only needed when Guest Agent lands |
| DATA-03 | Phase 1 | Complete | Slim seed only (properties, agents, sample pricing/logs/exceptions); turnovers/claims/guests seed bundles into Phase 3/4 |
| DATA-04 | Phase 1 | Complete | `gen:types` script |
| DATA-05 | Phase 5 | Pending | Moved from Phase 1 — ESLint mock-data guard is regression prevention, not a 36hr-sprint blocker |
| DATA-06 | Phase 1 | Pending | 8 data modules built; Phase 1 pages migrated. Cleanings/Claims migrate in Phase 3; Bookings detail + agent pages in Phase 4 (bundled scope) |
| DATA-07 | Phase 1 | Complete | Env var rename + Zod validator |
| DATA-08 | Phase 1 | Complete | Cookie shape verify |
| INT-01 | Phase 2 | Pending | |
| INT-02 | Phase 2 | Pending | |
| INT-03 | Phase 2 | Pending | |
| INT-04 | Phase 2 | Pending | |
| INT-05 | Phase 2 | Pending | |
| INT-06 | Phase 2 | Pending | |
| INT-07 | Phase 2 | Pending | |
| ACT-01 | Phase 2 | Pending | |
| ACT-02 | Phase 2 | Pending | |
| ACT-03 | Phase 3 | Pending | |
| ACT-04 | Phase 3 | Pending | |
| ACT-05 | Phase 3 | Pending | |
| ACT-06 | Phase 2 | Pending | |
| ACT-07 | Phase 2 | Pending | |
| RT-01 | Phase 2 | Pending | |
| RT-02 | Phase 2 | Pending | |
| RT-03 | Phase 2 | Pending | |
| RT-04 | Phase 3 | Pending | |
| RT-05 | Phase 2 | Pending | |
| SAFE-01 | Phase 2 | Pending | |
| SAFE-02 | Phase 2 | Pending | |
| SAFE-03 | Phase 2 | Pending | |
| SAFE-04 | Phase 2 | Pending | |
| SAFE-05 | Phase 2 | Pending | |
| AGENT-01 | Phase 2 | Pending | |
| AGENT-02 | Phase 3 | Pending | |
| AGENT-03 | Phase 4 | Pending | |
| AGENT-04 | Phase 5 | Pending | |
| UI-01 | Phase 5 | Pending | Moved from Phase 1 — hardcoded date sweep is 15min polish work, not data-layer critical path |
| UI-02 | Phase 4 | Pending | |
| ~~UI-03~~ | — | Deferred | Moved to v2 (V2-PERF-04) — Home page works fine as client component with realtime; RSC conversion is performance cleanup, not May-15 correctness |
| UI-04 | Phase 5 | Pending | |
| UI-05 | Phase 2 | Pending | |

**Coverage:**
- v1 requirements: 40 total (UI-03 moved to v2 as V2-PERF-04)
- Mapped to phases: 40
- Unmapped: 0

**Per-phase counts:**
- Phase 1 (Data Foundation, 36hr sprint): **6 requirements** (DATA-01, DATA-03, DATA-04, DATA-06, DATA-07, DATA-08)
- Phase 2 (Integration Contracts + Pricing): 22 requirements (INT-01..07, ACT-01, ACT-02, ACT-06, ACT-07, RT-01, RT-02, RT-03, RT-05, SAFE-01..05, AGENT-01, UI-05)
- Phase 3 (Ops Cleaner Dispatch): 5 requirements (ACT-03, ACT-04, ACT-05, RT-04, AGENT-02)
- Phase 4 (Guest Agent): **3 requirements** (AGENT-03, UI-02, DATA-02 — pgvector landed here)
- Phase 5 (Verification + SOP Scaffold + Polish): **4 requirements** (AGENT-04, UI-04, UI-01, DATA-05)

---

*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 — Phase 1 compressed to 36hr critical path. DATA-02 → Phase 4 (with Guest Agent KB). DATA-05 + UI-01 → Phase 5 (polish). UI-03 → v2 (V2-PERF-04).*
