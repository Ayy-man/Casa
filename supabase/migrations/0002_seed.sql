-- ============================================================================
-- Casa Command Center — Narrative-Mirror Seed (Phase 2, Plan 01)
-- Project: aqsitrzbjokkkpcohple
-- ----------------------------------------------------------------------------
-- Mirrors the redesigned narrative mock-data in src/lib/mock-data/*.ts 1:1
-- (D-06). Visual parity is the QA bar: "does the screen match yesterday?"
--
-- Kept in a SEPARATE file from 0001 (D-07) so the schema migration is
-- replayable independently of the seed. Run 0001 first, then this file.
--
-- Run order within this file: properties -> agents -> agent_runs ->
-- pricing_recs -> agent_logs -> exceptions. FK parents precede children.
-- ----------------------------------------------------------------------------
-- agent_runs SEED DECISION: two sample agent_runs rows ARE seeded below (one
-- completed Pricing run, one completed-shadow Pricing run). Rationale: the
-- Pricing Agent detail page's Decisions/Activity feed and the agent_runs trace
-- must render BEFORE the first live n8n execution lands (ROADMAP criterion 5
-- depends on the n8n run surfacing — but the page should not show an empty
-- void on day one). Seeding two runs lets agent_logs/pricing_recs carry a
-- valid run_id FK and gives the feed real content. The live n8n workflow
-- (gIcYI8N1i1ljtCnW) appends NEW rows on top — it does not depend on these.
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
