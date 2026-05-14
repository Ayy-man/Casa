# Stack Research — Casa ↔ Supabase ↔ n8n Integration

**Domain:** AI-agent supervisor dashboard (Next.js 14 App Router + Supabase Postgres/pgvector/realtime + externally-hosted n8n agent workflows)
**Researched:** 2026-05-14
**Confidence:** HIGH (Supabase, Next.js, pgvector, Zod) · MEDIUM (n8n webhook idempotency patterns, version-specific Supabase realtime quotas)

The Casa demo skin is shipped. The base stack (Next.js 14.2.18 · TypeScript · Tailwind · `@supabase/ssr` 0.10.3 · `@supabase/supabase-js` 2.105.4) is fixed. This file is opinionated about the integration plumbing — what to add, what patterns to use, and what to deliberately not introduce.

---

## Recommended Stack

### Core Technologies (already installed — keep and use)

| Technology | Pinned Version | Purpose | Why Recommended |
|------------|----------------|---------|-----------------|
| `next` | **14.2.18** (current install) | App Router host for dashboard + Route Handlers (webhook receivers) | Already in use; App Router gives RSC + Server Actions + Route Handlers in one framework. No reason to upgrade to 15 mid-milestone — App Router APIs used here are stable across 14.2 → 15. |
| `react` / `react-dom` | **18.3.1** | UI runtime | Pinned to match Next 14.2; do not upgrade to React 19 until Next 15. |
| `@supabase/ssr` | **0.10.3** (latest stable on npm, May 2026) | Cookie-based Supabase clients for App Router (browser, server, middleware) | Already installed at this version. v0.10.x is the recommended modern API: `getAll`/`setAll` cookies pattern; cache headers piped through `setAll` so CDN never caches authed responses. **Stay on 0.10.3; this is still the latest published 0.x and the package is feature-stable.** |
| `@supabase/supabase-js` | **2.105.4** | DB queries, realtime, RPC, auth primitives | Already installed. 2.105.x is the current line. Peer-compatible with `@supabase/ssr` 0.10.x. |

### Supporting Libraries (add as part of this milestone)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | **^3.23.8** | Schema validation for n8n → Casa webhook payloads, Server Action inputs, env-var validation at boot | Wrap every inbound webhook body in a Zod `safeParse`; share the same schema type with the TypeScript types Casa uses internally. **Do NOT jump to Zod 4 mid-milestone** — 3.23 is the de-facto stable in the ecosystem and aligns with `@hookform/resolvers` and most CMS examples. |
| `nanoid` | **^5.0.7** | Generating `idempotency_key` for outbound Casa → n8n webhook calls | Every outbound dispatch (`approve`, `reject`, `dispatch`, `override`) needs a stable client-generated key. `nanoid(21)` is collision-resistant and URL-safe. Don't use `crypto.randomUUID()` only because it's longer; either is fine — pick `nanoid` for shorter audit-log strings. |
| `sonner` | **^1.7.0** (already in `package.json`, currently unused) | Wire up the existing toast surface to real action results (success / failure / undo) | Already installed but not imported. Replace the inline `useState` toast in `app/(dashboard)/page.tsx` with `<Toaster />` mounted in the dashboard layout. Single source of truth for action feedback (including Undo). |
| `@supabase/supabase-js` types via `supabase gen types typescript` | n/a — CLI output | Generated `database.types.ts` powering `createClient<Database>()` end-to-end type safety | Re-run on every schema migration. Commit `database.types.ts` to the repo. See "Generated Types Workflow" section below. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `supabase` CLI (>= 1.200.x, installed locally per dev — **not as a project dep**) | Migrations, type generation, local Supabase via `supabase start` | Install via `brew install supabase/tap/supabase` or `npx supabase`. Use `supabase migration new <name>` for every schema change. **Commit `supabase/migrations/*.sql` to the repo.** |
| GitHub Action: `supabase/setup-cli` + `supabase gen types typescript --project-id` | Nightly type regeneration | Optional but recommended once you have >2 schema changes/week. Until then, run `npm run types` manually after each migration. |
| `tsx` (dev-only) | One-shot scripts (seed 26 properties from CSV, backfill embeddings) | Lighter than ts-node, no config. Add `"seed": "tsx scripts/seed.ts"`. |

### Database Extensions to Enable on Supabase

| Extension | Purpose | Setup |
|-----------|---------|-------|
| `pgvector` (>= 0.7.0, default-available on Supabase) | Per-property embeddings for the knowledge base | `create extension if not exists vector with schema extensions;` in your first migration. |
| `pgcrypto` (auto-available) | `gen_random_uuid()` for PK defaults; HMAC if you ever verify webhook signatures in SQL (don't — do it in Node) | `create extension if not exists pgcrypto with schema extensions;` |
| `uuid-ossp` | **NOT needed** — `pgcrypto`'s `gen_random_uuid()` is the modern path | Skip. |

---

## Installation

```bash
# Already installed — verify nothing broke
npm ls @supabase/ssr @supabase/supabase-js sonner zod

# Add new
npm install zod@^3.23.8 nanoid@^5.0.7

# Dev (optional but recommended for the seed script)
npm install -D tsx@^4.19.0

# Supabase CLI — global (not a project dep)
brew install supabase/tap/supabase
# or one-shot via npx supabase ...

# Sonner is already in package.json; just import it. No install.
```

After install, add to `package.json` scripts:

```json
{
  "scripts": {
    "types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/lib/supabase/database.types.ts",
    "types:local": "supabase gen types typescript --local > src/lib/supabase/database.types.ts",
    "db:migrate": "supabase db push",
    "seed": "tsx scripts/seed.ts"
  }
}
```

---

## The Six Integration Decisions (Prescriptive)

### Decision 1 — Read path: RSC + server-side queries, NOT client-side fetch

**Choice:** Convert pages to **React Server Components** when their data-fetching is rewired to Supabase. Use `createClient()` from `@supabase/ssr` inside the RSC, return the typed result, render. Push interactivity (filters, sheet open/close, optimistic updates) into `"use client"` leaf components.

**Why:**
1. The codebase's existing "all pages are `use client`" finding is a real waste — every dashboard route ships a full client bundle of static data today.
2. Server-side fetching means the dashboard renders the first paint with real data already in the HTML; no spinner-then-data flash on Carlos's 5–10x/day open.
3. `@supabase/ssr` `createServerClient` reads the auth cookie automatically — once you flip to real Supabase Auth (Phase 2), the same code keeps working.
4. The middleware (`src/middleware.ts`) already refreshes the session — RSC reads benefit from this for free.

**Tradeoff:** Pages that today hold tab state, filter state, or sheet-open state in `useState` need a small refactor: extract the interactive shell into a `"use client"` child, keep the `page.tsx` as an RSC that fetches and passes data as props. This is `PROJECT.md`'s explicit "convert pages opportunistically when their data-fetching gets rewired" guidance — follow it.

**Confidence:** HIGH (Supabase docs + Next.js docs both recommend this pattern.)

---

### Decision 2 — Write path: Server Actions for Casa-internal mutations, Route Handlers for n8n integration only

**Use Server Actions** (`"use server"`) for:
- Approve / Reject / Override on exception cards
- Save edits on a claim draft
- Toggle Pricing Agent Shadow ↔ Live mode
- Edit any property / booking / cleaning row from the UI

**Use Route Handlers** (`app/api/.../route.ts`) for:
- Inbound n8n callbacks (`POST /api/webhooks/n8n/agent-run-complete`)
- Inbound Hostaway / Breezeway / PriceLabs webhooks when those land
- Any health-check endpoint Settings page wants to hit

**Why this split:**
- Server Actions are first-class for in-app mutations: form/button → server function with the user's auth cookie already on it, automatic `revalidatePath`/`revalidateTag`, type safety from action input → return. They're the right tool when the caller is *your own UI*.
- Route Handlers are the only option for *external* callers — n8n calling Casa has no React form context, no Next.js auth cookie. It needs a stable, named URL and HMAC signature verification.
- **Don't try to use Server Actions for the n8n callback.** Server Actions encrypt their URL/path and require Next.js CSRF context; external systems literally cannot call them.

**Inside the Server Action, what about the outbound n8n call?**
Two-step: (1) Server Action writes the decision to Supabase with status `pending_dispatch` and gets the row's `id` + `idempotency_key`; (2) the same Server Action `fetch()`s the n8n webhook URL with the idempotency key in headers; (3) on success, update the row to `dispatched`. On failure, leave it `pending_dispatch` and surface a toast — a background `pending_dispatch` retry job (or Supabase webhook → n8n retry workflow) handles eventual consistency.

**Trade-off (idempotency cost):** The two-row-state pattern doubles the writes per action but it's the only honest way to survive transient n8n outages without double-dispatching when the user clicks twice. For 26 properties × ~10 daily actions, the cost is negligible (~520 rows/day extra updates).

**Confidence:** HIGH (Makerkit, Vercel, and multiple production Next.js + webhook guides converge on this hybrid pattern.)

---

### Decision 3 — Inbound n8n → Casa: signed Route Handler, idempotency table, immediate 200

**Endpoint shape:** `POST /api/webhooks/n8n/[event-type]` (e.g. `agent-run-complete`, `claim-submitted`, `cleaner-replied`)

**Required mechanics, in order inside the handler:**

1. **`export const runtime = 'nodejs'`** — needed for `crypto.timingSafeEqual` and the Supabase service-role key. Edge runtime is wrong here.
2. **`export const dynamic = 'force-dynamic'`** — POST is dynamic by default in Next 14, but be explicit. No caching of webhook responses.
3. Read raw body with `await request.text()` (not `request.json()` first) so HMAC can be computed over the exact bytes n8n signed.
4. Verify `X-Casa-Signature: sha256=<hex>` header using a shared secret stored in `N8N_WEBHOOK_SECRET` (server-only env). Use `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')` and compare with `crypto.timingSafeEqual`.
5. Verify `X-Casa-Timestamp` header is within ±5 min of `Date.now()` — rejects replay attacks.
6. Parse the body with a Zod schema (`AgentRunCompletePayload`). On parse error → `400`.
7. Check `agent_dispatches` table for `delivery_id` (n8n's UUID per webhook fire). If present → return `200 { status: "duplicate" }` immediately.
8. Insert into `agent_dispatches(delivery_id, ...)` (will fail on unique constraint if you have a race — that's a feature; just return `200 duplicate`).
9. Apply the effect (mutate the affected `agent_log` / `exception` / `claim` row).
10. `revalidateTag('agent-runs')` / `revalidateTag('exceptions')` so the next dashboard render sees the change.
11. Return `200 { ok: true }` — fast. Heavy work should already be in-process or off-loaded; n8n's default expectation is sub-5s.

**HMAC, not just Header Auth:** n8n's built-in Webhook trigger only supports `None / Basic Auth / Header Auth / JWT Auth` natively. Header Auth is a *shared static token* and is fine for casual cases but loses authenticity if the token leaks. HMAC over the body is the production-grade choice — and you control both sides, so just compute it in an n8n Code/Crypto node before the workflow's final HTTP-Request-back-to-Casa step. The n8n community confirms HMAC must be computed in a Code/Crypto node; it isn't yet built-in to the Webhook trigger.

**Why this matters for Casa:** n8n is hosted at `fyi-media.app.n8n.cloud` — a third-party-controlled subdomain. Without HMAC, anyone who guesses the URL can fake an "agent run complete" callback and corrupt Casa's state. HMAC + timestamp + idempotency table is the minimum bar.

**Confidence:** HIGH on the pattern. MEDIUM on the n8n-side ergonomics (HMAC must be built manually in the n8n flow with a Crypto node — verified against n8n community threads).

---

### Decision 4 — Outbound Casa → n8n: Server Action with idempotency key in header, single retry on transient

**Pattern:**
```ts
// src/lib/agents/dispatch.ts (called from a Server Action)
const idempotencyKey = nanoid(21);
const res = await fetch(`${N8N_BASE_URL}/webhook/${workflow}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': idempotencyKey,
    'X-Casa-Signature': hmacSha256(secret, body),
    'X-Casa-Timestamp': String(Date.now()),
  },
  body,
  signal: AbortSignal.timeout(8000), // n8n response within 8s or we treat it as failed
});
```

**n8n response mode (set on each receiving Webhook node):**
- For **fire-and-acknowledge** dispatches (the common case — "Carlos approved, run the workflow, callback later"): set the n8n Webhook node's *Response Mode* to **`Immediately`**. n8n returns a 200 with `"workflow got started"` and the actual work happens async. Casa's Server Action treats that 200 as "dispatched, awaiting callback."
- For **synchronous lookups** (rare — e.g. "give me PriceLabs' current price for this listing right now"): use response mode **`When Last Node Finishes`** and let the Server Action `await` the actual result. Cap the timeout to 8s; longer than that and you owe the user a "still working…" UX, which means it should have been async in the first place.

**Idempotency contract with n8n:** The first node after the Webhook trigger in every flow is a Code node that:
- Reads `X-Idempotency-Key` from headers
- Checks a Supabase `webhook_deliveries` table (or Redis if you add it later — don't yet) for that key
- If present → end the workflow with an idempotent no-op response
- Otherwise → insert the key and proceed

This means n8n owns the dedupe state for *inbound* (Casa → n8n) and Casa owns the dedupe state for *inbound* (n8n → Casa). Symmetric and simple.

**Retry policy:** On a 5xx or network error from n8n, the Server Action should **not** retry inline (Carlos is waiting). Instead:
1. Write the row with status `pending_dispatch` (this happened *before* the fetch — see Decision 2).
2. Return a toast: "Action queued, dispatch retrying in background."
3. A scheduled job (Supabase Edge Function on a cron, OR an n8n workflow that polls `pending_dispatch` rows every 30s) does exponential backoff (5s, 30s, 2min, 10min — give up after 4 attempts, surface as exception card).

**Confidence:** HIGH on Server-Action-as-the-call-site. HIGH on idempotency-key-in-header. MEDIUM on the specific retry schedule (informed by Stripe's well-documented retry schedule, but tuned shorter for an internal LAN-speed n8n).

---

### Decision 5 — Realtime vs polling: Realtime (postgres_changes) for live tables; **no polling fallback this milestone**

**For Casa specifically:**

| Surface | Approach | Rationale |
|---------|----------|-----------|
| Home: exception cards | **Realtime subscription** to `exceptions` table (INSERT / UPDATE / DELETE) | Carlos opens once and leaves the tab. New exceptions must appear without refresh. Three concurrent users × a single tab each = well inside the free tier's 200 connection budget. |
| Home: KPI counts (Open Exceptions, Cleanings Today, Pricing Recs, Claims Pending) | **Derived from the same realtime subscription** — recompute on the client when the underlying table changes | One subscription per table, not one per KPI. |
| Right rail: cleanings list, check-ins/outs, agent activity | **Realtime subscription** to `cleanings` / `bookings` / `agent_logs` | Same logic. Carlos's "5–10x/day glance" expectation requires that the tab show fresh data without a manual refresh. |
| Pricing page recommendations | **RSC initial fetch + Realtime subscription** for `pricing_recommendations` | Initial paint is instant via RSC; subsequent updates stream in. |
| Pricing Agent detail page: Live Activity table | **Realtime subscription** to `agent_logs WHERE agent='pricing'` | This page is explicitly Carlos watching the agent work. Polling would be a wrong-feeling UX here. |
| Property / Booking / Claim *detail* pages | **RSC only** — no subscription | Detail pages are point-in-time views; user closes when done. The cost of a subscription per detail-page view is not worth the freshness. If the page is open long enough to need an update, the user can navigate away and back. |
| Settings → API Status | **30-second client-side polling** of a `/api/health/integrations` Route Handler | Settings is the *one* place polling beats realtime — the data source (external service health) is outside Postgres anyway, so a regular fetch is the right shape. |

**Why realtime, not polling, for the dashboard:**

1. **Carlos's stated expectation** is "5–10x/day glance, never refresh." Polling forces a choice between sub-second freshness (= high request volume) and noticeable lag (= bad UX). Realtime gives both.
2. **The scale is tiny.** 3 users × ~6 subscribed tables × ~10 events/hour = nowhere near the free-tier ceiling (200 peak connections, 2M messages/month). Even at 10x growth the math holds.
3. **The auth-check-per-row overhead** Supabase warns about (the "100 subscribed users → 100 reads per insert" bottleneck) is a non-issue at 3 users.
4. **Single-tenant + shared demo creds** means RLS is not yet in play, which actually makes realtime *cheaper* — no per-row policy evaluation for the next month.

**When polling would be right (not now, but document the trigger):**
- If user count grows past ~50 concurrent and Carlos's pattern stays "5–10x/day glance," switch to RSC + `Cache-Control: private, max-age=15` and let the browser revalidate on focus. Realtime stops being cost-effective above ~100 channels per tenant.
- If you ever route Casa traffic through Cloudflare Workers / Vercel Edge in a way that breaks WebSocket, fall back to RSC + `next: { revalidate: 30 }` server-side tag-based revalidation. That's polling-shaped but server-cache-aware.

**Decision tree:**
```
Is the surface a "live operator dashboard view" that should reflect
agent activity within seconds without a refresh?
  ├── YES → Supabase realtime subscription (postgres_changes)
  │         on the affected table(s).
  └── NO  → Is it a detail page user opens, reads, closes?
            ├── YES → RSC fetch on render. No subscription.
            └── NO  → Is the data source outside Postgres
                      (3rd-party health, external API status)?
                      ├── YES → 30s client-side poll of a Route Handler.
                      └── NO  → Re-examine the use case.
```

**Trade-off (debuggability):** Realtime is harder to debug than polling — "why didn't this update" can be RLS, JWT expiry, payload filter, channel disconnect, or replication lag. **Add a small dev-only HUD on the dashboard** showing `channel.state` for each subscription. Worth its weight on day 1.

**Confidence:** HIGH on the technical choice; HIGH on free-tier headroom.

---

### Decision 6 — pgvector for per-property knowledge bases: HNSW index, OpenAI 1536-dim, single table with `property_id` discriminator

**Schema:**
```sql
create extension if not exists vector with schema extensions;

create table public.knowledge_chunks (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  source      text not null,          -- 'house_manual' | 'past_review' | 'guest_thread' | 'sop'
  source_ref  text,                   -- e.g. booking_id, review_id, file path
  content     text not null,          -- the chunk's text, ~500 tokens
  embedding   vector(1536) not null,  -- OpenAI text-embedding-3-small dimension
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index knowledge_chunks_property_idx
  on public.knowledge_chunks (property_id);

-- HNSW, cosine. m=16, ef_construction=64 are the standard pgvector defaults.
create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
```

**Why these choices:**

| Choice | Why |
|--------|-----|
| **Single `knowledge_chunks` table with `property_id` discriminator**, not one table per property | 26 tables would be operational hell. Supabase per-tenant pgvector best practice (2025) is exactly this: tenant ID as a column, indexed for filtering. |
| **`vector(1536)`** | OpenAI `text-embedding-3-small` (the cost/quality sweet spot). If you ever want to downscale, `text-embedding-3-small` supports the `dimensions` parameter — but 1536 is the safe default. |
| **HNSW with cosine ops** | Recommended by Supabase docs and OpenAI's cookbook for production pgvector. Faster queries than IVFFlat, doesn't need rebuilding as the dataset grows. The slower index *build* time is a non-issue at 26 properties × maybe 100–500 chunks each = ~13k rows total. |
| **`m = 16, ef_construction = 64`** | pgvector defaults. Good recall/latency balance for sub-100k row corpora. |
| **`metadata jsonb`** | Holds chunk-level attributes — guest language, sentiment, source date — without schema migrations. Filter inside the SQL: `where property_id = $1 and metadata->>'language' = 'en'`. |
| **`embedding vector(1536) not null`** | Required so the HNSW index covers every row. NULL embeddings would silently miss queries. |

**Query pattern n8n will use (from a Code/HTTP node):**

```sql
-- pre-filter by property, then ANN-search the embedding column.
-- The HNSW index supports this because we have a btree on property_id.
select id, content, source, source_ref, metadata,
       1 - (embedding <=> $1::vector) as similarity
from public.knowledge_chunks
where property_id = $2
order by embedding <=> $1::vector
limit 8;
```

Expose this as a Postgres function so n8n calls it via `rpc()` rather than crafting raw SQL:

```sql
create or replace function public.match_knowledge_for_property(
  query_embedding vector(1536),
  target_property_id uuid,
  match_count int default 8
) returns table(
  id uuid, content text, source text, source_ref text,
  metadata jsonb, similarity float
)
language sql stable as $$
  select kc.id, kc.content, kc.source, kc.source_ref, kc.metadata,
         1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where kc.property_id = target_property_id
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;
```

n8n then calls this as `supabase.rpc('match_knowledge_for_property', { ... })` — type-safe, parametrized, no SQL injection surface.

**Embedding pipeline (out of scope for this milestone but flag for later):** Embeddings should be written by n8n (which already has OpenRouter/OpenAI in its credential set), not by Casa. Casa just reads. The write side is "when a new review comes in, or when SOP Agent ingests a house manual page, n8n embeds the text and inserts the row." Document this contract; don't build the embedding code in Casa.

**Vector Buckets (Supabase's 2026 announcement) NOT used here:** Vector Buckets are for tens of millions of vectors with durable object-storage backing. 26 properties × hundreds of chunks each = thousands of rows — pgvector in the main DB is correct.

**Confidence:** HIGH. Pattern is straight from Supabase + OpenAI cookbook.

---

## Generated Types Workflow

**One-time setup:**

1. `supabase login`
2. `supabase link --project-ref <your-project-ref>` (writes `supabase/config.toml`)
3. `echo "SUPABASE_PROJECT_REF=<ref>" >> .env.local`

**Per-migration workflow:**

```bash
# 1. Author migration
supabase migration new add_agent_logs_table
# edit supabase/migrations/<timestamp>_add_agent_logs_table.sql

# 2. Apply locally (or to remote — your call this milestone)
supabase db push

# 3. Regenerate types
npm run types

# 4. Verify compile
npx tsc --noEmit

# 5. Commit migration + types together
git add supabase/migrations src/lib/supabase/database.types.ts
git commit -m "feat(db): add agent_logs"
```

**Typed client usage:**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* RSC can't set cookies — fine, middleware handles refresh */ }
        },
      },
    }
  );
}
```

Now `supabase.from('properties').select('*')` is fully typed, and refactoring a column propagates to every page that touches it.

**Note on the env-var rename (called out in `CONCERNS.md`):** Rename `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` as part of the data-layer phase. Add a `lib/env.ts` Zod schema that validates both vars at startup and throws a readable error if missing — kills the silent `!`-suppressed undefined.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Server Actions for in-app mutations | All-Route-Handler API surface | If you ever need to call Casa's API from a non-Next.js client (mobile app, partner integration). Today's three users are all in the dashboard — Server Actions are the better DX. |
| Route Handler `app/api/webhooks/n8n/...` | Supabase Edge Function as the webhook receiver | If Casa is ever deployed to Vercel Edge and Node.js runtime becomes painful. Supabase Edge Functions are Deno-based and live next to the DB. Trade-off: separate deploy surface, separate logs, separate env-var management. Not worth the split today. |
| Realtime subscriptions (postgres_changes) | Realtime Broadcast (server → clients via `channel.send`) | If you grow past ~50 users and the per-row authorization overhead becomes a problem. Broadcast offloads auth to your app. Premature here. |
| Realtime subscriptions | 30-second client polling of a Route Handler | If you intentionally need cache-friendly HTTP semantics (CDN-cached responses, simple monitoring). Worse UX for Carlos's "never refresh" expectation. |
| `pgvector` HNSW in main DB | Supabase Vector Buckets | At >1M vectors per tenant. You're at <100k for the foreseeable future. |
| `nanoid` for idempotency keys | `crypto.randomUUID()` | If you have a hard reason to want the UUID format in logs. Functionally equivalent. |
| Zod 3.23 | Zod 4 | Once the ecosystem (`@hookform/resolvers`, drizzle-zod, etc.) catches up. As of May 2026 there are still rough edges; not worth the churn mid-milestone. |
| One `knowledge_chunks` table with `property_id` column | One table per property (or per-schema partitioning) | Never, for this scale. The discriminator approach scales to thousands of tenants with HNSW pre-filtering. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `supabase.auth.getSession()` server-side | Supabase docs explicitly warn: "Never trust `getSession()` inside server code." It doesn't re-validate the JWT signature. | `supabase.auth.getUser()` (validates against Supabase's auth server) or `supabase.auth.getClaims()` (validates JWT against published public keys) in middleware and RSC auth checks. |
| `@supabase/auth-helpers-nextjs` | Deprecated. Replaced by `@supabase/ssr` (which the codebase already has). | `@supabase/ssr` — already installed. |
| Polling for any agent-decision surface | Carlos opens the tab once and leaves it. Polling either burns requests or feels stale. | Realtime subscriptions on `exceptions`, `agent_logs`, `cleanings`. |
| `request.json()` inside the n8n webhook handler before signature verification | Consuming the body as JSON re-serializes it; HMAC over the re-serialized bytes won't match n8n's signature over the original bytes. | `const raw = await request.text();` then verify HMAC, then `JSON.parse(raw)`. |
| `cookies()` directly inside RSC without `@supabase/ssr` | Possible but you lose automatic cookie refresh and the `setAll` cache-header injection. | The `createClient()` helper above — it wraps `cookies()` correctly. |
| Edge runtime (`export const runtime = 'edge'`) for the n8n webhook receiver | Node's `crypto.timingSafeEqual` is the right primitive for HMAC verify; Edge runtime's WebCrypto can do it but adds friction. Service role key handling is also more straightforward on Node. | `export const runtime = 'nodejs'` (the default). |
| `Math.random()` or array-index-as-React-key anywhere in the data-driven pages | Already a flagged concern in `CONCERNS.md` for the math-generated pricing decisions. Once real data lands, this becomes a real reconciliation bug. | Use the row's `id` (uuid) as the React key. |
| Manually constructed SQL for vector queries called from n8n | SQL-injection-prone; harder to type. | A Postgres function (`match_knowledge_for_property`) called via `supabase.rpc()` with parameter binding. |
| `redis` / `upstash` / any external cache | Adds an operational surface for no demonstrated benefit at this scale. The codebase concerns audit explicitly notes there's no cache today and that's fine. | Supabase Postgres for idempotency tables; Next.js `revalidateTag`/`revalidatePath` for read caching. |
| **Skipping HMAC** on the n8n callback because "it's all internal" | n8n is on a public hostname (`fyi-media.app.n8n.cloud`). Anyone who finds Casa's webhook URL can forge calls. | HMAC-SHA256 + timestamp + delivery-id idempotency. Non-negotiable. |
| `output: 'export'` or static-only deploy | Realtime subscriptions and Route Handlers require a server runtime. | Standard Next.js Node deploy (Vercel, Render, Fly, self-hosted — your call). |

---

## Stack Patterns by Variant

**If a route is purely read (Property Detail, Booking Detail, Reports Cumulative tab):**
- RSC `page.tsx` calls `createClient()` and queries Supabase server-side.
- Tag the query: `await supabase.from(...).select(...)` with `revalidateTag('property:' + id)` on writes.
- No `"use client"` directive. Push interactive sub-trees (Flag dialog, tab switching) into client leaves.

**If a route is read + frequently-mutating (Home, Pricing, Cleanings):**
- RSC `page.tsx` for the first paint.
- A `"use client"` sub-component subscribes to the relevant Supabase channel(s) on mount and merges incoming events into local state (the simplest pattern: `useEffect` → `supabase.channel(name).on('postgres_changes', ...).subscribe()` → `useState` setter).
- All mutations go through Server Actions imported from the page.

**If a route triggers an external agent (Approve → n8n):**
- The Server Action writes `agent_dispatches` with `idempotency_key`, then `fetch(N8N_URL, ...)`, then updates the row.
- On the failure path, leaves the row `pending_dispatch` and a follow-up worker handles retry.
- The user-facing toast (Sonner) reflects optimistic success; on retry-failure, the Home page surfaces it as an exception card.

**If a route renders agent decisions from `agent_logs` (Pricing Agent detail page):**
- Initial fetch is server-side, paginated.
- A realtime subscription on `agent_logs WHERE agent='pricing'` pushes new rows in.
- Decisions table uses `row.id` as React key (not `i`).

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@supabase/ssr@0.10.3` | `@supabase/supabase-js@^2.43.0` | Codebase has 2.105.4 — well above the peer range. Safe. |
| `@supabase/supabase-js@2.105.x` | `next@14.x` and `next@15.x` | Framework-agnostic; runtime is the only constraint. |
| `next@14.2.18` | `react@18.3.1` | Pinned together. **Do not** upgrade React to 19 without first upgrading Next to 15. |
| `next@14.2.x` | `@supabase/ssr@0.10.x` | Documented compatible (Supabase's official Next.js guides target 14.2+). |
| `zod@3.23.x` | `@hookform/resolvers@^3.x` | Both work with React 18. Zod 4 would require resolver upgrades. |
| `nanoid@^5` | ESM-only | Requires `next.config.mjs` (already in use). No CommonJS migration headache. |
| `pgvector` 0.7.0+ | Postgres 14, 15, 16 | Supabase defaults are fine. HNSW requires pgvector ≥ 0.5.0 — you'll get 0.7+. |

---

## Sources

**Authoritative / verified directly (HIGH confidence):**
- [Supabase Auth Server-Side Next.js guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — getAll/setAll cookies pattern, getUser/getClaims warning, middleware Proxy mechanism
- [Next.js 14 Route Handlers documentation](https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers) — webhook receiver pattern, `request.text()` for raw body, runtime selection
- [Supabase Postgres Changes docs](https://supabase.com/docs/guides/realtime/postgres-changes) — limitations, single-thread bottleneck, when to use Broadcast instead
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing) — Free tier: 2M messages/month, 200 peak connections; Pro: 5M / 500
- [Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector) — extension setup, HNSW vs IVFFlat
- [@supabase/ssr CHANGELOG](https://github.com/supabase/ssr/blob/main/CHANGELOG.md) — v0.10.3 is latest stable (May 2026); v0.10.0 added cache-header support
- [Supabase Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types) — `supabase gen types typescript` workflow
- [Supabase Generate Types via GitHub Actions](https://supabase.com/docs/guides/deployment/ci/generating-types) — CI integration

**Strong secondary (MEDIUM confidence — verified across multiple credible sources):**
- [Makerkit: Server Actions vs Route Handlers](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers) — hybrid pattern rationale
- [Makerkit: Next.js Server Actions guide (2026)](https://makerkit.dev/blog/tutorials/nextjs-server-actions) — current patterns
- [Webhook Security in Next.js (signatures, idempotency)](https://dev.to/whoffagents/webhook-security-in-nextjs-signatures-idempotency-and-avoiding-common-mistakes-4g6) — HMAC + replay window + idempotency-key patterns
- [Stripe webhook retry behavior](https://www.hookrelay.io/guides/stripe-webhook-retry) — production-grade retry schedule reference
- [n8n Webhook node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) — response modes (`Immediately` / `When Last Node Finishes` / `Respond to Webhook` / `Streaming`); auth options (None / Basic / Header / JWT — no native HMAC)
- [n8n community: HMAC Verification feature request](https://community.n8n.io/t/feature-proposal-hmac-signature-verification-for-webhook-node/223375) — confirms HMAC must be done manually in a Code/Crypto node
- [Sparkco: Supabase Vector 2025 deep dive](https://sparkco.ai/blog/mastering-supabase-vector-storage-a-2025-deep-dive) — multi-tenant pgvector patterns
- [Supabase blog: OpenAI embeddings with pgvector](https://supabase.com/blog/openai-embeddings-postgres-vector) — 1536-dim schema and HNSW configuration
- [OpenAI Cookbook: Semantic search using Supabase Vector](https://cookbook.openai.com/examples/vector_databases/supabase/semantic-search) — production query patterns
- [Next.js revalidateTag docs](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) — tag-based cache invalidation
- [Next.js revalidatePath docs](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) — path-based cache invalidation
- [n8n webhook security guide (Logicworkflow)](https://logicworkflow.com/blog/n8n-webhook-security/) — auth, IP filtering, abuse prevention
- [Codehooks: Securing automation webhooks (Zapier/Make/n8n)](https://codehooks.io/blog/secure-zapier-make-n8n-webhooks-signature-verification) — cross-platform webhook signature patterns

---

*Stack research for: AI-agent supervisor dashboard (Casa Command Center integration milestone)*
*Researched: 2026-05-14*
