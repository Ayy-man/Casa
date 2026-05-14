# Codebase Concerns

**Analysis Date:** 2026-05-14

---

## Tech Debt

**Dual Auth Systems: Custom vs Supabase — Completely Disconnected**
- Issue: Two auth systems exist side by side with zero integration. `src/lib/auth/context.tsx` is a fully custom in-memory auth with hardcoded demo credentials (`carlos@casa.com / demo`, `denika@casa.com / demo`) stored in `localStorage`. The Supabase SSR clients (`src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`) were wired in commit `715127c` but are **never called from any page or component** — no `grep` hit on `createClient` outside of the `utils/supabase/` directory itself.
- Files: `src/lib/auth/context.tsx`, `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`, `src/middleware.ts`
- Impact: The middleware runs `updateSession(request)` on every route, making a Supabase `getUser()` call that serves no function — the dashboard auth guard reads from the custom `AuthContext`, not Supabase. Any real user created in Supabase cannot log in. Conversely, the demo accounts exist only in JavaScript memory and bypass Supabase entirely.
- Fix approach: Decide which system to keep. Most likely path: replace `src/lib/auth/context.tsx` with a Supabase-backed provider that calls `createClient()` (browser) and reads `session` from `supabase.auth.getSession()`. Update dashboard layout guard to check the Supabase session instead of the custom `user` state.

**Mock-Data Boundary Has No Enforcement Layer**
- Issue: All data displayed in the app is sourced from `src/lib/mock-data/` (9 files re-exported through `src/lib/mock-data/index.ts`). Every page imports directly from this directory. There is no data-fetching layer, no service abstraction, and no clear seam at which a real API call would replace a mock import.
- Files: `src/lib/mock-data/index.ts` and all 9 modules; all 12 `src/app/(dashboard)/**/*.tsx` pages import from this path.
- Impact: When real Supabase data is connected, every page file will need surgical edits to replace direct mock-data imports. There is no central data layer to swap. This will affect every route simultaneously.
- Fix approach: Introduce a thin data-access layer (e.g., `src/lib/data/properties.ts` → `getProperties(): Promise<Property[]>`). Mock implementations call the static arrays; real implementations call Supabase. Pages import from the data layer, not from `mock-data/` directly.

**All Pages Are Client Components Without Need**
- Issue: Every page in `src/app/(dashboard)/` carries `"use client"` at line 1 (12 files). Several pages — Bookings, Agents Overview, Reports — perform no client interaction on initial render and contain no hooks that require client execution (they use `useRouter` or `useState` for tab state only).
- Files: `src/app/(dashboard)/bookings/page.tsx:1`, `src/app/(dashboard)/agents/page.tsx:1`, `src/app/(dashboard)/reports/page.tsx:1` (and all 9 sibling routes)
- Impact: The entire dashboard bundle ships to the browser as a client bundle. No route benefits from RSC streaming or server-side rendering. Next.js's App Router performance model is unused.
- Fix approach: Remove `"use client"` from pages that only need it for a single interactive sub-component; extract that sub-component and mark it client-only instead. The layout (`src/app/(dashboard)/layout.tsx`) must remain `"use client"` due to `useAuth`.

**Hardcoded Dates in UI Copy**
- Issue: Two pages embed the literal string `"Today · Friday, May 1"` and `"Today, May 1 · 7 cleanings scheduled."` directly in JSX.
- Files: `src/app/(dashboard)/page.tsx:214`, `src/app/(dashboard)/cleanings/page.tsx:42`
- Impact: The app will display incorrect dates to any user who opens it after May 1. This is demo-context for now, but will cause confusion the moment the app is used on a different day.
- Fix approach: Replace with `new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })` or a `useDateLabel()` hook that formats the current date. The cleanings count (`7`) should also come from `CLEANINGS_TODAY.length`.

**Unused Dependencies in package.json**
- Issue: Nine Radix UI packages, `sonner` (toast), `class-variance-authority`, and the `cn()` utility in `src/lib/utils.ts` are installed but never imported in any source file. Radix (`@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, etc.) and `sonner` appear to be scaffolding from a template that was not cleaned up. Toast functionality is reimplemented inline in `src/app/(dashboard)/page.tsx` and `src/app/(dashboard)/claims/page.tsx`.
- Files: `package.json`, `src/lib/utils.ts`
- Impact: ~9 Radix packages + sonner add unnecessary bundle weight and tree-shaking noise. The `cn()` utility is dead code.
- Fix approach: `npm uninstall @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs sonner class-variance-authority`. Either delete `src/lib/utils.ts` or start using `cn()` for dynamic class composition.

**`navigator.platform` Is Deprecated**
- Issue: Mac detection in the keyboard shortcut handler uses `navigator.platform.toUpperCase().includes("MAC")`, which is deprecated in all major browsers.
- Files: `src/app/(dashboard)/layout.tsx:27`
- Impact: Will produce browser console warnings; eventually may break Mac/PC shortcut detection.
- Fix approach: Replace with `navigator.userAgentData?.platform ?? navigator.platform` with a fallback, or `/(Mac|iPhone|iPad|iPod)/i.test(navigator.userAgent)`.

---

## Known Bugs

**Login Labels Are Not Programmatically Associated with Inputs**
- Symptoms: The email and password `<label>` elements on the login page wrap descriptive text but are not linked to their `<input>` via `htmlFor`/`id`. Screen readers cannot associate the label with the field.
- Files: `src/app/login/page.tsx:59–76`
- Trigger: Any screen reader visit to the login page.
- Workaround: None for assistive technology users.

**"Undo" Toast Has No Actual Undo Logic**
- Symptoms: Clicking "Undo" on an exception action toast (`src/app/(dashboard)/page.tsx:405`) clears the toast but does not reverse any state change — the exception card is not restored, no data mutation is rolled back. The button is purely cosmetic.
- Files: `src/app/(dashboard)/page.tsx:169–171` (`undoAction` function)
- Trigger: Take any action on an exception card, then click Undo.
- Workaround: None; the action is effectively non-undoable.

**"Save draft" in Claims Edit Sheet Is a console.log**
- Symptoms: The "Save draft" button in `ClaimEditSheet` fires `console.log("save draft")` with no persistence.
- Files: `src/app/(dashboard)/claims/page.tsx:429`
- Trigger: Open a pending claim → Edit Draft → Save draft.
- Workaround: None; state is lost on sheet close.

**All Action Buttons That Should Do Something Fire console.log**
- Symptoms: 13 interactive elements across the app use `onClick={() => console.log(...)}` as their entire handler. These include: "Open Calendar", "Message Owner", "Add Property", "Dispatch Backup", "Send" (WhatsApp message), "Call cleaner", quick-reply buttons, "About shadow mode", "Override rate", "Reject claim", "Help".
- Files: `src/app/(dashboard)/page.tsx:92,194`, `src/app/(dashboard)/properties/page.tsx:39`, `src/app/(dashboard)/properties/[id]/page.tsx:146,153`, `src/app/(dashboard)/cleanings/page.tsx:180,242,264`, `src/app/(dashboard)/pricing/page.tsx:95,242`, `src/app/(dashboard)/claims/page.tsx:184,429`, `src/components/casa/topbar.tsx:68`
- Trigger: Any click on the affected buttons.

---

## Security Considerations

**Custom Auth Stores Session in localStorage**
- Risk: The custom `AuthContext` persists the authenticated user object (email, name, initials, role) to `localStorage` under the key `"casa.auth.user"`. The plaintext JSON is readable by any script running on the origin, including third-party analytics or injected scripts.
- Files: `src/lib/auth/context.tsx:44,71–74`
- Current mitigation: None. No HttpOnly cookie, no expiry, no signature.
- Recommendations: Replace with Supabase's cookie-based session (`@supabase/ssr` already installed). If custom auth is kept temporarily, at minimum add an expiry timestamp and validate on read.

**Hardcoded Demo Passwords in Client-Side JavaScript**
- Risk: Both demo account passwords (`"demo"`) and the full user registry are compiled into the client bundle in `src/lib/auth/context.tsx:28–41`. Anyone who opens DevTools can read the credentials dictionary.
- Files: `src/lib/auth/context.tsx:28–41`
- Current mitigation: Passwords are trivially weak (`"demo"`), so there is no practical secret to protect today, but the pattern must not persist when real credentials are introduced.
- Recommendations: Move auth to Supabase before adding any real user data.

**No Route-Level Auth Protection: Flash of Unauthenticated Content**
- Risk: The dashboard layout (`src/app/(dashboard)/layout.tsx:39–45`) renders a "Loading…" spinner while waiting for `localStorage` to hydrate (`ready` state). During server-side rendering and the initial client paint before hydration, the protected dashboard content is not guarded — it flashes briefly before the redirect fires.
- Files: `src/app/(dashboard)/layout.tsx:19–45`
- Current mitigation: The flash is brief and the data is mock-only. In production with real data, this would be a meaningful exposure window.
- Recommendations: Use Next.js middleware-level redirect (already present in `src/middleware.ts`) backed by a real Supabase session cookie check, removing reliance on client-side `localStorage` hydration entirely.

**Supabase Environment Variables Use Non-Standard Key Name**
- Risk: All three Supabase clients read `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (lines 5 in each `src/utils/supabase/*.ts` file). The canonical Supabase environment variable name is `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If `.env.local` uses the standard name, the Supabase clients will silently receive `undefined` and fail with a runtime crash (`createServerClient(url!, undefined!)`).
- Files: `src/utils/supabase/client.ts:4`, `src/utils/supabase/server.ts:5`, `src/utils/supabase/middleware.ts:5`
- Current mitigation: The non-null assertion (`!`) suppresses TypeScript errors but does not prevent the runtime crash.
- Recommendations: Align the env var name with the Supabase docs (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and add a startup validation that throws a clear error if either variable is missing.

**External Image Requests to picsum.photos**
- Risk: Property hero images and claim evidence photos are loaded from `https://picsum.photos` (a third-party CDN). This sends user-browsing patterns to an external service and will break if picsum is unavailable.
- Files: `src/lib/mock-data/properties.ts:50`, `src/lib/mock-data/claims.ts:73`, `src/app/(dashboard)/cleanings/page.tsx:212`
- Current mitigation: Demo-only context.
- Recommendations: Replace with local `/public/` assets or a signed Supabase Storage URL when real property photos are introduced.

---

## Accessibility

**Login Inputs Have Unlabeled Labels (WCAG 1.3.1)**
- Issue: `<label>` elements wrap text but no `htmlFor` attribute links them to the corresponding `<input id="...">`. The inputs have no `id` attributes.
- Files: `src/app/(dashboard)/page.tsx`, `src/app/login/page.tsx:59–76`
- Fix: Add matching `id` to each `<input>` and `htmlFor` to each `<label>`.

**Side-Sheets Have No ARIA Role or Focus Trap (WCAG 2.1, 4.1.2)**
- Issue: The cleaning detail sheet (`CleaningSheet`), claim edit sheet (`ClaimEditSheet`), flag dialog (`FlagDialog`), and command palette use custom `<aside>` or `<div>` elements with no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby`, and no focus trap. Keyboard users can tab behind the overlay into the main content.
- Files: `src/app/(dashboard)/cleanings/page.tsx:136–355`, `src/app/(dashboard)/claims/page.tsx:317–445`, `src/app/(dashboard)/properties/[id]/page.tsx:388–488`, `src/components/casa/command-palette.tsx:125–187`
- Fix: Add `role="dialog" aria-modal="true" aria-labelledby="<heading-id>"` to each sheet root. Implement focus trapping (either via Radix Dialog — already installed — or a small `useFocusTrap` hook).

**Sidebar User Menu Has No ARIA Disclosure Pattern (WCAG 4.1.2)**
- Issue: The user avatar button in the sidebar that opens the sign-out popover has no `aria-expanded` or `aria-haspopup` attribute. Screen readers cannot announce the popover's state.
- Files: `src/components/casa/sidebar.tsx:152–164`
- Fix: Add `aria-expanded={menuOpen}` and `aria-haspopup="menu"` to the trigger button; add `role="menu"` and `role="menuitem"` to the popover list.

**Notification Bell Popover Has No ARIA Expansion State**
- Issue: Same pattern as the sidebar menu — the bell button that opens the exception dropdown has no `aria-expanded` or `aria-haspopup`.
- Files: `src/components/casa/topbar.tsx:76–79`
- Fix: Add `aria-expanded={bellOpen}` and `aria-haspopup="true"` to the bell button.

**Color-Only Status: urgency-dot Is Color-Alone on the Home Rail**
- Issue: PRODUCT.md explicitly requires "Status colors (Critical / High / Medium / Low) carry both a colored dot and a textual label, never color alone." On the "Today's Cleanings" home rail panel, only a colored `urgency-dot` (with inline `background` color based on status string) is shown — no textual label accompanies it.
- Files: `src/app/(dashboard)/page.tsx:302–305`
- Fix: Add a visually-hidden status label next to the dot, or replace the custom inline dot with the `.urgency-pill` + `.urgency-dot` pair used on exception cards.

**Tab Triggers Have No Selected State Announced**
- Issue: Multiple tab bars (Bookings, Cleanings, Claims, Property Detail, Reports) use plain `<button>` elements with a CSS `active` class but no `role="tab"`, `aria-selected`, or `role="tabpanel"` on content areas.
- Files: `src/app/(dashboard)/cleanings/page.tsx:46–58`, `src/app/(dashboard)/claims/page.tsx:53–65`, `src/app/(dashboard)/properties/[id]/page.tsx:175–185`, `src/app/(dashboard)/reports/page.tsx:24–46`
- Fix: Convert to `role="tablist"` / `role="tab"` / `role="tabpanel"` ARIA pattern, or use `@radix-ui/react-tabs` (already installed).

**`prefers-reduced-motion` Not Applied to Toast Entrance**
- Issue: The `@media (prefers-reduced-motion: reduce)` block in `globals.css:921–936` covers `route-fade`, `sheet-overlay`, `sheet`, `kpi-card`, `ex-card`, and `prop-card` transitions. The fixed-position toast (`src/app/(dashboard)/page.tsx:378–423`) has no animation class and no reduced-motion equivalent, so any future entrance animation added to it will not be covered.
- Files: `src/app/globals.css:921–936`, `src/app/(dashboard)/page.tsx:383–398`
- Fix: If a toast entrance animation is added, include `.toast` in the `prefers-reduced-motion` block.

---

## Performance Bottlenecks

**No Code Splitting Within Large Page Files**
- Issue: Five page files exceed 350 lines of co-located helper components and inline SVG charts. The pricing agent page (`687 lines`) includes two full SVG chart components (`SuccessChart`, `ExceptionsChart`), all section tab logic, and a 30-item decisions table. The settings page (`437 lines`) contains 5 fully inline sub-panels.
- Files: `src/app/(dashboard)/agents/pricing/page.tsx` (687 lines), `src/app/(dashboard)/settings/page.tsx` (437 lines), `src/app/(dashboard)/claims/page.tsx` (445 lines), `src/app/(dashboard)/properties/[id]/page.tsx` (488 lines), `src/app/(dashboard)/cleanings/page.tsx` (355 lines)
- Impact: All content for every tab and section is rendered in a single RSC/client boundary, regardless of whether the user views it. No lazy loading.
- Fix approach: Extract section components into separate files and use `React.lazy` / dynamic imports for below-the-fold sections (e.g., Prompt History, Validation, Charts).

**No Suspense Boundaries or Loading States**
- Issue: `grep` for `Suspense` returns zero results across the entire `src/` directory. There are no `loading.tsx` files and no skeleton screens for any route.
- Files: All `src/app/(dashboard)/**` routes
- Impact: Route transitions show a hard blank frame until the client renders. The dashboard layout shows "Loading…" plain text during auth hydration — no styled skeleton.
- Fix approach: Add `loading.tsx` files for each route group, using the existing `.urgency-dot`, `.ex-card`, and `.kpi-card` CSS classes to build plausible skeletons. Wrap data-heavy sections in `<Suspense fallback={<Skeleton />}>`.

---

## Fragile Areas

**Product-Code Gap: 3 of 4 Agent Detail Pages Are Empty Stubs**
- Issue: PRODUCT.md describes four agents with full detail pages (Pricing, Guest, Ops, SOP) containing sections for At a Glance, Live Activity, Configuration, Performance, Decisions, Property Breakdown, Validation, Prompt History, and Controls. Only the Pricing Agent page is implemented. Guest, Ops, and SOP render `<AgentSkeleton>` — a placeholder that explicitly says "Same structure, different mock data. Populated with this agent's action types in a later iteration."
- Files: `src/app/(dashboard)/agents/guest/page.tsx`, `src/app/(dashboard)/agents/ops/page.tsx`, `src/app/(dashboard)/agents/sop/page.tsx`, `src/components/casa/agent-skeleton.tsx`
- Why fragile: Clicking Guest, Ops, or SOP from the nav or from an exception card's "Open in Guest →" link delivers a non-functional stub.

**Property Detail Tabs: 3 of 6 Are Placeholder Stubs**
- Issue: The Property detail page has 6 tabs (Profile, House Rules, Cleaning, Reviews, Pricing History, Activity). House Rules, Cleaning, and Pricing History show a centered "Detailed view coming in a later iteration" message.
- Files: `src/app/(dashboard)/properties/[id]/page.tsx:248–256`
- Why fragile: The stub text is shown by a catch-all `(tab === "House Rules" || tab === "Cleaning" || tab === "Pricing History")` condition. Any new tab added accidentally falling into this condition would silently become a stub.

**Cleanings: Tomorrow and "This Week" Views Are Stubs**
- Issue: The Cleanings page has three tabs (Today, Tomorrow, This Week). Tomorrow and This Week render a "Demo focuses on today's board" placeholder.
- Files: `src/app/(dashboard)/cleanings/page.tsx:103–110`

**Reports: Weeks 1–4 Are Stubs**
- Issue: The Validation Reports page has 5 tabs (Cumulative, Week 1–4). Only Cumulative is implemented; all four week tabs render `<WeekStub>`.
- Files: `src/app/(dashboard)/reports/page.tsx:166–176`

**Mode Toggle in Pricing Agent Is UI-Only**
- Issue: The "Shadow / Live" mode toggle in the Pricing Agent controls section (`src/app/(dashboard)/agents/pricing/page.tsx:587–600`) updates local `useState` only. It has no effect on the "Logged (Shadow)" status pills in the decisions table, which are hardcoded based on array index (`i % 7 === 3`). Toggling to "Live" does not change any displayed data.
- Files: `src/app/(dashboard)/agents/pricing/page.tsx:73–75, 587–600`

**"Send to SOP Agent" in Flag Dialog Is Fake**
- Issue: The FlagDialog "Send to SOP Agent" button sets local `sent` state to `true` and shows "Thanks, noted." There is no network call, no SOP Agent integration, and no persistence.
- Files: `src/app/(dashboard)/properties/[id]/page.tsx:467–469`

**Pricing Decisions Table Uses Math-Generated Data per Render**
- Issue: `DECISIONS` in the Pricing Agent page is defined at module scope using `Array.from({ length: 30 }).map(...)` with `Math.sin` and `Math.cos` arithmetic. If the module is hot-reloaded or the component re-mounts, the data regenerates identically (deterministic). However, the table key is array index `i`, meaning any future re-sort or filter will produce incorrect React reconciliation.
- Files: `src/app/(dashboard)/agents/pricing/page.tsx:41–61`
- Fix: Use a stable `id` field as the React key.

---

## Missing Critical Features

**No Real Data Layer**
- Problem: The entire app is a static mock. No Supabase queries, no API calls, no real-time updates. PRODUCT.md describes live agent activity (e.g., "Repriced 18 listings 2 min ago"), but all timestamps are hardcoded strings.
- Blocks: Cannot deploy to production users. Exception counts, cleaning schedules, booking data, and agent decisions are all static.

**No Real Authentication**
- Problem: Real users cannot be created or authenticated. The custom auth in `src/lib/auth/context.tsx` only accepts two hardcoded demo accounts.
- Blocks: Multi-user access, role-based permissions, audit log attribution.

**No Error Boundaries**
- Problem: There are no React `ErrorBoundary` components or Next.js `error.tsx` files anywhere in the app. An unhandled exception in any client component will crash the entire dashboard to a blank screen.
- Blocks: Production resilience. Any future API call that throws will be unrecoverable without a full page reload.

---

## Test Coverage Gaps

**No Tests Exist**
- What's not tested: 100% of application code — all 12 route pages, 4 shared components, auth context, Supabase client utilities, and all mock-data modules.
- Files: Entire `src/` directory. No `*.test.*` or `*.spec.*` files exist anywhere.
- Risk: Any refactor (especially the planned data-layer migration and auth replacement) can silently break existing behavior. The mock-data structures (`ExceptionItem`, `Property`, `Booking`) are the implicit contract for the UI — no type tests or snapshot tests guard against shape changes.
- Priority: High — especially for `src/lib/auth/context.tsx` and `src/utils/supabase/*.ts` before real auth is wired.

---

*Concerns audit: 2026-05-14*
