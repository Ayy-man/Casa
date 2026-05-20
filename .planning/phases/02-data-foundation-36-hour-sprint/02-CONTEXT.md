# Phase 2: Data Foundation (36-hour sprint) - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

> Supersedes the 2026-05-15 version, which was gathered when Data Foundation was
> Phase 1 — before the Casa 360 Redesign (now Phase 1) restructured the routes.
> This version reconciles every page path against the post-redesign codebase and
> uses the current phase numbering (Redesign 1 · **Data Foundation 2** · Integration 3 ·
> Ops 4 · Guest 5 · Verification 6). Schema / types / env / module decisions
> (D-01–D-11) were unaffected by the redesign and carry forward; D-12–D-14 were
> re-grounded to the new routes and D-15 was added.

<domain>
## Phase Boundary

Phase 2 delivers the Supabase backend that unblocks the integration testbed. Five concrete outcomes, all from ROADMAP.md §"Phase 2" success criteria:

1. **12-table schema deployed** to Supabase project `aqsitrzbjokkkpcohple` via `supabase/migrations/0001_initial_schema.sql` (tables: `properties`, `bookings`, `guests`, `agents`, `agent_runs`, `agent_logs`, `pricing_recs`, `exceptions`, `action_log`, `turnovers`, `claims`, `knowledge_chunks`). `agent_runs.idempotency_key` UNIQUE.
2. **Env + types + cookie correctness** — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` renamed to `NEXT_PUBLIC_SUPABASE_ANON_KEY` across `src/utils/supabase/{client,server,middleware}.ts`; `src/lib/env.ts` Zod validator throws readable errors; `npm run gen:types` produces `src/types/database.types.ts`; `@supabase/ssr` cookie handler validated end-to-end (already uses `getAll`/`setAll`, needs runtime proof).
3. **Eight data modules built** at `src/lib/data/{properties,bookings,agents,agent_runs,agent_logs,pricing_recs,exceptions,action_log}.ts`. The Pricing-Agent path-to-paint pages migrate to read from these modules — see D-12/D-13/D-15 for the exact (post-redesign) page set. Other pages stay on mock imports until their phases land.
4. **Seed mirrors the redesigned narrative mock-data** — 26 real Casa properties, 4 agents (`mode='shadow'`), ~20 `pricing_recs`, ~30 `agent_logs`, ~6 `exceptions`; visual parity with the current (post-redesign) demo skin.
5. **n8n Pricing workflow `gIcYI8N1i1ljtCnW` runs end-to-end** against real Supabase — writes `agent_runs` + `agent_logs` + `pricing_recs` rows that surface on the Pricing Agent detail page on next navigation.

**Post-redesign route reconciliation (the reason this context was re-gathered):**

The Casa 360 Redesign (Phase 1) collapsed 13 routes into a 3-tab IA. The old Phase-2 plan named three migration targets — "Home, Pricing, Pricing Agent detail." Post-redesign there are only **two routes**, plus an in-page surface:

- **Exception Board** = `src/app/(dashboard)/page.tsx` — the home route `/` (unchanged path). Reads `EXCEPTIONS` from `@/lib/mock-data/exceptions` and `PRICING_BASE` from `@/lib/mock-data/pricing`.
- **Pricing Agent detail** = `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` — relocated from `/agents/pricing`. The old path is now a `redirect()` stub.
- The **"Pricing surface"** is no longer a route. The standalone `/pricing` page is a `redirect()` stub to `/`. The Pricing approval workflow is the "Pricing Week of [date]" mega-card + 26-row Approve/Edit/Reject side-sheet that lives **inside** the Exception Board page.

This phase explicitly does **NOT** do: pgvector / HNSW / `match_knowledge_for_property` RPC (Phase 5); ESLint mock-data guard (Phase 6); hardcoded-date sweep (Phase 6); RSC conversion of the Pricing Agent detail page (v2); action-button wiring / three-state lifecycle transitions (Phase 3); HMAC plumbing (Phase 3); realtime subscriptions (Phase 3); At-a-Glance KPI aggregation queries (deferred — see `<deferred>`); migration of the Cleanings/Claims/Vault/Bookings/Guest-Ops-SOP-agent surfaces (Phases 4–5).

</domain>

<decisions>
## Implementation Decisions

> D-01–D-11 carry forward verbatim from the 2026-05-15 discussion — the redesign
> did not touch the data layer, schema, or module API. D-12–D-14 are re-grounded
> to the post-redesign routes; D-15 is new (from the 2026-05-21 discussion).

### Schema scope (0001_initial_schema.sql)

- **D-01:** All 12 tables land in 0001 with primary keys, foreign keys, and the known UNIQUE constraints. Two-tier strategy: structural shells + Phase 2/3 "safety mechanic" columns now; Phase 4–6 columns added in their own migrations.
- **D-02:** Phase 3 "safety mechanic" columns ride along in 0001 because retrofitting them after rows exist is expensive. Concretely:
  - **Idempotency:** `agent_runs.idempotency_key` UNIQUE, `action_log.idempotency_key`
  - **Three-state lifecycle:** `pricing_recs.status` enum-like (`pending`|`accepted`|`dispatched`), `exceptions.state`, `executed_at` timestamp on action-bearing rows
  - **Shadow-mode trio (SAFE-01):** `agents.mode` (`shadow`|`live`), `agent_runs.mode_at_run`, `agent_logs.shadow_mode`
  - **Operator-race (SAFE-04):** `exceptions.claimed_by`, `exceptions.claimed_at`
  - **Stalled-agent watchdog (SAFE-05):** `agent_runs.expected_callback_by`, `agent_runs.status`, `agent_runs.completed_at`
- **D-03:** `knowledge_chunks` table is created in 0001 (so the structural shell exists) but the pgvector extension, HNSW index, embedding column, and `match_knowledge_for_property` RPC are deferred to Phase 5 (Guest Agent — DATA-02) — only the table skeleton with `property_id` FK lands now. Acceptable to leave it empty/minimal.
- **D-04:** Later-phase columns NOT in 0001: `turnovers.whatsapp_thread` JSONB, `turnovers.dispatch_state` enum (Phase 4), `agent_logs.kb_chunks_used[]` (Phase 5), claim-specific JSON blobs, etc. Each phase's first migration adds its columns.

### Migration tooling & seed

- **D-05:** Planner produces `.sql` files in `supabase/migrations/*.sql` (versioned in repo). User runs them manually against the hosted Supabase project — via Studio SQL editor or `supabase db push` at user's discretion. No CLI dependency on the build path. Schema is replayable from repo files even though execution is manual.
- **D-06:** Seed mirrors the **redesigned narrative mock-data** in `src/lib/mock-data/*.ts` 1:1 — the 26 real Vancouver property names/addresses/owners from the post-Phase-1 `properties.ts`, pricing decisions matching `PRICING_BASE`, ~30 `agent_logs` rows that look like real Pricing-Agent output, ~6 `exceptions` matching the current `EXCEPTIONS` array (the 7 anchor exception cards and the rest). Visual parity is the QA bar: "does the screen match what it showed yesterday?" (NB: the mock-data *content* was rewritten in Phase 1 — the *files* are the same; seed the new content, not the old demo content.)
- **D-07:** Seed file placement is planner discretion (e.g., `supabase/migrations/0002_seed.sql`, or `supabase/seed.sql` if Supabase CLI's seed conventions are followed). Keep schema and seed in separate files so the migration is replayable independent of seed.

### `src/lib/data/*` module API

- **D-08:** Each of the 8 modules exports **async functions returning rows typed from generated `src/types/database.types.ts`**. Examples: `getExceptions()`, `getPricingRecs({ weekStart })`, `getAgent(key)`, `getAgentLogs({ agentKey, limit })`, `getProperty(id)`, `listProperties()`, `getAgentRuns({ agentKey })`, `getActionLog({ entityType, entityId })`.
- **D-09:** Functions are **isomorphic** — callable from RSC and from client code. No `'server-only'` marker. Browser client (`src/utils/supabase/client.ts`) vs server client (`src/utils/supabase/server.ts`) is selected inside each function based on execution context, or via an injected client param — planner picks the precise mechanism.
- **D-10:** **Type source of truth** is `Database['public']['Tables']['<table>']['Row']` from generated types. No `as any` widening. Modules MAY also export camelCase view types and a mapper if the rows leaving the module need to match existing TS conventions in the codebase (DB columns are `snake_case`, app code is `camelCase`).
- **D-11:** Module names are **fixed** by DATA-06: `properties.ts`, `bookings.ts`, `agents.ts`, `agent_runs.ts`, `agent_logs.ts`, `pricing_recs.ts`, `exceptions.ts`, `action_log.ts`. Eight files, no more, no less, this phase. (Phase 4 adds `turnovers.ts`/`claims.ts` for the Ops cleaner-dispatch surfaces; Phase 5 adds the bookings-detail + Guest/Ops/SOP agent-detail page reads.) All 8 are *built* this phase; `bookings.ts` and `action_log.ts` are built but not yet *consumed* by a path-to-paint page until Phases 5 / 3.

### Rendering model & page migration (post-redesign)

- **D-12:** **The Exception Board (`src/app/(dashboard)/page.tsx`) converts to RSC.** The page shell becomes a server component that calls the async data functions directly — `getExceptions()` and `getPricingRecs()` — and passes the data to a client island holding all interactivity. Post-redesign that island is larger than the old "Home" island: it covers the 7 multi-select filter chips, the 4 status pills, the exception-card action buttons + toast, and the "Pricing Week of [date]" mega-card → 26-row side-sheet. Planner picks the island file location (e.g., `src/app/(dashboard)/_exception-board/`). Rationale unchanged: the Exception Board is Carlos's 5–10×/day entry point (Pitfall 13); RSC eliminates skeleton flash and is the first end-to-end exercise of the SSR cookie-handler shape (DATA-08 validation).
- **D-13:** **The Pricing mega-card + 26-row side-sheet** (inside the Exception Board page) migrates its **reads** to `pricing_recs` via `src/lib/data/pricing_recs.ts` this phase — it is the ROADMAP's "Pricing surface." Its Approve/Edit/Reject buttons stay local-state / toast demos until Phase 3 (HMAC + three-state lifecycle). As a stateful surface it is part of the Exception Board's client island, not a server component. **The Pricing Agent detail page (`src/app/(dashboard)/vault/agent-logs/pricing/page.tsx`) stays `"use client"`** — it has heavy local state (9-section scroll nav, mode toggle, property filter); it calls async data functions from a client loader pattern (planner picks: SWR / React Query / `useEffect`+`useState`). Its RSC conversion stays deferred to v2 (V2-PERF-04, opportunistic).
- **D-14:** The math-generated arrays on the Pricing Agent detail page (`src/app/(dashboard)/vault/agent-logs/pricing/page.tsx`) are **deleted** and replaced with real reads: the 30-row `DECISIONS` array (lines ~41–61, `Math.sin`-generated) and the 12-row `ACTIVITY` feed (lines ~27–39, derived from `PROPERTIES.slice`) → `getAgentLogs()` / `getPricingRecs()`. The "Flagged" vs "Logged" status becomes `shadow_mode` + lifecycle-status driven (CONCERNS.md "Pricing Decisions Table Uses Math-Generated Data" — closed for the Pricing Agent by this phase).
- **D-15:** **Pricing Agent detail migration depth = Decisions table + Activity feed only** (2026-05-21 decision). Both decision-history sections read `agent_logs` / `pricing_recs` for the Pricing agent so a Studio-inserted `agent_logs` row appears in two places (ROADMAP criterion 4) and the n8n run trace surfaces (ROADMAP criterion 5). The **At-a-Glance KPI tiles** (`KPIS`, lines ~63–70), **Performance**, **Validation**, and **Properties** sections stay mock/math this phase — Performance/Validation/Properties need historical + PriceLabs-comparison data the seed will not have. At-a-Glance KPI aggregation is explicitly deferred (see `<deferred>`).

### Claude's Discretion

The user said "whatever is best for prod" / "just take the recommendation" on most gray areas (2026-05-15), and on 2026-05-21 elected not to discuss Exception Board rendering, Pricing side-sheet scope, or seed fidelity — accepting the recommendations carried into D-06/D-12/D-13. Researcher and planner have judgment within the constraints above on:

- Exact column types (text vs varchar, timestamp vs timestamptz, numeric precision for rates) — pick Postgres-idiomatic defaults; document choices in the migration comments.
- Default values for safety columns (`agents.mode DEFAULT 'shadow'`, `pricing_recs.status DEFAULT 'pending'`, etc.) — pick the conservative default for each.
- Whether seed lives in `supabase/migrations/0002_seed.sql` or `supabase/seed.sql`.
- Whether the seed includes 1–2 sample `agent_runs` rows so the Decisions/Activity feed renders before the first n8n run, or `agent_runs` is left for n8n to populate first (in which case the feed must render a graceful empty state) — planner decides.
- Whether `src/lib/data/*` functions accept an injected Supabase client or call `createClient()` internally.
- Whether `database.types.ts` regeneration is wired only to `npm run gen:types` (manual) or also to a pre-commit / pre-build hook — manual is sufficient.
- Migration file naming convention beyond `0001_initial_schema.sql`.
- How the `snake_case` ↔ `camelCase` mapper layer is structured (per-module helpers, shared `mapRow()`, or camelCase view types).
- The Exception Board client-island boundary and file location (D-12).
- The client data-loader pattern for the Pricing Agent detail page (D-13).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

> ⚠️ **Codebase maps are stale.** `.planning/codebase/*.md` were last updated
> 2026-05-18 — before the Casa 360 Redesign executed. `STRUCTURE.md` in
> particular still describes the pre-redesign 13-route layout. For the live
> route/page structure, trust the actual `src/app/` tree (and `01-CONTEXT.md`),
> not `STRUCTURE.md`.

### Milestone framing & locked decisions
- `.planning/PROJECT.md` — Casa milestone framing, 12-table architectural commitment, three API-route families (`/api/cron/*`, `/api/actions/*`, `/api/webhooks/*`), `NEXT_PUBLIC_WORKSPACE_NAME` future-proofing, hardcoded auth this milestone, Pricing Agent as integration validation target. (Updated 2026-05-20 — Phase 1 redesign reflected in Validated section.)
- `.planning/REQUIREMENTS.md` — DATA-01/03/04/06/07/08 success criteria (Phase 2 scope). NB: the REQUIREMENTS.md traceability table (last updated 2026-05-14) predates the redesign renumber — it lists DATA-02 as "Phase 4" and DATA-05 as "Phase 5"; under current numbering those are **Phase 5** (Guest) and **Phase 6** (Verification). ROADMAP.md is authoritative for phase numbers.
- `.planning/ROADMAP.md` §"Phase 2: Data Foundation (36-hour sprint)" — five numbered success criteria; the 2026-05-20 re-sequencing note.
- `.planning/STATE.md` — last-session context; deadline framing; n8n Pricing workflow `gIcYI8N1i1ljtCnW` built and mock-validated.
- `.planning/phases/01-casa-360-redesign/01-CONTEXT.md` — the Phase 1 redesign decisions: the post-redesign route hierarchy, legacy-route `redirect()` stubs, the Pricing-mega-card folding, narrative mock-data rewrite. Read this to understand the routes Phase 2 migrates into.

### Pitfalls research (mandatory)
- `.planning/research/PITFALLS.md` — "Critical Pitfalls" relevant to Phase 2 work:
  - **Pitfall 1** (mock-data leak) — addressed by `src/lib/data/*` abstraction landing before page migrations
  - **Pitfall 2** (@supabase/ssr cookie handler shape + env var name) — Phase 2 day-1 work
  - **Pitfall 3** (idempotency keys) — `agent_runs.idempotency_key` UNIQUE from day one (D-02)
  - **Pitfall 4** (optimistic UI) — `pricing_recs.status` three-state column exists in 0001 even though Phase 3 wires the transitions
  - **Pitfall 6** (silent callback failure) — `agent_runs.expected_callback_by` column lands in 0001
  - **Pitfall 9** (mode toggle gating) — per-agent `agents.mode` + `mode_at_run` snapshot + `shadow_mode` flag in 0001
  - **Pitfall 10** (realtime memory leak) — not Phase 2, but tables must support filtered subscriptions (Phase 3)
  - **Pitfall 11** (TypeScript type drift) — `npm run gen:types` script + regenerate after every migration
  - **Pitfall 13** (all-`"use client"` pages) — the Exception Board converts to RSC (D-12)
  - Pitfalls 5, 7, 8, 12, 14, 15 — not Phase 2 scope; tracked for later phases
- `.planning/research/PITFALLS.md` §"Looks Done But Isn't" Checklist — Phase 2 items: mock-data layer abstraction (item 1), env var canonical (item 2), cookie handler validated (item 3), webhook secrets server-side only (item 17).

### Research context (background)
- `.planning/research/ARCHITECTURE.md` — Casa ↔ Supabase ↔ n8n high-level architecture.
- `.planning/research/FEATURES.md` — feature/requirements landscape.
- `.planning/research/SUMMARY.md` — research roll-up.
- `.planning/research/STACK.md` — stack-level research notes.

### Codebase inventory (stale — see warning above)
- `.planning/codebase/STACK.md` — pinned versions: Next.js 14.2.18, React 18.3.1, TypeScript 5.x, Tailwind 3.4.14, `@supabase/ssr` 0.10.3, `@supabase/supabase-js` 2.105.4. `date-fns@^3.6.0` was added in Phase 1. New deps this phase: `zod@^3.23.8`, `nanoid@^5.0.7`.
- `.planning/codebase/STRUCTURE.md` — pre-redesign layout; use the live `src/app/` tree instead for routes.
- `.planning/codebase/ARCHITECTURE.md` — layer responsibilities (Auth, Mock Data, Supabase SSR, Components, Styling).
- `.planning/codebase/CONCERNS.md` — "Supabase Environment Variables Use Non-Standard Key Name," "Mock-Data Boundary Has No Enforcement Layer," "All Pages Are Client Components Without Need," "Pricing Decisions Table Uses Math-Generated Data" — all directly relevant to Phase 2 work.
- `.planning/codebase/INTEGRATIONS.md` — Supabase SSR scaffolding state.
- `.planning/codebase/CONVENTIONS.md` — TS conventions: `type` not `interface`, `as const` literal arrays, path alias `@/*`, camelCase locals + SCREAMING_SNAKE_CASE module-level arrays.
- `.planning/codebase/TESTING.md` — no test framework this milestone (per PROJECT.md Out of Scope).

### Brand + design (binding for any UI surface)
- `PRODUCT.md` — brand voice, UX rules, anti-references (no Hostaway/Lodgify/PriceLabs/Guesty UI patterns).
- `DESIGN.md` — design system tokens, typography, color, corner radius, animations.

### Source files Phase 2 directly modifies
- `src/utils/supabase/client.ts` — env var rename
- `src/utils/supabase/server.ts` — env var rename; cookie handler already `getAll`/`setAll` (validate end-to-end)
- `src/utils/supabase/middleware.ts` — env var rename
- `.env.local` — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/app/(dashboard)/page.tsx` — Exception Board; converts to RSC server-shell + client island (D-12); swaps `EXCEPTIONS` / `PRICING_BASE` mock imports for `src/lib/data/{exceptions,pricing_recs}` reads
- `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` — Pricing Agent detail; stays `"use client"`; replaces math-generated `DECISIONS` (lines ~41–61) and `ACTIVITY` (lines ~27–39) with `getAgentLogs()` / `getPricingRecs()` reads (D-14/D-15); `KPIS` / Performance / Validation / Properties stay mock
- `src/lib/mock-data/{properties,exceptions,pricing,agents,cleanings}.ts` — source of seed data (mirror the narrative content 1:1)
- `package.json` — add `gen:types` script + `zod`, `nanoid` deps

  *Not modified:* the legacy `redirect()` stubs `src/app/(dashboard)/pricing/page.tsx` and `src/app/(dashboard)/agents/pricing/page.tsx` — leave them as-is.

### Source files Phase 2 creates
- `supabase/migrations/0001_initial_schema.sql` — 12 tables + safety-mechanic columns
- `supabase/migrations/0002_seed.sql` (or `supabase/seed.sql`) — narrative-mock-mirror seed data
- `src/types/database.types.ts` — generated; committed
- `src/lib/env.ts` — Zod validator throwing readable errors on missing env vars
- `src/lib/data/properties.ts`, `bookings.ts`, `agents.ts`, `agent_runs.ts`, `agent_logs.ts`, `pricing_recs.ts`, `exceptions.ts`, `action_log.ts` — 8 data modules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/utils/supabase/{client,server,middleware}.ts`** — Supabase SSR clients already scaffolded. Server + middleware already use the correct `getAll`/`setAll` cookie shape (good — DATA-08 just needs runtime validation, not a rewrite). Three files just need the env var name rename.
- **`src/lib/mock-data/{properties,exceptions,pricing,agents,cleanings}.ts`** — the TypeScript source of truth for seed data, rewritten to narrative content in Phase 1. Planner reads them to compose the `0002_seed.sql` inserts. Pure rendering helpers in these files (`getProperty(id)`, `formatDate(...)`, `channelClass(...)`, `modeClass(...)`, `modeLabel(...)`, `changeClass(...)`) stay where they are — they are not data and are not migrated.
- **`src/components/casa/sparkline.tsx`** — pure SVG renderer, no hooks; consumed by Pricing Agent detail. No changes needed.
- **`src/components/casa/exception-card.tsx`** — the narrative exception card the Exception Board renders. Consumes exception fields; will receive rows shaped from `src/lib/data/exceptions.ts` instead of mock `EXCEPTIONS`. No structural change, just the data source.
- **`src/lib/utils.ts`** — `cn()` Tailwind merger helper, leave alone.
- **`src/lib/auth/context.tsx`** — fake auth + `useRole()` hook (Phase 1). NOT replaced this milestone (PROJECT.md: Out of Scope). Pages keep using `useAuth()` / `useRole()`.

### Established Patterns
- **TypeScript conventions** (`.planning/codebase/CONVENTIONS.md`): `type` not `interface`; union types for constrained strings; `as const` for literal arrays; path alias `@/*`; camelCase locals; SCREAMING_SNAKE_CASE module-level arrays. Generated `Database` type lives at `src/types/database.types.ts`.
- **Naming patterns**: route pages are `page.tsx`; shared components `kebab-case.tsx`; mock-data files `kebab-case.ts`. New data modules at `src/lib/data/*.ts` follow the same naming — the underscored ones (`agent_runs.ts`, `agent_logs.ts`, `pricing_recs.ts`, `action_log.ts`) mirror table names exactly per DATA-06; keep that mismatch since DATA-06 dictates it.
- **Page rendering model**: post-Phase-1, every `page.tsx` is still `"use client"` (the redesign did not introduce RSC). The Exception Board becomes the first RSC exception (D-12). The RSC-shell + client-island pattern is not yet established in this codebase — the planner is establishing it.
- **Component classes vs Tailwind utilities**: design-system primitives live as `@layer components` in `src/app/globals.css` (`.ex-card`, `.kpi-card`, `.btn-sm-primary`, `.urgency-pill`, `.filter-chip`, `.sheet`, etc.). No new component classes needed in Phase 2 — this is a data-layer phase, not a UI phase.
- **Postgres snake_case ↔ TS camelCase**: generated types are `snake_case`; the codebase is `camelCase`. Mapper convention not yet established — planner picks the lightest approach (D-10).

### Integration Points
- **Env var resolution chain**: `.env.local` → `process.env.NEXT_PUBLIC_*` → consumed by `src/utils/supabase/{client,server,middleware}.ts`. The Zod validator in `src/lib/env.ts` must run at module load on the server side so missing/misnamed env vars fail loud at startup, not silently `undefined` at request time.
- **n8n Pricing workflow `gIcYI8N1i1ljtCnW`** writes to `agent_runs`, `agent_logs`, `pricing_recs`. The Phase 2 column shape for these three tables must accept what n8n's writes look like; coordinating the exact write shape with the n8n flow's output schema is a planner/research task. (Workspace: `fyi-media.app.n8n.cloud`.)
- **The Exception Board now reads two data domains** — `exceptions` (the narrative cards) and `pricing_recs` (the "Pricing Week of" mega-card + side-sheet). Migrating it touches `src/lib/data/exceptions.ts` and `src/lib/data/pricing_recs.ts`. The RSC shell fetches both.
- **Realtime is NOT Phase 2.** Tables must SUPPORT realtime subscriptions later (no exotic Postgres extensions that break replication), but `useRealtimeChannel` + subscriptions are Phase 3.
- **Action-button handlers are NOT Phase 2.** The `pricing_recs.status` enum-like column lands now so Phase 3's lifecycle handlers have somewhere to write. Phase 2 inserts rows with `status='pending'` / `status='accepted'` in seed; the UI renders them but does not yet TRANSITION them.

</code_context>

<specifics>
## Specific Ideas

- **Pricing Agent detail depth (2026-05-21):** the user picked "Decisions + Activity feed" and pre-resolved a sub-question — the At-a-Glance KPI aggregation work is deferred (see `<deferred>`). Their spec for that deferred work: "6 aggregation queries against `agent_logs` filtered by the pricing agent + time window; a single Supabase RPC returns all 6 in one call; ~2-hour task."
- **"Just take the recommendation" / "best for prod"** remained the user's posture — they trust technical defaults aligned with PROJECT.md / REQUIREMENTS.md / Pitfalls and declined to re-litigate carried-forward decisions. The decisions above ARE the recommendations.
- **n8n workspace specifics:** `fyi-media.app.n8n.cloud`, Pricing workflow ID `gIcYI8N1i1ljtCnW`. The schema must accept that workflow's writes.
- **Supabase project specifics:** `aqsitrzbjokkkpcohple` (ROADMAP criterion 1). Creds in `.env.local` and Vercel project env.

</specifics>

<deferred>
## Deferred Ideas

### Phase 3 (Integration Contracts + Pricing Agent)
- **Action-button wiring, three-state lifecycle transitions, HMAC plumbing, realtime subscriptions** — Phase 2 lands the *columns* (`pricing_recs.status`, `agent_runs.idempotency_key`, etc.) and the *reads*; Phase 3 wires the writes/transitions. The Pricing mega-card side-sheet's Approve/Edit/Reject buttons stay demos until then (D-13).

### Phase 5 (Guest Agent)
- **pgvector extension + HNSW index + `match_knowledge_for_property(property_id, query_embedding, k)` RPC** — DATA-02. Phase 2 creates only the `knowledge_chunks` table skeleton (D-03).
- **Bookings detail + Guest/Ops/SOP agent-detail page migrations** — `bookings.ts` data module is built in Phase 2 (one of the 8); the page that consumes it migrates in Phase 5.
- **Per-language CSS `:lang(...)` font stacks** for guest messages — UI-02, Pitfall 12.

### Phase 6 (Pre-Cutover Verification + SOP Scaffold + Polish)
- **Pricing Agent detail At-a-Glance KPI aggregation (2026-05-21 decision)** — the 6 KPI tiles (Actions Today, Actions This Week, Success Rate, Exception Rate, Tokens MTD, Cost MTD) stay mock through Phase 2. The deferred work: 6 aggregation queries against `agent_logs` filtered by the pricing agent + a time window, returned via a single Supabase RPC; ~2-hour task. The user described this as "Phase 5 polish backlog" — under the post-redesign renumbering the milestone's polish phase is **Phase 6**; placed here, flag for the user to confirm if they meant otherwise.
- **ESLint mock-data guard** — DATA-05; the build-time guard that fails on any `@/lib/mock-data` import outside `src/lib/data/`. Not Phase 2; the 36hr sprint relies on visual + grep verification.
- **Hardcoded date sweep** — UI-01.
- **`src/app/(dashboard)/error.tsx` top-level error boundary** — UI-04, Pitfall 18.
- **SOP Agent row in `agents` table + page parity** — AGENT-04.

### v2 (post-cutover)
- **RSC conversion for the Pricing Agent detail page** — V2-PERF-04. Phase 2 only converts the Exception Board (D-12/D-13).
- **Real Supabase Auth + RLS policies** — entire auth migration out of milestone.
- **Test framework** — V2-TEST-*.
- **A11y side-sheet roles + focus traps** — V2-A11Y-*.

### Not folded — no new capabilities surfaced
The 2026-05-21 re-discussion stayed within phase scope. The only new item is the KPI-aggregation deferral above; everything else is a path/numbering reconciliation of decisions that already existed.

</deferred>

---

*Phase: 2-Data Foundation (36-hour sprint)*
*Context gathered: 2026-05-21 (re-discussion after the Casa 360 Redesign; supersedes the 2026-05-15 version)*
