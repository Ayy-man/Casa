# Phase 2: Data Foundation (36-hour sprint) - Context

**Gathered:** 2026-05-15
**Status:** Stale — re-run discuss-phase before planning

> ⚠️ **STALE (2026-05-20).** This context was gathered when Data Foundation was Phase 1.
> The Casa 360 Redesign was inserted ahead of it as the new Phase 1, so this is now
> **Phase 2**, and the redesign restructures the pages this phase migrates (Home →
> Exception Board, the Pricing route, the Pricing Agent detail route). Internal
> "Phase N" references below reflect the pre-renumber numbering (old 1 = now 2,
> old 2 = now 3, …). Re-run `/gsd:discuss-phase 2` after the redesign lands before
> using this for planning.

<domain>
## Phase Boundary

Phase 1 delivers the Supabase backend that unblocks the integration testbed. Five concrete outcomes, all from ROADMAP.md success criteria:

1. **12-table schema deployed** to Supabase project `aqsitrzbjokkkpcohple` via `supabase/migrations/0001_initial_schema.sql` (tables: `properties`, `bookings`, `guests`, `agents`, `agent_runs`, `agent_logs`, `pricing_recs`, `exceptions`, `action_log`, `turnovers`, `claims`, `knowledge_chunks`). `agent_runs.idempotency_key` UNIQUE.
2. **Env + types + cookie correctness** — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` renamed to `NEXT_PUBLIC_SUPABASE_ANON_KEY` across `src/utils/supabase/{client,server,middleware}.ts`; `src/lib/env.ts` Zod validator throws readable errors; `npm run gen:types` produces `src/types/database.types.ts`; `@supabase/ssr` cookie handler validated end-to-end (already uses `getAll`/`setAll`, needs runtime proof).
3. **Eight data modules built** at `src/lib/data/{properties,bookings,agents,agent_runs,agent_logs,pricing_recs,exceptions,action_log}.ts`. Home, Pricing, and Pricing Agent detail pages migrated to read from these modules. Other pages stay on mock imports until their phases land.
4. **Seed mirrors mock-data 1:1** — 26 real Casa properties, 4 agents (mode='shadow'), ~20 pricing_recs, ~30 agent_logs, ~6 exceptions; visual parity with current demo skin.
5. **n8n Pricing workflow `gIcYI8N1i1ljtCnW` runs end-to-end** against real Supabase — writes `agent_runs` + `agent_logs` + `pricing_recs` rows that surface in the UI on next navigation.

This phase explicitly does NOT do: pgvector / HNSW / `match_knowledge_for_property` RPC (Phase 4), ESLint mock-data guard (Phase 5), hardcoded date sweep (Phase 5), Pricing/Pricing-Agent RSC conversion (v2), action button wiring (Phase 2), HMAC plumbing (Phase 2), realtime subscriptions (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Schema scope (0001_initial_schema.sql)

- **D-01:** All 12 tables land in 0001 with primary keys, foreign keys, and the known UNIQUE constraints. Two-tier strategy: structural shells + Phase 1/2 "safety mechanic" columns now; Phase 3-5 columns added in their own migrations.
- **D-02:** Phase 2 "safety mechanic" columns ride along in 0001 because retrofitting them after rows exist is expensive. Concretely:
  - **Idempotency:** `agent_runs.idempotency_key` UNIQUE, `action_log.idempotency_key`
  - **Three-state lifecycle:** `pricing_recs.status` enum-like (`pending`|`accepted`|`dispatched`), `exceptions.state`, `executed_at` timestamp on action-bearing rows
  - **Shadow-mode trio (SAFE-01):** `agents.mode` (`shadow`|`live`), `agent_runs.mode_at_run`, `agent_logs.shadow_mode`
  - **Operator-race (SAFE-04):** `exceptions.claimed_by`, `exceptions.claimed_at`
  - **Stalled-agent watchdog (SAFE-05):** `agent_runs.expected_callback_by`, `agent_runs.status`, `agent_runs.completed_at`
- **D-03:** `knowledge_chunks` table is created in 0001 (so the structural shell exists) but the pgvector extension, HNSW index, embedding column, and `match_knowledge_for_property` RPC are deferred to Phase 4 — only the table skeleton with `property_id` FK lands now. Acceptable to leave it empty/minimal.
- **D-04:** Phase 3-5 columns NOT in 0001: `turnovers.whatsapp_thread` JSONB, `turnovers.dispatch_state` enum, `agent_logs.kb_chunks_used[]`, claim-specific JSON blobs, etc. Each phase's first migration adds its columns.

### Migration tooling & seed

- **D-05:** Planner produces `.sql` files in `supabase/migrations/*.sql` (versioned in repo). User runs them manually against the hosted Supabase project — via Studio SQL editor or `supabase db push` at user's discretion. No CLI dependency on the build path. Schema is replayable from repo files even though execution is manual.
- **D-06:** Seed mirrors `src/lib/mock-data/*.ts` 1:1 — same 26 property names/addresses/owners from `properties.ts`, realistic pricing decisions matching the demo skin's `PRICING_BASE`, ~30 `agent_logs` rows that look like real Pricing-Agent output, ~6 `exceptions` matching the current `EXCEPTIONS` array shape. Visual parity is the QA bar: "does the screen match what it showed yesterday?"
- **D-07:** Seed file placement is planner discretion (e.g., `supabase/migrations/0002_seed.sql`, or `supabase/seed.sql` if Supabase CLI's seed conventions are followed). Keep schema and seed in separate files so the migration is replayable independent of seed.

### `src/lib/data/*` module API

- **D-08:** Each of the 8 modules exports **async functions returning rows typed from generated `src/types/database.types.ts`**. Examples: `getExceptions()`, `getPricingRecs({ weekStart })`, `getAgent(key)`, `getAgentLogs({ agentKey, limit })`, `getProperty(id)`, `listProperties()`, `getAgentRuns({ agentKey })`, `getActionLog({ entityType, entityId })`.
- **D-09:** Functions are **isomorphic** — callable from RSC and from client code. No `'server-only'` marker. Browser client (`src/utils/supabase/client.ts`) vs server client (`src/utils/supabase/server.ts`) is selected inside each function based on execution context, or via an injected client param — planner picks the precise mechanism.
- **D-10:** **Type source of truth** is `Database['public']['Tables']['<table>']['Row']` from generated types. No `as any` widening. Modules MAY also export camelCase view types and a mapper if the rows leaving the module need to match existing TS conventions in the codebase (DB columns are `snake_case`, app code is `camelCase`).
- **D-11:** Module names are **fixed** by DATA-06: `properties.ts`, `bookings.ts`, `agents.ts`, `agent_runs.ts`, `agent_logs.ts`, `pricing_recs.ts`, `exceptions.ts`, `action_log.ts`. Eight files, no more, no less, this phase. (Phase 3 adds `turnovers.ts`/`claims.ts`; Phase 4 adds bookings detail + agent detail reads.)

### Rendering model for migrated pages

- **D-12:** **Home (`src/app/(dashboard)/page.tsx`) converts to RSC.** Page shell becomes a server component that calls the async data functions directly. Interactive bits (action toast, dropdown menus, action handlers, useEffect-driven panels) extract into client child components under `src/app/(dashboard)/_home/` (or planner's chosen location). Rationale: Home is Carlos's 5-10x/day entry point (Pitfall 13 calls it out specifically); RSC eliminates skeleton flash; this is also the first end-to-end exercise of the SSR cookie handler shape (DATA-08 validation).
- **D-13:** **Pricing (`src/app/(dashboard)/pricing/page.tsx`) and Pricing Agent detail (`src/app/(dashboard)/agents/pricing/page.tsx`) stay `"use client"`.** They call async data functions from a client loader pattern (planner picks: SWR / React Query / `useEffect` + `useState`). Rationale: both pages have heavy local state (week selector, sort, tab nav, mode toggle, decision state) where RSC's gain is smaller and the conversion cost is higher in a 36-hour window. Their RSC conversion stays deferred to v2 (V2-PERF-04, opportunistic).
- **D-14:** The math-generated `decisions[]` array on the Pricing Agent detail page (`src/app/(dashboard)/agents/pricing/page.tsx:42–58`, using `Math.sin(i * 1.7)`, `i % 7 === 3 ? "Flagged" : "Logged"`) is **deleted** and replaced with `getAgentLogs({ agentKey: 'pricing' })` reading from seeded rows. The "Flagged" vs "Logged" status becomes `shadow_mode` + lifecycle status driven (CONCERNS.md: "Pricing Decisions Table Uses Math-Generated Data" — closed by this phase for the Pricing Agent specifically).

### Claude's Discretion

The user said "whatever is best for prod" / accepted recommendations on these — researcher and planner have judgment within the constraints above:

- Exact column types (text vs varchar, timestamp vs timestamptz, numeric precision for rates) — pick Postgres-idiomatic defaults; document choices in the migration comments.
- Default values for safety columns (`agents.mode DEFAULT 'shadow'`, `pricing_recs.status DEFAULT 'pending'`, etc.) — pick the conservative default for each.
- Whether seed lives in `supabase/migrations/0002_seed.sql` or `supabase/seed.sql` — Supabase CLI convention preferred if it doesn't add CLI dependency for the user's manual run.
- Whether `src/lib/data/*` functions accept an injected Supabase client or call `createClient()` internally — picks the simpler pattern that still allows server vs browser routing.
- Whether the `database.types.ts` regeneration is wired to `npm run gen:types` (manual) or also pre-commit / pre-build hook — manual is sufficient for Phase 1; pre-commit is bonus.
- Migration file naming convention (`0001_initial_schema.sql` is fine; `0002_seed.sql` or otherwise also fine).
- How the mapper layer between Postgres `snake_case` and TS `camelCase` is structured (per-module helpers, shared `mapRow()` utility, or rely on generated types and rename at call sites) — pick the lightest pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone framing & locked decisions
- `.planning/PROJECT.md` — Casa milestone framing, 12-table architectural commitment, three API-route families (`/api/cron/*`, `/api/actions/*`, `/api/webhooks/*`), `NEXT_PUBLIC_WORKSPACE_NAME` future-proofing, hardcoded auth this milestone, Pricing Agent as integration validation target.
- `.planning/REQUIREMENTS.md` — DATA-01/03/04/06/07/08 success criteria (Phase 1 scope); DATA-02 (Phase 4), DATA-05 (Phase 5); Phase 2-5 column needs the schema must accommodate (INT-*, ACT-*, RT-*, SAFE-*, AGENT-*).
- `.planning/ROADMAP.md` §"Phase 1: Data Foundation (36-hour sprint)" — five numbered success criteria; phase ordering rationale.
- `.planning/STATE.md` — last-session context; deadline framing; n8n Pricing workflow `gIcYI8N1i1ljtCnW` is built and mock-validated.

### Pitfalls research (mandatory)
- `.planning/research/PITFALLS.md` — All "Critical Pitfalls" relevant to Phase 1 work:
  - **Pitfall 1** (mock-data leak) — addressed by `src/lib/data/*` abstraction landing before page migrations
  - **Pitfall 2** (@supabase/ssr cookie handler shape + env var name) — Phase 1 day-1 work
  - **Pitfall 3** (idempotency keys) — `agent_runs.idempotency_key` UNIQUE from day one (D-02)
  - **Pitfall 4** (optimistic UI) — `pricing_recs.status` three-state column exists in 0001 even though Phase 2 wires the transitions
  - **Pitfall 6** (silent callback failure) — `agent_runs.expected_callback_by` column lands in 0001
  - **Pitfall 9** (mode toggle gating) — per-agent `agents.mode` column + `mode_at_run` snapshot + `shadow_mode` flag in 0001
  - **Pitfall 10** (realtime memory leak) — not Phase 1 but tables must support filtered subscriptions (Phase 2)
  - **Pitfall 11** (TypeScript type drift) — `npm run gen:types` script + regenerate after every migration
  - **Pitfall 13** (all-`"use client"` pages) — Home converts to RSC (D-12)
  - Pitfalls 5, 7, 8, 12, 14, 15 — not Phase 1 scope; tracked for later phases
- `.planning/research/PITFALLS.md` §"Looks Done But Isn't" Checklist — Phase 1 items: mock-data layer abstraction (item 1), env var canonical (item 2), cookie handler validated (item 3), webhook secrets server-side only (item 17). Researcher should pull the exact items into the verification plan.

### Research context (background)
- `.planning/research/ARCHITECTURE.md` — Casa ↔ Supabase ↔ n8n high-level architecture.
- `.planning/research/FEATURES.md` — feature/requirements landscape.
- `.planning/research/SUMMARY.md` — research roll-up.
- `.planning/research/STACK.md` — stack-level research notes.

### Codebase inventory
- `.planning/codebase/STACK.md` — pinned versions: Next.js 14.2.18, React 18.3.1, TypeScript 5.x, Tailwind 3.4.14, `@supabase/ssr` 0.10.3, `@supabase/supabase-js` 2.105.4. New deps this milestone: `zod@^3.23.8`, `nanoid@^5.0.7`.
- `.planning/codebase/STRUCTURE.md` — current src layout (`src/app/(dashboard)/*`, `src/lib/mock-data/*`, `src/utils/supabase/*`, `src/components/casa/*`).
- `.planning/codebase/ARCHITECTURE.md` — layer responsibilities (Auth, Mock Data, Supabase SSR, Components, Styling).
- `.planning/codebase/CONCERNS.md` — "Supabase Environment Variables Use Non-Standard Key Name," "Dual Auth Systems," "Mock-Data Boundary Has No Enforcement Layer," "All Pages Are Client Components Without Need," "Pricing Decisions Table Uses Math-Generated Data" — all directly relevant to Phase 1 work.
- `.planning/codebase/INTEGRATIONS.md` — Supabase SSR scaffolding state.
- `.planning/codebase/CONVENTIONS.md` — TS conventions: `type` not `interface`, `as const` literal arrays, path alias `@/*`, camelCase locals + SCREAMING_SNAKE_CASE module-level arrays.
- `.planning/codebase/TESTING.md` — no test framework this milestone (per PROJECT.md Out of Scope).

### Brand + design (binding for any UI surface)
- `PRODUCT.md` — brand voice, UX rules, anti-references (no Hostaway/Lodgify/PriceLabs/Guesty UI patterns).
- `DESIGN.md` — design system tokens, typography, color, corner radius, animations.

### Source files Phase 1 directly modifies
- `src/utils/supabase/client.ts` — env var rename
- `src/utils/supabase/server.ts` — env var rename; cookie handler already `getAll`/`setAll` (validate end-to-end)
- `src/utils/supabase/middleware.ts` — env var rename
- `.env.local` — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/app/(dashboard)/page.tsx` (522 lines, currently `"use client"`) — Home, converts to RSC + client islands
- `src/app/(dashboard)/pricing/page.tsx` (277 lines) — Pricing, stays client-side, swaps import
- `src/app/(dashboard)/agents/pricing/page.tsx` (687 lines) — Pricing Agent detail; replaces math-generated `decisions[]` at lines 42–58 with `getAgentLogs()` call
- `src/lib/mock-data/{properties,exceptions,pricing,agents,cleanings}.ts` — source of seed data (mirror 1:1)
- `package.json` — add `gen:types` script + `zod`, `nanoid` deps

### Source files Phase 1 creates
- `supabase/migrations/0001_initial_schema.sql` — 12 tables + safety mechanic columns
- `supabase/migrations/0002_seed.sql` (or `supabase/seed.sql`) — mirror-of-mock seed data
- `src/types/database.types.ts` — generated; committed
- `src/lib/env.ts` — Zod validator throwing readable errors on missing env vars
- `src/lib/data/properties.ts`, `bookings.ts`, `agents.ts`, `agent_runs.ts`, `agent_logs.ts`, `pricing_recs.ts`, `exceptions.ts`, `action_log.ts` — 8 data modules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/utils/supabase/{client,server,middleware}.ts`** — Supabase SSR clients already scaffolded. Server + middleware already use the correct `getAll`/`setAll` cookie shape (good — DATA-08 just needs runtime validation, not a rewrite). Three files just need the env var name rename.
- **`src/lib/mock-data/{properties,exceptions,pricing,agents}.ts`** — these are the TypeScript source of truth for seed data. Planner reads them to compose the 0002_seed.sql inserts. Helper functions (`getProperty(id)`, `formatDate(...)`, `channelClass(...)`, `modeClass(...)`, `modeLabel(...)`, `changeClass(...)`) are pure rendering utilities — they stay where they are.
- **`src/components/casa/sparkline.tsx`** — pure SVG renderer, no hooks; consumed by Pricing Agent detail. No changes needed.
- **`src/lib/utils.ts`** — `cn()` Tailwind merger helper, leave alone.
- **`src/lib/auth/context.tsx`** — fake auth context; NOT replaced this milestone (PROJECT.md: Out of Scope). Pages keep using `useAuth()`.

### Established Patterns
- **TypeScript conventions** (from `.planning/codebase/CONVENTIONS.md`): `type` not `interface` for data shapes; union types for constrained strings; `as const` for literal arrays; path alias `@/*` → `./src/*`; camelCase locals; SCREAMING_SNAKE_CASE for module-level data arrays. Generated `Database` type lives at `src/types/database.types.ts`.
- **Naming patterns**: route pages are `page.tsx`; shared components are `kebab-case.tsx`; mock data files are `kebab-case.ts`. New data modules at `src/lib/data/*.ts` should follow the same naming (the underscored ones like `agent_runs.ts` mirror table names exactly per DATA-06 — keep that mismatch with the broader codebase convention since DATA-06 dictates it).
- **Page rendering model**: every existing `page.tsx` is `"use client"`. Home becomes the first exception (D-12). The pattern for RSC + client islands isn't established in this codebase yet — planner is establishing it.
- **Component classes vs Tailwind utilities**: design system primitives live as `@layer components` in `src/app/globals.css` (`.ex-card`, `.kpi-card`, `.btn-sm-primary`, `.urgency-pill`, etc.); use those named classes for any Casa surface and Tailwind utilities for layout. No new component classes needed in Phase 1.
- **Postgres snake_case ↔ TS camelCase**: generated types will be `snake_case`. The codebase is `camelCase`. Mapper layer convention is not yet established — planner picks the lightest approach (per-module mapper helpers, or rely on destructuring with rename at call sites, or expose camelCase view types from each data module).

### Integration Points
- **Env var resolution chain**: `.env.local` → `process.env.NEXT_PUBLIC_*` → consumed by `src/utils/supabase/{client,server,middleware}.ts`. The Zod validator in `src/lib/env.ts` must run at module load on the server side so missing/misnamed env vars fail loud at startup, not silently `undefined` at request time.
- **n8n Pricing workflow `gIcYI8N1i1ljtCnW`** writes to `agent_runs`, `agent_logs`, `pricing_recs` tables. The Phase 1 column shape for these three tables must accept what n8n's writes will look like. STATE.md confirms the workflow is built + mock-validated; coordinating the exact write shape with the n8n flow's output schema is a planner task. (Workspace: fyi-media.app.n8n.cloud.)
- **Realtime is NOT Phase 1.** Tables must SUPPORT realtime subscriptions later (no exotic Postgres extensions that break replication), but the `useRealtimeChannel` hook + subscriptions are RT-01 (Phase 2).
- **Action button handlers are NOT Phase 1.** The `pricing_recs.status` enum-like column lands now so Phase 2's lifecycle handlers (INT-06) have somewhere to write. Phase 1 inserts rows with `status='pending'` or directly `status='accepted'` in seed; the UI renders them but does not yet TRANSITION them.

</code_context>

<specifics>
## Specific Ideas

- **"Just take the recommendation"** was the user's signal on multiple gray areas — they trust technical defaults that align with PROJECT.md / REQUIREMENTS.md / Pitfalls. The decisions captured above ARE the recommendations; planner doesn't need to re-litigate them.
- **"Best for prod"** was the user's framing for module API shape — read as: optimize for long-term codebase health over 36-hour-sprint expedience. Async typed functions backed by generated `Database` types is the prod-correct call.
- **n8n workspace specifics:** `fyi-media.app.n8n.cloud`, Pricing workflow ID `gIcYI8N1i1ljtCnW`. Schema designed in Phase 1 must accept that workflow's writes (planner coordinates with the n8n flow's output schema during research).
- **Supabase project specifics:** `aqsitrzbjokkkpcohple` (per ROADMAP.md success criterion 1). Creds in `.env.local` and in Vercel project env.

</specifics>

<deferred>
## Deferred Ideas

### Phase 4 (Guest Agent)
- **pgvector extension + HNSW index + `match_knowledge_for_property(property_id, query_embedding, k)` RPC** — DATA-02 moved to Phase 4 per REQUIREMENTS.md traceability. Phase 1 creates the `knowledge_chunks` table skeleton (`property_id` FK, basic columns) but does NOT install pgvector or build the index/RPC.
- **Bookings detail + Guest/Ops/SOP agent detail page migrations** — `bookings.ts` data module exists from Phase 1 (it's one of the eight), but the page that consumes it migrates in Phase 4 (per REQUIREMENTS.md DATA-06 phasing).
- **Per-language CSS `:lang(...)` font stacks** for guest messages — Phase 4 (UI-02, Pitfall 12).

### Phase 5 (Pre-Cutover Verification + Polish)
- **ESLint mock-data guard** — DATA-05; the build-time guard that fails on any `@/lib/mock-data` import outside `src/lib/data/`. Not Phase 1; the 36hr sprint relies on visual + grep verification.
- **Hardcoded date sweep** — UI-01 (`src/app/(dashboard)/page.tsx:214`, `src/app/(dashboard)/cleanings/page.tsx:42`).
- **`src/app/(dashboard)/error.tsx` top-level error boundary** — UI-04 (Pitfall 18).
- **SOP Agent row in `agents` table + page parity** — AGENT-04.

### v2 (post-May 15)
- **RSC conversion for Pricing and Pricing Agent detail pages** — V2-PERF-04 (was UI-03; explicitly moved to v2 because client-component pages work fine with realtime). Phase 1 only converts Home.
- **Real Supabase Auth + RLS policies** — V2-AUTH-* + V2-RLS-* (entire auth migration out of milestone).
- **Test framework** — V2-TEST-*.
- **A11y side-sheet roles + focus traps** — V2-A11Y-*.

### None — discussion stayed within phase scope
(All ideas above are already in REQUIREMENTS.md and traceable to their target phase — none surfaced as new "wait but what about X" capabilities during discussion.)

</deferred>

---

*Phase: 1-Data Foundation (36-hour sprint)*
*Context gathered: 2026-05-15*
