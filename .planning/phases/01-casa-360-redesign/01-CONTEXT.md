# Phase 1: Casa 360 Redesign — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning
**Source:** PRD Express Path (`.planning/phases/01-casa-360-redesign/REDESIGN-BRIEF.md`)

> The operator elected to skip discuss-phase: the 302-line `REDESIGN-BRIEF.md` plus the
> approved `01-UI-SPEC.md` (which already resolves every open item) are the complete
> spec. This CONTEXT.md transcribes the brief and the UI-SPEC's locked decisions into
> the structure the planner expects. The two source documents remain authoritative —
> see Canonical References.

<domain>
## Phase Boundary

**In scope — Phase 1 delivers:**

A **structural refactor** of the existing, shipped Casa Command Center demo skin —
collapsing the 13-route left-sidebar layout into a 3-tab top-nav information
architecture (Exception Board / Vault / Assistant), wiring two real roles
(Owner / Operations), and rewriting mock-data *content* to be narrative and specific.

1. **3-tab top nav** replaces the left sidebar across all authenticated routes.
2. **Exception Board** (`/`) — the new home: greeting block, 4 status pills, 7
   multi-select filter chips, urgency-sorted narrative exception-card stack, empty
   state. Absorbs the old Home page and the old standalone Pricing Approval Queue.
3. **Vault** (`/vault`) — data-discovery surface: 8-card landing grid, table
   sub-pages with right-side-sheet drill-downs, Agent Logs index.
4. **Pricing Agent detail preserved verbatim** at `/vault/agent-logs/pricing`;
   Guest/Ops/SOP detail pages built to the same 9-section structure.
5. **Assistant** (`/assistant`) — role-aware chat with suggested prompts and a
   canned-response demo (no real LLM this phase).
6. **Two roles** (`owner` / `operations`) wired into `auth/context.tsx` via a
   `useRole()` hook, driving greetings, Vault pinning, and Assistant prompts.
7. **Narrative mock-data rewrite** — real Vancouver addresses, Casa's real cleaner
   roster, 7 anchor exception cards + 5–10 more.
8. **Legacy routes** (`/pricing`, `/cleanings`, `/claims`, `/properties`,
   `/bookings`, `/agents/*`, `/reports`) deleted or redirected to their `/vault/*`
   homes.

**Out of scope — explicitly NOT this phase:**

- No Supabase schema, queries, or `src/lib/data/*` work — Phase 1 runs entirely on
  rewritten **mock data** (`src/lib/mock-data/`). The real data layer is Phase 2.
- No real LLM / OpenRouter integration — the Assistant uses canned responses.
- No real action persistence — all exception action buttons are local-state /
  toast demos. Real three-state lifecycle lands in Phase 3.
- No `error.tsx` boundary (Phase 6), no side-sheet ARIA roles / focus traps (v2).
- No new visual language — the mature Casa design system is preserved; this phase
  records it and specifies only the new surfaces.

This phase runs first because it reshapes the routes and pages every subsequent
data-integration phase wires into.
</domain>

<decisions>
## Implementation Decisions

Everything below is a **locked decision** (operator-supplied brief + approved
UI-SPEC). The "Resolved Tensions" and L1–L7 items come from `01-UI-SPEC.md` and are
not open to re-litigation.

### Routing & Information Architecture
- Collapse 13 routes → the hierarchy in the brief's "New URL structure" section.
  Authenticated routes: `/`, `/vault`, `/vault/{properties,bookings,cleanings,claims,owners,pipeline,financials,compliance}`, `/vault/agent-logs`, `/vault/agent-logs/{pricing,guest,ops,sop}`, `/assistant`, `/settings`. `/login` unchanged structurally.
- Detail views (`/vault/properties/[id]`, `/bookings/[id]`, `/cleanings/[id]`, `/claims/[id]`, `/owners/[id]`) open as **right side-sheets**, but support deep linking.
- Delete or redirect legacy routes: `/pricing` (folded into `/` as PRICING exception cards), `/cleanings`→`/vault/cleanings`, `/claims`→`/vault/claims`, `/properties`→`/vault/properties`, `/bookings`→`/vault/bookings`, `/agents` + `/agents/[name]`→`/vault/agent-logs` + `/vault/agent-logs/[name]`.
- **L2:** `/reports` folds into each agent detail page as a **"Validation" section**. No standalone `/vault/validation-reports` route.

### Top Nav (replaces sidebar)
- Single sticky top bar, **70px** fixed height, white bg, 1px `#E5E5E5` bottom border, mounted in `(dashboard)/layout.tsx`.
- Left: HumanOS logo + dot separator + "Casa Properties" wordmark. Center: 3 nav links (Exception Board / Vault / Assistant) — active gets a 2px Casa-blue underline + darker text, inactive `#737373`. Right: notification bell with badge, user avatar (initials), name + ROLE label, chevron dropdown.
- User dropdown (Radix, styled with `.menu-pop-*`): full name + email; role pill (`OWNER` / `OPERATIONS`); `Settings` → `/settings`; `Sign out` → clears auth, redirects `/login`.
- **L5:** logo asset is the existing `public/humanos-logo.png` (PNG — no SVG; ignore the brief's `.svg` reference).
- **Delete** `src/components/casa/sidebar.tsx` and its mount.
- Notification bell is icon-only — `<button>` carries `aria-label="Notifications"` + `title`.

### Roles
- **L3:** No formal REQUIREMENTS.md REQ-IDs for Phase 1 — tracked by the 6 ROADMAP success criteria only.
- Extend (do not replace) `src/lib/auth/context.tsx` to expose `role: 'owner' | 'operations'` derived from the demo account email; add a `useRole()` hook. `carlos@casa.com` = owner, `denika@casa.com` = operations.
- Role drives: Exception Board greeting/eyebrow; Vault pinning (owner → Properties/Owners/Financials; operations → Bookings/Turnovers); Assistant greeting + 4 suggested prompts; which exception *instances* surface.
- No financial gating in Phase 1 — Denika is full admin.

### Exception Board (`/`)
- Single column, 1000px max-width, centered, `#FAFAF7` canvas.
- Greeting block: role eyebrow (`OWNER VIEW` / `OPERATIONS VIEW`) + Playfair 40px headline `Good {timeOfDay}, {firstName}.` (morning <12:00, afternoon 12:00–17:59, evening 18:00+) + sans subtitle `Here's what's waiting on you right now.`
- 4 status pills (pending / critical / medium / resolved today) — data-driven, animate on change. Per UI-SPEC, the "pending" pill uses the Critical **soft** quartet, not solid red.
- 7 multi-select filter chips: All (active default), Critical, Guest, Operations, Pricing, Pipeline, Compliance. Active chip uses Casa-blue fill / white text (`.filter-chip--accent`).
- Exception cards sorted urgency (Critical→High→Medium→Low) then `created_at` DESC. Card = category pill + inner 2px colored rule + time-ago (`date-fns/formatDistanceToNow`) + Playfair title + property/neighborhood subtitle + 15px narrative body + `Suggested:` italic block on `#F7F7F6` + action row + source-attribution footer.
- Per-category action buttons exactly as the brief's "Action buttons by category" table; copy per the UI-SPEC Copywriting Contract.
- Empty state: Playfair 40px `All clear.` + `Nothing in this category needs your attention right now.`
- **Removed:** the 4 KPI tiles (→ replaced by 4 status pills); the right rail; the standalone Pricing Approval Queue route.
- The Pricing bulk-approve workflow is preserved as a **"Pricing Week of [date]"** PRICING mega-card that opens a side-sheet containing the existing 26-row Approve/Edit/Reject table.

### Vault (`/vault`)
- Landing: `Admin Vault` Playfair header + subtitle; 4×2 grid of 8 cards (Properties, Owners, Bookings, Pipeline, Turnovers, Financials, Compliance, Agent Logs) — icon-in-soft-square + title + count subtitle.
- Role-pinned cards carry a `PINNED FOR {ROLE}` badge + border. **L6 / Resolved Tension 3:** pin highlight uses **Casa blue** (`#EAF1FB` badge fill, `#1E5FBF` text, `#C9D9F0` border) — NOT green.
- Sub-pages: breadcrumb `← Vault` + Playfair header + count + filter row (search + chips) + sortable table; row click → ~500px right side-sheet (`.sheet--vault` width variant; full-screen mobile).
- Side-sheet: X close, header, 4-tile stat grid, key/value `.def-row` rows, entity action row.
- Agent Logs index (`/vault/agent-logs`): 4-agent 2×2 grid (status pill + sparkline + stat tiles) + 50-row recent-activity feed table.
- **Preserve verbatim:** the existing 9-section Pricing Agent detail page, relocated to `/vault/agent-logs/pricing` — do not restyle. Build Guest/Ops/SOP to the same 9-section structure with agent-appropriate mock data.

### Assistant (`/assistant`)
- Single column, 700px max-width, centered. Bot avatar + role-aware greeting bubble + 4 role-aware suggested-prompt chips + conversation history + fixed bottom input bar + Casa-blue send button.
- Demo behavior: clicking a chip populates + sends; sending shows a user bubble + loading indicator + a canned response after a 1–2s local timeout (no network). Canned responses per the brief examples.

### Design Tokens / Visual System
- **L6:** Casa blue `#1E5FBF` is the only saturated accent. **No sage green anywhere** — the reference prototype's green is rejected.
- **L7 / Resolved Tension 1:** body resolves to a **15px** reading tier (`text-[15px]`, lh 1.55) for narrative bodies / Assistant / Vault detail prose; existing **13px** retained for dense UI chrome. Not a whole-app jump to 16px.
- **L7 / Resolved Tension 2:** route canvas is `#FAFAF7` off-white; cards/sheets/panels stay pure `#FFFFFF` with the existing 1px `#E5E5E5` rule.
- Keep Playfair Display (serif headings/reasoning) + Inter (sans body) + SF Mono (IDs/timestamps/costs). One Playfair 40px Headline per route.
- 8 exception-category color quartets: use the **reconciled** WCAG-AA mapping in the UI-SPEC "8 Exception-Category color quartets" table — NOT the brief's raw Tailwind `red-50/green-500/...` palette. Category accent on the card is an **inner 2px rule**, never a `border-left > 1px`.
- New dependency: **`date-fns`** (pin a stable v3.x) — required for `formatDistanceToNow`.

### Mock Data Rewrite
- Rewrite mock-data **content** (keep the existing `src/lib/mock-data/*` module *structure* — Phase 2 wires the `src/lib/data/*` seam).
- All 26 properties use real Vancouver addresses with correct neighborhoods (full list in the brief).
- All cleaner references use Casa's real roster: Andrea, Carly, Sabrina, Juli (main team); Stana, Andrea L. (Langley team). Remove "Maria L." / "Jason K." / "Priya S." placeholders.
- Seed the 7 anchor exception cards verbatim from the brief, plus 5–10 more across mixed categories. Every card needs a `Suggested:` italic block + a source-attribution footer.

### Removal / Relocation
- Delete `src/app/(dashboard)/agents`; relocate content to `(dashboard)/vault/agent-logs/`.
- Delete `(dashboard)/pricing/page.tsx` as a standalone route; fold the bulk-approve queue into the "Pricing Week of [date]" side-sheet.
- Delete `(dashboard)/cleanings`, `/claims`, `/properties`, `/bookings` as top-level routes; redirect to `/vault/*`.
- Delete the left sidebar from `(dashboard)/layout.tsx`; delete the right rail from Home; delete the 4 KPI tiles from Home.
- Delete `(dashboard)/reports` as a top-level route; fold into agent detail pages (L2).

### Mobile / Responsive
- **L4:** mobile nav is a **full slide-in hamburger drawer** (3 tabs + user/role section) — not a condensed bar. Slide via `transform`, `prefers-reduced-motion` honored.
- Breakpoints follow `globals.css`: tablet ≤1023px, mobile ≤767px. Vault grid 4×2 → 2-col → 1-col; tables horizontal-scroll; side-sheets full-screen; touch targets ≥44px.

### Claude's Discretion
- Plan/wave decomposition and file-level task breakdown.
- Exact content of the 5–10 additional exception cards beyond the 7 anchors (must stay narrative, mixed urgency/category, follow the card contract).
- Internal component file names within the brief/UI-SPEC's naming conventions.
- Agent-appropriate mock data for the Guest/Ops/SOP detail stubs.
- How redirects are implemented (Next.js `redirect()` in a `page.tsx` vs. `next.config.mjs` redirects vs. middleware) — pick the App-Router-idiomatic approach.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 spec (authoritative)
- `.planning/phases/01-casa-360-redesign/REDESIGN-BRIEF.md` — the 302-line source brief: full URL structure, top-nav spec, role-based UX, Exception Board / Vault / Assistant specs, mock-data rewrite (addresses + roster + 7 seed cards), remove/relocate checklist, 15-point verification checklist.
- `.planning/phases/01-casa-360-redesign/01-UI-SPEC.md` — the approved UI design contract: Locked Decisions L1–L7, the 3 Resolved Tensions, the reconciled 8-category color quartets, typography tiers, spacing scale, component inventory (build vs. reuse), copywriting contract, accessibility + responsive contracts, and the 12-point checker watch-list.

### Binding design / product system
- `DESIGN.md` — binding Casa design system (editorial, restrained, premium; print-shop status quartets; One Voice / One Headline rules).
- `PRODUCT.md` — binding brand voice and product principles.
- `CLAUDE.md` — project instructions: design-system conventions, TypeScript/naming conventions, accessibility rules.
- `src/app/globals.css` — the `@layer components` class system (`.ex-card`, `.sheet`, `.filter-chip`, `.btn-sm-*`, `.bubble`, `.notif-badge`, `.toast-row`, etc.) — reuse, do not re-implement.
- `tailwind.config.ts` — design tokens (`ink`, `paper`, `rule`, `accent`, `softgray`, letter-spacing, radius).

### Roadmap
- `.planning/ROADMAP.md` — Phase 1 section: the 6 success criteria this phase is verified against (L3 — no formal REQ-IDs).

</canonical_refs>

<specifics>
## Specific Ideas

- **7 anchor exception cards** — transcribe verbatim from the brief's "Seed exception cards" list (Critical·Guest hot-water at 989 Nelson; Critical·Cleaner no-response at 1455 Howe; Medium·Pricing Taylor Swift weekend portfolio-wide; Medium·Pipeline Sarah Chen callback at 2105 W 4th; Medium·Compliance STR license at 1120 Hamilton; Low·Owner November revenue at 3280 W Broadway; Low·Revenue underperformance at 1233 W Cordova).
- **Canned Assistant responses** — use the brief's three worked examples ("Which properties are underperforming?", "What's our occupancy this month?", "Show me today's turnovers"); supply matching canned answers for the remaining role-specific prompts.
- **Real Vancouver address list** — 36 addresses with neighborhoods in the brief; use 26 for the property roster.
- **Component inventory** — UI-SPEC section "Component Inventory" enumerates build-vs-reuse per surface: NEW (`casa/top-nav.tsx`, `casa/exception-card.tsx`, `casa/vault-card.tsx`, `casa/assistant.tsx`, greeting block, status pills, empty state, Pricing mega-card, Agent Logs index) vs. PRESERVE (`topbar`, `command-palette`, `sparkline`, `agent-skeleton`, `publish-button`, all `globals.css` classes, the Pricing Agent detail page).
- **Checker watch-list** — the UI-SPEC's 12-point watch-list (no sage green; inner 2px rule not thick border; `#134E8B` owner/revenue text; ≤10% blue; one Playfair headline/route; every card has `Suggested:` + footer; `#FAFAF7`/`#FFFFFF`; `date-fns` in package.json; PNG logo; reduced-motion block updated; active-chip contrast; bell aria-label) is the de-facto acceptance bar.

</specifics>

<deferred>
## Deferred Ideas

- **Real Supabase data layer** — Phase 2 (Phase 1 stays on rewritten mock data — L1).
- **Real LLM / OpenRouter Assistant** — later phase (Phase 1 = canned responses).
- **Real exception-action persistence + three-state lifecycle + Undo persistence** — Phase 3.
- **`error.tsx` route-level error boundary** — Phase 6 (Phase 1 uses graceful inline not-found copy, matching the existing `getProperty`/`getBooking` null pattern).
- **Side-sheet ARIA roles + focus traps** — v2 (V2-A11Y-01). Keyboard *reachability* (Esc-to-close, focusable controls) is still required this phase.
- **Guest/Ops/SOP agent detail pages at full Pricing parity** — Phase 1 mirrors the 9-section *structure*; full functional parity is later phases.

</deferred>

---

*Phase: 01-casa-360-redesign*
*Context gathered: 2026-05-20 via PRD Express Path (REDESIGN-BRIEF.md)*
