# Architecture Research — Casa Agent Integration

**Domain:** Multi-agent shadow-mode operator dashboard (Next.js 14 + Supabase + n8n + Claude/OpenRouter)
**Researched:** 2026-05-14
**Confidence:** HIGH on the Casa ↔ Supabase ↔ n8n trio (Context7 + canonical Supabase/n8n docs verified); MEDIUM on the 12-table schema shape (synthesized from PRODUCT.md + existing mock-data modules; user has not finalized columns); HIGH on build order (constrained by May 15 deadline + Rachit credential dependency).

---

## System Overview

Three durable systems plus one ephemeral one. Casa is the supervisor surface — it never thinks, it only reads state and dispatches intents. Supabase is the system of record — everything observable in the UI must be readable from a row. n8n is the agent execution layer — it owns the LLM calls, the external-vendor HTTP, and the retry/queue semantics. Hostaway/Breezeway/PriceLabs/WhatsApp are the side-effect targets — Casa never calls them directly.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Casa (Next.js 14, this repo)                      │
│                                                                            │
│  RSC pages (server)        │  Client leaves         │  API routes        │
│  ─ read agent_runs,        │  ─ optimistic UI       │  ─ /api/actions/*  │
│    exceptions, decisions   │  ─ realtime subscribe  │  ─ /api/webhooks/* │
│  ─ initial render only     │  ─ undo timer          │  ─ HMAC verify     │
└────────┬─────────────────────┬────────────────────────┬──────────────────┘
         │ read (RSC + RPC)    │ subscribe (WS)         │ write + dispatch
         ▼                     ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       Supabase (system of record)                         │
│                                                                            │
│  Postgres tables  │  Realtime (Postgres CDC)  │  pgvector  │  Storage    │
│  ─ 12-table core  │  ─ exceptions             │  ─ kb_     │  ─ photos   │
│  ─ shadow_mode    │    agent_runs             │    chunks  │    evidence │
│    per row        │    agent_decisions         │  ─ per-     │             │
│                   │    action_log             │    property │             │
│                   │                            │    scoped   │             │
└────────▲──────────────────────────────────────────▲──────────────────────┘
         │ writes/reads (service role)              │ similarity query (RPC)
         │                                          │
┌────────┴──────────────────────────────────────────┴──────────────────────┐
│                        n8n (fyi-media.app.n8n.cloud)                      │
│                                                                            │
│  Inbound webhooks         │  Agent workflows        │  Outbound HTTP     │
│  ─ /webhook/pricing/dec   │  ─ Claude via OpenRouter│  ─ Hostaway        │
│  ─ /webhook/ops/dispatch  │  ─ pgvector retrieval   │  ─ PriceLabs       │
│  ─ /webhook/guest/draft   │  ─ idempotency_key      │  ─ Breezeway       │
│  ─ /webhook/sop/push      │    dedupe               │  ─ WhatsApp        │
│                            │                          │                    │
│  Outbound callbacks       │                          │                    │
│  ─ POST Casa /api/         │                          │                    │
│    webhooks/n8n            │                          │                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Owns | Does NOT own |
|-----------|------|--------------|
| Casa RSC pages | First paint of agent state from Supabase reads | Mutation, LLM calls, vendor HTTP |
| Casa client leaves | Optimistic UI, realtime subscribe, undo timers, command palette | Auth-trusted writes, secret material |
| Casa `/api/actions/*` | Auth check, idempotency key generation, Supabase write, n8n dispatch | Vendor API calls, retries beyond first attempt |
| Casa `/api/webhooks/n8n` | HMAC verify, payload validation, Supabase upsert by `idempotency_key` | Business decisions, vendor calls |
| Supabase Postgres | Durable state, FK integrity, shadow_mode flags, audit log | Anything ephemeral or unverifiable |
| Supabase Realtime | Notifying connected Casa tabs when rows change | Initiating state changes |
| Supabase pgvector | Per-property knowledge chunks + embeddings + similarity RPC | Embedding generation (n8n does that) |
| n8n agent workflows | Claude prompt assembly, KB retrieval, vendor HTTP, retry policy | Storing canonical state (echoes back to Casa) |
| n8n callback to Casa | Reporting run outcome + decision payload | Direct DB writes (uses webhook so Casa can validate) |

**Critical invariant:** *Supabase is the only thing that can be "wrong." n8n is stateless from Casa's perspective — if n8n loses a run, Casa replays it. If Casa loses an action, n8n's idempotency dedupe prevents a double-fire on retry.*

---

## Reference Schema (12 tables + pgvector)

The user has not designed columns yet. The shapes below are derived from the existing mock-data modules (`src/lib/mock-data/*.ts`) plus what a shadow-mode multi-agent dashboard structurally requires. Treat columns as a starting point — Carlos's data-layer phase will refine.

### Domain tables (8)

#### 1. `properties` — Central reference entity
```sql
create table properties (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,           -- "yaletown-skyhome-32a"
  name            text not null,
  neighborhood    text not null,                  -- "Yaletown" | "Downtown" | ...
  address         text,
  bedrooms        smallint,
  bathrooms       numeric(3,1),
  max_guests      smallint,
  hero_image_url  text,
  status          text not null default 'active', -- 'active' | 'maintenance' | 'new'
  hostaway_id     text,                            -- external listing id
  pricelabs_id    text,
  workspace       text not null default 'casa',   -- multi-tenant escape hatch
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

#### 2. `bookings`
```sql
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id) on delete restrict,
  channel         text not null,                  -- 'airbnb' | 'vrbo' | 'direct' | 'booking.com'
  channel_ref     text,                            -- vendor reservation id
  guest_id        uuid references guests(id),
  check_in        date not null,
  check_out       date not null,
  status          text not null,                   -- 'inquiry' | 'confirmed' | 'in_stay' | 'completed' | 'cancelled'
  total_amount    numeric(10,2),
  currency        text default 'CAD',
  created_at      timestamptz not null default now()
);
create index on bookings (property_id, check_in);
create index on bookings (status) where status in ('confirmed','in_stay');
```

#### 3. `guests`
```sql
create table guests (
  id              uuid primary key default gen_random_uuid(),
  display_name    text not null,
  email           text,
  phone           text,
  language        text default 'en',               -- 'en' | 'zh' | 'ja' | 'fr'
  channel_handle  text,                            -- airbnb user id, etc.
  created_at      timestamptz not null default now()
);
```

#### 4. `cleanings`
```sql
create table cleanings (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id),
  booking_id      uuid references bookings(id),    -- turnover this clean belongs to
  scheduled_for   date not null,
  cleaner_name    text,                             -- 'Andrea' | 'Carly' | ...
  cleaner_phone   text,
  dispatch_state  text not null default 'pending', -- 'pending' | 'dispatched' | 'claimed' | 'completed' | 'escalated'
  dispatched_at   timestamptz,
  claimed_at      timestamptz,
  completed_at    timestamptz,
  quality_score   smallint,                         -- 0..100 from photos
  whatsapp_thread jsonb,                            -- message log mirror
  created_at      timestamptz not null default now()
);
create index on cleanings (scheduled_for, dispatch_state);
```

#### 5. `claims` — damage claims
```sql
create table claims (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id),
  booking_id      uuid references bookings(id),
  status          text not null default 'pending',-- 'pending' | 'submitted' | 'resolved' | 'rejected'
  amount          numeric(10,2),
  description     text,
  before_photos   text[],                           -- Storage URLs
  after_photos    text[],
  evidence_pack   jsonb,                            -- generated artifact for Hostaway/AirCover
  submitted_at    timestamptz,
  resolved_at     timestamptz,
  created_by_agent text                             -- 'ops' if claim generated from cleaning
);
```

### Agent tables (3)

#### 6. `agents` — One row per agent kind, holds config + mode
```sql
create table agents (
  id              text primary key,                 -- 'pricing' | 'ops' | 'guest' | 'sop'
  display_name    text not null,
  tagline         text,
  mode            text not null default 'shadow',  -- 'shadow' | 'live' | 'paused'
  config          jsonb not null default '{}'::jsonb, -- per-agent settings
  prompt_version  text not null,
  enabled         boolean not null default true,
  updated_at      timestamptz not null default now(),
  updated_by      text                              -- email of human who toggled
);
```

#### 7. `agent_runs` — One row per agent invocation (n8n execution)
```sql
create table agent_runs (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null references agents(id),
  trigger         text not null,                    -- 'cron' | 'webhook' | 'manual' | 'reply'
  trigger_ref     text,                              -- e.g. checkout booking_id
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null default 'running', -- 'running' | 'succeeded' | 'failed' | 'timeout'
  mode_at_run     text not null,                    -- snapshot of agents.mode at run start
  n8n_execution_id text,                             -- traceability
  idempotency_key text unique,                       -- dedupe inbound callbacks
  input_summary   jsonb,                              -- what triggered, salient inputs
  output_summary  jsonb,                              -- what the agent concluded
  tokens_in       integer,
  tokens_out      integer,
  cost_usd        numeric(8,4),
  error           text
);
create index on agent_runs (agent_id, started_at desc);
create index on agent_runs (status) where status = 'running';
```

#### 8. `agent_decisions` — One row per discrete decision a run produced
```sql
create table agent_decisions (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references agent_runs(id) on delete cascade,
  agent_id        text not null references agents(id),
  decision_type   text not null,                    -- 'price_change' | 'cleaner_dispatch' | 'guest_reply_draft' | 'listing_push'
  subject_table   text not null,                    -- 'properties' | 'bookings' | 'cleanings' | 'claims'
  subject_id      uuid not null,                     -- FK to that table (polymorphic)
  shadow_mode     boolean not null,                  -- TRUE = logged only, FALSE = executed
  proposed        jsonb not null,                    -- what the agent would do / did
  rationale       text,                              -- LLM-generated explanation
  kb_chunks_used  uuid[] default '{}',               -- traceability into knowledge_chunks
  confidence      numeric(3,2),                      -- 0.00..1.00 self-reported
  human_action    text,                               -- null | 'approved' | 'rejected' | 'overridden' | 'auto_executed'
  human_action_by text,                               -- email
  human_action_at timestamptz,
  override_value  jsonb,                              -- if Carlos changed the price
  executed_at     timestamptz,                        -- when n8n actually called Hostaway/etc
  executed_result jsonb,                              -- vendor response
  created_at      timestamptz not null default now()
);
create index on agent_decisions (agent_id, created_at desc);
create index on agent_decisions (subject_table, subject_id);
create index on agent_decisions (human_action) where human_action is null; -- "needs review"
```

### Operational tables (4)

#### 9. `exceptions` — The Home page hub
```sql
create table exceptions (
  id              uuid primary key default gen_random_uuid(),
  source_agent    text references agents(id),       -- which agent escalated, null = human-flagged
  source_decision_id uuid references agent_decisions(id),
  urgency         text not null,                    -- 'critical' | 'high' | 'medium' | 'low'
  title           text not null,
  body            text,
  subject_table   text,
  subject_id      uuid,
  state           text not null default 'open',    -- 'open' | 'acted' | 'dismissed' | 'snoozed'
  acted_by        text,
  acted_at        timestamptz,
  snoozed_until   timestamptz,
  created_at      timestamptz not null default now()
);
create index on exceptions (state, urgency, created_at desc) where state = 'open';
```

#### 10. `action_log` — Append-only audit (what humans did, what agents did)
```sql
create table action_log (
  id              bigserial primary key,
  actor_type      text not null,                    -- 'human' | 'agent' | 'system'
  actor_id        text not null,                    -- email or agent_id
  action          text not null,                    -- 'approve_pricing' | 'dispatch_cleaner' | 'send_guest_reply' | 'undo_action'
  subject_table   text,
  subject_id      uuid,
  payload         jsonb,                             -- before/after diff
  idempotency_key text,                              -- pairs with agent_runs / outbound webhook
  result          text,                              -- 'ok' | 'failed' | 'pending'
  created_at      timestamptz not null default now()
);
create index on action_log (actor_id, created_at desc);
create index on action_log (idempotency_key);
```

#### 11. `knowledge_documents` — Per-property KB source documents
```sql
create table knowledge_documents (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid references properties(id),  -- null = global KB
  kind            text not null,                    -- 'house_manual' | 'wifi_guide' | 'neighborhood' | 'pricing_strategy'
  title           text not null,
  source_url      text,                             -- if scraped/imported
  content         text not null,                    -- raw markdown/text before chunking
  version         integer not null default 1,
  updated_at      timestamptz not null default now()
);
```

#### 12. `knowledge_chunks` — Vector-indexed retrievable chunks (pgvector)
```sql
create extension if not exists vector;

create table knowledge_chunks (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references knowledge_documents(id) on delete cascade,
  property_id     uuid references properties(id),  -- denormalized for fast filtered ANN
  agent_scope     text[] default '{}',              -- which agents may retrieve this chunk
  chunk_index     integer not null,
  content         text not null,
  embedding       vector(1536),                      -- OpenAI ada-002 size; Claude uses different — pick at impl time
  token_count     integer,
  created_at      timestamptz not null default now()
);
create index on knowledge_chunks (property_id);
create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

**Companion RPC** (so n8n can retrieve via REST/PostgREST, not raw SQL):
```sql
create or replace function match_knowledge (
  query_embedding vector(1536),
  match_property_id uuid,
  match_agent text,
  match_count int default 6,
  match_threshold float default 0.75
)
returns table (
  id uuid, content text, similarity float, document_id uuid
) language sql stable as $$
  select kc.id, kc.content,
         1 - (kc.embedding <=> query_embedding) as similarity,
         kc.document_id
  from knowledge_chunks kc
  where (kc.property_id = match_property_id or kc.property_id is null)
    and (match_agent = any(kc.agent_scope) or array_length(kc.agent_scope, 1) is null)
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;
```

### Relationships (ASCII)

```
              ┌──────────────┐
              │  properties  │◄────────────────────────────┐
              └──────┬───────┘                              │
                     │                                       │
        ┌────────────┼─────────────┬──────────────┐         │
        ▼            ▼             ▼              ▼         │
   ┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐      │
   │bookings│  │cleanings │  │  claims  │  │knowledge_documents│
   └───┬────┘  └────┬─────┘  └────┬─────┘  └────┬───┘      │
       │           │              │              │          │
       ▼           │              │              ▼          │
   ┌────────┐      │              │       ┌───────────┐    │
   │ guests │      │              │       │knowledge_ │────┘ property_id
   └────────┘      │              │       │  chunks   │ (denorm + agent_scope)
                   │              │       └───────────┘
                   │              │              ▲
                   │              │              │ kb_chunks_used[]
                   └─────┬────────┘              │
                         ▼                       │
                  ┌─────────────────┐            │
                  │ agent_decisions │────────────┘
                  └─────────┬───────┘
                            ▲
                            │ run_id
                  ┌─────────┴───────┐         ┌─────────┐
                  │   agent_runs    │◄────────│ agents  │
                  └─────────┬───────┘         └─────────┘
                            │
                            ▼ source_decision_id
                     ┌──────────────┐
                     │  exceptions  │
                     └──────┬───────┘
                            │ subject_id (poly)
                            ▼
                     ┌──────────────┐
                     │  action_log  │  append-only audit, references everything
                     └──────────────┘
```

### Where shadow mode lives (specified at the schema level)

**Three layered controls — intentional, because go-live is per-agent, not global:**

1. **`agents.mode`** (per-agent default) — `'shadow' | 'live' | 'paused'`. Carlos toggles this from `/agents/[id]` Controls section. Persisted, not localStorage. Surface this in Settings → Agents and in each agent detail page header.

2. **`agent_runs.mode_at_run`** (per-run snapshot) — written at run-start, immutable. If Carlos flips to Live mid-run, the run still finishes in the mode it started in. This makes audit retroactively coherent.

3. **`agent_decisions.shadow_mode`** (per-decision boolean) — denormalized from `mode_at_run` so the Pricing decisions table can render "Logged (Shadow)" / "Auto-Applied" badges without joining. **This is the field the UI reads.** Toggling `agents.mode` does not retroactively change historical decision rows.

**The contract:** if `shadow_mode = true`, the n8n callback writes the decision row but the outbound vendor call (Hostaway/PriceLabs) is *not* made. The `executed_at` field stays null. Only on human approval (`human_action = 'approved'`) does Casa fire a follow-up "execute this decision" webhook to n8n, which then performs the side-effect and writes `executed_at` + `executed_result` back via callback.

This is the single mechanic that makes Pricing testable today: Carlos sees what the agent *would* do without it actually doing it.

---

## Webhook Contract (Casa ↔ n8n)

### Outbound: Casa → n8n (action dispatch)

**Endpoint pattern:** `https://fyi-media.app.n8n.cloud/webhook/{agent}/{action}`
**Auth:** Header authentication — `X-Casa-Signature: <hex HMAC-SHA256 of raw body using N8N_INBOUND_SECRET>` plus `X-Casa-Timestamp: <unix>` to defeat replay (reject if > 5 minutes old). n8n's Webhook node natively supports header auth; HMAC verification is done in a first Code node.

**Why HMAC, not just header token:** the header token alone is a static bearer — if it leaks once it's hot forever. HMAC over `timestamp + body` means an attacker who sniffs one request cannot replay or modify it. The Crypto node in n8n computes the same HMAC on receive and compares; mismatch returns 401.

**Payload shape (example: pricing approval):**
```json
{
  "idempotency_key": "casa-act-7e3f9b2c-pricing-approve-2026-05-14T14:32:11Z",
  "action": "pricing.approve",
  "actor": { "type": "human", "id": "carlos@casa.com" },
  "agent": "pricing",
  "decision_id": "8c1a...",
  "subject": { "table": "properties", "id": "..." },
  "payload": {
    "new_rate": 412.00,
    "previous_rate": 389.00,
    "effective_dates": ["2026-05-20", "2026-05-26"]
  },
  "context": {
    "mode": "live",
    "casa_url": "https://casa.../agents/pricing/decisions/8c1a..."
  }
}
```

**Casa's API route fire-and-forget pattern:** the `/api/actions/*` route writes the action_log row + flips `agent_decisions.human_action = 'approved'` *before* awaiting n8n. n8n dispatch is async (background). If n8n is down, the action_log row already exists with `result = 'pending'`; a reconciliation cron can retry.

**Response Casa expects from n8n:** `202 Accepted` immediately with `{ "execution_id": "n8n-...", "received": true }`. The actual vendor result comes back later as a callback (next section). This is critical — vendor calls (Hostaway, PriceLabs) can take 5–30 seconds and would otherwise block the UI thread.

### Inbound: n8n → Casa (run completion / decision callback)

**Endpoint:** `POST /api/webhooks/n8n` (one Next.js API route, dispatches internally by `event` field)
**Auth:** mirror — `X-N8n-Signature: <HMAC-SHA256>` using `N8N_OUTBOUND_SECRET`. Reject on timestamp skew or signature mismatch with 401.

**Payload shape (example: pricing agent run completed in shadow mode):**
```json
{
  "idempotency_key": "n8n-exec-9f2a-pricing-2026-05-14T14:30:00Z",
  "event": "agent.run.completed",
  "execution_id": "9f2a3b...",
  "agent": "pricing",
  "run": {
    "trigger": "cron",
    "started_at": "2026-05-14T14:30:00Z",
    "finished_at": "2026-05-14T14:30:18Z",
    "mode_at_run": "shadow",
    "status": "succeeded",
    "tokens_in": 12480,
    "tokens_out": 980,
    "cost_usd": 0.0742
  },
  "decisions": [
    {
      "decision_type": "price_change",
      "subject": { "table": "properties", "id": "..." },
      "proposed": { "new_rate": 412.00, "previous_rate": 389.00, "dates": ["2026-05-20"] },
      "rationale": "Demand signal: ...",
      "kb_chunks_used": ["chunk-uuid-1", "chunk-uuid-2"],
      "confidence": 0.86
    }
  ],
  "exceptions": []
}
```

**Idempotency rule:** every inbound webhook MUST carry `idempotency_key`. Casa's handler does `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING` against `agent_runs`. A duplicate callback (n8n retry, double-fire) becomes a no-op. This is the single most important durability property in the system.

**Why callback-based (not polling):** n8n's "Respond to Webhook" node in immediate-respond mode lets the workflow continue running after returning 202. Casa never has to poll for completion. Combined with Supabase Realtime, the user experience is: Carlos clicks Approve → optimistic UI → action_log row appears → 1–3 seconds later n8n callback writes `executed_at` → Realtime pushes the row update → "Auto-applied to PriceLabs ✓" badge appears live.

### Auth pattern summary

| Direction | Secret | Header(s) | Verify location |
|-----------|--------|-----------|-----------------|
| Casa → n8n | `N8N_INBOUND_SECRET` (server-only env) | `X-Casa-Signature`, `X-Casa-Timestamp` | n8n Code node, first in workflow |
| n8n → Casa | `N8N_OUTBOUND_SECRET` (server-only env) | `X-N8n-Signature`, `X-N8n-Timestamp` | `/api/webhooks/n8n` Next.js route |

Two separate secrets — compromising one direction does not compromise the other. Both are server-only (`process.env`, never `NEXT_PUBLIC_*`).

---

## Action Button Flow (Approve / Reject / Dispatch / Override)

The user's specific question: *where does the optimistic UI go, where does retry happen, where does Undo live?*

### End-to-end trace (Carlos clicks Approve on a pricing exception card)

```
1. CLIENT  Exception card "Approve" button
   ├─ optimistic state: card flips to "Approving…" + toast appears with 6s Undo timer
   └─ POST /api/actions/pricing/approve  { decision_id, idempotency_key: client-generated nanoid }

2. SERVER  /api/actions/pricing/approve (Next.js Route Handler)
   ├─ auth check (Supabase session cookie)
   ├─ INSERT action_log (actor=carlos, action=approve_pricing, result=pending, idempotency_key)
   ├─ UPDATE agent_decisions SET human_action='approved', human_action_by=..., human_action_at=now()
   │  WHERE id = decision_id AND human_action IS NULL
   │  (the NULL guard prevents double-approve race)
   ├─ if rowcount = 0: return 409 Conflict — UI rolls back optimistic state
   └─ enqueue n8n dispatch (await is awaited, but n8n returns 202 in <500ms)
       └─ POST {n8n}/webhook/pricing/execute (with HMAC + idempotency_key)

3. CLIENT  receives 200 OK from /api/actions/pricing/approve
   ├─ replaces optimistic state with confirmed state
   ├─ toast continues showing "Approved · Undo" for remainder of 6s window
   └─ when 6s elapses: toast auto-dismisses, Undo button disappears

4. UNDO PATH (within 6s)
   ├─ POST /api/actions/undo  { action_log_id }
   ├─ Server checks: is window still open? Is executed_at still null on the decision?
   ├─ If both: UPDATE agent_decisions SET human_action=NULL; INSERT action_log undo entry
   │           POST {n8n}/webhook/pricing/cancel  { decision_id, idempotency_key }
   └─ If executed_at is non-null (n8n already called PriceLabs): Undo is REJECTED with explanation
      ("Already applied to PriceLabs. Use Override to set a different rate.")

5. ASYNC  n8n callback arrives (5–20s after step 2)
   ├─ POST /api/webhooks/n8n  { event: 'decision.executed', decision_id, executed_at, executed_result }
   ├─ UPDATE agent_decisions SET executed_at=..., executed_result=...
   └─ Realtime fires → subscribed Casa tabs see the badge update to "Auto-applied to PriceLabs ✓"
```

### Where each concern lives

| Concern | Lives in | Why |
|---------|----------|-----|
| **Optimistic UI** | Client component (the exception card) | Must respond to click in <50ms; cannot wait for server roundtrip |
| **Idempotency key** | Client-generated nanoid, threaded server → n8n | Same key on retry means same outcome; client owns it because client may retry network failures |
| **Auth gate** | `/api/actions/*` route handler | Trust boundary — never trust client claims about user identity |
| **State mutation** | `/api/actions/*` route handler → Supabase | All writes go through one place; client never writes directly |
| **Retry of n8n dispatch** | Background cron / queue (Phase 2); Phase 1 = "log failure, surface as exception card" | Phase 1 ships May 15 — building a queue is over-scope. If n8n is unreachable, the action_log row stays `result=pending` and a 5-min cron retries. |
| **Undo window timer** | Client (visual) + server check at undo time (real gate) | Client clock is unreliable; server validates `executed_at IS NULL` |
| **Undo reversibility** | Server checks `executed_at` | If vendor side-effect already happened, undo is no longer free — must compensate |
| **Realtime fan-out** | Supabase Realtime postgres_changes channel | Other tabs (Denika's, Carlos's phone) see the same update |

### The Undo design decision

**Phase 1 design: optimistic-with-server-gated reversal, 6-second window.** This is the right tradeoff because:

- n8n callback latency is 5–20s typical (Claude call + Hostaway/PriceLabs roundtrip)
- 6s window means most Undos happen *before* the vendor was called → free reversal
- After 6s, Undo button disappears; if vendor was already called, the appropriate action is "Override" (a new forward action), not "Undo"
- The server check `executed_at IS NULL` is the authoritative gate. UI timer is just a hint.

**Anti-pattern to avoid:** queueing the n8n dispatch for the full Undo window before sending. This trades a real-time agent system for a 6-second-delayed one — Denika would see Carlos's approval take 6s to show up on her tab. Don't do this.

---

## Per-property Knowledge Base (pgvector)

The user's specific question: *how does Casa surface "what this agent knew when it decided"?*

### Storage and population

- `knowledge_documents` holds source-of-truth content (house manual, wifi instructions, owner preferences, pricing strategy notes, listing copy). One row per logical document, versioned.
- `knowledge_chunks` is the embeddings table. n8n owns the chunking + embedding pipeline (chunk on header boundaries or ~500 token windows; embed via OpenRouter or Claude's embedding API; insert via Supabase REST with service role key).
- Each chunk carries `property_id` (or null for global) and `agent_scope` array (which agents may retrieve it — e.g., `{'guest','ops'}`). The KB is multi-agent but agent-scoped.

### Retrieval (n8n side, during agent runs)

n8n's agent workflow embeds the current query (e.g., "guest asking about 4pm late checkout") via the same model, then calls the Supabase RPC `match_knowledge(embedding, property_id, agent, count, threshold)`. Results are templated into the Claude prompt. The chunk UUIDs that came back are recorded — they get included in the callback as `kb_chunks_used`.

### Surfacing in the UI ("why did the agent decide this?")

This is the trust-building lever for shadow mode. Two surfaces:

1. **Decision detail drawer (linked from the decisions table on each agent page).** Shows:
   - The `rationale` field (Claude's own explanation)
   - The `kb_chunks_used` array hydrated into chunk content (`SELECT id, content, document_id FROM knowledge_chunks WHERE id = ANY($1)`)
   - Each chunk links to its source document
   - The `proposed` payload (what would change)
   - The `confidence` score

2. **Property detail → Activity tab.** Lists `agent_decisions WHERE subject_id = property_id` chronologically. Carlos can click any decision to see the same drawer.

The Pricing Agent detail page already has a "Recent Decisions" table — this is where it gets wired. The current math-generated rows get replaced by a `SELECT FROM agent_decisions WHERE agent_id = 'pricing' ORDER BY created_at DESC LIMIT 50` query plus a side-drawer for the rationale + KB chunks.

### Anti-pattern: storing prompts in the codebase

n8n owns prompts. Casa stores the *output* and *which KB chunks were consulted*, not the prompt text. If you want prompt-version traceability, store `prompt_version` on `agent_runs` and let n8n maintain a versioned-prompts table in its own workspace. The Casa repo should never need to deploy to update a prompt.

---

## Build Order (dependency-reasoned)

The user's specific question: *where do dependencies actually constrain order?*

### Hard dependencies (must-be-true-before)

```
[A] Supabase schema + seed
     │
     ├──► [B] Data-access layer (src/lib/data/*) — replaces mock-data imports
     │         │
     │         ├──► [C] One page rewired to data layer (Properties grid — lowest-risk)
     │         │
     │         └──► [F] Realtime subscribe wrapper
     │
     ├──► [D] /api/actions/* skeleton (one route, the simplest: dismiss exception)
     │         │
     │         └──► [E] HMAC sign/verify helper (used by both directions)
     │                   │
     │                   └──► [G] /api/webhooks/n8n inbound handler
     │
     └──► [H] Pricing Agent end-to-end vertical slice
               │  needs: [B] reads, [D] approve route, [E] HMAC, [G] callback, [F] realtime
               │
               └──► [I] Ops cleaner dispatch (same pattern, WhatsApp mocked)
                         │
                         └──► [J] Guest Agent (Hostaway-gated; needs Rachit creds)
                                   │
                                   └──► [K] SOP Agent (after May 15)
```

### Phased build order (with reasoning)

**Phase A — Data foundation (no agent integration yet).**
1. Deploy 12-table schema + pgvector extension + `match_knowledge` RPC to Supabase.
2. Seed properties (26 Vancouver), seed minimal bookings/cleanings/exceptions matching existing mock-data shapes.
3. Generate TypeScript types: `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`.
4. Build `src/lib/data/` modules — one file per entity (`properties.ts`, `bookings.ts`, ...) with the same function names the pages currently import from `mock-data/`. **This is the seam.** Each module exports `getProperties()`, `getProperty(id)`, etc. Real implementation queries Supabase; mock fallback for tests later.
5. Fix env var name (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
6. Replace auth — `src/lib/auth/context.tsx` keeps the hardcoded-credentials map but now reads via a Supabase-mediated session OR stays as-is per PROJECT.md (real auth is Phase 2). Either way, the data layer doesn't depend on this.

*Dependency reasoning:* Nothing else works without the schema. The data layer is the seam that lets you rewire one page at a time instead of a big-bang cutover.

**Phase B — Read-side cutover (one page at a time).**
1. Properties grid + detail — read-only, no writes, lowest risk. Validates the data layer works.
2. Bookings list + detail — slightly more complex (joins to guests, properties).
3. Home page exception cards — still read-only at this stage (Approve buttons stay console.log).
4. Cleanings, Claims pages — same pattern.

*Dependency reasoning:* Read paths are independent of n8n. Rewiring them surfaces shape mismatches between mock-data types and real schema before action wiring makes a mismatch costly.

**Phase C — Action contracts (one route, one shape).**
1. Build `src/lib/n8n/sign.ts` HMAC helper (sign + verify). Unit test it locally with curl.
2. Build `/api/actions/exceptions/dismiss` as the simplest action — no n8n call, just a Supabase update. This validates: auth check → action_log write → state update → return shape.
3. Build `/api/webhooks/n8n` skeleton that verifies signature, parses payload, no-ops with 200. Test by curling from local with a manually-signed request.
4. Build `/api/actions/pricing/approve` — first action that fires an n8n webhook. n8n side: minimal workflow that receives, verifies HMAC, returns 202, fires callback to `/api/webhooks/n8n` after 5s with a fake `decision.executed` payload.

*Dependency reasoning:* The HMAC helper is shared by every action and every callback. Build it once, prove it once. The first end-to-end roundtrip (Casa → n8n → Casa) needs to exist before you scale to four agents.

**Phase D — Realtime + Undo + first real agent (Pricing).**
1. Build `useRealtimeChannel` hook (wraps `supabase.channel('table-changes').on('postgres_changes', ...)`).
2. Subscribe Home page exception list and Pricing decisions table to realtime.
3. Implement Undo properly — `/api/actions/undo` route with the `executed_at IS NULL` gate.
4. Pricing Agent end-to-end: n8n cron job runs every N minutes, calls PriceLabs API for recommendations, writes to `agent_runs` + `agent_decisions` via callback in shadow mode. Decisions table on `/agents/pricing` renders real rows. Approve button fires `/api/actions/pricing/approve`, which dispatches to n8n, which calls PriceLabs (or mocks it), which callbacks with `executed_result`.

*Dependency reasoning:* Realtime is needed before Pricing goes live so multiple operators see updates. Undo is needed before any action that has a vendor side-effect goes live. Pricing is first because it's the only agent with no Rachit dependency — PriceLabs creds may exist; even if not, the n8n side can mock the vendor call and the Casa-side flow is identical.

**Phase E — Ops cleaner dispatch (May 15 critical path).**
1. WhatsApp dispatch is mocked (Meta Business API gated on Rachit). n8n's "send WhatsApp" node becomes "log to action_log + write to cleanings.whatsapp_thread".
2. Cleaner-reply parser: separate n8n workflow that, when WhatsApp creds land, listens for inbound replies and updates `cleanings.dispatch_state`.
3. 60min → Carly fallback, 120min → escalation as exception card: n8n cron checks `cleanings WHERE dispatch_state='dispatched' AND dispatched_at < now() - 60min` and re-dispatches or creates an exception row.

*Dependency reasoning:* Same Casa-side pattern as Pricing. Phase E is mostly n8n workflow work, not Casa work. Casa changes: cleanings page reads real rows, dispatch button fires real webhook.

**Phase F — Guest Agent (Hostaway-gated).**
1. Blocked on Rachit forwarding Hostaway access. Build n8n side against Hostaway sandbox if available; otherwise stub.
2. Casa side: Bookings detail page conversation thread reads from `bookings.id`-joined message history (need an `inbound_messages` extension — possibly a 13th table, possibly inline JSONB on bookings; defer until access lands).
3. Sensitive-escalation: Guest agent decisions with `decision_type='guest_reply_draft'` AND `confidence < threshold` create exception rows automatically (n8n workflow logic).

*Dependency reasoning:* Hostaway access is the gating dependency. Build everything Casa-side that doesn't need Hostaway first.

**Phase G — SOP Agent (after May 15).**
Listing-push workflow. Lowest priority. Same Casa-side pattern.

### What can be parallelized

- Phase B (read cutover) and Phase C (action contracts) can run in parallel as long as they don't touch the same files. Different pages get rewired by different sessions.
- Phase E (Ops) and Phase F (Guest) are blocked on different credentials — they sequence by whichever creds Rachit forwards first.

### What absolutely cannot be skipped

- HMAC helper before *any* n8n webhook fires.
- Idempotency_key field on agent_runs before *any* callback handler exists. n8n retries are inevitable.
- `mode_at_run` snapshot before going Live on any agent. Without it, audit is destroyed when a mode toggle happens.
- `executed_at` field on agent_decisions before Undo ships. Without it, Undo can silently revert a vendor side-effect.

---

## Scaling Considerations

Casa is single-tenant, 3 users, 26 properties. The scaling concerns are not about scale — they are about *frequency*.

| Concern | At 26 properties / 3 users | Adjustment if 200 properties / 10 users |
|---------|----------------------------|------------------------------------------|
| Agent run volume | Pricing daily, Guest per-message, Ops per-turnover. ~50-200 runs/day. | Same pattern. Supabase free tier is fine. |
| Realtime channels | One channel per user-page combination. ~10 simultaneous channels. | Move to filtered channels with RLS once auth migrates. |
| pgvector chunks | ~50-100 chunks per property × 26 = ~2.5K rows. IVFFLAT with `lists=100` is overkill but cheap. | At 50K+ chunks, switch to HNSW index. |
| n8n executions | Free tier handles 5K/month. At 200 runs/day = 6K/month, just over. | Move to n8n Cloud paid tier ($20/mo). |
| action_log growth | ~500 rows/day. Trivial. | Partition by month after year 1 if it exceeds 10M rows. |

### What breaks first

1. **n8n cold-start latency** on the free tier — the first webhook of the day can take 10-15s. Mitigation: a 5-minute heartbeat ping cron in n8n itself keeps it warm. Or move to the always-on tier.
2. **Supabase Realtime connection limits** on free tier (200 concurrent). Single-tenant is nowhere near. Multi-tenant adds RLS-filtered channels and this matters more.
3. **OpenRouter rate limits** under burst (e.g., 26 properties all repricing at once). n8n's queue node serializes calls. Anthropic also publishes per-minute caps.

---

## Anti-Patterns Specific to This System

### Anti-Pattern 1: Casa calls vendor APIs directly

**What people do:** "It's faster to just `fetch('https://api.hostaway.com/...')` from the Casa API route."
**Why it's wrong:** Casa is the supervisor surface. Putting vendor SDKs in Casa means vendor secrets in Casa env, vendor retry logic in Casa, vendor rate limits affecting Casa request times. It also fragments the agent — half the workflow in n8n, half in Casa.
**Do this instead:** Casa fires a webhook to n8n; n8n owns every external HTTP call. The cost is one extra network hop; the benefit is one place to handle vendor failures.

### Anti-Pattern 2: Writing to Supabase from inside n8n agent steps using INSERT statements

**What people do:** n8n's Supabase node + raw SQL to insert decisions mid-workflow.
**Why it's wrong:** Bypasses Casa's `/api/webhooks/n8n` handler, which is where validation, signature verification (in reverse), and idempotency dedupe live. State changes happen without an audit trail of *which n8n execution* wrote them.
**Do this instead:** n8n calls Casa's `/api/webhooks/n8n` callback endpoint with the structured event. Casa does the write. There is exactly one path into the database.

**Exception:** n8n *embeddings ingestion* (knowledge_chunks bulk insert) is fine to do directly with the service role key — it's a build-time pipeline, not a runtime decision flow.

### Anti-Pattern 3: Optimistic UI updates that bypass Realtime

**What people do:** After Approve, mutate local React state to remove the exception card. Don't subscribe to realtime.
**Why it's wrong:** Denika's tab still shows the exception. Carlos's phone shows it. The Home page is stale.
**Do this instead:** Optimistic update for instant feedback, AND realtime subscription that authoritatively reconciles. If the realtime event contradicts the optimistic state (e.g., a 409 came back), the realtime event wins.

### Anti-Pattern 4: One mega-route `/api/actions` that switches on `action` field

**What people do:** Single Next.js route handler with a giant switch statement for every action type.
**Why it's wrong:** Every action shares the same auth, same validation, same error mapping. Diverging action shapes get forced into a lowest-common-denominator union type. Logging granularity collapses.
**Do this instead:** One route per action, sharing a `src/lib/api/withAction(handler)` wrapper that handles auth + action_log + HMAC dispatch + error shape. Routes like `/api/actions/pricing/approve/route.ts`, `/api/actions/exceptions/dismiss/route.ts`. Each is 15-30 lines.

### Anti-Pattern 5: Polling Supabase from client for "is this run done yet?"

**What people do:** After clicking Approve, `setInterval` that re-queries `agent_decisions` every 2 seconds.
**Why it's wrong:** Wastes battery on Carlos's phone, hammers Supabase, and is slower than the realtime channel by 1-2 seconds.
**Do this instead:** Realtime subscription on the row's table with a filter for the decision_id. The subscription is the completion signal.

### Anti-Pattern 6: Treating `agents.mode` as a single global "are we shadow or live" flag

**What people do:** Add a localStorage boolean `isShadowMode` that gates everything.
**Why it's wrong:** Per PROJECT.md, agents go live on different timelines. Ops cleaner dispatch will be autonomous before Guest. The mode is per-agent, period.
**Do this instead:** The three-layer model in the Schema section. `agents.mode` is the default, `mode_at_run` is the snapshot, `shadow_mode` on the decision is what the UI reads.

---

## Integration Points

### External Services (all proxied through n8n)

| Service | n8n integration pattern | Phase | Notes |
|---------|--------------------------|-------|-------|
| Hostaway | HTTP Request node + Bearer token in n8n credentials | F (Guest) | Gated on Rachit |
| PriceLabs | HTTP Request node + API key | D (Pricing) | May already have creds |
| Breezeway | HTTP Request node + Basic auth | E (Ops) | Gated on Rachit |
| Meta WhatsApp Business | HTTP Request node + long-lived token | E (Ops) | Gated on Rachit; mock until then |
| OpenRouter (Claude Sonnet 4.5) | n8n's "OpenAI-compatible" or HTTP Request node | All agents | API key already configured |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Casa client ↔ Casa server | RSC props (initial) + fetch to /api/* (mutations) + Supabase Realtime (live) | One trust boundary |
| Casa server ↔ Supabase | Service-role client in `/api/*`, anon client in middleware | Service role MUST stay server-only |
| Casa server ↔ n8n | HMAC-signed webhook in each direction, separate secrets | Two trust boundaries (each direction independently auth'd) |
| n8n ↔ vendor APIs | n8n credentials (per-vendor) | Casa never sees vendor secrets |
| n8n ↔ Claude | OpenRouter via API key in n8n | Casa never sees the prompts |

---

## Sources

- Context7 `/n8n-io/n8n-docs` — Webhook Node authentication (Header auth, HMAC via Crypto node), Respond-to-Webhook node pattern (202 immediate, callback later). HIGH confidence.
- Context7 `/supabase/supabase` — Realtime postgres_changes channel pattern, pgvector `match_documents` RPC, IVFFLAT index for cosine search. HIGH confidence.
- `.planning/PROJECT.md` — Requirements REQ-DATA-01 through REQ-UI-03, build-order rationale, scope boundaries. HIGH confidence (project-internal).
- `.planning/codebase/CONCERNS.md` — Dual-auth conflict, mock-data boundary, env var mismatch — informs Phase A ordering. HIGH confidence.
- `.planning/codebase/ARCHITECTURE.md` — Current rendering model (all `"use client"`), Supabase clients scaffolded but unused — informs RSC opportunistic conversion. HIGH confidence.
- Inferred reference schema columns — synthesized from `src/lib/mock-data/*.ts` shapes plus shadow-mode operational requirements. MEDIUM confidence (user has not approved column-level design).

---

*Architecture research for: Casa Command Center agent-integration milestone*
*Researched: 2026-05-14*
