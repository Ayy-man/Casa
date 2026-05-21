---
phase: 02-data-foundation-36-hour-sprint
plan: 01
subsystem: database
tags: [supabase, postgres, zod, typescript, sql-migrations, env-validation]

# Dependency graph
requires:
  - phase: 01-casa-360-redesign
    provides: 3-tab IA (Exception Board / Vault / Assistant), narrative mock-data modules, Pricing Agent detail page
provides:
  - 12-table Supabase schema (0001_initial_schema.sql) with PK/FK constraints and Phase-3 safety-mechanic columns
  - Narrative-mirror seed data (0002_seed.sql) — 26 properties, 4 shadow agents, pricing_recs, agent_logs, exceptions
  - src/lib/env.ts — Zod-validated env object that throws readable, var-named errors on missing config
  - src/types/database.types.ts — Database type covering all 12 tables (Row/Insert/Update + FK Relationships)
  - Env var renamed NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY across all three Supabase client factories
  - gen:types npm script for future CLI-based type regeneration
affects: [02-02 data-modules, 02-03 page-migrations, pricing-agent-integration, n8n-webhook-receivers]

# Tech tracking
tech-stack:
  added: [zod@^3.23.8, nanoid@^5.0.7]
  patterns:
    - "Module-load env validation — Zod schema.safeParse(process.env) throws at startup, not at request time"
    - "Versioned SQL migrations as raw Postgres DDL — schema (0001) and seed (0002) in separate replayable files, no Supabase CLI on the build path"
    - "Committed generated types — database.types.ts is version-controlled and regenerated after every migration (Pitfall 11)"

key-files:
  created:
    - supabase/migrations/0001_initial_schema.sql
    - supabase/migrations/0002_seed.sql
    - src/lib/env.ts
    - src/types/database.types.ts
  modified:
    - src/utils/supabase/client.ts
    - src/utils/supabase/server.ts
    - src/utils/supabase/middleware.ts
    - .env.local
    - package.json

key-decisions:
  - "Supabase schema applied by the operator via Studio SQL Editor — no Supabase CLI dependency on the build path (D-05)"
  - "database.types.ts hand-transcribed from the operator-confirmed live-schema DDL because the Supabase CLI is unauthenticated; gen:types script remains wired for future regeneration"
  - "All 4 agents seeded with mode='shadow' overriding agents.ts (which shows Ops/SOP as Live) per D-02 / CONTEXT criterion 4"
  - "Phase-3 safety-mechanic columns authored in 0001 from day one (idempotency_key UNIQUE, three-state lifecycle, shadow-mode trio, operator-race claim columns, stalled-agent watchdog) — retrofitting after rows exist is expensive"

patterns-established:
  - "Env validation: import { env } from '@/lib/env' — never read process.env directly in Supabase client factories"
  - "Generated DB types live at src/types/database.types.ts and follow the supabase gen types output shape"

requirements-completed: [DATA-01, DATA-03, DATA-04, DATA-07, DATA-08]

# Metrics
duration: ~3h (across 3 sessions, operator checkpoint in between)
completed: 2026-05-21
---

# Phase 2 Plan 01: Data Foundation Summary

**12-table Supabase schema deployed with narrative-mirror seed, Zod env validator that fails loud on missing config, and a committed Database type covering all 12 tables.**

## Performance

- **Duration:** ~3h wall-clock across 3 sessions (operator-applied SQL checkpoint between Task 1 and Task 2)
- **Completed:** 2026-05-21
- **Tasks:** 2 auto + 1 operator checkpoint
- **Files modified:** 9 (4 created, 5 modified)

## Accomplishments

- **12-table schema live** on Supabase project `aqsitrzbjokkkpcohple` — properties, bookings, guests, agents, agent_runs, agent_logs, pricing_recs, exceptions, action_log, turnovers, claims, knowledge_chunks — all with PK/FK constraints and `agent_runs.idempotency_key` UNIQUE.
- **Phase-3 safety-mechanic columns authored up front** — three-state lifecycle (`status`/`state` + `executed_at`), shadow-mode trio (`agents.mode`, `agent_runs.mode_at_run`, `agent_logs.shadow_mode`), operator-race columns (`exceptions.claimed_by`/`claimed_at`), stalled-agent watchdog (`agent_runs.expected_callback_by`/`completed_at`).
- **Narrative-mirror seed** — 26 properties, 4 agents (all `mode='shadow'`), pricing_recs, agent_logs, and the exception anchor cards, mirroring the Phase-1 mock-data 1:1.
- **Day-1 correctness pitfalls closed** — env var renamed to `NEXT_PUBLIC_SUPABASE_ANON_KEY` everywhere, `src/lib/env.ts` Zod validator throws readable var-named errors at module load (Pitfall 2), `database.types.ts` committed and reflects all 12 tables (Pitfall 11).
- **Type-check clean** — `npx tsc --noEmit` passes with zero errors.

## Task Commits

1. **Task 1: Author the 12-table schema and narrative-mirror seed SQL** — `2fef646` (feat)
2. **Operator checkpoint: apply SQL to Supabase** — RESOLVED (operator confirmed schema live on `aqsitrzbjokkkpcohple`)
3. **Task 2a: Zod env validator, rename anon key, wire gen:types** — `66ba9d4` (feat)
4. **Task 2b: Generate database.types.ts from applied schema** — `77f1c15` (feat)

_Task 2 split into two commits — the env/dependency work was committable independent of the types file, which depended on the operator confirming the applied schema._

## Files Created/Modified

- `supabase/migrations/0001_initial_schema.sql` — 12-table Postgres DDL with safety-mechanic columns; no pgvector, no Phase-4 columns
- `supabase/migrations/0002_seed.sql` — narrative-mirror seed inserts mirroring Phase-1 mock-data
- `src/lib/env.ts` — Zod-validated `env` object; `safeParse` at module load, throws naming the missing/invalid var
- `src/types/database.types.ts` — `Database` type with Row/Insert/Update + FK `Relationships` for all 12 tables, plus `Tables`/`TablesInsert`/`TablesUpdate` helpers
- `src/utils/supabase/client.ts` / `server.ts` / `middleware.ts` — now import `{ env }` from `@/lib/env`, no `!` non-null assertions; cookie `getAll`/`setAll` handler left byte-for-byte unchanged
- `.env.local` — key renamed `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `package.json` — added `zod@^3.23.8`, `nanoid@^5.0.7`, and the `gen:types` script

## Decisions Made

- **`database.types.ts` hand-transcribed, not CLI-generated.** The Supabase CLI is not authenticated and the operator opted out of CLI login. The file was transcribed faithfully from the operator-confirmed live-schema DDL (pasted verbatim from Supabase Studio) — the schema that is actually applied to project `aqsitrzbjokkkpcohple`. There is no drift risk: this is the real schema, not a guess. The `gen:types` script remains wired so the file can be regenerated by `supabase gen types typescript --project-id aqsitrzbjokkkpcohple` once CLI auth is available.
- **Schema applied by the operator** via Supabase Studio SQL Editor (D-05) — keeps the build path free of any Supabase CLI dependency.
- **All 4 agents seeded `mode='shadow'`**, overriding the Ops/SOP "Live" values in `agents.ts`, per D-02 / CONTEXT criterion 4.

## Deviations from Plan

None — plan executed as written. The only adaptation: `gen:types` was not run as a live command because the Supabase CLI is unauthenticated and the operator deferred CLI login; the equivalent output was produced by hand-transcribing the operator-confirmed live-schema DDL into the standard `supabase gen types` shape. This was explicitly directed in the continuation instructions, not an autonomous deviation.

## Issues Encountered

- **Supabase CLI unauthenticated** on the build path. Resolved per the continuation directive — `database.types.ts` was produced from the authoritative DDL the operator confirmed against the live project, keeping the file `tsc`-clean and faithful to the applied schema.

## User Setup Required

External service configuration was completed during this plan via the operator checkpoint:
- The two migration files were applied to Supabase project `aqsitrzbjokkkpcohple` (operator-confirmed: 12 tables, 26 properties, 4 shadow agents).
- `.env.local` carries `NEXT_PUBLIC_SUPABASE_URL` and the renamed `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Future regeneration of `database.types.ts` requires `supabase login` (deferred — operator decision); the `gen:types` script is wired and ready when CLI auth is available.

## Next Phase Readiness

- The live schema and `database.types.ts` are the spine for Plan 02-02 (8 typed data modules) and Plan 02-03 (page migrations) — both can now type against `@/types/database.types`.
- `src/lib/env.ts` is the canonical env accessor; downstream code must import `{ env }` rather than read `process.env`.
- `agent_runs` seed decision (empty vs. sample rows) is documented in `0002_seed.sql` — Plan 02-03's Decisions/Activity feed must honor whatever that file chose (graceful empty state if left empty).
- No blockers. Rachit credential forwarding remains a Phase-3/4 concern, not relevant here.

## Self-Check: PASSED

All claimed files exist on disk and all task commits (`2fef646`, `66ba9d4`, `77f1c15`) are present in git history.

---
*Phase: 02-data-foundation-36-hour-sprint*
*Completed: 2026-05-21*
