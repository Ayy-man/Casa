---
phase: 01-casa-360-redesign
plan: 03
subsystem: exception-board
tags: [exception-board, home-route, exception-card, pricing-sheet, ui]
requires:
  - "01-01: useRole() hook, globals.css redesign classes (.cat-*, .cat-rule, .status-count-pill, .filter-chip--accent, .btn-sm-accent, .sheet--vault), date-fns dependency"
  - "01-02: narrative EXCEPTIONS data (category, suggested, source, createdAt, neighborhood) + URGENCY_RANK"
provides:
  - "casa/exception-card.tsx — reusable narrative ExceptionCard component"
  - "(dashboard)/page.tsx — the Exception Board home route"
affects:
  - "Home route / is now the Exception Board; KPI tiles, status banner, right rail removed"
  - "The standalone /pricing bulk-approve workflow is now reachable as the Pricing mega-card side-sheet on /"
tech-stack:
  added: []
  patterns:
    - "Multi-select filter via useState<Set<FilterChip>> with All mutually exclusive"
    - "Optimistic dismiss + toast-with-Undo restore"
    - "date-fns formatDistanceToNow for card time-ago"
key-files:
  created:
    - "src/components/casa/exception-card.tsx"
  modified:
    - "src/app/(dashboard)/page.tsx"
decisions:
  - "Filter chips map to category groups: Operations = Cleaner + Maintenance; Pricing chip = Pricing + Revenue; Critical filters by urgency not category"
  - "The pricing_week exception renders as a dedicated PricingMegaCard (sibling of ExceptionCard, reuses .ex-card) whose primary action opens the bulk-approve sheet"
  - "Dismiss/Resolve/Reject/Ignore tertiary actions all optimistically remove the card; Undo restores it"
metrics:
  duration: ~15m
  completed: 2026-05-21
  tasks: 2
  files: 2
---

# Phase 1 Plan 3: Exception Board Summary

The home route `/` is now the Exception Board — a role-aware greeting, 4 data-driven
status pills, 7 multi-select filter chips, and an urgency-sorted stack of narrative
exception cards, with the preserved 26-row Pricing bulk-approve workflow folded into a
"Pricing Week of" mega-card side-sheet.

## What Was Built

### Task 1 — `casa/exception-card.tsx` (commit `f2c2024`)

A reusable `"use client"` `ExceptionCard` component, extracted from the old inline
`ExceptionCard` in `(dashboard)/page.tsx` and extended to the full UI-SPEC card contract:

- `.cat-{Category}` colour pill carrying the uppercase category text label
  (color-is-never-alone — Checker item 6).
- Inner 2px category accent rule via `.cat-rule` (an absolutely-positioned bar inside a
  `position:relative; overflow:hidden` article) — never a thick `border-left`
  (Checker item 2).
- `date-fns` `formatDistanceToNow(new Date(createdAt), { addSuffix: true })` time-ago,
  right-aligned, `tabular-nums`.
- Playfair 18px title (`typeLabel`); `#737373` 13px property + neighborhood subtitle.
- 15px reading-tier narrative body (`text-[15px]`, line-height 1.55).
- Italic `Suggested:` block on a `#F7F7F6` softgray fill — rendered on every card.
- Action row: `.btn-sm-accent` primary, `.btn-sm-outline` secondary, tertiary plain
  text link in `#737373`. `requiresConfirm` actions route the primary through the
  preserved `PublishButton` two-step confirm.
- Source-attribution footer with the booking ID in `.mono`.

### Task 2 — `(dashboard)/page.tsx` rewrite (commit `9958f60`)

The home page is rewritten as the Exception Board (1000px centered column):

- **Greeting block** — `OWNER VIEW` / `OPERATIONS VIEW` eyebrow from `useRole()`, a
  Playfair 40px `Good {timeOfDay}, {firstName}.` headline (morning/afternoon/evening
  computed from `new Date()`), and the subtitle. This is the one Playfair Headline for
  the route.
- **4 status pills** — `{n} pending / critical / medium / resolved today`, counts
  computed live from `EXCEPTIONS` and local dismiss state, using the `.status-count-pill`
  + `.status-*` classes.
- **7 multi-select filter chips** — `All` (default, mutually exclusive), `Critical`,
  `Guest`, `Operations`, `Pricing`, `Pipeline`, `Compliance`; modeled on
  `useState<Set<FilterChip>>`; active chip uses `.filter-chip--accent`.
- **Card stack** — `useMemo` urgency sort with the `created_at DESC` tiebreaker, active
  filter applied, renders `casa/ExceptionCard` per exception. Card actions flow through
  the preserved toast-with-Undo; `Dismiss` optimistically removes the card.
- **Empty state** — Playfair 40px `All clear.` + body when the filtered stack is empty.
- **Pricing mega-card** — the `pricing_week` exception renders as a `PricingMegaCard`
  whose primary action opens a `.sheet` side-sheet containing the 26-row
  Approve/Edit/Reject bulk table relocated from `(dashboard)/pricing/page.tsx`. Esc
  closes the sheet.

Removed per CONTEXT.md: the 4 KPI tiles, the `status-banner`, the right rail
`<aside className="home-rail">`, and the `LEAD_KPI` / `SECONDARY_KPIS` constants.

## Deviations from Plan

None affecting scope. One pre-commit cleanup: the first draft of `page.tsx` imported
`useMemo` twice (once aliased as `_useMemo`); the redundant import was removed before
the Task 2 commit. No behavioral change.

## Verification

- Task 1 automated checks: file exists, exports `ExceptionCard`, uses `formatDistanceToNow`,
  renders `Suggested`, no `border-left` width ≥2, `npx tsc --noEmit` exits 0 — all PASS.
- Task 2 automated checks: `page.tsx` references `useRole`, `ExceptionCard`, `All clear`;
  no `home-rail` / `status-banner` / `SECONDARY_KPIS` stale refs; ≤2 `font-display
  text-[40px]` headlines (greeting + empty state, mutually exclusive at render);
  `npm run build` exits 0 — all PASS.
- `npm run build`: `✓ Compiled successfully`, 17/17 static pages, `/` route emits at
  14.2 kB.
- `npx tsc --noEmit`: exits 0.

Note: `npm install` was run once to sync `node_modules` — `date-fns@^3.6.0` was already
a pinned dependency from plan 01-01, so `package.json` / `package-lock.json` are
unchanged (no new package added).

## Threat Surface

The plan's `<threat_model>` mitigation T-01-06 (no `dangerouslySetInnerHTML`) is honored:
all mock-data strings (`summary`, `suggested`, `source`, `property`, `neighborhood`)
render as plain React text children — React auto-escapes, no XSS sink introduced. No new
security-relevant surface beyond the plan's threat model.

## Known Stubs

The Approve/Edit/Reject buttons in the Pricing mega-card sheet and the exception-card
action buttons are local-state / toast demos with no persistence — this is intentional
for Phase 1 (CONTEXT.md L1, threat T-01-08). Real three-state lifecycle + action log is
Phase 3. The `Edit rate` icon button in the pricing table is a `console.log` stub
carried over verbatim from the preserved `/pricing` page.

## Self-Check: PASSED

- `src/components/casa/exception-card.tsx` — FOUND
- `src/app/(dashboard)/page.tsx` — FOUND (modified)
- Commit `f2c2024` — FOUND
- Commit `9958f60` — FOUND
