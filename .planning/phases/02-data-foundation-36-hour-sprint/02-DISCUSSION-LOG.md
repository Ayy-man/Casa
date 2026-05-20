# Phase 2: Data Foundation (36-hour sprint) - Discussion Log

> ⚠️ Renumbered 2026-05-20: this phase was Phase 1; the Casa 360 Redesign is now Phase 1.

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 1-Data Foundation (36-hour sprint)
**Areas discussed:** Column-level schema design, Migration tooling/seed fidelity/deployment workflow, src/lib/data/* module API shape, Rendering model for Phase 1 pages

---

## Gray area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Column-level schema design | DATA-01 explicitly defers to "Phase 1 design session with Carlos." Researcher + planner can't write migrations without finalized columns. | ✓ |
| src/lib/data/* module API shape | Drop-in mock replacement vs async typed functions vs hybrid vs repository pattern. Shapes how invasive each page migration is. | ✓ |
| Rendering model for Phase 1 pages (client vs RSC) | All three target pages currently `"use client"`. PROJECT.md says "convert opportunistically." Picks the work surface for the 36hr sprint. | ✓ |
| Migration tooling, seed fidelity & deployment workflow | Supabase CLI vs Studio editor; real Casa property names vs anonymized; math-generated vs handcrafted agent_logs. | ✓ |

**User's choice:** All four selected.
**Notes:** User opted for full coverage rather than a subset — the four areas together specify everything researcher + planner need.

---

## Column-level schema design

### Sub-question 1: 0001_initial_schema.sql scope

| Option | Description | Selected |
|--------|-------------|----------|
| Lean — Phase 1 reads only, extend per phase | Only columns Phase 1 reads + DATA-01 required columns. Phase 2 adds its own migrations. | |
| Full forward-looking schema in 0001 | All columns REQUIREMENTS.md names across all 5 phases land now. | |
| Two-tier: structural + extensible | 0001 lands all 12 tables with PKs/FKs/known UNIQUE constraints; non-load-bearing columns per phase. Phase 1 + Phase 2 columns land now; Phase 3-5 columns later. | ✓ |
| Carlos owns this — design session not a Claude decision | Defer entire column-level design to synchronous Carlos session. | |

**User's choice:** Two-tier: structural + extensible.

### Sub-question 2: Which Phase 2 columns ride along in 0001

| Option | Description | Selected |
|--------|-------------|----------|
| Idempotency keys + UNIQUE constraint | agent_runs.idempotency_key UNIQUE + action_log.idempotency_key. | |
| Three-state lifecycle columns | pricing_recs.status, exceptions.state, executed_at timestamps. | |
| Shadow-mode trio + operator-race + watchdog (all four safety mechanics) | SAFE-01 + SAFE-04 + SAFE-05 columns bundled. | |
| All of the above (everything Phase 2 needs lands in 0001) | Idempotency + lifecycle + shadow-mode + claimed_by + watchdog in 0001. Cleanest cutover. | ✓ |

**User's choice:** "Just take the recommendation (load safety columns now)" — confirmed all four safety mechanics land in 0001.
**Notes:** First framing of the question used too much Postgres jargon — user replied "i don't know what this means so it can't hurt me." Re-framed in plain English with explicit "recommendation / show me / why does it matter / defer" choices. User picked "take the recommendation." Captured rationale in CONTEXT.md D-02 with explicit column lists per safety category so future readers (and Carlos) can see what's being locked.

---

## Migration tooling, seed fidelity & deployment workflow

### Sub-question 1: Migration deployment workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase CLI + supabase/migrations/*.sql | Versioned .sql files, applied with `supabase db push`. | |
| Studio SQL editor (paste + run) | Migration as a single .sql file in repo for reference, executed via Supabase dashboard SQL editor. | |
| CLI for schema, Studio for seed | Migration files via CLI, seed inserted via Studio paste. | |
| Local Supabase + push to remote | `supabase start` runs a local Postgres; migrations developed against local; pushed to remote. | |

**User's choice:** Free-text — "give me sqls in a supabase > migrations folder ill keep running them."
**Notes:** Hybrid of the options offered. Captured as D-05: planner produces `.sql` files in `supabase/migrations/*.sql`; user runs them manually (Studio SQL editor or `supabase db push` at user's discretion). No CLI dependency on the build path.

### Sub-question 2: Seed data fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror current mock-data 1:1 | Exact names/addresses/owners from src/lib/mock-data/properties.ts; realistic pricing_recs + agent_logs; visual parity with demo skin. | ✓ |
| Anonymized addresses, realistic decisions | Fake names + handcrafted realistic decisions; safer for screenshots; +1hr to compose. | |
| Real properties + math-generated decisions | Real names + Math.sin/cos generated agent_logs; fastest seed; numbers feel arbitrary. | |
| Bare minimum — 1 property, 2 agents, 5 rows total | Smallest seed; n8n Pricing flow writes the rest; sacrifices visual parity. | |

**User's choice:** Mirror current mock-data 1:1.

---

## src/lib/data/* module API shape

| Option | Description | Selected |
|--------|-------------|----------|
| Drop-in mock replacement — same exports + sync feel | Each module exports same named constants (EXCEPTIONS, PROPERTIES, etc.) populated from Supabase; pages barely change. | |
| Async query functions returning typed rows | `getExceptions()`, `getProperty(id)` returning rows typed from generated `database.types.ts`. | ✓ |
| Hybrid — server module + client hooks | Each module exports both `getX()` (RSC) and `useX()` (client). | |
| Repository pattern — single client-typed query object per entity | `exceptions.list()`, `exceptions.byId(id)`, `exceptions.subscribe(...)`. | |

**User's choice:** Free-text — "whatever is best for prod." Interpreted as: optimize for long-term codebase health over 36-hour-sprint expedience. Captured as async query functions returning typed rows (option B) — the idiomatic Supabase + App Router pattern, isomorphic between RSC and client, no corner-painting for Phase 2-5.

---

## Rendering model for Phase 1 pages

| Option | Description | Selected |
|--------|-------------|----------|
| Convert Home to RSC; keep Pricing + Pricing Agent client-side | Home is Carlos's 5-10x/day entry point (Pitfall 13); RSC means no skeleton flash + cookie handler validation. Pricing + Pricing Agent retain heavy local state. | ✓ |
| Convert all three to RSC | Maximum pattern consistency; bigger lift in 36hr. | |
| Keep all three client-side, async functions called from useEffect | Zero rendering-model change; accepts Pitfall 13 skeleton flash on Home. | |
| Server data, client islands — extract Pricing/Pricing-Agent state | Architecturally cleanest; highest lift. | |

**User's choice:** Convert Home to RSC; keep Pricing + Pricing Agent client-side.

---

## Claude's Discretion

User signaled "take the recommendation" / "best for prod" on multiple turns. Planner + researcher have judgment on:

- Exact Postgres column types (text vs varchar, timestamp vs timestamptz, numeric precision for nightly rates)
- Default values for safety columns (`agents.mode DEFAULT 'shadow'`, `pricing_recs.status DEFAULT 'pending'`, etc.)
- Seed file location (`supabase/migrations/0002_seed.sql` vs `supabase/seed.sql`) — pick what works for manual replay
- Whether `src/lib/data/*` functions accept an injected Supabase client or call `createClient()` internally
- `npm run gen:types` wiring (manual script only, or pre-commit hook bonus)
- Migration file naming convention beyond `0001_initial_schema.sql`
- Mapper layer convention between Postgres snake_case and TS camelCase (per-module helpers vs destructure-and-rename vs camelCase view types)

## Deferred Ideas

All deferrals trace back to REQUIREMENTS.md phase assignments — no new "wait but what about X" capabilities surfaced during this discussion. Documented in CONTEXT.md `<deferred>`:

- pgvector + HNSW + KB RPC → Phase 4 (DATA-02)
- Bookings detail + Guest/Ops/SOP page migrations → Phase 4
- Per-language CSS `:lang(...)` font stacks → Phase 4 (UI-02)
- ESLint mock-data guard → Phase 5 (DATA-05)
- Hardcoded date sweep → Phase 5 (UI-01)
- Top-level error boundary → Phase 5 (UI-04)
- SOP Agent scaffold → Phase 5 (AGENT-04)
- RSC conversion for Pricing + Pricing Agent detail → v2 (V2-PERF-04)
- Real Supabase Auth + RLS → v2
- Test framework → v2
- A11y side-sheets → v2
