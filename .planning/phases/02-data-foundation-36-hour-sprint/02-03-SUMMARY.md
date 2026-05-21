---
phase: 02-data-foundation-36-hour-sprint
plan: 03
subsystem: dashboard-data-wiring
status: checkpoint
tags: [rsc, client-island, supabase, pricing-agent, exception-board]
requires:
  - "02-01: Supabase schema (0001) + generated database.types.ts"
  - "02-02: the 8 src/lib/data/* modules (getExceptions, getPricingRecs, getAgentLogs, listProperties)"
provides:
  - "Exception Board (/) as an RSC server shell + client island reading real Supabase data"
  - "Pricing Agent detail Decisions table + Activity feed reading real agent_logs/pricing_recs"
  - "ExceptionBoardClient island — reusable interactivity container for the home route"
affects:
  - "Phase 3: action-route wiring will replace the local-state Approve/Edit/Reject demos"
tech-stack:
  added: []
  patterns:
    - "RSC server-shell + client-island split (D-12) — first in the codebase"
    - "Dependency-free client data loader (useEffect+useState) for a use-client page (D-13)"
key-files:
  created:
    - "src/app/(dashboard)/_exception-board/exception-board-client.tsx"
  modified:
    - "src/app/(dashboard)/page.tsx"
    - "src/app/(dashboard)/vault/agent-logs/pricing/page.tsx"
decisions:
  - "Exception Board RSC shell also fetches listProperties() — the exceptions / pricing_recs tables carry only property_id (FK), not display names, and the cards need name + neighborhood"
  - "An adapter (toExceptionItem) maps the Supabase Exception view rows to the legacy ExceptionItem shape the ExceptionCard/PricingMegaCard consume; per-category action verbs are derived in the island (the exceptions table has no actions column)"
  - "Decisions table reads pricing_recs (carries change_pct + reasoning + status); Activity feed reads agent_logs — the $ cost column was dropped (no cost column exists in either table)"
  - "Status semantics (D-14): shadow_mode/pending -> Flagged; non-shadow/accepted -> Logged"
metrics:
  duration_min: 35
  completed: 2026-05-21
  tasks_completed: 2
  tasks_total: 3
---

# Phase 2 Plan 03: Pricing-Path Page Migration Summary

Migrated the two Pricing-Agent path-to-paint surfaces to read real Supabase
data — the Exception Board home route became an RSC server shell + client
island (D-12), and the Pricing Agent detail page's Decisions table + Activity
feed now read `agent_logs`/`pricing_recs` via a dependency-free client loader
(D-13/D-14/D-15). Tasks 1 and 2 are complete and committed; Task 3 is an
operator-gated `checkpoint:human-action` (trigger the n8n Pricing workflow) and
execution is paused there.

## What Shipped

### Task 1 — Exception Board → RSC server shell + client island (commit 1a4325e)

- `src/app/(dashboard)/page.tsx` is now an `async` RSC server component. It
  drops `"use client"`, builds the per-request Supabase SSR client via
  `cookies()` from `next/headers` + `createClient(cookieStore)`, and fetches
  `getExceptions()`, `getPricingRecs({})`, and `listProperties()` in parallel.
  Render mode confirmed `ƒ` (server-rendered on demand) in the build output.
- `src/app/(dashboard)/_exception-board/exception-board-client.tsx` is a new
  `"use client"` island (`ExceptionBoardClient`) holding ALL interactivity:
  the 7 filter chips, 4 status pills, toast-with-Undo machinery, the urgency
  sort comparator, the greeting block, `useAuth()`/`useRole()`, and the entire
  Pricing mega-card → 26-row Approve/Edit/Reject side-sheet. `.route-fade` is
  preserved on the rendered root.
- An adapter (`toExceptionItem`) maps the Supabase `Exception` view rows to the
  `ExceptionItem` shape the components consume.

### Task 2 — Pricing Agent detail Decisions + Activity (commit 4544fb1)

- Deleted the math-generated `ACTIVITY` (`PROPERTIES.slice` + index times) and
  `DECISIONS` (`Array.from` + `Math.sin`) arrays.
- Added a dependency-free client loader (`useEffect`+`useState`, no SWR/React
  Query — CLAUDE.md pinned-stack constraint). On mount it fetches
  `getAgentLogs({ agentKey: "pricing", limit: 12 })` for the Activity feed and
  `getPricingRecs({})` for the Decisions table.
- Status column now reads real data (D-14). Loading / error / empty states
  render gracefully in both tables.
- The page stays `"use client"` (D-13). `KPIS`, `SuccessChart`/`ExceptionsChart`,
  Property Breakdown, and Shadow Mode Validation are untouched — still mock/math
  per D-15. `modeClass`, `modeLabel`, `PROMPT_VERSIONS`, `changeClass`,
  `Sparkline`, `PROPERTIES` imports preserved.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] RSC shell fetches `listProperties()` in addition to the planned two reads**
- **Found during:** Task 1
- **Issue:** The plan's `key_links` specify the shell fetches only
  `getExceptions()` + `getPricingRecs()`. But the Supabase `exceptions` and
  `pricing_recs` tables carry only `property_id` (FK) — no `property` display
  name and no `neighborhood`. `ExceptionCard` and `PricingMegaCard` both render
  `exception.property` and `exception.neighborhood`; the 26-row side-sheet
  renders the property name. Without a property lookup the cards would render
  raw UUIDs. The plan's claim that "components consume these rows without any
  change" is not literally true — the data-module `Exception` view type and the
  component `ExceptionItem` shape diverge.
- **Fix:** The RSC shell also `await`s `listProperties()` and passes the
  portfolio to the island; the island builds a `property_id → Property` map and
  the `toExceptionItem` adapter resolves names + neighborhoods. Per-category
  action verbs (`CATEGORY_ACTIONS`) and the `requiresConfirm` flag are derived
  in the island since the `exceptions` table has no `actions` column.
- **Files modified:** `src/app/(dashboard)/page.tsx`,
  `src/app/(dashboard)/_exception-board/exception-board-client.tsx`
- **Commit:** 1a4325e

**2. [Rule 3 - Blocking] Dropped the `$` cost column from the Decisions + Activity tables**
- **Found during:** Task 2
- **Issue:** The old math-generated `DECISIONS`/`ACTIVITY` arrays had a `cost`
  field. Neither the `agent_logs` nor the `pricing_recs` table has a cost
  column — there is no real data source for it.
- **Fix:** Removed the `$` column from both tables. The KPI cards still show
  "Cost MTD" (mock, untouched per D-15). Documented here rather than masked
  with a hardcoded `$0.000`.
- **Files modified:** `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx`
- **Commit:** 4544fb1

## Blocker — Live Supabase tables are empty (seed not applied)

The plan's context note stated the seed was applied to project
`aqsitrzbjokkkpcohple` (26 properties, 4 agents, ~21 pricing_recs, ~30
agent_logs, ~6 exceptions, 2 agent_runs). **This is not the case.** A direct
REST query against the live project returns `count=*/0` for every table —
`properties`, `agents`, `exceptions`, `pricing_recs`, `agent_logs`,
`agent_runs`, `bookings`. The schema (0001) IS applied (tables exist, status
200); the seed (`supabase/migrations/0002_seed.sql`, present in the repo) has
NOT been run.

**Impact on this plan:**
- `npx tsc --noEmit` and `npm run build` both PASS regardless — empty data is
  valid; the code migration is complete and correct.
- The two pages render their graceful empty states (Exception Board → "All
  clear."; Pricing detail → "No agent activity yet." / "No pricing decisions
  yet.") instead of the seeded content.
- The plan's manual verification items — "Loading `/` renders the greeting, 4
  status pills, 7 filter chips, and the urgency-sorted exception stack (incl.
  the Pricing mega-card)" and "Loading `/vault/agent-logs/pricing` renders the
  Decisions table + Activity feed from real `agent_logs`" — CANNOT be confirmed
  with real data until the seed is applied.

**Why not auto-fixed:** Applying the seed requires running SQL against the
operator's Supabase project. Per STATE.md decision log (2026-05-21), the
Supabase CLI is unauthenticated and D-05 dictates schema/seed SQL is applied by
the operator via the Studio SQL Editor — this is operator-gated, not
auto-fixable executor work. It is surfaced at the Task 3 checkpoint below so
the operator can apply `0002_seed.sql` before triggering n8n.

## Verification Status

- [x] `npx tsc --noEmit` — passes
- [x] `npm run build` — succeeds, `/` confirmed `ƒ` (dynamic RSC), no broken imports
- [x] `page.tsx` has no `"use client"`, is `async`, imports + awaits `getExceptions`/`getPricingRecs`
- [x] `exception-board-client.tsx` starts with `"use client"`, exports `ExceptionBoardClient`, holds filter chips / status pills / toast / 26-row side-sheet, keeps `.route-fade`
- [x] `useAuth()`/`useRole()` live only in the island
- [x] Pricing detail stays `"use client"`; `ACTIVITY`/`DECISIONS` math arrays deleted; `KPIS`/`PROMPT_VERSIONS` preserved
- [ ] Visual parity with real data — BLOCKED on the empty-seed issue above
- [ ] Task 3 (n8n run) — operator-gated checkpoint, execution paused

## Self-Check: PASSED

- FOUND: src/app/(dashboard)/page.tsx
- FOUND: src/app/(dashboard)/_exception-board/exception-board-client.tsx
- FOUND: src/app/(dashboard)/vault/agent-logs/pricing/page.tsx
- FOUND commit 1a4325e (Task 1)
- FOUND commit 4544fb1 (Task 2)
