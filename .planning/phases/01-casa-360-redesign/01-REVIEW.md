---
phase: 01-casa-360-redesign
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 56
files_reviewed_list:
  - src/app/(dashboard)/layout.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/assistant/page.tsx
  - src/app/(dashboard)/agents/page.tsx
  - src/app/(dashboard)/agents/guest/page.tsx
  - src/app/(dashboard)/agents/ops/page.tsx
  - src/app/(dashboard)/agents/sop/page.tsx
  - src/app/(dashboard)/agents/pricing/page.tsx
  - src/app/(dashboard)/bookings/page.tsx
  - src/app/(dashboard)/bookings/[id]/page.tsx
  - src/app/(dashboard)/claims/page.tsx
  - src/app/(dashboard)/cleanings/page.tsx
  - src/app/(dashboard)/pricing/page.tsx
  - src/app/(dashboard)/properties/page.tsx
  - src/app/(dashboard)/properties/[id]/page.tsx
  - src/app/(dashboard)/reports/page.tsx
  - src/app/(dashboard)/vault/page.tsx
  - src/app/(dashboard)/vault/agent-logs/page.tsx
  - src/app/(dashboard)/vault/agent-logs/pricing/page.tsx
  - src/app/(dashboard)/vault/agent-logs/guest/page.tsx
  - src/app/(dashboard)/vault/agent-logs/ops/page.tsx
  - src/app/(dashboard)/vault/agent-logs/sop/page.tsx
  - src/app/(dashboard)/vault/properties/page.tsx
  - src/app/(dashboard)/vault/properties/[id]/page.tsx
  - src/app/(dashboard)/vault/bookings/page.tsx
  - src/app/(dashboard)/vault/bookings/[id]/page.tsx
  - src/app/(dashboard)/vault/cleanings/page.tsx
  - src/app/(dashboard)/vault/cleanings/[id]/page.tsx
  - src/app/(dashboard)/vault/claims/page.tsx
  - src/app/(dashboard)/vault/claims/[id]/page.tsx
  - src/app/(dashboard)/vault/owners/page.tsx
  - src/app/(dashboard)/vault/owners/[id]/page.tsx
  - src/app/(dashboard)/vault/pipeline/page.tsx
  - src/app/(dashboard)/vault/financials/page.tsx
  - src/app/(dashboard)/vault/compliance/page.tsx
  - src/components/casa/top-nav.tsx
  - src/components/casa/exception-card.tsx
  - src/components/casa/vault-card.tsx
  - src/components/casa/vault-sheet.tsx
  - src/components/casa/agent-detail-page.tsx
  - src/components/casa/agent-skeleton.tsx
  - src/components/casa/command-palette.tsx
  - src/components/casa/assistant.tsx
  - src/components/ui/publish-button.tsx
  - src/lib/auth/context.tsx
  - src/lib/vault/detail.ts
  - src/lib/mock-data/index.ts
  - src/lib/mock-data/exceptions.ts
  - src/lib/mock-data/properties.ts
  - src/lib/mock-data/cleanings.ts
  - src/lib/mock-data/owners.ts
  - src/lib/mock-data/pipeline.ts
  - src/lib/mock-data/financials.ts
  - src/lib/mock-data/compliance.ts
  - src/lib/mock-data/assistant.ts
  - src/lib/mock-data/agent-detail.ts
findings:
  critical: 0
  warning: 8
  info: 11
  total: 19
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 56
**Status:** issues_found

## Summary

The Casa 360 redesign is a mock-data-only milestone (Phase 1, CONTEXT L1): all
action buttons are local-state/toast demos, no persistence, no network. Within
that scope, the code is generally well-structured — timer cleanup is consistent,
React auto-escaping is correctly relied upon (no `dangerouslySetInnerHTML`),
dynamic `[id]` routes guard against unknown ids, and the legacy-route redirect
stubs are same-origin. No security vulnerabilities, no crash-causing null
dereferences, and no injection sinks were found.

However, the review surfaced **0 blockers and 8 warnings**. The warnings cluster
around three real defects: (1) the Exception Board pricing copy is internally
contradictory — the card narrative says "12 properties" while the sheet header
and bulk table say "26"; (2) multiple mock-data modules reference *phantom*
addresses that do not exist in `PROPERTIES`, which will read as a data bug to
Carlos the moment he cross-references the Vault; (3) the compliance vault and the
compliance exception card disagree on the STR-license expiry date for the same
property. There is also a real (if low-probability) key-collision bug in the
Assistant, a non-deterministic `Date.now()` SSR-hydration hazard, debug
`console.log` statements left in shipping action handlers, and a date-arithmetic
bug in the agent-logs feed. None block the demo, but several would be visibly
wrong in front of the client.

This being a UI milestone, no test files exist; reliability of the demo rests
entirely on the correctness of the seed data and the render logic reviewed here.

## Warnings

### WR-01: Exception Board pricing copy contradicts itself — "12 properties" vs "26 rates"

**File:** `src/lib/mock-data/exceptions.ts:104-115`, `src/app/(dashboard)/page.tsx:390-392,615`
**Issue:** Exception id 3 (`pricing_week`) states `property: "Portfolio-wide · 12 properties"` and its summary says "12 of 26 properties have availability" with suggested action "across all 12 available properties." But `PricingMegaCard` renders a button labeled **"Review 26 rates"** (`page.tsx:615`), and the side-sheet header says **"26 properties analyzed"** (`page.tsx:391`) and renders all 26 rows of `PRICING_BASE`. The operator is told 12 properties need a rate change, then handed a 26-row table. This is a visible internal contradiction in the headline demo flow.
**Fix:** Pick one number and make every surface agree. If the bulk table should remain 26 rows, change the exception copy and the megacard subtitle to 26; if only 12 properties have availability, slice `PRICING_BASE` to the relevant 12 in the sheet:
```ts
// exceptions.ts — make the narrative match the 26-row table
property: "Portfolio-wide · 26 properties",
summary: "Taylor Swift Eras Tour at BC Place Nov 15–17. Current weekend rates 22% below comparable listings. 26 properties analyzed.",
suggested: "Increase rates by 35–50% for Nov 15–17 across all available properties. Estimated additional revenue: $4,200–6,800.",
```

### WR-02: `PRICING_BASE` references properties that do not exist in `PROPERTIES`

**File:** `src/lib/mock-data/pricing.ts:24,33`
**Issue:** `PRICING_BASE` contains rows for `"2933 Granville St · South Granville"` (line 24) and `"3700 Knight St · Kensington 2BR"` (line 33). Neither address appears in `PROPERTIES` (`properties.ts`), which holds the canonical 26-home portfolio. The pricing table keys on the free-text `property` string so it does not crash, but the bulk-approve sheet now shows two homes Carlos does not manage, and the 26-row count silently includes two phantoms while two real properties (e.g. `2400 Cornwall Ave`, `4900 Joyce St` exist, but `1120 Hamilton St`, `1233 W Cordova St` are absent from `PRICING_BASE`). The data is not internally consistent.
**Fix:** Replace the two phantom rows with the real portfolio addresses missing from `PRICING_BASE` (cross-check every `PRICING_BASE.property` against `PROPERTIES[].name`). Better: key `PricingRow` on `propertyId` and derive the display name via `getProperty(id)` so the two datasets cannot drift again.

### WR-03: Compliance vault and compliance exception disagree on STR-license expiry date

**File:** `src/lib/mock-data/exceptions.ts:136-150`, `src/lib/mock-data/compliance.ts:35`
**Issue:** Exception id 5 (`compliance_expiry`, property `1120 Hamilton St · Yaletown Loft`) says the STR license "expires in 12 days" and its summary states "expires March 30, 2026." The compliance vault record for the *same property* (`C-3201`, `propertyId: "p23"`, `1120 Hamilton St`) has `expires: "2026-06-01"`. Two problems: (a) the two surfaces disagree by ~2 months for the same license; (b) the reference "now" is 2026-05-20, so "March 30, 2026" is already ~7 weeks in the past — "expires in 12 days" is false either way. When Carlos clicks from the exception into the Compliance vault he sees a different date.
**Fix:** Make the exception summary cite the vault's `2026-06-01` date and a true day count from the 2026-05-20 anchor (12 days):
```ts
// exceptions.ts id 5
summary: "City of Vancouver Short-Term Rental business license expires June 1, 2026. Renewal requires proof of principal residence or operator license. 14-day alert threshold reached.",
```

### WR-04: Assistant message ids use float arithmetic — key-collision risk

**File:** `src/components/casa/assistant.tsx:65-66`
**Issue:** `const userId = Date.now() + Math.random(); const pendingId = userId + 1;`. `Date.now()` is an integer of magnitude ~1.7e12; adding `Math.random()` (a sub-1 float) and then `+1` produces non-integer doubles used directly as React `key`s and as the `m.id === pendingId` match target in the timeout callback. Two issues: (1) `userId + 1` collides with another message's id whenever `Math.random()` for a later send falls within `[prev_random, prev_random+1)` mapped onto the same millisecond bucket — unlikely but possible, and a collision would make the swap callback (`assistant.tsx:79-83`) overwrite the wrong bubble; (2) float keys are fragile and non-obvious. The same pattern exists in `page.tsx:143` (`Date.now() + Math.random()`) for toasts, which is safer because no `+1` derivation is layered on top.
**Fix:** Use a monotonic counter ref instead of timestamp math:
```ts
const idSeq = useRef(0);
// in send():
const userId = ++idSeq.current;
const pendingId = ++idSeq.current;
```

### WR-05: `Date.now()` / `new Date()` in render path is an SSR-hydration hazard

**File:** `src/app/(dashboard)/page.tsx:210-213`, `src/components/casa/exception-card.tsx:49-51`
**Issue:** `ExceptionBoardPage` calls `const now = new Date()` directly in the render body (`page.tsx:210`) to compute the greeting ("Good morning/afternoon/evening"), and `ExceptionCard` calls `formatDistanceToNow(new Date(exception.createdAt))` in render (`exception-card.tsx:49`). These pages carry `"use client"` but Next.js still server-renders client components for the initial HTML. The server's clock and the browser's clock can land in different `timeOfDay` buckets (or different "X min ago" strings), producing a React hydration mismatch warning and a flicker. `formatDistanceToNow` is also frozen at first render — the time-ago never updates as the page sits open.
**Fix:** Compute time-derived values in an effect after mount so the server renders a stable placeholder:
```ts
const [now, setNow] = useState<Date | null>(null);
useEffect(() => { setNow(new Date()); }, []);
const greeting = now ? `Good ${timeOfDay(now)}, ${firstName}.` : `Hello, ${firstName}.`;
```

### WR-06: Debug `console.log` statements left in action handlers

**File:** `src/components/casa/vault-sheet.tsx:107,118`, `src/app/(dashboard)/page.tsx:509`
**Issue:** Three action handlers ship `console.log` as their entire body: `vault-sheet.tsx` line 107 (`console.log("vault action", a.label)`) and line 118 (same), and `page.tsx:509` (`console.log("override", r.property)` for the pricing "Edit rate" icon button). These are the only feedback the user gets for those clicks — the buttons appear interactive but do nothing visible. Even for a mock milestone, a console.log is debug residue, not a demo affordance; clicking "Edit Property" / "Approve Claim" / "Edit rate" in front of Carlos produces silence.
**Fix:** Route these through the same toast mechanism the Exception Board already uses, or at minimum replace `console.log` with a visible no-op affordance. If the action is genuinely deferred, disable the button or add a "coming soon" title attribute rather than leaving a silent console call.

### WR-07: Agent-logs feed "Yesterday" timestamps are computed incorrectly

**File:** `src/app/(dashboard)/vault/agent-logs/page.tsx:64-68`
**Issue:** The 50-row `FEED` derives a clock time per row: `totalMin = 10*60 - i*11`, then `day = totalMin >= 0 ? "Today" : "Yesterday"`, then `norm = ((totalMin % 1440) + 1440) % 1440` and formats `hh:mm` from `norm`. The bug: `day` flips to "Yesterday" as soon as `totalMin` goes negative (around row i=55, but the feed only has 50 rows so all rows are actually "Today" — wait, row i=49 gives `totalMin = 600-539 = 61`, still positive). So in practice every row labels "Today", but the *intent* was a feed spanning yesterday. More concretely, the modulo normalization means any row whose `totalMin` is negative would display a `hh:mm` from the *previous* day's wall clock while still potentially mislabeled — and there is no handling for `totalMin < -1440` (day-before-yesterday) which would still say "Yesterday". The arithmetic does not produce the multi-day feed the comment promises ("50 most-recent agent actions ... stable across renders" implies a time span).
**Fix:** Compute the day offset from the normalized total, not the sign:
```ts
const dayOffset = Math.floor(totalMin / 1440); // 0, -1, -2 ...
const day = dayOffset === 0 ? "Today" : dayOffset === -1 ? "Yesterday" : `${-dayOffset}d ago`;
```

### WR-08: Assistant underperformer response cites phantom properties

**File:** `src/lib/mock-data/assistant.ts:39`
**Issue:** The canned "Which properties are underperforming?" response names "2592 W Broadway (West End)" and "3119 Hastings (West End)" as the two other underperformers besides 1233 W Cordova. Neither address exists in `PROPERTIES`, and "W Broadway" is a Point Grey street in this dataset, not West End. The Coal Harbour figure (-24%) correctly matches the `revenue_anomaly` exception card and `FINANCIALS` (p26 occupancy 58%, trend `down`), so the operator is primed to trust the response — then two of the three named properties cannot be found in the Vault. `FINANCIALS.byProperty` already flags real low performers (p06 `5550 Cambie St` 54% down, p22 `525 Smithe St` 49% down); the canned answer should name those.
**Fix:** Replace the phantom addresses with the real down-trend properties from `FINANCIALS`:
```ts
response: "Three properties are 20%+ below portfolio average MTD: 1233 W Cordova (Coal Harbour, -24%), 525 Smithe St (Downtown, -18%), 5550 Cambie St (Cambie, -16%). Want me to flag these as exception cards?",
```

## Info

### IN-01: Command Palette cleaning result drops the selected record

**File:** `src/components/casa/command-palette.tsx:64-73`
**Issue:** Property and booking palette results navigate to a detail route (`/vault/properties/${p.id}`, `/vault/bookings/${b.id}`), but a cleaning result navigates to the bare table `/vault/cleanings` — the chosen cleaning is lost and the user lands on an unfiltered list. A deep-link route `/vault/cleanings/[id]` exists and would work here.
**Fix:** `go: "/vault/cleanings/" + c.id` to match the booking/property pattern. (Agent-action results have no detail route, so `/vault/agent-logs` is acceptable there.)

### IN-02: Layout Escape handler is redundant with CommandPalette's own handler

**File:** `src/app/(dashboard)/layout.tsx:30-32`
**Issue:** The dashboard layout's `keydown` listener handles `Escape` to close the palette, but `CommandPalette` already wires its own `onKeyDown` Escape handler (`command-palette.tsx:120-122`). Two handlers for the same key; the layout effect also re-subscribes on every `paletteOpen` toggle. Harmless but duplicated logic.
**Fix:** Drop the `Escape` branch from the layout effect; let `CommandPalette` own its close key. The Cmd/Ctrl-K open shortcut should stay in the layout.

### IN-03: Mega-card category-pill label mismatch with filter chips

**File:** `src/app/(dashboard)/page.tsx:63-79,567-578`
**Issue:** The pricing exception has `category: "Pricing"`, so `PricingMegaCard` renders a `cat-Pricing` pill labeled "Pricing". The filter chip "Pricing" admits `category === "Pricing" || category === "Revenue"` — consistent. But the "Operations" chip admits `Cleaner || Maintenance`; there is no chip that admits the `Owner` category at all. Exceptions id 6 and id 15 (`category: "Owner"`) are reachable only via the "All" chip — selecting any specific chip permanently hides them. Likely unintended given the chip set was meant to cover all categories.
**Fix:** Add an "Owner" chip, or fold `Owner` into an existing chip's `matchesChip` set, so every exception is reachable through at least one specific filter.

### IN-04: `ExceptionItem.timeAgo` is dead data — `createdAt` is the only source used

**File:** `src/lib/mock-data/exceptions.ts:43,75-334`
**Issue:** Every exception carries both `createdAt` (ISO) and `timeAgo` (human string). The redesigned `ExceptionCard` derives time-ago from `createdAt` via `date-fns` (`exception-card.tsx:49`); nothing reads `timeAgo` anymore. The field's own doc comment admits it is "retained only so the pre-redesign Home page and topbar keep type-checking" — but those pages are now redirect stubs. It is 15 lines of stale, drift-prone data.
**Fix:** Delete the `timeAgo` field from `ExceptionItem` and all 15 records; the type is `?` optional so removal is safe.

### IN-05: `top-nav.tsx` notification bell renders an unstyled menu without keyboard semantics

**File:** `src/components/casa/top-nav.tsx:122-181`
**Issue:** The bell dropdown uses `role="menu"` / `role="menuitem"` on plain `<div>`/`<button>` elements but provides no arrow-key navigation, no focus trap, and no `aria-activedescendant` — it only closes on outside-click. Screen-reader users entering a `role="menu"` will expect menu keyboard semantics that are not implemented. The user dropdown immediately below uses Radix (`Dropdown.Root`) which handles all of this correctly; the bell does not.
**Fix:** Either drop the `role="menu"`/`role="menuitem"` attributes (treat it as a plain disclosure panel — `aria-haspopup` can stay) or rebuild it on Radix `Dropdown` for consistency with the adjacent account menu.

### IN-06: Notification badge count is `aria-hidden`, leaving screen-reader users without the count

**File:** `src/components/casa/top-nav.tsx:115-119`
**Issue:** The bell button has `aria-label="Notifications"` and the count badge is `aria-hidden="true"`. A sighted user sees "15"; a screen-reader user hears only "Notifications" with no indication anything is pending. CLAUDE.md's accessibility section requires status to carry a textual label.
**Fix:** Move the count into the accessible name: `aria-label={`Notifications, ${exceptionCount} open`}` on the button, and keep the visual badge `aria-hidden`.

### IN-07: Duplicated `pastTense` helper across two files

**File:** `src/app/(dashboard)/page.tsx:32-37`, `src/components/casa/exception-card.tsx:28-33`
**Issue:** The identical `pastTense(action: string)` function is defined verbatim in both `page.tsx` and `exception-card.tsx`. Duplicated logic drifts; the naive `verb + "ed"` rule already mishandles verbs like "Snooze 7 Days" → "Snoozeed" is avoided (ends in "e" → "Snoozed") but "Dispatch" → "Dispatched" is fine, while a hypothetical "Apply" → "Applyed" would be wrong. One copy to fix is better than two.
**Fix:** Extract `pastTense` to a shared util (e.g. `src/lib/text.ts`) and import it in both files.

### IN-08: Sort comparators stringify enum/date columns, giving non-chronological order

**File:** `src/app/(dashboard)/vault/bookings/page.tsx:46-49`, `src/app/(dashboard)/vault/cleanings/page.tsx:45-48`
**Issue:** The bookings and cleanings tables sort every column via `String(a[sortKey]).localeCompare(...)`. For `checkIn`/`checkOut` the values are ISO `YYYY-MM-DD` strings so lexical order happens to equal chronological order — but for the cleanings `time` column the values are ranges like `"08:30–10:00"` and `"11:00–14:00"`, which sort lexically and that is acceptable; the latent risk is that any future non-ISO date or numeric-in-string column will sort wrong. The properties/owners/claims tables correctly branch on `typeof === "number"`; bookings and cleanings do not, so they are inconsistent with the other four tables.
**Fix:** Apply the same `typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))` branch used in `properties/page.tsx:38-41` to the bookings and cleanings comparators for consistency and future-proofing.

### IN-09: `agent-detail.ts` model string ("Claude Sonnet 4.6") contradicts project stack

**File:** `src/lib/mock-data/agent-detail.ts:79,123,197`, `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx:244`
**Issue:** All three agent-detail configs and the Pricing Agent page show `Model: "Claude Sonnet 4.6"`. CLAUDE.md's stack section specifies "Claude Sonnet 4.5 via OpenRouter." Either the constant is a typo or the docs are stale; as shipped, the demo displays a model version that does not match the documented stack.
**Fix:** Confirm the intended model and make the four occurrences agree with CLAUDE.md (likely "Claude Sonnet 4.5").

### IN-10: AgentSkeleton component is dead code

**File:** `src/components/casa/agent-skeleton.tsx`
**Issue:** `AgentSkeleton` was the placeholder for the Guest/Ops/SOP agent pages. Those pages (`vault/agent-logs/{guest,ops,sop}/page.tsx`) now render `AgentDetailPage` instead. No file imports `AgentSkeleton`. It is an unused 64-line component.
**Fix:** Delete `src/components/casa/agent-skeleton.tsx` (and `topbar.tsx`/`sidebar.tsx` if they are likewise orphaned by the top-nav redesign — out of this review's file scope but worth a sweep).

### IN-11: `cleanings.ts` thread map omits two cleanings with no fallback

**File:** `src/lib/mock-data/cleanings.ts:45-72`
**Issue:** `CLEANING_THREAD` has keys `c1, c2, c3, c4, c7` — cleanings `c5` and `c6` (both `Completed`) have no thread entry. The Vault cleaning detail surface (`cleaningDetail` in `detail.ts`) does not render a thread so this is currently latent, but any consumer that does `CLEANING_THREAD[c.id]` will get `undefined` for c5/c6 and must guard. Inconsistent seed data.
**Fix:** Add minimal thread entries for `c5` and `c6`, or document that completed turnovers may legitimately have no thread and ensure every reader null-guards `CLEANING_THREAD[id]`.

---

_Reviewed: 2026-05-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
