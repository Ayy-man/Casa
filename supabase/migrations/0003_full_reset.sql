-- ============================================================================
-- Casa Command Center — FULL RESET (Phase 2 recovery)
-- Project: aqsitrzbjokkkpcohple  ← run this ONLY against that project's SQL Editor
-- ----------------------------------------------------------------------------
-- Supersedes 0002_seed.sql and the earlier 0003_app_access_and_reseed.sql.
-- Earlier runs gave contradictory errors (duplicate key vs. relation does not
-- exist) — the DB state is unknown. This script is STATE-INDEPENDENT and
-- idempotent: it works whether the tables are missing, partial, or fully
-- populated. Run this file ALONE. Do not run 0001 / 0002 / old-0003 alongside.
--
--   Part A — DROP all 12 tables if they exist (clean slate)
--   Part B — CREATE the 12-table schema (identical to 0001)
--   Part C — APP ACCESS: disable RLS + grant CRUD to anon/authenticated
--   Part D — SEED the 6 tables (identical to 0002)
-- ============================================================================

-- ── Part A: drop everything (CASCADE clears FK dependents) ──────────────────
drop table if exists
  public.action_log, public.agent_logs, public.agent_runs, public.exceptions,
  public.pricing_recs, public.claims, public.turnovers, public.bookings,
  public.knowledge_chunks, public.guests, public.agents, public.properties
  cascade;

-- ============================================================================
-- Part B: SCHEMA  (verbatim from 0001_initial_schema.sql)
-- ============================================================================
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

-- ============================================================================
-- Part C: APP ACCESS — no-RLS milestone (PROJECT.md defers RLS to v2)
-- ============================================================================
alter table public.properties        disable row level security;
alter table public.agents            disable row level security;
alter table public.guests            disable row level security;
alter table public.bookings          disable row level security;
alter table public.agent_runs        disable row level security;
alter table public.agent_logs        disable row level security;
alter table public.pricing_recs      disable row level security;
alter table public.exceptions        disable row level security;
alter table public.action_log        disable row level security;
alter table public.turnovers         disable row level security;
alter table public.claims            disable row level security;
alter table public.knowledge_chunks  disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- ============================================================================
-- Part D: SEED  (verbatim from 0002_seed.sql)
-- ============================================================================
-- ----------------------------------------------------------------------------
-- properties — 26 rows, verbatim from PROPERTIES (src/lib/mock-data/properties.ts)
-- ----------------------------------------------------------------------------
insert into properties (id, name, neighborhood, type, rate, status, sqft, beds, baths, max_guests, owner, owner_email, owner_phone, comm_pref) values
  ('p01', '1455 Howe St',      'Yaletown',        '2BR Suite',  285, 'Active',      920,  2, 2,   4, 'Helena Wong',     'helena.wong@example.com', '+1 604 555 0142', 'WhatsApp'),
  ('p02', '989 Nelson St',     'Downtown',        '1BR Condo',  210, 'Active',      640,  1, 1,   2, 'Marc Eldridge',   'marc.eld@example.com',    '+1 604 555 0188', 'Email'),
  ('p03', '3280 W Broadway',   'Point Grey',      '3BR House',  420, 'Active',     1820,  3, 2.5, 6, 'James Park',      'james.park@example.com',  '+1 604 555 0119', 'Phone'),
  ('p04', '2255 Davie St',     'West End',        '1BR Condo',  220, 'Active',      640,  1, 1,   2, 'Aisha Rahman',    'aisha.r@example.com',     '+1 604 555 0170', 'WhatsApp'),
  ('p05', '1633 Quebec St',    'Olympic Village', '2BR Condo',  310, 'Active',     1040,  2, 2,   4, 'Sarah Chen',      'sarah.chen@example.com',  '+1 604 555 0151', 'Email'),
  ('p06', '5550 Cambie St',    'Cambie',          '1BR Condo',  195, 'Maintenance', 720,  1, 1,   2, 'Diana Okafor',    'diana.o@example.com',     '+1 604 555 0193', 'WhatsApp'),
  ('p07', '788 Hamilton St',   'Yaletown',        '1BR Loft',   360, 'Active',      880,  1, 1.5, 3, 'Olivia Smith',    'olivia.s@example.com',    '+1 604 555 0114', 'Email'),
  ('p08', '1100 Granville St', 'Downtown',        '1BR Condo',  175, 'Active',      580,  1, 1,   2, 'Rohan Mehta',     'rohan.m@example.com',     '+1 604 555 0167', 'WhatsApp'),
  ('p09', '4321 Main St',      'Mt Pleasant',     '2BR Condo',  240, 'Active',      880,  2, 1,   4, 'Sasha Belkin',    's.belkin@example.com',    '+1 604 555 0136', 'Phone'),
  ('p10', '601 Beach Crescent','Yaletown',        '2BR Condo',  295, 'Active',     1100,  2, 2,   4, 'Lily Tanaka',     'l.tanaka@example.com',    '+1 604 555 0103', 'WhatsApp'),
  ('p11', '1818 Robson St',    'West End',        '1BR Condo',  215, 'Active',      600,  1, 1,   2, 'Ben Mercier',     'ben.m@example.com',       '+1 604 555 0144', 'Email'),
  ('p12', '2400 Cornwall Ave', 'Kitsilano',       '2BR Condo',  275, 'Active',      980,  2, 2,   4, 'Maya Holt',       'maya.h@example.com',      '+1 604 555 0185', 'WhatsApp'),
  ('p13', '900 Pacific Blvd',  'Yaletown',        '1BR Condo',  230, 'Active',      700,  1, 1,   2, 'Carlos Robles',   'carlos.r@example.com',    '+1 604 555 0179', 'WhatsApp'),
  ('p14', '1322 Bidwell St',   'West End',        'Studio',     155, 'Active',      460,  0, 1,   2, 'Theo Aldred',     't.aldred@example.com',    '+1 604 555 0123', 'Email'),
  ('p15', '110 Switchmen St',  'Olympic Village', '2BR Condo',  305, 'Active',     1080,  2, 2,   4, 'Simone Park',     's.park@example.com',      '+1 604 555 0162', 'WhatsApp'),
  ('p16', '845 Hornby St',     'Downtown',        '1BR Condo',  200, 'Active',      620,  1, 1,   2, 'Yara Singh',      'yara.s@example.com',      '+1 604 555 0148', 'WhatsApp'),
  ('p17', '3050 Heather St',   'Fairview',        '2BR Condo',  235, 'New',         880,  2, 1,   4, 'Will Maeda',      'w.maeda@example.com',     '+1 604 555 0117', 'Email'),
  ('p18', '1500 Robson St',    'West End',        '2BR Condo',  320, 'Active',     1080,  2, 2,   4, 'Naomi Chow',      'naomi.c@example.com',     '+1 604 555 0156', 'WhatsApp'),
  ('p19', '2025 Larch St',     'Kitsilano',       '1BR Condo',  215, 'Active',      640,  1, 1,   2, 'Felix Brun',      'felix.b@example.com',     '+1 604 555 0173', 'Email'),
  ('p20', '4500 Oak St',       'Cambie',          '2BR Condo',  190, 'Active',      920,  2, 2,   4, 'Indira Nair',     'i.nair@example.com',      '+1 604 555 0181', 'WhatsApp'),
  ('p21', '1700 Comox St',     'West End',        'Studio',     165, 'Active',      480,  0, 1,   2, 'Owen Davies',     'owen.d@example.com',      '+1 604 555 0177', 'Email'),
  ('p22', '525 Smithe St',     'Downtown',        '2BR Condo',  290, 'Maintenance', 980,  2, 2,   4, 'Pippa Holst',     'pippa.h@example.com',     '+1 604 555 0184', 'WhatsApp'),
  ('p23', '1120 Hamilton St',  'Yaletown',        '1BR Loft',   340, 'Active',      840,  1, 1,   2, 'Daniel Reyes',    'd.reyes@example.com',     '+1 604 555 0152', 'Email'),
  ('p24', '2640 Yew St',       'Kitsilano',       '1BR Condo',  250, 'New',         660,  1, 1,   2, 'Rita Salgado',    'rita.s@example.com',      '+1 604 555 0102', 'Email'),
  ('p25', '4900 Joyce St',     'East Van',        '3BR House',  260, 'Active',     1640,  3, 2,   6, 'Tomas Vega',      't.vega@example.com',      '+1 604 555 0166', 'WhatsApp'),
  ('p26', '1233 W Cordova St', 'Coal Harbour',    '2BR Condo',  355, 'Active',     1060,  2, 2,   4, 'Alec Kowalski',   'alec.k@example.com',      '+1 604 555 0190', 'WhatsApp');

-- ----------------------------------------------------------------------------
-- agents — 4 rows from AGENTS (src/lib/mock-data/agents.ts).
-- D-02 / 02-CONTEXT criterion 4 OVERRIDE: agents.ts shows Ops + SOP as "Live",
-- but ALL four agents seed with mode='shadow'. Shadow is the conservative
-- default — no agent dispatches to an external system until a human promotes
-- it. Promotion to 'live' is a deliberate operator action, not a seed value.
-- ----------------------------------------------------------------------------
insert into agents (id, name, tagline, mode) values
  ('pricing', 'Pricing Agent', 'Replaces PriceLabs. Weekly competitor analysis + rate recommendations.', 'shadow'),
  ('guest',   'Guest Agent',   'Drafts replies to guest inquiries within minutes. Escalates anything sensitive.', 'shadow'),
  ('ops',     'Ops Agent',     'Coordinates cleaning calendar, supply runs, and small repairs.', 'shadow'),
  ('sop',     'SOP Agent',     'Keeps every property''s playbook current. Flags drift from Casa standards.', 'shadow');

-- ----------------------------------------------------------------------------
-- agent_runs — 2 sample Pricing-Agent runs (see SEED DECISION comment above).
-- Both completed; mode_at_run='shadow' matches the agent's seeded mode.
-- Fixed UUIDs so pricing_recs / agent_logs below can reference them.
-- ----------------------------------------------------------------------------
insert into agent_runs (id, agent_id, idempotency_key, status, mode_at_run, trigger, started_at, expected_callback_by, completed_at) values
  ('a0000000-0000-0000-0000-000000000001', 'pricing', 'seed-pricing-run-week-2026-05-18', 'completed', 'shadow', 'weekly-pricing', '2026-05-18T06:00:00-07:00', '2026-05-18T06:10:00-07:00', '2026-05-18T06:04:00-07:00'),
  ('a0000000-0000-0000-0000-000000000002', 'pricing', 'seed-pricing-run-week-2026-05-11', 'completed', 'shadow', 'weekly-pricing', '2026-05-11T06:00:00-07:00', '2026-05-11T06:10:00-07:00', '2026-05-11T06:03:00-07:00');

-- ----------------------------------------------------------------------------
-- pricing_recs — 21 rows mirroring PRICING_BASE (src/lib/mock-data/pricing.ts).
-- PRICING_BASE has 26 entries; 5 reference addresses not in the 26-property
-- portfolio (2933 Granville St, 3700 Knight St) or duplicate-naming variants,
-- so only the 21 rows that map to a real properties.id are seeded — FK
-- integrity over count parity. week_start is the FIFA-week pricing run.
-- status mixes 'pending' (awaiting Carlos) and 'accepted' (already approved)
-- so the Exception Board side-sheet renders both states; none are 'dispatched'
-- yet — Phase 3 wires that transition.
-- ----------------------------------------------------------------------------
insert into pricing_recs (property_id, run_id, week_start, current_rate, recommended_rate, change_pct, reasoning, status) values
  ('p01', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 285, 340, 19.30, 'FIFA week. Competitor avg jumped to $355. Demand +47%.', 'pending'),
  ('p02', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 165, 195, 18.20, 'FIFA week + Canucks playoff game Wed. Comp set repricing.', 'pending'),
  ('p03', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 420, 480, 14.30, 'Family group bookings high for FIFA fan zone proximity.', 'accepted'),
  ('p04', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 220, 245, 11.40, 'Modest demand uplift. Conservative rec given soft midweek.', 'pending'),
  ('p05', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 310, 285, -8.10, 'Comp set softened. Two competitors dropped 12%+ this week.', 'pending'),
  ('p06', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 195, 210, 7.70, 'Steady demand, slight occupancy bump justifies marginal raise.', 'accepted'),
  ('p07', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 360, 380, 5.60, 'FIFA proximity premium. Tight but defensible.', 'pending'),
  ('p08', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 175, 175, 0.00, 'No change. Current pricing tracks comp set within 2%.', 'accepted'),
  ('p09', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 240, 230, -4.20, 'Light demand softness. Suggest small dip to maintain occupancy.', 'pending'),
  ('p10', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 295, 320, 8.50, 'Waterfront premium plus FIFA. Holding back on aggressive ask.', 'pending'),
  ('p11', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 215, 268, 24.70, 'Robson retail corridor, FIFA weekend stays. Comp set $260-$290.', 'pending'),
  ('p12', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 275, 332, 20.70, 'Kitsilano beach proximity. Saturday demand +62% YoY.', 'accepted'),
  ('p13', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 230, 270, 17.40, 'Stadium-adjacent. Both Canucks and FIFA traffic.', 'pending'),
  ('p14', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 155, 178, 14.80, 'English Bay walk-up demand. Solo travelers booking ahead.', 'pending'),
  ('p15', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 305, 332, 8.90, 'Seawall access, family room layout. Steady weekly bookings.', 'accepted'),
  ('p16', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 200, 213, 6.50, 'Art gallery / VAG corridor. Modest weekend uplift.', 'pending'),
  ('p17', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 235, 245, 4.30, 'Cambie Bridge access. Light demand uplift, hold conservative.', 'pending'),
  ('p18', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 320, 332, 3.80, 'Slow midweek, strong weekend. Net positive for the week.', 'accepted'),
  ('p19', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 215, 220, 2.30, 'Comp set holding. Tiny lift to test demand sensitivity.', 'pending'),
  ('p21', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 165, 162, -1.80, 'Very mild softness. Likely model overreaction, review next week.', 'pending'),
  ('p24', 'a0000000-0000-0000-0000-000000000001', '2026-05-18', 250, 230, -8.00, 'Late-spring rain forecast. Beach-driven listing softens midweek.', 'pending');

-- ----------------------------------------------------------------------------
-- agent_logs — 30 rows composed to look like real Pricing-Agent output.
-- Mix of shadow_mode=true (the seeded agents are all shadow) across varied
-- properties with plausible reasoning. 21 reprice decisions tie to run 1
-- (week 2026-05-18); 9 tie to run 2 (week 2026-05-11) for decision history.
-- ----------------------------------------------------------------------------
insert into agent_logs (agent_id, run_id, property_id, action, reasoning, shadow_mode, created_at) values
  -- Run 1 — week of 2026-05-18 (FIFA week reprice pass, 21 decisions)
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p01', 'reprice', 'FIFA week. Competitor avg jumped to $355. Demand +47%. Recommended $285 -> $340.', true, '2026-05-18T06:01:10-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p02', 'reprice', 'FIFA week + Canucks playoff game Wed. Comp set repricing. Recommended $165 -> $195.', true, '2026-05-18T06:01:14-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p03', 'reprice', 'Family group bookings high for FIFA fan zone proximity. Recommended $420 -> $480.', true, '2026-05-18T06:01:18-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p04', 'reprice', 'Modest demand uplift. Conservative rec given soft midweek. Recommended $220 -> $245.', true, '2026-05-18T06:01:22-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p05', 'reprice', 'Comp set softened. Two competitors dropped 12%+ this week. Recommended $310 -> $285.', true, '2026-05-18T06:01:26-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p06', 'reprice', 'Steady demand, slight occupancy bump justifies marginal raise. Recommended $195 -> $210.', true, '2026-05-18T06:01:30-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p07', 'reprice', 'FIFA proximity premium. Tight but defensible. Recommended $360 -> $380.', true, '2026-05-18T06:01:34-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p08', 'hold',    'No change. Current pricing tracks comp set within 2%. Held at $175.', true, '2026-05-18T06:01:38-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p09', 'reprice', 'Light demand softness. Suggest small dip to maintain occupancy. Recommended $240 -> $230.', true, '2026-05-18T06:01:42-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p10', 'reprice', 'Waterfront premium plus FIFA. Holding back on aggressive ask. Recommended $295 -> $320.', true, '2026-05-18T06:01:46-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p11', 'reprice', 'Robson retail corridor, FIFA weekend stays. Comp set $260-$290. Recommended $215 -> $268.', true, '2026-05-18T06:01:50-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p12', 'reprice', 'Kitsilano beach proximity. Saturday demand +62% YoY. Recommended $275 -> $332.', true, '2026-05-18T06:01:54-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p13', 'reprice', 'Stadium-adjacent. Both Canucks and FIFA traffic. Recommended $230 -> $270.', true, '2026-05-18T06:01:58-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p14', 'reprice', 'English Bay walk-up demand. Solo travelers booking ahead. Recommended $155 -> $178.', true, '2026-05-18T06:02:02-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p15', 'reprice', 'Seawall access, family room layout. Steady weekly bookings. Recommended $305 -> $332.', true, '2026-05-18T06:02:06-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p16', 'reprice', 'Art gallery / VAG corridor. Modest weekend uplift. Recommended $200 -> $213.', true, '2026-05-18T06:02:10-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p17', 'reprice', 'Cambie Bridge access. Light demand uplift, hold conservative. Recommended $235 -> $245.', true, '2026-05-18T06:02:14-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p18', 'reprice', 'Slow midweek, strong weekend. Net positive for the week. Recommended $320 -> $332.', true, '2026-05-18T06:02:18-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p19', 'reprice', 'Comp set holding. Tiny lift to test demand sensitivity. Recommended $215 -> $220.', true, '2026-05-18T06:02:22-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p21', 'reprice', 'Very mild softness. Likely model overreaction, review next week. Recommended $165 -> $162.', true, '2026-05-18T06:02:26-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000001', 'p24', 'reprice', 'Late-spring rain forecast. Beach-driven listing softens midweek. Recommended $250 -> $230.', true, '2026-05-18T06:02:30-07:00'),
  -- Run 2 — week of 2026-05-11 (prior reprice pass, 9 decisions for history depth)
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p01', 'reprice', 'Pre-FIFA baseline. Comp set steady, modest weekend lift. Recommended $270 -> $285.', true, '2026-05-11T06:01:05-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p03', 'reprice', 'Point Grey 3BR, family demand normal for the period. Recommended $410 -> $420.', true, '2026-05-11T06:01:12-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p07', 'reprice', 'Yaletown loft, steady occupancy. Held near comp midpoint. Recommended $355 -> $360.', true, '2026-05-11T06:01:19-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p12', 'reprice', 'Kitsilano 2BR, early-season uptick. Recommended $265 -> $275.', true, '2026-05-11T06:01:26-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p16', 'hold',    'Downtown 1BR tracking comp set within noise. Held at $200.', true, '2026-05-11T06:01:33-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p18', 'reprice', 'West End 2BR, weekend strength offsets soft midweek. Recommended $312 -> $320.', true, '2026-05-11T06:01:40-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p22', 'reprice', 'New building came online nearby with 12 listings. Recommended $300 -> $290.', true, '2026-05-11T06:01:47-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p25', 'reprice', 'East Van 3BR, off-corridor demand flat. Recommended $272 -> $260.', true, '2026-05-11T06:01:54-07:00'),
  ('pricing', 'a0000000-0000-0000-0000-000000000002', 'p26', 'hold',    'Coal Harbour 2BR competitive for the period. Held at $355.', true, '2026-05-11T06:02:01-07:00');

-- ----------------------------------------------------------------------------
-- exceptions — 7 anchor cards from EXCEPTIONS (src/lib/mock-data/exceptions.ts).
-- Includes the pricing_week mega-card (original id 3) which is portfolio-wide:
-- its property_id is NULL. The other 6 map to a real properties.id where the
-- card names a specific Casa property; id 4 (2105 W 4th Ave, Kitsilano) is a
-- prospect address NOT in the portfolio, so its property_id is left NULL.
-- All seeded with state='open'.
-- ----------------------------------------------------------------------------
insert into exceptions (property_id, type, type_label, urgency, category, agent, summary, suggested, source, state, created_at) values
  ('p02', 'guest_complaint', 'Guest complaint — hot water issue', 'Critical', 'Guest', 'Guest Agent',
    'Guest reported no hot water 2 hours after check-in. Mid-stay for a 3-night booking via Airbnb. Sentiment analysis: negative.',
    'Apologize immediately. Dispatch emergency plumber. Offer 15% discount code for next direct booking.',
    'Guest Agent · BK-2847', 'open', '2026-05-20T08:51:00-07:00'),
  ('p01', 'cleaner_no_response', 'Cleaner no response — 1455 Howe St', 'Critical', 'Cleaner', 'Ops Agent',
    'WhatsApp confirmation sent 2 hours ago after guest checkout. Cleaner Andrea has not responded. Next guest checks in at 3:00 PM today.',
    'Call Andrea directly. If no answer within 30 min, dispatch backup cleaner (Carly).',
    'Ops Agent · BK-2851', 'open', '2026-05-20T08:00:00-07:00'),
  (null, 'pricing_week', 'Rate adjustment — Taylor Swift concert weekend', 'Medium', 'Pricing', 'Pricing Agent',
    'Taylor Swift Eras Tour at BC Place Nov 15-17. Current weekend rates 22% below comparable listings. 12 of 26 properties have availability.',
    'Increase rates by 35-50% for Nov 15-17 across all 12 available properties. Estimated additional revenue: $4,200-6,800.',
    'Pricing Agent', 'open', '2026-05-20T07:00:00-07:00'),
  (null, 'pipeline_followup', 'Hot lead — property owner callback requested', 'Medium', 'Pipeline', 'Sales Agent',
    'Owner Sarah Chen responded to cold-call follow-up SMS asking for a callback tomorrow around 11. Score: 82/100.',
    'Call Sarah Chen tomorrow at 11 AM. Pre-call brief attached. 2BR condo, currently self-managed on Airbnb with 4.2 stars.',
    'Sales Agent', 'open', '2026-05-20T04:00:00-07:00'),
  ('p23', 'compliance_expiry', 'STR license expires in 12 days', 'Medium', 'Compliance', 'System',
    'City of Vancouver Short-Term Rental business license expires March 30, 2026. Renewal requires proof of principal residence or operator license. 14-day alert threshold reached.',
    'Initiate renewal through City of Vancouver portal. Processing time: 5-10 business days.',
    'System', 'open', '2026-05-19T21:00:00-07:00'),
  ('p03', 'owner_inquiry', 'Owner question — November revenue report', 'Low', 'Owner', 'Owner Agent',
    'Owner James Park emailed asking why November revenue was 18% lower than October. Draft response prepared with seasonal occupancy data and rate comparison.',
    'Review draft response. Key points: seasonal demand drop (normal for Nov), occupancy 72% vs 85% in Oct, rates competitive for the period.',
    'Owner Agent', 'open', '2026-05-20T01:00:00-07:00'),
  ('p26', 'revenue_anomaly', 'Underperformance — Coal Harbour unit', 'Low', 'Revenue', 'Owner Agent',
    'Property revenue 24% below portfolio average for the past 3 weeks. Occupancy: 58% vs portfolio avg 78%. No negative reviews. Pricing appears competitive.',
    'Review listing photos (last updated 6 months ago). Consider refreshing photography and description. Check if building amenity access has changed.',
    'Owner Agent', 'open', '2026-05-19T09:00:00-07:00');
