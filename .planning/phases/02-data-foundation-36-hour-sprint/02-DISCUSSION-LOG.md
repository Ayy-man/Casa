# Phase 2: Data Foundation (36-hour sprint) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21 (re-discussion — supersedes the 2026-05-15 session)
**Phase:** 2-data-foundation-36-hour-sprint
**Areas discussed:** Pricing Agent detail migration depth

---

## Context for this re-discussion

The 2026-05-15 discussion happened when Data Foundation was Phase 1. The Casa 360
Redesign was then inserted ahead of it (now Phase 1), making Data Foundation
Phase 2 and restructuring the routes this phase migrates into. STATE.md carried a
pending todo: "Re-run /gsd:discuss-phase 2 after Phase 1 lands — 02-CONTEXT.md
predates the redesign and is flagged stale."

This session reconciled the stale context. The schema / types / env / module
decisions (D-01–D-11) were unaffected by a UI redesign and carried forward
verbatim. Three redesign-affected gray areas were offered; the user selected one
to discuss and accepted the carried-forward recommendation on the rest.

---

## Gray area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Exception Board rendering | RSC server-shell + client islands (old D-12) vs keep fully client-side. The redesign made this the busiest interactive surface. | |
| Pricing side-sheet scope | Migrate the 26-row bulk-approve side-sheet's reads to `pricing_recs` in Phase 2, or defer to Phase 3 when its buttons get wired. | |
| Pricing detail depth | D-14 scoped only the Decisions table. ROADMAP criterion 5 names `agent_runs` + `agent_logs` + `pricing_recs`. How deep does the migration go? | ✓ |
| Seed fidelity | Mirror the rewritten narrative mock-data 1:1, or go slimmer. | |

**User's choice:** Pricing detail depth only.
**Notes:** The three unselected areas were resolved with carried-forward
recommendations (Exception Board → RSC + island per D-12; Pricing side-sheet →
reads migrate this phase, buttons defer to Phase 3 per D-13; Seed → 1:1 narrative
mirror per D-06). The user confirmed "Ready for context" at the closing gate.

---

## Pricing Agent detail migration depth

| Option | Description | Selected |
|--------|-------------|----------|
| Decisions table only | Old D-14 verbatim — replace the 30-row math `DECISIONS` array; Activity + At-a-Glance stay mock. Borderline against ROADMAP criterion 5. | |
| Decisions + Activity feed | Both decision-history sections read `agent_logs` / `pricing_recs` from the latest run; At-a-Glance / Performance / Validation stay mock. Cleanly satisfies criteria 4 & 5. | ✓ |
| + At-a-Glance KPIs too | Also wire the 6 KPI tiles to live aggregates over `agent_runs` / `agent_logs`. Bigger lift inside the 36h window. | |
| Let Claude decide | Researcher + planner pick the depth. | |

**User's choice:** Decisions + Activity feed.
**Notes:** The user pre-resolved the At-a-Glance sub-question in the same answer:
the KPI-tile aggregation is deferred to the polish backlog rather than dropped.
Their spec for the deferred work: "6 aggregation queries (Actions Today/Week,
Success/Exception Rate, Tokens/Cost MTD) against `agent_logs` filtered by the
pricing agent + time window; a single Supabase RPC returns all 6 in one call;
~2-hour task." Captured as D-15 (depth) + a `<deferred>` entry. The user said
"Phase 5 polish backlog" — under the post-redesign renumbering the milestone's
polish phase is Phase 6; the deferred entry is placed in Phase 6 with a flag for
the user to confirm.

---

## Claude's Discretion

- Exception Board rendering, Pricing side-sheet scope, and seed fidelity — the
  user declined to discuss these and accepted the recommendations carried into
  D-06 / D-12 / D-13.
- All Claude's-discretion items from the 2026-05-15 session (column types,
  safety-column defaults, seed file location, client-injection mechanism,
  `gen:types` wiring, migration naming, mapper-layer convention) carry forward
  unchanged — see CONTEXT.md `<decisions>` → "Claude's Discretion."

## Deferred Ideas

- At-a-Glance KPI aggregation RPC → Phase 6 polish (new this session — see above).
- All 2026-05-15 deferrals (pgvector → Phase 5; ESLint guard / hardcoded dates /
  error boundary / SOP scaffold → Phase 6; RSC for Pricing Agent detail + real
  Auth/RLS + tests + a11y → v2) carry forward with corrected phase numbers in
  CONTEXT.md `<deferred>`.
