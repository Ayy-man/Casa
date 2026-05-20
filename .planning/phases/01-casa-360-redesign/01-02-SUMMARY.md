---
phase: 01-casa-360-redesign
plan: 02
subsystem: ui
tags: [mock-data, typescript, narrative-content, vault, assistant]

requires:
  - phase: 01-casa-360-redesign
    provides: "Plan 01-01's date-fns dependency and useRole() — exceptions.ts createdAt feeds date-fns time-ago; assistant.ts roles align with useRole()"
provides:
  - "Narrative EXCEPTIONS array — 7 verbatim anchor cards + 8 more, all carrying category/suggested/source/createdAt/neighborhood"
  - "26 real Vancouver-address properties and Casa's real cleaner roster (Andrea/Carly/Sabrina/Juli/Stana/Andrea L.)"
  - "owners.ts — 18 owners covering all 26 properties (OWNERS, getOwner, getOwnerByProperty)"
  - "pipeline.ts — 34 sales prospects (PIPELINE, getProspect)"
  - "financials.ts — portfolio + per-property P&L summary (FINANCIALS, getPropertyFinancial)"
  - "compliance.ts — 20 certificates incl. brief-locked STR-license and insurance entries (COMPLIANCE, getCertificate)"
  - "assistant.ts — role-aware greetings, 8 suggested prompts, canned responses (ASSISTANT_RESPONSES, getAssistantResponse)"
  - "index.ts barrel re-exporting all 5 new modules"
affects: [01-03-exception-board, 01-04-vault, 01-06-assistant]

tech-stack:
  added: []
  patterns:
    - "Mock-data module = exported type + SCREAMING_SNAKE const array + getX(id) helper"
    - "Cross-module id linkage: owners.properties[], financials.byProperty[].propertyId, compliance.propertyId all reference properties.ts ids"

key-files:
  created:
    - src/lib/mock-data/owners.ts
    - src/lib/mock-data/pipeline.ts
    - src/lib/mock-data/financials.ts
    - src/lib/mock-data/compliance.ts
    - src/lib/mock-data/assistant.ts
  modified:
    - src/lib/mock-data/exceptions.ts
    - src/lib/mock-data/properties.ts
    - src/lib/mock-data/cleanings.ts
    - src/lib/mock-data/index.ts

key-decisions:
  - "18 owners cover 26 properties — 8 owners hold a second unit; names drawn from properties.ts owner fields"
  - "assistant.ts ASSISTANT_RESPONSES derived from ASSISTANT_PROMPTS via Object.fromEntries — single source of truth for chip + lookup"
  - "Task 3 executed inline by the orchestrator after the original executor stalled and a continuation subagent dropped its socket"

patterns-established:
  - "Mock-data module template: type + const array + getX helper, re-exported via the index.ts barrel"
  - "Brief-locked data: exception cards, certificates, and prospects share concrete entities (1120 Hamilton STR license, Sarah Chen prospect) so surfaces stay internally consistent"

requirements-completed: []

duration: ~50min (incl. failure recovery)
completed: 2026-05-20
---

# Phase 01 / Plan 02: Narrative Mock-Data Layer Summary

**Rewrote the mock-data layer into operator-grade narrative content — 26 real Vancouver-address properties, Casa's real cleaner roster, 15 narrative exception cards, and five new typed modules (owners, pipeline, financials, compliance, assistant) backing the Vault and Assistant slices.**

## Performance

- **Duration:** ~50 min (includes recovery from two subagent infrastructure failures)
- **Completed:** 2026-05-20
- **Tasks:** 3
- **Files modified:** 9 (5 created, 4 modified)

## Accomplishments

- `exceptions.ts` — `EXCEPTIONS` rewritten to 15 entries: the 7 brief-verbatim anchor cards plus 8 more across mixed urgency/category; every entry carries `category`, `suggested`, `source`, ISO `createdAt`, and `neighborhood`. The Taylor Swift card is the `pricing_week` portfolio mega-card.
- `properties.ts` — all 26 records use real Vancouver addresses with correct neighborhoods; `cleanings.ts` uses only Casa's real roster (Andrea/Carly/Sabrina/Juli/Stana/Andrea L.) — no `Maria L.`/`Jason K.`/`Priya S.` placeholders survive.
- Five new mock-data modules created and barrel-exported: `owners.ts` (18 owners), `pipeline.ts` (34 prospects), `financials.ts` (portfolio + per-property P&L), `compliance.ts` (20 certificates), `assistant.ts` (role-aware prompts + canned responses).
- Cross-module consistency: the 1120 Hamilton STR-license and 2255 Davie insurance certificates, and the Sarah Chen / James-Park-referral prospects, are locked to their exception cards.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite exceptions.ts with narrative cards and the new field contract** — `8f89be7` (feat)
2. **Task 2: Rewrite properties + cleanings to real Vancouver data** — `9c6fba9` (feat)
3. **Task 3: Create the 5 new Vault + Assistant mock-data modules and extend the barrel** — `2442f75` (feat)

_Tasks 1–2 ran in the original executor worktree; Task 3 ran inline (see Deviations)._

## Files Created/Modified

- `src/lib/mock-data/exceptions.ts` — 15-entry narrative `EXCEPTIONS`; extended `ExceptionItem` type; `URGENCY_RANK` unchanged
- `src/lib/mock-data/properties.ts` — 26 real Vancouver addresses; `Property` type + `getProperty` unchanged
- `src/lib/mock-data/cleanings.ts` — real cleaner roster
- `src/lib/mock-data/owners.ts` — `Owner` type, `OWNERS` (18), `getOwner`, `getOwnerByProperty`
- `src/lib/mock-data/pipeline.ts` — `Prospect` type, `PIPELINE` (34), `getProspect`
- `src/lib/mock-data/financials.ts` — `FinancialSummary`/`PropertyFinancial`/`MonthlyFinancial` types, `FINANCIALS`, `getPropertyFinancial`
- `src/lib/mock-data/compliance.ts` — `Certificate` type, `COMPLIANCE` (20), `getCertificate`
- `src/lib/mock-data/assistant.ts` — `ASSISTANT_GREETINGS`, `ASSISTANT_PROMPTS` (8), `ASSISTANT_RESPONSES`, `getAssistantResponse`, `promptsForRole`, `historyForRole`
- `src/lib/mock-data/index.ts` — barrel extended with the 5 new `export *` lines

## Decisions Made

- **18 owners → 26 properties:** eight owners hold a second unit so the roster matches the brief's "18 owners" while still covering every property id. Owner names are drawn from the existing `properties.ts` owner fields.
- **`ASSISTANT_RESPONSES` is derived**, not hand-duplicated — `Object.fromEntries(ASSISTANT_PROMPTS.map(...))` keeps the chip list and the prompt→response lookup in sync from one source.
- **Verbatim brief copy preserved:** the three brief example Assistant responses and the seven anchor exception cards are copied exactly.

## Deviations from Plan

The plan executed exactly as written in terms of scope and output. The execution *path* deviated due to infrastructure failures, not plan content:

### Execution-path deviation (orchestrator recovery, not a code/scope change)

**1. Original executor stalled mid-Task-3**
- **Found during:** Task 3 (new modules) — the wave-1 parallel executor stopped responding (stream watchdog, no progress 600s) after committing Tasks 1 and 2.
- **Recovery:** The orchestrator merged the two good task commits to `main`, then spawned a fresh continuation subagent scoped to Task 3 only.

**2. Continuation subagent dropped its socket**
- **Issue:** The continuation subagent lost its connection (`socket connection closed`) before writing any files — its worktree was empty.
- **Fix:** The orchestrator executed Task 3 inline (the GSD `execute-phase` inline fallback path), creating the five modules and the barrel directly, then ran the plan's Task 3 verify gate.

---

**Total deviations:** 0 code/scope deviations. 2 execution-path recoveries from subagent infrastructure failures.
**Impact on plan:** None on output — all three tasks delivered as specified; the plan's per-task verify gates passed.

## Issues Encountered

- Two consecutive background-subagent infrastructure failures (stall, then socket drop) on this plan. Resolved by salvaging the committed Task 1–2 work and finishing Task 3 via inline execution. No work was lost or duplicated.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Wave 2 (plans 01-03 Exception Board, 01-04 Vault) can fork: `EXCEPTIONS` is render-ready and the Vault's owners/pipeline/financials/compliance modules and the Assistant's canned content all export typed data.
- `npx tsc --noEmit` exits 0 on the full project at the Task 3 commit.

---
*Phase: 01-casa-360-redesign*
*Completed: 2026-05-20*
