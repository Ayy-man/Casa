# Phase 2: Data Foundation (36-hour sprint) - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 18 (5 created + standalone migrations/types/env, 8 data modules, 6 modified source files)
**Analogs found:** 12 / 18 (6 are net-new patterns with no analog)

> **Read order for the planner:** This phase has two "no-analog" patterns the planner
> is *establishing*, not copying — the `supabase/migrations/*.sql` SQL convention and
> the RSC server-shell + client-island split (D-12). Both are flagged in
> `## No Analog Found`. Everything else copies an existing in-repo pattern.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `supabase/migrations/0001_initial_schema.sql` | migration | transform (DDL) | — none — | no analog |
| `supabase/migrations/0002_seed.sql` | migration | batch insert | `src/lib/mock-data/{properties,exceptions,pricing,agents}.ts` | data-source-match |
| `src/types/database.types.ts` | model (generated) | — | — none — (tool-generated) | no analog |
| `src/lib/env.ts` | config | request-response (boot guard) | `src/utils/supabase/client.ts` (env read) + `src/lib/utils.ts` (single-export util) | partial |
| `src/lib/data/properties.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/properties.ts` | role-match |
| `src/lib/data/bookings.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/bookings.ts` | role-match |
| `src/lib/data/agents.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/agents.ts` | role-match |
| `src/lib/data/agent_runs.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/bookings.ts` (list+filter shape) | role-match |
| `src/lib/data/agent_logs.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/agent-detail.ts` (`activity`/`decisions` rows) | role-match |
| `src/lib/data/pricing_recs.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/pricing.ts` | role-match |
| `src/lib/data/exceptions.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/exceptions.ts` | role-match |
| `src/lib/data/action_log.ts` | service (data module) | CRUD (read) | `src/lib/mock-data/bookings.ts` (filtered list shape) | role-match |
| `src/utils/supabase/client.ts` | config (client factory) | request-response | itself (env-var rename only) | self |
| `src/utils/supabase/server.ts` | config (client factory) | request-response | itself (env-var rename only) | self |
| `src/utils/supabase/middleware.ts` | config (client factory) | request-response | itself (env-var rename only) | self |
| `.env.local` | config | — | itself (key rename only) | self |
| `src/app/(dashboard)/page.tsx` | route (RSC shell + island) | request-response | — no RSC analog — (diverges from current `"use client"` page) | no analog |
| `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` | route (client page) | request-response | itself (stays `"use client"`; arrays swapped for reads) | self |
| `package.json` | config | — | itself (add script + 2 deps) | self |

---

## Pattern Assignments

### `src/lib/data/*.ts` — the 8 data modules (service, CRUD-read)

**Analog:** `src/lib/mock-data/{properties,bookings,agents,exceptions,pricing}.ts`

These modules **replace the mock-data files as the import seam**. They are NOT structural
clones — mock-data files are sync constant arrays; data modules are async Supabase reads
(D-08, D-09). But they MUST preserve the mock-data **export style and helper-fn naming**
so page diffs stay minimal.

**What carries over from the mock-data analogs (copy these conventions):**

1. **Named exports, no default export.** Every mock-data file uses
   `export type X = ...` + `export const X = ...` + `export const getX = ...`.
   See `properties.ts:1`, `:3`, `:29`, `:61`. Data modules do the same — but the
   data getter becomes `async`.

2. **Helper-function naming is already established** — preserve the exact names the
   pages already call so D-08's function list maps 1:1:
   - `getProperty(id)` — `properties.ts:61` → `data/properties.ts` keeps `getProperty(id)`, adds `listProperties()`
   - `getBooking(id)` — `bookings.ts:47` → `data/bookings.ts` keeps `getBooking(id)`
   - D-08's full target list: `getExceptions()`, `getPricingRecs({ weekStart })`,
     `getAgent(key)`, `getAgentLogs({ agentKey, limit })`, `getProperty(id)`,
     `listProperties()`, `getAgentRuns({ agentKey })`, `getActionLog({ entityType, entityId })`.

3. **Pure rendering helpers STAY in mock-data — do NOT move them.** `channelClass`,
   `channelLabel`, `statusClass`, `statusLabel`, `formatDate` (`bookings.ts:36-45`),
   `changeClass` (`pricing.ts:38`), `modeClass`, `modeLabel` (`agents.ts:22-24`),
   `propertyImg` (`properties.ts:58`), `URGENCY_RANK` (`exceptions.ts:337`). These are
   view logic, not data (per CONTEXT `<code_context>` Reusable Assets). The pages keep
   importing them from `@/lib/mock-data/*`.

**Type source of truth (D-10):** rows are typed from generated
`Database['public']['Tables']['<table>']['Row']` in `src/types/database.types.ts`. No
`as any`. The DB is `snake_case`; existing app types (`exceptions.ts:18-51` `ExceptionItem`,
`pricing.ts:1-7` `PricingRow`, `properties.ts:3-18` `Property`) are `camelCase`. A module
MAY export a camelCase view type + `mapRow()` mapper if rows leaving the module must match
those existing shapes — planner picks per-module helper vs shared `mapRow()` (D-10).

**Supabase client selection (D-09 — isomorphic, no `'server-only'`):** each function
picks the browser client (`src/utils/supabase/client.ts`) or server client
(`src/utils/supabase/server.ts`) by execution context, or takes an injected client
param. Planner picks the exact mechanism. Note the asymmetry in the existing factories
— `client.ts` `createClient()` takes no args; `server.ts` `createClient(cookieStore)`
**requires** an `Awaited<ReturnType<typeof cookies>>` arg (`server.ts:7`). An injected-client
param sidesteps this; an internal-`createClient()` call must branch and supply the
cookie store on the server path.

**Module-name convention (DATA-06, fixed):** `agent_runs.ts`, `agent_logs.ts`,
`pricing_recs.ts`, `action_log.ts` use underscores to mirror table names exactly. This
intentionally breaks the repo's `kebab-case.ts` mock-data file convention — keep the
mismatch, DATA-06 dictates it (CONTEXT `<code_context>` Established Patterns).

**Reference query shape — list + filter (copy this pattern):**
`bookings.ts:47` shows the list-then-`.find` shape; the async equivalent is a Supabase
`.select()` + `.eq()` filter. `getAgentLogs({ agentKey, limit })` and
`getActionLog({ entityType, entityId })` take an **options object**, matching D-08's
signatures — not positional args.

**Build-but-don't-consume (D-11):** all 8 modules are built this phase, but
`bookings.ts` and `action_log.ts` have no path-to-paint consumer until Phases 5 / 3.
Still build them to the same standard.

---

### `src/lib/env.ts` — Zod env validator (config, boot guard)

**Analog (partial):** `src/utils/supabase/client.ts:3-4` (the env-var read it replaces) +
`src/lib/utils.ts` (the single-purpose, single-export `src/lib/` utility shape).

**Current anti-pattern this file fixes** (`client.ts:3-6`, `server.ts:4-5`,
`middleware.ts:4-5`): env vars are read with `process.env.NEXT_PUBLIC_*` and asserted
with non-null `!` at call sites — `createBrowserClient(supabaseUrl!, supabaseKey!)`. A
missing/misnamed var is silently `undefined` until a request fails. This is CONCERNS.md
"Supabase Environment Variables Use Non-Standard Key Name" + Pitfall 2.

**Pattern to establish:** a Zod schema parsed at module load that throws a readable
error naming the missing var. Per CONTEXT `<integration_points>` it must run server-side
at module load so misconfiguration fails loud at startup, not at request time.

**Convention to copy from `src/lib/utils.ts`:**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
`src/lib/` utilities are tiny, named-export, single-purpose. `env.ts` follows suit —
export a parsed/validated `env` object (and/or typed getters), no default export.

**TypeScript conventions (CLAUDE.md / CONVENTIONS.md):** `type` not `interface`;
infer the env type from the Zod schema (`z.infer<typeof schema>`); `@/*` path alias for
any cross-module import. `zod@^3.23.8` is added to `package.json` this phase.

---

### `src/utils/supabase/{client,server,middleware}.ts` — env-var rename only

**Analog:** the files themselves. **No structural change.** Per CONTEXT
`<code_context>` Reusable Assets: the cookie handler is already correct — `server.ts`
and `middleware.ts` already use the `getAll`/`setAll` shape (`server.ts:9-24`,
`middleware.ts:17-28`). DATA-08 needs **runtime proof**, not a rewrite.

**The only edit — rename the env var** in all three files:
- `client.ts:4` — `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `..._ANON_KEY`
- `server.ts:5` — same rename
- `middleware.ts:5` — same rename

Current `server.ts` cookie handler (already correct — leave it, just confirm it works
end-to-end against real Supabase):
```typescript
cookies: {
  getAll() {
    return cookieStore.getAll();
  },
  setAll(cookiesToSet) {
    try {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options),
      );
    } catch {
      // The `setAll` method was called from a Server Component.
    }
  },
},
```

**Consider routing these through `src/lib/env.ts`** so the `!` non-null assertions
(`client.ts:6`, `server.ts:8`, `middleware.ts:14`) are replaced by a validated `env`
object — planner's call, but it closes the Pitfall-2 loop in one move.

`.env.local` gets the matching key rename: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` →
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. (`NEXT_PUBLIC_SUPABASE_URL` is unchanged.)

---

### `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` — Pricing Agent detail (route, stays `"use client"`)

**Analog:** the file itself — it **stays `"use client"`** (D-13; heavy local state:
9-section scroll nav `SECTIONS:15-25`, `agentActive`/`mode`/`filterProp` `:73-75`).
RSC conversion is deferred to v2.

**What changes — delete the math-generated arrays, replace with real reads (D-14/D-15):**

- **`ACTIVITY`** (`page.tsx:27-39`) — currently `PROPERTIES.slice(0,12).map(...)` with
  index-derived times/costs. **Delete.** Replace with `getAgentLogs({ agentKey: "pricing", limit: 12 })`.
- **`DECISIONS`** (`page.tsx:41-61`) — currently `Array.from({length:30})` with
  `Math.sin(i*1.7)`-generated `change` values. **Delete.** Replace with
  `getAgentLogs()` / `getPricingRecs()` for the pricing agent.

**Migration depth is exactly Decisions + Activity (D-15) — do NOT touch the rest:**
- `KPIS` (`page.tsx:63-70`) — stays mock/`as const`.
- `SuccessChart` / `ExceptionsChart` (`page.tsx:614-687`) — stay math.
- Property Breakdown section (`page.tsx:400-447`, `Math.cos`-generated) — stays math.
- Shadow Mode Validation (`page.tsx:449-523`, hardcoded PriceLabs arrays) — stays mock.

**Status semantics change (D-14):** the `"Flagged"` vs `"Logged"` status (currently
`i % 7 === 3 ? "Flagged" : "Logged"` at `page.tsx:58`, rendered at `:384-390`) becomes
driven by real `shadow_mode` + lifecycle-status columns from the row.

**Client data-loader pattern (D-13 — planner picks):** since the page stays `"use client"`,
it needs a client-side async loader for the data-module calls — `useEffect`+`useState`,
SWR, or React Query. The repo currently has **none of these wired** — `agents/page.tsx`
and every other page is sync mock import. The page already uses `useMemo` over the
synchronous array (`page.tsx:77-83`); the loader must feed that memo a fetched array and
handle the loading state. The seed may include 1-2 sample `agent_runs` rows or leave the
feed empty — if empty, the table needs a graceful empty state (Claude's Discretion).

**Preserve these imports — they are view helpers, not data:** `modeClass`, `modeLabel`,
`PROMPT_VERSIONS` from `@/lib/mock-data/agents` (`page.tsx:11`); `changeClass` from
`@/lib/mock-data/pricing` (`page.tsx:12`); `Sparkline` from `@/components/casa/sparkline`
(`page.tsx:13`). `PROPERTIES` (`page.tsx:10`) stays for the still-mock sections
(Breakdown, Validation, the property filter `<select>` at `:324-328`).

---

### `src/lib/data/pricing_recs.ts` & `exceptions.ts` — the Exception Board's two read domains

**Analogs:** `src/lib/mock-data/pricing.ts` (`PricingRow` type `:1-7`, `PRICING_BASE`
26-row array `:9-36`) and `src/lib/mock-data/exceptions.ts` (`ExceptionItem` type
`:18-51`, `EXCEPTIONS` 15-row array `:59-335`).

These two modules are on the **critical path** — the RSC Exception Board shell calls
both. Build them first.

- `getExceptions()` returns rows shaped for `ExceptionCard` (`@/components/casa/exception-card`)
  and the `PricingMegaCard` (`page.tsx:554-624`). The current `EXCEPTIONS` array drives
  both — the `pricing_week` typed row (`exceptions.ts:99-115`, `id:3`) renders as the
  mega-card; everything else is a standard card. The component consuming these is
  unchanged — only the data source moves (CONTEXT Reusable Assets: `exception-card.tsx`
  "no structural change, just the data source").
- `getPricingRecs({ weekStart })` returns the 26-row pricing table. `PRICING_BASE`
  (`pricing.ts:9-36`) is the seed content — mirror it 1:1 into `pricing_recs` rows.
  Phase 2 seeds rows with `status='pending'`/`'accepted'`; the UI renders but does not
  transition them (Phase 3).

---

### `package.json` — add script + 2 deps

**Analog:** the file itself. Add to `scripts` (`package.json:5-10`) a `gen:types`
entry — `supabase gen types typescript ... > src/types/database.types.ts` (exact form
is planner's call; manual invocation is sufficient — no pre-commit hook needed).
Add to `dependencies` (`package.json:11-34`): `zod@^3.23.8` and `nanoid@^5.0.7`.
Everything else stays pinned (CLAUDE.md constraint — pinned stack).

---

### `supabase/migrations/0002_seed.sql` — narrative-mirror seed (migration, batch insert)

**Analog (data source, not code shape):** the narrative mock-data files.
Per D-06 the seed mirrors them **1:1**:
- 26 properties → `src/lib/mock-data/properties.ts:29-56` `PROPERTIES` (real Vancouver
  addresses, owners, rates, neighborhoods — all already there).
- 4 agents `mode='shadow'` → `src/lib/mock-data/agents.ts:15-20` `AGENTS`. NB: seed all
  4 as `mode='shadow'` even though `agents.ts` has Ops/SOP as `"Live"` — D-02/CONTEXT
  criterion 4 says `mode='shadow'`.
- ~20 `pricing_recs` → `src/lib/mock-data/pricing.ts:9-36` `PRICING_BASE`.
- ~6 `exceptions` → `src/lib/mock-data/exceptions.ts:59-335` `EXCEPTIONS` (the 7 anchor
  cards + selection of the rest).
- ~30 `agent_logs` → composed to look like real Pricing-Agent output.

**Seed file placement is planner discretion** (D-07): `supabase/migrations/0002_seed.sql`
OR `supabase/seed.sql` — keep schema and seed in **separate files** so the migration is
replayable independent of seed.

---

## Shared Patterns

### TypeScript conventions (apply to every new `.ts` file)
**Source:** CLAUDE.md "Conventions" + `.planning/codebase/CONVENTIONS.md`, visible in
every mock-data file.
- `type` not `interface` for data shapes — `exceptions.ts:18`, `properties.ts:3`.
- Union types for constrained strings — `exceptions.ts:1` `type Urgency = "Critical" | ...`.
- `as const` on literal arrays — `page.tsx:51-59` `FILTER_CHIPS`, `pricing/page.tsx:63-70` `KPIS`.
- `@/*` path alias for all non-relative imports — no `../../` chains. Every page
  import uses it (`page.tsx:5-12`).
- camelCase locals, SCREAMING_SNAKE_CASE module-level data arrays — `PROPERTIES`,
  `EXCEPTIONS`, `PRICING_BASE`, `AGENTS`, `BOOKINGS`.
- Named exports only — no anonymous default export anywhere in `src/lib/`.

### Env-var access
**Source:** to be centralized in `src/lib/env.ts` this phase.
**Apply to:** `src/utils/supabase/{client,server,middleware}.ts` — replace the four
inline `process.env.NEXT_PUBLIC_*` reads + `!` assertions
(`client.ts:3-6`, `server.ts:4-8`, `middleware.ts:4-14`) with the validated `env` object.

### snake_case (DB) ↔ camelCase (app) boundary
**Source:** no convention exists yet — planner establishes it (D-10).
**Apply to:** all 8 `src/lib/data/*` modules. Generated `Database` row types are
`snake_case`; existing app types (`ExceptionItem`, `PricingRow`, `Property`, `Booking`)
are `camelCase`. Pick the lightest approach (per-module mapper helper, shared `mapRow()`,
or exported camelCase view types) and apply it uniformly across all 8 modules.

### Route entrance animation (UI invariant — do not regress)
**Source:** `.route-fade` class, applied on the root `<div>` of every page —
`page.tsx:252`, `pricing/page.tsx:91`.
**Apply to:** the new RSC Exception Board shell and its client island must keep
`.route-fade` on the rendered root so the 220ms entrance is preserved (DESIGN.md binding).

---

## No Analog Found

These patterns have no existing in-repo precedent. The planner is **establishing** them
— use RESEARCH.md / PITFALLS.md and the notes below, not a codebase copy.

| File / Pattern | Role | Data Flow | Reason & Guidance |
|----------------|------|-----------|-------------------|
| `supabase/migrations/0001_initial_schema.sql` | migration | transform (DDL) | No `supabase/` directory exists; no `.sql` file anywhere in the repo. **No SQL convention to copy.** Planner authors raw Postgres DDL: 12 tables, PK/FK, the safety-mechanic columns (D-02), `agent_runs.idempotency_key UNIQUE`. Document column-type choices in SQL comments (Claude's Discretion). Tables must not use extensions that break logical replication (realtime is Phase 3). |
| `supabase/migrations/0002_seed.sql` | migration | batch insert | No `.sql` precedent for the file *shape* — but the *content* mirrors the mock-data files 1:1 (see Pattern Assignments above). The "no analog" is the SQL syntax, not the data. |
| `src/types/database.types.ts` | model | — | Tool-generated by `supabase gen types typescript` — not hand-authored, so no analog by definition. Committed to the repo (Pitfall 11). Regenerate after every migration. |
| `src/app/(dashboard)/page.tsx` → **RSC server-shell + client-island split** | route | request-response | **The single biggest new pattern this phase (D-12).** Every `page.tsx` in the repo today is `"use client"` (`page.tsx:1`, `pricing/page.tsx:1`, all 36 page files) — Pitfall 13. There is **no RSC page and no client-island** in the codebase to copy. The planner establishes: (a) `page.tsx` becomes an `async` server component, drops `"use client"`, calls `getExceptions()` + `getPricingRecs()` directly, awaits both; (b) a new client-island file (planner picks location, e.g. `src/app/(dashboard)/_exception-board/`) holds **everything currently in the `"use client"` body** — the 7 filter chips (`page.tsx:51-80`, `:288-303`), 4 status pills (`:265-285`), exception-card action buttons + toast-with-Undo (`:142-176`, `:305-341`), and the entire Pricing mega-card → 26-row side-sheet (`:115-117`, `:375-544`, plus the `PricingMegaCard` component `:554-624`). The server shell passes fetched data down as props; the island keeps all `useState`/`useEffect`/`useRef`/`useMemo`. **Reference for what to preserve:** the current `page.tsx` IS the spec — its greeting block (`:254-263`), sort comparator (`:96-104`), filter logic (`:63-80`), and status-count math (`:199-207`) all move into the island unchanged; only the data *source* and the server/client boundary change. Keep `.route-fade` on the rendered root. `useAuth()`/`useRole()` (`page.tsx:92-93`) are client-context hooks — they must live in the island, not the server shell. |
| `src/lib/data/` directory | — | — | The directory does not exist. Creating `src/lib/data/` is itself new — it sits beside `src/lib/mock-data/`, `src/lib/auth/`, `src/lib/utils.ts`. No barrel `index.ts` is required by D-11 (8 fixed files); planner may add one mirroring `mock-data/index.ts:1-14` (`export * from "./..."`) or skip it. |
| Client async data-loader (for `vault/agent-logs/pricing/page.tsx`) | — | request-response | D-13 needs a client-side loader (`useEffect`+`useState` / SWR / React Query). The repo has **zero** client data-fetching today — every page is a sync mock import. No SWR/React Query dependency is installed. Planner picks the mechanism; if it picks SWR/React Query, that is a new dependency to add to `package.json` (weigh against the CLAUDE.md "pinned stack" constraint — `useEffect`+`useState` adds no dependency). |

---

## Metadata

**Analog search scope:** `src/lib/mock-data/` (all 17 modules), `src/lib/`,
`src/utils/supabase/`, `src/app/(dashboard)/` (all 36 page files), `src/app/`,
`src/middleware.ts`, repo root (`.env.local`, `package.json`), and confirmed-absent
`supabase/` + `src/types/` + `src/lib/data/` directories.
**Files scanned:** 11 read in full (3 Supabase clients, `utils.ts`, 5 mock-data
modules, 2 modified pages), plus directory listings and `agent-detail.ts` head.
**Pattern extraction date:** 2026-05-21
