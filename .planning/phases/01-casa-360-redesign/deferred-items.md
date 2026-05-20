# Deferred Items — Phase 01 (Casa 360 Redesign)

Out-of-scope discoveries logged during plan execution. Not fixed in-plan.

## From Plan 01-06 (Wave 4 verification gate)

- **`react-hooks/exhaustive-deps` warning — `src/app/(dashboard)/page.tsx:122`**
  - ESLint reports: "The ref value 'timers.current' will likely have changed by
    the time this effect cleanup function runs. ... copy 'timers.current' to a
    variable inside the effect."
  - Severity: **warning** (0 errors — the lint gate's "no errors" bar is met).
  - Origin: pre-existing code from plan 01-03 (the Exception Board toast-timer
    cleanup `useEffect`). Not introduced by plan 01-06.
  - Out of scope for 01-06 (SCOPE BOUNDARY: only auto-fix issues caused by the
    current plan's changes). The fix is a one-line `const map = timers.current;`
    inside the effect — the same pattern plan 01-06's `assistant.tsx` already
    uses correctly. Recommend a follow-up cleanup commit.
