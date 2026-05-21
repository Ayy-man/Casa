---
phase: 02-data-foundation-36-hour-sprint
plan: 02
subsystem: database
tags: [supabase, typescript, data-layer, postgres, async]

# Dependency graph
requires:
  - phase: 02-01
    provides: "src/types/database.types.ts (generated Database type, 12 tables), src/lib/env.ts validator, env-renamed Supabase client factories"
provides:
  - "8 async Supabase data modules at src/lib/data/* — the entity-data import seam replacing src/lib/mock-data/*"
  - "Established data-module pattern: injected SupabaseClient<Database> param + per-module mapRow() snake->camel boundary"
  - "Optional barrel src/lib/data/index.ts mirroring mock-data/index.ts"
affects: [02-03-page-migration, phase-03-integration-contracts, phase-05-guest-agent]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Injected-client data module — exported async getters take an optional SupabaseClient<Database>, fall back to the browser createClient() when omitted (isomorphic RSC/client, no 'server-only' marker)"
    - "Per-module mapRow() — explicit snake_case row -> camelCase view-type field mapping, no type widening"

key-files:
  created:
    - src/lib/data/exceptions.ts
    - src/lib/data/pricing_recs.ts
    - src/lib/data/agents.ts
    - src/lib/data/agent_logs.ts
    - src/lib/data/properties.ts
    - src/lib/data/bookings.ts
    - src/lib/data/agent_runs.ts
    - src/lib/data/action_log.ts
    - src/lib/data/index.ts
  modified: []

key-decisions:
  - "Injected-client mechanism (D-09): each getter accepts an optional SupabaseClient<Database> param; omitting it falls back to the browser-safe createClient(). Sidesteps the factory asymmetry (server createClient REQUIRES a cookieStore arg) without a 'server-only' marker — modules stay isomorphic."
  - "camelCase view type + per-module mapRow() (D-10): each module exports a camelCase view type whose field names mirror the existing mock-data app types, plus a mapRow() that maps every column explicitly. No type widening, no 'as any'."
  - "exceptions.id and the *.id columns are uuid strings — the data-module Exception.id is typed string, diverging from the legacy mock ExceptionItem.id (number). The redesigned Exception Board keys on the uuid."
  - "Added an optional barrel src/lib/data/index.ts (planner discretion under D-11) so Plan 03's page migrations swap a single import path."

patterns-established:
  - "Data module: import generated Row type -> declare camelCase view type -> mapRow() mapper -> export async getter(args, client?) with createClient() fallback and a thrown Error on Supabase error"
  - "All reads use the Supabase query builder's parameterized methods (.select/.eq/.gte/.order/.maybeSingle) — no string-interpolated SQL (threat T-02-05 mitigated)"

requirements-completed: [DATA-06]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 2 Plan 02: Data Foundation — Async Supabase Data Modules Summary

**The 8-module `src/lib/data/*` seam is live — async functions that read real Supabase tables and return rows typed from the generated `Database` type, replacing `src/lib/mock-data/*` as the entity-data import path with no `as any` anywhere.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-21T08:55:57Z
- **Completed:** 2026-05-21T08:59:30Z
- **Tasks:** 2 completed
- **Files modified:** 9 created (8 data modules + barrel)

## Accomplishments

- Established the data-module pattern once in Task 1 (injected `SupabaseClient<Database>` param + per-module `mapRow()` camelCase boundary) and copied it verbatim across all 8 modules — the pattern is uniform.
- Built the 4 critical-path modules first (`exceptions`, `pricing_recs`, `agents`, `agent_logs`) — the RSC Exception Board and the Pricing Agent detail page depend on these in Plan 03.
- `getExceptions()` returns rows urgency-sorted (Critical → Low) shaped for `ExceptionCard` and the `pricing_week` mega-card with no component change; `getPricingRecs({ weekStart })` returns the pricing table mirroring `PricingRow`.
- All 8 DATA-06 modules type-check (`npx tsc --noEmit`) and the full `npm run build` succeeds with no broken imports.

## Task Commits

Each task was committed atomically:

1. **Task 1: Critical-path data modules + pattern establishment** - `7a3e61e` (feat)
2. **Task 2: Remaining 4 data modules + barrel** - `02625d8` (feat)

## Files Created/Modified

- `src/lib/data/exceptions.ts` — `getExceptions(client?)`; urgency-sorted reads, reference module documenting the injected-client + `mapRow()` pattern.
- `src/lib/data/pricing_recs.ts` — `getPricingRecs({ weekStart }, client?)`; optional week filter, `PricingRow`-shaped view type plus `status` lifecycle field.
- `src/lib/data/agents.ts` — `getAgent(key, client?)`; single agent by slug, returns `null` when absent.
- `src/lib/data/agent_logs.ts` — `getAgentLogs({ agentKey, limit }, client?)`; newest-first, `shadowMode` flag for Flagged/Logged status semantics.
- `src/lib/data/properties.ts` — `getProperty(id, client?)` + `listProperties(client?)`; `Property`-shaped view type.
- `src/lib/data/bookings.ts` — `getBooking(id, client?)`; built-but-not-consumed until Phase 5 (D-11). View type reflects the normalised live `bookings` schema.
- `src/lib/data/agent_runs.ts` — `getAgentRuns({ agentKey }, client?)`; n8n-write target read shape, accepts every column the Pricing workflow `gIcYI8N1i1ljtCnW` writes.
- `src/lib/data/action_log.ts` — `getActionLog({ entityType, entityId }, client?)`; built-but-not-consumed until Phase 3 (D-11).
- `src/lib/data/index.ts` — barrel re-exporting all 8 modules; mirrors `mock-data/index.ts`.

## Decisions Made

- **D-09 — injected-client mechanism:** Each getter accepts an optional `SupabaseClient<Database>` param. When omitted it calls `createClient()` from `@/utils/supabase/client.ts` (browser-safe, no args). RSC callers in Plan 03 pass the server client explicitly. This avoids the factory asymmetry (`server.ts` `createClient(cookieStore)` requires an arg) and keeps every module isomorphic — no `'server-only'` marker.
- **D-10 — camelCase view type + `mapRow()`:** Each module imports its generated `Database['public']['Tables'][...]['Row']` type, declares a camelCase view `type` whose field names mirror the existing app types (`ExceptionItem`, `PricingRow`, `Property`, etc.), and a `mapRow()` that maps every field explicitly. No type widening.
- **`*.id` is a uuid string:** the data-module `Exception.id` is `string`, diverging from the legacy mock `ExceptionItem.id` (`number`). Documented in the module — the redesigned Exception Board keys on the uuid.
- **Barrel added:** `src/lib/data/index.ts` is optional under D-11; added so Plan 03 migrations can switch a single import path.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded the literal phrase `as any` out of module header comments**
- **Found during:** Task 1
- **Issue:** Module header comments described the D-10 rule using the literal phrase "No `as any` widening". The plan's `<verify>` automation runs `grep -r "as any" src/lib/data/` and fails the task if it matches anything — including descriptive prose. The comments tripped the gate even though no actual `as any` cast exists.
- **Fix:** Reworded the four comments to "No unchecked type widening" / "No type widening". No code semantics changed; `npx tsc --noEmit` confirms zero `as any` casts in the actual code.
- **Files modified:** `src/lib/data/exceptions.ts`, `pricing_recs.ts`, `agents.ts`, `agent_logs.ts`
- **Commit:** `7a3e61e`

## Threat Surface

No new threat surface beyond the plan's `<threat_model>`. T-02-05 (SQL injection) is mitigated as planned — every query uses the Supabase query builder's parameterized methods (`.select`, `.eq`, `.gte`, `.order`, `.maybeSingle`); no string-interpolated SQL, no `.rpc()`, no `supabase.sql`. T-02-07 (`as any` widening) is mitigated — no `as any` casts; rows are typed from generated `Database` types only.

## Notes for Next Plan (02-03 — page migration)

- Pages import getters from `@/lib/data/<module>` (or the `@/lib/data` barrel). RSC server components must pass the server client explicitly: `createClient(await cookies())` then `getExceptions(serverClient)`.
- Pure rendering helpers (`channelClass`, `statusClass`, `formatDate`, `changeClass`, `modeClass`, `URGENCY_RANK`, `propertyImg`, `PROMPT_VERSIONS`, etc.) deliberately stay in `@/lib/mock-data/*` — they were NOT moved or re-exported. Pages keep importing them from there.
- `getExceptions()` already returns urgency-sorted rows — the board does not need to re-sort.
- `Exception.id` / `Property.id` / etc. are uuid strings; any page code that treated mock ids as numbers needs adjustment.

## Self-Check: PASSED

All 9 created files verified present on disk (8 data modules + barrel). Both task commits (`7a3e61e`, `02625d8`) verified in git history. `npx tsc --noEmit` and `npm run build` both pass; `grep -r "as any" src/lib/data/` returns nothing.
