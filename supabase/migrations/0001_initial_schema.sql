-- ============================================================================
-- Casa Command Center — Initial Schema (Phase 2, Plan 01)
-- Project: aqsitrzbjokkkpcohple
-- ----------------------------------------------------------------------------
-- 12-table foundation for the Casa supervisor dashboard. Authored as raw
-- Postgres DDL — no Supabase CLI assumptions (D-05). Applied by the operator
-- via Supabase Studio SQL Editor or `supabase db push`.
--
-- Two-tier strategy (D-01/D-02):
--   * Structural shells for all 12 tables land NOW.
--   * Phase-3 "safety mechanic" columns ride along in this migration because
--     retrofitting them after rows exist is expensive (PITFALLS 3/4/6/9).
--   * Phase 4-6 columns (turnovers.whatsapp_thread, turnovers.dispatch_state,
--     agent_logs.kb_chunks_used[], claim JSON blobs) are deliberately NOT here
--     (D-04) — each later phase adds its own columns in its own migration.
--
-- Type conventions (Claude's discretion, D-15 / 02-CONTEXT):
--   * `text` over `varchar` — Postgres treats them identically; text is idiomatic.
--   * `timestamptz` over `timestamp` — every time value is absolute UTC; the
--     dashboard renders in America/Vancouver but storage stays tz-aware.
--   * `numeric(10,2)` for money/rates — exact decimal, no float rounding drift.
--   * `integer` for counts (sqft, beds, guests, token counts).
--   * `boolean` for flags, `jsonb` only where a structured blob is unavoidable.
--   * Enum-like constrained columns use `text` + a CHECK constraint rather than
--     native Postgres ENUM types — CHECK constraints are cheaper to evolve
--     (Phase 3 may add lifecycle states) and do not break logical replication,
--     which Phase 3 realtime depends on.
--
-- No extensions are created here. pgvector / HNSW for knowledge_chunks is a
-- Phase 5 concern (D-03); `gen_random_uuid()` is built into Postgres 13+ via
-- pgcrypto being preloaded on Supabase, so no `create extension` is needed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. properties — the 26-home Vancouver portfolio
-- ----------------------------------------------------------------------------
-- id is TEXT (p01..p26) not uuid: the seed needs stable, human-readable ids
-- that the narrative mock-data and exception cards reference directly.
create table properties (
  id            text primary key,
  name          text not null,
  neighborhood  text not null,
  type          text not null,                 -- e.g. "2BR Suite", "Studio"
  rate          numeric(10,2) not null,         -- nightly base rate, CAD
  status        text not null default 'Active'
                  check (status in ('Active', 'Maintenance', 'New')),
  sqft          integer,
  beds          integer,
  baths         numeric(3,1),                   -- numeric: half-baths (2.5) exist
  max_guests    integer,
  owner         text,
  owner_email   text,
  owner_phone   text,
  comm_pref     text check (comm_pref in ('WhatsApp', 'Email', 'Phone')),
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. guests — guest identities behind bookings
-- ----------------------------------------------------------------------------
create table guests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text,
  phone         text,
  language      text default 'en',              -- ISO 639-1; Guest Agent (P5) uses this
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. bookings — reservations across channels
-- ----------------------------------------------------------------------------
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  property_id   text references properties(id),
  guest_id      uuid references guests(id),
  channel       text check (channel in ('Airbnb', 'Vrbo', 'BookingCom', 'Direct')),
  status        text not null default 'Confirmed'
                  check (status in ('Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled')),
  check_in      date,
  check_out     date,
  nights        integer,
  guests_count  integer,
  total_amount  numeric(10,2),                  -- gross booking value, CAD
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. agents — the four Casa AI agents (Pricing, Guest, Ops, SOP)
-- ----------------------------------------------------------------------------
-- id is TEXT (the agent key: 'pricing'|'guest'|'ops'|'sop') — stable, matches
-- the AGENTS mock-data keys and the n8n workflow's agent references.
-- mode defaults to 'shadow' (D-02 / SAFE-01): a new agent never dispatches to
-- an external system until a human explicitly promotes it to 'live'.
create table agents (
  id            text primary key,
  name          text not null,
  tagline       text,
  mode          text not null default 'shadow'
                  check (mode in ('shadow', 'live')),
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. agent_runs — one row per n8n workflow execution
-- ----------------------------------------------------------------------------
-- idempotency_key UNIQUE (D-02 / PITFALL 3): n8n webhooks are at-least-once;
-- a duplicate run-write is rejected at the DB layer, not retroactively.
-- expected_callback_by + status + completed_at (SAFE-05 / PITFALL 6): the
-- Phase-3 watchdog cron sweeps for runs past their callback deadline.
-- mode_at_run (SAFE-01): snapshots the agent's mode at trigger time so a
-- later mode flip cannot rewrite history of whether a run dispatched.
create table agent_runs (
  id                    uuid primary key default gen_random_uuid(),
  agent_id              text references agents(id),
  idempotency_key       text unique,            -- UNIQUE: dedup n8n retries (PITFALL 3)
  status                text not null default 'pending'
                          check (status in ('pending', 'running', 'completed', 'failed')),
  mode_at_run           text check (mode_at_run in ('shadow', 'live')),
  trigger               text,                   -- e.g. 'weekly-pricing', 'manual'
  started_at            timestamptz default now(),
  expected_callback_by  timestamptz,            -- watchdog deadline (SAFE-05)
  completed_at          timestamptz,
  created_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. agent_logs — individual agent decisions / outputs
-- ----------------------------------------------------------------------------
-- shadow_mode (SAFE-01): true means the decision was logged but NOT dispatched
-- externally. Drives the "Logged (Shadow)" vs "Dispatched (Live)" pill.
-- run_id ties a log line back to its n8n execution (nullable — seed rows and
-- manually-inserted decisions may have no run).
create table agent_logs (
  id            uuid primary key default gen_random_uuid(),
  agent_id      text references agents(id),
  run_id        uuid references agent_runs(id),
  property_id   text references properties(id),
  action        text,                           -- e.g. 'reprice', 'draft_reply'
  reasoning     text,                           -- the agent's narrative output
  shadow_mode   boolean not null default true,  -- logged-only vs dispatched (SAFE-01)
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. pricing_recs — per-property rate recommendations
-- ----------------------------------------------------------------------------
-- status three-state lifecycle (D-02 / PITFALL 4): pending -> accepted ->
-- dispatched. Phase 2 only SEEDS rows in pending/accepted and the UI READS
-- them; Phase 3 wires the transitions. The column lands now so Phase 3's
-- handlers have a target. executed_at stamps when the rec actually dispatched.
create table pricing_recs (
  id              uuid primary key default gen_random_uuid(),
  property_id     text references properties(id),
  run_id          uuid references agent_runs(id),
  week_start      date,                         -- the pricing week this rec covers
  current_rate    numeric(10,2),
  recommended_rate numeric(10,2),
  change_pct      numeric(6,2),                 -- signed % delta (e.g. -8.10, 24.70)
  reasoning       text,
  status          text not null default 'pending'
                    check (status in ('pending', 'accepted', 'dispatched')),
  executed_at     timestamptz,                  -- set when status -> dispatched
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. exceptions — the operator-facing exception cards
-- ----------------------------------------------------------------------------
-- property_id is NULLABLE: portfolio-wide cards (the "Pricing Week" mega-card)
-- belong to no single property.
-- state: the exception lifecycle column (D-02) — Phase 3 transitions it.
-- claimed_by / claimed_at (SAFE-04 / PITFALL 5): the atomic-claim guard so two
-- operators acting on the same card cannot both fire side effects.
-- executed_at: stamps when the exception's action was carried out.
create table exceptions (
  id            uuid primary key default gen_random_uuid(),
  property_id   text references properties(id),  -- nullable: portfolio-wide cards
  type          text,                            -- machine type, e.g. 'guest_complaint'
  type_label    text,
  urgency       text check (urgency in ('Critical', 'High', 'Medium', 'Low')),
  category      text check (category in
                  ('Guest', 'Cleaner', 'Pricing', 'Maintenance',
                   'Owner', 'Revenue', 'Pipeline', 'Compliance')),
  agent         text,                            -- attributed agent name (free text)
  summary       text,
  suggested     text,                            -- the recommended operator action
  source        text,                            -- attribution footer
  state         text not null default 'open'
                  check (state in ('open', 'claimed', 'resolved', 'dismissed')),
  claimed_by    text,                            -- operator id holding the card (SAFE-04)
  claimed_at    timestamptz,
  executed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. action_log — audit trail of operator + system actions
-- ----------------------------------------------------------------------------
-- idempotency_key (D-02 / PITFALL 3): present so Phase-3 action routes can
-- dedup. NOT marked UNIQUE here — only agent_runs needs the hard DB-level
-- uniqueness gate this phase; action_log's uniqueness strategy is a Phase-3
-- design decision (it may key on a composite). executed_at stamps completion.
create table action_log (
  id              uuid primary key default gen_random_uuid(),
  entity_type     text,                          -- e.g. 'pricing_rec', 'exception'
  entity_id       text,                          -- the affected row's id (text: ids vary)
  action          text,                          -- e.g. 'approve', 'reject', 'override'
  actor           text,                          -- operator id or 'system'
  idempotency_key text,                          -- dedup key (PITFALL 3)
  detail          jsonb,                         -- structured action payload
  executed_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. turnovers — cleaning turnovers between bookings
-- ----------------------------------------------------------------------------
-- Structural shell only. Phase 4 (Ops cleaner dispatch) adds the
-- whatsapp_thread JSONB and the dispatch_state enum (D-04) — NOT here.
create table turnovers (
  id            uuid primary key default gen_random_uuid(),
  property_id   text references properties(id),
  booking_id    uuid references bookings(id),
  cleaner       text,                            -- assigned cleaner name
  scheduled_for date,
  status        text not null default 'Assigned'
                  check (status in
                    ('Assigned', 'Dispatched', 'InProgress', 'Completed', 'NoResponse')),
  quality_score integer,                         -- 0-100 post-clean score
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 11. claims — damage / deposit claims
-- ----------------------------------------------------------------------------
-- Structural shell. Claim-specific JSON evidence blobs are deferred (D-04).
create table claims (
  id            uuid primary key default gen_random_uuid(),
  property_id   text references properties(id),
  booking_id    uuid references bookings(id),
  description   text,
  amount        numeric(10,2),                   -- claimed amount, CAD
  status        text not null default 'Pending'
                  check (status in ('Pending', 'Submitted', 'Resolved')),
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 12. knowledge_chunks — per-property knowledge base (STRUCTURAL SHELL ONLY)
-- ----------------------------------------------------------------------------
-- D-03: this is the table skeleton only. The pgvector extension, an
-- `embedding vector(...)` column, the HNSW index, and the
-- `match_knowledge_for_property` RPC are ALL deferred to Phase 5 (Guest Agent
-- KB). Acceptable to leave this table empty/minimal this phase.
create table knowledge_chunks (
  id            uuid primary key default gen_random_uuid(),
  property_id   text references properties(id),
  content       text,
  created_at    timestamptz not null default now()
);
