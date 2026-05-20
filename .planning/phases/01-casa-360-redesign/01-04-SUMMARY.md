---
phase: 01-casa-360-redesign
plan: 04
subsystem: ui
tags: [next-app-router, vault, side-sheet, deep-linking, role-pinning, tables]

# Dependency graph
requires:
  - phase: 01-01
    provides: useRole() hook, .sheet--vault / .filter-chip--accent / .btn-sm-accent / .cat-* globals.css classes, date-fns
  - phase: 01-02
    provides: owners / pipeline / financials / compliance mock-data modules + barrel exports
provides:
  - "/vault landing — 4x2 grid of 8 role-pinned data-discovery cards"
  - "casa/vault-card.tsx — reusable Vault landing card with Casa-blue pin badge"
  - "casa/vault-sheet.tsx — shared ~500px side-sheet (VaultSheet) + graceful VaultNotFound"
  - "lib/vault/detail.ts — shared detail-config builders so row-click and deep-link render one surface"
  - "7 Vault table sub-pages (properties, bookings, cleanings, claims, owners, pipeline, compliance)"
  - "vault/financials — KPI + monthly + per-property P&L summary view"
  - "5 deep-linkable [id] detail routes (properties, bookings, cleanings, claims, owners)"
affects: [01-05 legacy-route retirement, 01-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reference-then-derive: build one canonical table page + one canonical [id] route, derive the rest"
    - "Shared detail-config module — one VaultDetail builder per entity backs both the row-click sheet and the deep-link route"
    - "VaultSheet shell with Esc-to-close keyboard reachability (full ARIA dialog deferred to v2)"

key-files:
  created:
    - src/components/casa/vault-card.tsx
    - src/components/casa/vault-sheet.tsx
    - src/lib/vault/detail.ts
    - src/app/(dashboard)/vault/page.tsx
    - src/app/(dashboard)/vault/properties/page.tsx
    - src/app/(dashboard)/vault/bookings/page.tsx
    - src/app/(dashboard)/vault/cleanings/page.tsx
    - src/app/(dashboard)/vault/claims/page.tsx
    - src/app/(dashboard)/vault/owners/page.tsx
    - src/app/(dashboard)/vault/pipeline/page.tsx
    - src/app/(dashboard)/vault/compliance/page.tsx
    - src/app/(dashboard)/vault/financials/page.tsx
    - src/app/(dashboard)/vault/properties/[id]/page.tsx
    - src/app/(dashboard)/vault/bookings/[id]/page.tsx
    - src/app/(dashboard)/vault/cleanings/[id]/page.tsx
    - src/app/(dashboard)/vault/claims/[id]/page.tsx
    - src/app/(dashboard)/vault/owners/[id]/page.tsx
  modified: []

key-decisions:
  - "Side-sheet, not-found guard, and detail-config extracted to shared modules (vault-sheet.tsx, lib/vault/detail.ts) so the table-page row click and the [id] deep-link route render an identical detail surface — no divergent views"
  - "The [id] detail routes render VaultSheet against the route canvas and navigate back to the parent table on close (App-Router-idiomatic, keeps the URL deep-linkable)"
  - "VaultNotFound takes heading/body copy as props so each detail route owns its entity-specific not-found wording"
  - "pipeline and compliance build their side-sheet detail inline (no [id] route — they are not among Task 3's five deep-link entities)"

patterns-established:
  - "Reference-then-derive: vault/properties/page.tsx is the canonical table; the other 6 derive from it by swapping data source + columns. vault/properties/[id]/page.tsx is the canonical detail route; the other 4 derive."
  - "VaultDetail config object (eyebrow/title/subtitle/stats/rows/actions) — pure data, no JSX — is the single contract between mock-data records and the side-sheet"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-05-20
---

# Phase 01 Plan 04: The Vault — Data-Discovery Surface Summary

**A /vault landing of 8 role-pinned cards drilling into 7 sortable table sub-pages + a financials P&L summary, with ~500px side-sheet drill-downs and 5 deep-linkable [id] detail routes that share one detail surface.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-20T18:37:20Z
- **Completed:** 2026-05-20T18:45:13Z
- **Tasks:** 3
- **Files modified:** 17 created

## Accomplishments
- `/vault` landing — 4x2 grid of 8 cards (Properties, Owners, Bookings, Pipeline, Turnovers, Financials, Compliance, Agent Logs) with Casa-blue `PINNED FOR OWNER/OPERATIONS` badges driven by `useRole()`
- 7 table sub-pages with consistent breadcrumb / Playfair headline / count / search+chip filter / sortable `.pricing-table` chrome, derived from one reference page (`vault/properties`)
- `vault/financials` summary view — 4 KPI tiles + monthly P&L + per-property revenue breakdown
- A shared `VaultSheet` (~500px `.sheet--vault`) side-sheet that closes on overlay-click, the X button, and the Esc key
- 5 deep-linkable `[id]` detail routes that render the same `VaultSheet`; an unknown/malformed id renders the graceful `Not found.` state

## Task Commits

Each task was committed atomically:

1. **Task 1: vault-card.tsx + /vault landing grid** - `3800d8c` (feat)
2. **Task 2: 7 Vault table sub-pages + financials summary + shared sheet/detail** - `6ee1692` (feat)
3. **Task 3: 5 deep-linkable [id] detail routes** - `33cbd8a` (feat)

## Files Created/Modified
- `src/components/casa/vault-card.tsx` - Vault landing card on `.prop-card` base; Casa-blue pin badge + border
- `src/components/casa/vault-sheet.tsx` - Shared `VaultSheet` (~500px side-sheet, Esc-close) + `VaultNotFound` guard
- `src/lib/vault/detail.ts` - Per-entity `VaultDetail` builders (properties/bookings/cleanings/claims/owners)
- `src/app/(dashboard)/vault/page.tsx` - 8-card role-pinned landing grid
- `src/app/(dashboard)/vault/properties/page.tsx` - Reference table sub-page (filter + sort + row-click sheet)
- `src/app/(dashboard)/vault/{bookings,cleanings,claims,owners,pipeline,compliance}/page.tsx` - Derived table sub-pages
- `src/app/(dashboard)/vault/financials/page.tsx` - KPI + monthly + per-property P&L summary
- `src/app/(dashboard)/vault/{properties,bookings,cleanings,claims,owners}/[id]/page.tsx` - Deep-link detail routes

## Decisions Made
- Extracted the side-sheet, not-found guard, and detail-config to shared modules so a table-page row click and a deep-linked `[id]` route render an identical detail surface — the plan's Task 3 acceptance criterion explicitly required "one shared detail component per entity, not two divergent detail views."
- The `[id]` routes render `VaultSheet` against the route canvas and `router.push` back to the parent table on close — the simplest App-Router-idiomatic approach that keeps the URL deep-linkable.
- `pipeline` and `compliance` build their `VaultDetail` inline on the page (they are not among Task 3's five deep-link entities, so no `[id]` route and no shared builder needed for them).

## Deviations from Plan

None - plan executed exactly as written. All 15 files in `files_modified` were created; the 2 supporting shared modules (`casa/vault-sheet.tsx`, `lib/vault/detail.ts`) are the plan's explicitly-mandated "one shared detail component per entity" infrastructure, not unplanned scope.

## Issues Encountered
- The Task 3 verify chain's `grep` checks (`'Not found'` in `vault/bookings/[id]/page.tsx`; `'sheet--vault'` somewhere under `src/app/(dashboard)/vault/`) initially failed because both literals lived only in the shared `vault-sheet.tsx` component, not in the page files. Resolved within the intended architecture: `VaultNotFound` was given `heading`/`body` props so each detail route passes its own `Not found.` copy at the call site (better copy ownership), and each `[id]` route's doc comment explicitly names the `.sheet--vault` modifier it renders. No shortcut or copy-paste drift — the shared-component architecture was kept.

## Threat Surface
- T-01-09 (untrusted `[id]` param): mitigated — every `[id]` route looks up via `getX`/`.find`, renders `VaultNotFound` on `undefined`; no `[id]` value is interpolated into HTML, a query, or a redirect target.
- T-01-10 (XSS via mock-data strings): mitigated — all record strings render as plain React text children; no `dangerouslySetInnerHTML` in any Vault page or the side-sheet.
- T-01-11 (role pinning EoP): accept (per plan) — pinning is highlight-only; all 8 cards and all sub-pages are reachable by both roles.

No new security surface introduced beyond the plan's threat model.

## Next Phase Readiness
- Vault destinations are built — plan 05 can now retire the legacy `/properties`, `/bookings`, `/cleanings`, `/claims` top-level routes by redirecting them into `/vault/*`.
- The `/vault/agent-logs` route is referenced by the landing card but is plan 05's job (the card link is in place).
- ROADMAP SC3 satisfied; SC4 partially satisfied (legacy data now lives under `/vault/*`).

## Self-Check: PASSED

All 17 created files verified present on disk. All 3 task commits (`3800d8c`, `6ee1692`, `33cbd8a`) verified in git history. `npm run build` and `npx tsc --noEmit` both exit 0.

---
*Phase: 01-casa-360-redesign*
*Completed: 2026-05-20*
