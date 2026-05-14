# Casa Command Center — Research Summary

**Project:** Casa Command Center — Agent Integration Milestone
**Domain:** AI-agent supervisor dashboard (single-tenant, Next.js 14 + Supabase + externally-hosted n8n)
**Researched:** 2026-05-14
**Deadline:** May 15, 2026 (4-day sprint; Carlos's day-shift VA leaves that day)
**Confidence:** HIGH (stack, architecture, pitfalls) / MEDIUM (12-table schema column detail, n8n side-ergonomics)

---

## Executive Summary

Casa Command Center is a single-tenant operator dashboard in the **agent supervision console** category — the right references are LangSmith, OpenAI Operator, Lindy, and Cognition Devin, not Hostaway or Guesty. The demo skin is complete and trusted. This milestone's job is narrow and concrete: replace every mock-data import with real Supabase queries, wire bidirectional webhooks to n8n, and make the Guest + Ops agents operational enough that Carlos can let his day-shift VA go on May 15.

All four researchers converge on the same build order — data layer first, Pricing Agent as integration testbed, then Ops cleaner dispatch, then Guest — because that order follows hard dependencies, not preference.

**Architectural principle (locked by user 2026-05-14):** Agent logic lives in n8n (visual workflow representation). Everything else — schema, cron triggers, action button handlers, webhook receivers, realtime subscriptions — lives in this Next.js codebase.

The recommended technical approach is deliberately un-exotic. Stack is fixed (Next.js 14.2.18, `@supabase/ssr` 0.10.3, `@supabase/supabase-js` 2.105.4). Add only `zod@^3.23.8` and `nanoid@^5.0.7`. Three API-route families: `/api/cron/*` (Vercel-triggered, fan out to n8n), `/api/actions/*` (dashboard button handlers — Supabase writes + optional n8n fires), `/api/webhooks/*` (inbound from external services where Casa-side logging is wanted). Supabase Realtime subscriptions on `exceptions`, `agent_logs`, `pricing_recs`, `turnovers`. HMAC + idempotency on every cross-system call from day one.

The single greatest risk is shipping a dashboard that looks wired but isn't. Nine CRITICAL pitfalls must be designed in from Phase 1 — none can be retrofitted after action buttons are wired.

---

## Key Stack Decisions

**Core (pinned — do not change):**
- `next@14.2.18` — App Router; no Next 15 mid-milestone
- `react@18.3.1` — pinned to match Next 14.2
- `@supabase/ssr@0.10.3` — use `getAll`/`setAll` cookie shape only
- `@supabase/supabase-js@2.105.4`

**Add for this milestone:**
- `zod@^3.23.8` — validate every webhook payload and Server Action input (NOT v4)
- `nanoid@^5.0.7` — idempotency keys
- `supabase` CLI `>=1.200.x` (global) — migrations + type generation

**Database extensions (first migration):**
- `pgvector >= 0.7.0` — HNSW index for per-property KB
- `pgcrypto` — `gen_random_uuid()`

**Day-1 critical fix:** rename `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` across all three Supabase client files; add `lib/env.ts` Zod startup validation.

---

## Locked Integration Decisions

| Decision | Verdict |
|----------|---------|
| Agent logic | Lives in n8n (visual workflow representation). Casa never embeds LLM calls. |
| Read path | RSC + server-side Supabase queries; pages convert opportunistically as data-fetching rewires |
| Cron triggers | `vercel.json` cron config → `/api/cron/{job}` route → fan out HMAC-signed POSTs to `${N8N_WEBHOOK_BASE_URL}/...` |
| In-app mutations | API routes at `/api/actions/{domain}/{verb}` — auth check, Supabase write, optional n8n fire |
| Inbound n8n → Casa | `/api/webhooks/n8n/{event}` — `runtime = 'nodejs'`; `request.text()` FIRST; HMAC-SHA256 with `crypto.timingSafeEqual`; ±5 min timestamp window; `idempotency_key UNIQUE` dedup |
| Inbound vendor → Casa | `/api/webhooks/{vendor}/{event}` only for vendors where Casa-side logging is wanted before forwarding to n8n; otherwise vendors call n8n directly |
| Outbound Casa → n8n | Action route writes `pending_dispatch` row, then HMAC + idempotency-keyed `fetch()` n8n with 8s timeout; n8n returns 202; result arrives via callback |
| Realtime | Subscriptions on `exceptions`, `agent_logs`, `pricing_recs`, `turnovers`. 30s polling reserved for Settings → API Status (external health data). |
| pgvector | HNSW, `vector(1536)`, single `knowledge_chunks` table with `property_id` discriminator; expose `match_knowledge_for_property` RPC |

---

## Scheduled Triggers (Vercel Cron → Casa → n8n)

| Job | Schedule | Casa route | n8n target |
|-----|----------|------------|------------|
| `weekly-pricing` | Mon 06:00 | `/api/cron/weekly-pricing` | Pricing Agent run trigger |
| `daily-event-scan` | Daily 07:00 | `/api/cron/daily-event-scan` | Event-window scan for Pricing (FIFA week, etc.) |
| _(escalation watchdog — added Phase 3)_ | every 1 min | `/api/cron/cleaner-escalation` | Evaluates `cleanings.dispatch_state` for 60/120min boundaries |

Vercel Pro plan required for sub-daily cron resolution.

---

## Expected Features

### Must-have by May 15 (Carlos trust → fires VA)

| Feature | REQ-ID | Why non-negotiable |
|---------|--------|--------------------|
| Real `agent_logs` (not math-generated) | REQ-DATA-01, REQ-AGENT-01 | Carlos cannot trust invented numbers |
| Reasoning + source inputs per decision | sub of REQ-DATA-01 | Approve/Reject without reasoning is gambling |
| Mode toggle (Shadow/Live) actually gates dispatch | sub of REQ-AGENT-01 | Shadow mode is the entire rollout strategy |
| All action buttons write Supabase + fire n8n | REQ-INT-03 | 13+ `console.log` stubs are theater |
| Exceptions surface to Home only | REQ-INT-02 | Core value: resolve exceptions in <10 min |
| Functional Undo on action toast | REQ-UI-03 | Cost-of-error multiplier |
| Realtime refresh without manual reload | REQ-DATA-02 | Carlos opens 5–10x/day, leaves tab open |
| Guest + Ops detail pages at Pricing parity | REQ-UI-01 | May 15 agents cannot be supervised from `<AgentSkeleton>` |
| Hardcoded dates replaced with `new Date()` | REQ-UI-02 | "May 1" in October breaks the illusion |

### Post-May 15 (trust deepening)
Validation alignment with sample-size guards · async catch-up view · KB citation provenance on Guest replies · promote-to-autonomous gesture · per-language preview · SOP Agent · cumulative reports with confidence intervals.

### Anti-features (deliberately not building)
- Confidence score on decisions (LLM confidence unreliable; show reasoning)
- Chat-with-agent (post-hoc rationalization)
- Star ratings (Approve/Reject/Override IS the feedback)
- Bulk-approve on Home (degrades supervision discipline)
- Prominent cost/token dashboards (trains optimization-for-spend, not judgment)

---

## 12-Table Reference Schema (MEDIUM confidence on columns)

Column detail finalized with Carlos during Phase 1 data-layer design session.

| # | Table | Purpose |
|---|-------|---------|
| 1 | `properties` | `slug`, `workspace` (multi-tenant escape hatch), `hostaway_id`, `pricelabs_id` |
| 2 | `bookings` | `channel`, `status`, FK to `guests` + `properties` |
| 3 | `guests` | `language` (`en|zh|ja|fr`) — critical for Guest Agent |
| 4 | `cleanings` (or `turnovers`) | `dispatch_state` enum, `whatsapp_thread JSONB`, timing columns |
| 5 | `claims` | `before/after_photos`, `evidence_pack`, `created_by_agent` |
| 6 | `agents` | `mode` (`shadow|live|paused`), `prompt_version`, `updated_by` |
| 7 | `agent_runs` | `idempotency_key UNIQUE`, `mode_at_run`, `n8n_execution_id`, `expected_callback_by` |
| 8 | `agent_logs` (decisions) | `shadow_mode bool`, `rationale`, `kb_chunks_used[]`, `human_action`, `executed_at` |
| 9 | `exceptions` | `state` (`open|acted|dismissed|snoozed`), `urgency`, `claimed_by` |
| 10 | `pricing_recs` | Pricing recommendations queue (subscribed for realtime) |
| 11 | `action_log` | Append-only audit; `actor_type`, `actor_id`, `idempotency_key`, before/after JSONB |
| 12 | `knowledge_chunks` | `embedding vector(1536)`, `property_id` discriminator, `agent_scope[]`, HNSW index |

`knowledge_documents` (per-property KB source) may be a 13th table if document-level versioning is needed; defer to data-layer design session.

---

## Shadow-Mode Three-Layer Mechanic

Must be designed in from Phase 1; impossible to retrofit cleanly:

1. **`agents.mode`** — per-agent default (`shadow | live | paused`); Carlos toggles from agent detail page
2. **`agent_runs.mode_at_run`** — immutable snapshot at run-start; mode flip mid-run doesn't change the run
3. **`agent_logs.shadow_mode`** — denormalized boolean the UI reads; drives "Logged (Shadow)" vs "Auto-Applied" badge

Every dispatch path reads `agents.mode` BEFORE firing. n8n flow has the same check as defense-in-depth.

---

## Action Button Lifecycle — Three States

`pending` (clicked, disabled) → `accepted` (Casa wrote Supabase + n8n returned 202) → `dispatched` (n8n callback confirms vendor side-effect). UI must distinguish all three. Optimistic UI must NEVER flip to terminal-success.

---

## 9 CRITICAL Pitfalls (Design In, Don't Retrofit)

1. **Mock-data leak** — `src/lib/data/*.ts` is the ONLY entity-data import path; ESLint rule fails build on `@/lib/mock-data` import outside `src/lib/data/`
2. **`@supabase/ssr` cookie wrong shape** — use `getAll`/`setAll` exclusively (legacy shape causes random logouts)
3. **Action button double-fire under jitter** — disable on click; client-generated `idempotency_key`; UNIQUE constraint dedup
4. **Optimistic UI lying** — three states (`pending`/`accepted`/`dispatched`), never `useOptimistic` to terminal-success
5. **Two-operator race on same exception** — atomic `UPDATE ... WHERE claimed_by IS NULL RETURNING *`; 10-min auto-expiry
6. **Silent callback failure** — `agent_runs.expected_callback_by`; 5-min watchdog cron flags stalled runs as exception cards
7. **HMAC timing-safe failure** — always `crypto.timingSafeEqual(Buffer.from(a,'hex'), Buffer.from(b,'hex'))`; read raw body with `request.text()` BEFORE parse; reject if timestamp >5min off
8. **Cleaner escalation drift** — state machine in Supabase (`dispatch_state` atomic transitions), NOT n8n Wait nodes; 1-min Vercel cron evaluates
9. **Mode toggle doesn't gate dispatch** — every dispatch path reads `agents.mode` first; existing UI-only toggle on Pricing Agent is the cautionary tale

---

## 6 IMPORTANT Pitfalls (Corrode trust)

- Realtime channel memory leak → `removeChannel` in cleanup; centralized `useRealtimeChannel` hook
- TypeScript types drift → `npm run gen:types` after every migration; CI check
- Per-language Guest messages break display → `language` field; `:lang(zh|ja)` CSS font stacks; never Playfair for guest messages
- Validation alignment from N=3 → always show `(N decisions)`; "Not enough data yet" if N < 10
- Audit log gaps → action routes record prior-state for co-operator reconstruction
- All-`"use client"` over-fetching → convert Home to RSC in Phase 1; others opportunistically

---

## 4 POST-CUTOVER (acceptable defer)

- Login label associations (WCAG 1.3.1)
- Side-sheet `role="dialog"` + focus traps (WCAG 2.1)
- Error boundaries (consider promoting top-level `(dashboard)/error.tsx` — 30 min, high risk-reduction)
- Test suite (PROJECT.md explicit deferral)

---

## Recommended Phase Ordering

All four researchers converge. Dependency graph is the constraint.

### Phase 1: Data Foundation
**Gate:** Schema gates everything else. Mock-data abstraction must land before first page conversion.
**Delivers:** 12-table schema + pgvector + `match_knowledge_for_property` RPC; 26 properties seeded; TypeScript types; `src/lib/data/*.ts` abstraction; env var rename + Zod startup validation; all pages reading from real Supabase (read-only); hardcoded dates replaced (REQ-UI-02).
**REQ-IDs:** REQ-DATA-01, REQ-UI-02
**Avoids pitfalls:** 1 (mock leak), 2 (cookie), 11 (type drift), Home-page RSC anti-pattern
**Research flag:** SCHEMA DESIGN SESSION with Carlos before migrations run

### Phase 2: Webhook Contracts + Pricing Agent (Integration Testbed)
**Gate:** Pricing has zero Rachit dependencies. Every pattern established here is reused for Ops/Guest.
**Delivers:** `src/lib/n8n/sign.ts` HMAC helper; `vercel.json` cron config; `/api/cron/weekly-pricing` + `/api/cron/daily-event-scan`; `/api/webhooks/n8n/{event}` inbound handler; `/api/actions/exceptions/dismiss` + `/api/actions/pricing/approve` + `/reject` + `/override`; Pricing Agent detail page reading real `agent_logs`; mode toggle persisted + gating dispatch; `useRealtimeChannel` hook; Home + Pricing subscribed to realtime; functional Undo (REQ-UI-03) with server-gated `executed_at IS NULL` check.
**REQ-IDs:** REQ-INT-01, REQ-INT-02, REQ-AGENT-01, REQ-UI-03 (partial)
**Avoids pitfalls:** 3, 4, 6, 7, 9, 10

### Phase 3: Ops Agent — Cleaner Dispatch
**Gate:** May 15 critical path. State machine MUST live in Supabase, not n8n Wait nodes.
**Delivers:** Cleanings page on real `turnovers` data; dispatch button firing n8n; `dispatch_state` state machine with atomic transitions; 60/120min escalation via `/api/cron/cleaner-escalation` (1-min Vercel cron, NOT n8n Wait nodes); WhatsApp thread persisted in `turnovers.whatsapp_thread` JSONB; Claims page functional; `/api/actions/cleanings/*` + `/api/actions/claims/*`; (Meta WhatsApp creds mocked until Rachit forwards).
**REQ-IDs:** REQ-AGENT-02, REQ-INT-03 (Dispatch, Claim, Resolve action buttons)
**Avoids pitfalls:** 5 (race), 8 (cleaner escalation), 15 (audit log)

### Phase 4: Guest Agent
**Gate:** May 15 critical path. Hostaway-gated by Rachit — build Casa-side first, flip on credential.
**Delivers:** Bookings detail conversation thread on real data; sensitive-escalation creating exception rows; per-language font stack CSS; Guest + Ops Agent detail pages at Pricing parity (REQ-UI-01); `/api/webhooks/hostaway/inbound-message` (optional — direct-to-n8n also acceptable).
**REQ-IDs:** REQ-AGENT-03, REQ-UI-01 (Guest + Ops pages)
**Avoids pitfalls:** 12 (per-language), 14 (sample-size)
**Research flag:** ONE targeted spike — verify Hostaway webhook signature scheme before inbound handler

### Phase 5: Verification Pass + Pre-Cutover Sign-Off
**Gate:** Before VA leaves, "Looks Done But Isn't" checklist must pass.
**Delivers:** All 18 checklist items verified; `(dashboard)/error.tsx` error boundary; SOP Agent detail page scaffolded (content post-cutover); agent stub pages guarded with "coming soon" if not yet real.
**REQ-IDs:** REQ-UI-01 (SOP skeleton), verification of all REQ-INT-* + REQ-AGENT-01..03

### Post-Cutover Queue (Phase 2 milestone)
1. Real Supabase Auth + RLS
2. Realtime full upgrade from any remaining polling
3. SOP Agent wired (REQ-AGENT-04)
4. Validation alignment with statistical confidence
5. Async catch-up "since you last opened" view
6. KB citation provenance on Guest replies
7. Promote-to-autonomous gesture
8. ARIA roles + focus traps
9. Test suite

---

## Phase Ordering Rationale (Hard Constraints)

1. **Schema gates everything.** REQ-DATA-01 is required by every other REQ.
2. **Pricing is the only Rachit-unblocked agent.** Ops needs Breezeway + WhatsApp; Guest needs Hostaway; SOP is post-May-15.
3. **HMAC + idempotency + mode-gate are cross-cutting.** Must be correct before any n8n webhook fires. Build once in Phase 2 with Pricing; reuse everywhere.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Six integration decisions triangulated across Supabase docs, Next.js docs, `@supabase/ssr` CHANGELOG, production webhook guides |
| Features | HIGH (category) / MEDIUM (Carlos-specific trust threshold) | Patterns verified across LangSmith, Operator, Lindy, Devin, n8n |
| Architecture | HIGH (system design) / MEDIUM (schema columns) | Casa↔Supabase↔n8n trio Context7-verified; columns synthesized from mock-data + ops requirements |
| Pitfalls | HIGH (technical) / MEDIUM (shadow-mode UX) | Technical pitfalls grounded in upstream issues + canonical docs |

**Overall confidence:** HIGH on build order and integration patterns; MEDIUM on schema column detail.

---

## Gaps to Address During Planning

1. **Schema column-level finalization with Carlos** — `turnovers` columns vs Breezeway's data model; `bookings` 13th `inbound_messages` table or JSONB column; embedding model dimension confirmation
2. **Hostaway webhook signature format** — one targeted spike in Phase 4
3. **Rachit credential timeline** — mock-to-real switch steps scoped behind `src/lib/data/*.ts` interface
4. **n8n cold-start heartbeat** — 5-minute warmer cron in n8n; document in Phase 2 plan
5. **`agent_dispatches` vs `action_log` naming consolidation** — resolve in data-layer phase

---

## Sources

**Primary (HIGH confidence):** Supabase Auth Server-Side Next.js docs · Supabase Postgres Changes docs · Supabase Realtime Pricing · Supabase pgvector docs · `@supabase/ssr` CHANGELOG · Next.js 14 Route Handlers docs · n8n Webhook node docs · n8n upstream issue #25066 · `.planning/PROJECT.md` · `.planning/codebase/CONCERNS.md`

**Secondary (MEDIUM confidence):** Makerkit Server Actions vs Route Handlers · Webhook Security in Next.js · n8n HMAC feature request thread · Supabase realtime memory leak diagnoses · Shadow-mode validation literature · Trust-calibration for AI software · LangSmith/Operator/Lindy/Devin patterns · Sparkco multi-tenant pgvector

---

*Research completed: 2026-05-14 — Ready for roadmap*
