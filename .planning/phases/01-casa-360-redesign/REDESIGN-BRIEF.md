# Phase 1: Casa 360 Redesign — Source Brief

**Captured:** 2026-05-20
**Status:** Brief — input for discuss-phase / plan-phase
**Origin:** Operator-supplied redesign prompt + 3 reference screenshots of Rachit's Replit prototype.

> This is the authoritative source for Phase 1. The ROADMAP.md phase entry summarizes
> it; this file is the full spec. The redesign is a **structural refactor** of the
> existing codebase — layout, routing, and information architecture — not a greenfield
> build. Existing components, mock data, and styling tokens stay where useful.

---

## Intent

Restructure Casa Command Center from a 13-route left-sidebar layout to a 3-tab
top-nav layout matching the reference Replit prototype. Preserve the Pricing Agent
detail page by relocating it under Vault. Implement role-based UX with two roles
(Owner / Operations). Rewrite mock data to be narrative and specific.

**Reference aesthetic:** Rachit's Replit prototype — three top tabs (Exception Board,
Vault, Assistant), minimalist single-column layout, role-aware greetings, narrative
exception cards with "Suggested:" italicized blocks. Adopt his *structure*; keep
**Casa blue `#1E5FBF`** as the accent. The reference screenshots show a sage-green
accent — **do not adopt the green.** Casa blue stays, sage green stays out.

---

## New URL structure (collapse 13 routes → this hierarchy)

```
/login                          Login — role-aware demo accounts
/                               Exception Board (home, default route)
/vault                          Vault landing — 8 cards in a grid
/vault/properties               Properties table
/vault/properties/[id]          Property detail — side-sheet (support deep linking)
/vault/bookings                 Bookings table
/vault/bookings/[id]            Booking detail — side-sheet
/vault/cleanings                Cleanings table
/vault/cleanings/[id]           Cleaning detail — side-sheet
/vault/claims                   Claims table
/vault/claims/[id]              Claim detail — side-sheet
/vault/owners                   Owners table
/vault/owners/[id]              Owner detail — side-sheet
/vault/pipeline                 Pipeline / prospects table
/vault/financials               Financials summary view
/vault/compliance               Compliance / certificates table
/vault/agent-logs               Agent Logs — index of 4 agents + recent activity feed
/vault/agent-logs/pricing       Pricing Agent detail — keep the rich 9-section page
/vault/agent-logs/guest         Guest Agent detail — same 9-section structure
/vault/agent-logs/ops           Ops Agent detail — same 9-section structure
/vault/agent-logs/sop           SOP Agent detail — same 9-section structure
/assistant                      Chat — role-aware greeting + suggested prompts + input
/settings                       User settings — via top-right dropdown, not top nav
```

**Delete or redirect:**
- `/pricing` → folded into `/` as PRICING-category exception cards
- `/cleanings` → redirect to `/vault/cleanings`
- `/claims` → redirect to `/vault/claims`
- `/properties` → redirect to `/vault/properties`
- `/bookings` → redirect to `/vault/bookings`
- `/agents` and `/agents/[name]` → redirect to `/vault/agent-logs` and `/vault/agent-logs/[name]`
- `/reports` → fold into `/vault/agent-logs/[agent]` as a Validation section, or `/vault/validation-reports` if it deserves its own surface

---

## Top nav (replaces sidebar)

Single sticky top bar across all authenticated routes. Delete the left sidebar entirely.

- **Left:** HumanOS logo (SVG, `/public/humanos-logo.svg`) + dot separator + "Casa Properties" wordmark, sans-serif bold.
- **Center:** three nav links — Exception Board, Vault, Assistant. Active route gets a Casa-blue underline + darker text; inactive items gray-600.
- **Right:** notification bell with red badge count; user avatar circle (initials); user name + ROLE label below; chevron dropdown.
- **User dropdown:** full name + email; role pill (OWNER for Carlos, OPERATIONS for Denika); "Settings" → `/settings`; "Sign out" → clears auth, redirects to `/login`.
- Height ~70px, white background, 1px gray-200 bottom border.

---

## Role-based UX

Two roles, hardcoded credentials in `src/lib/auth/context.tsx`. Expose
`role: 'owner' | 'operations'` derived from the demo account email. Add a `useRole()` hook.

- **Carlos Robles** (`carlos@casa.com` / `demo`) → `role = 'owner'`
- **Denika Patel** (`denika@casa.com` / `demo`) → `role = 'operations'`

**Where role matters:**
1. **Exception Board greeting** — "OWNER VIEW" / "OPERATIONS VIEW" eyebrow + "Good {timeOfDay}, {firstName}." headline + "Here's what's waiting on you right now." subtitle. Time-of-day: `Good morning` before noon, `Good afternoon` until 6pm, `Good evening` after.
2. **Vault landing** — Owner sees Properties/Owners/Financials pinned; Operations sees Bookings/Turnovers pinned (green border + "PINNED FOR {ROLE}" badge). All 8 cards visible to both — pinning is highlighting, not gating.
3. **Assistant greeting** — Owner: "Hey Carlos — I have access to all your property data, bookings, financials, and agent activity. Ask me anything." Operations: "Hey Denika — I can pull up turnovers, cleaner activity, bookings, or anything else in operations. What do you need?"
4. **Assistant suggested prompts** — 4 chips. Owner: "Which properties are underperforming?", "What's our occupancy this month?", "Show me November revenue", "Compare Q1 vs Q2". Operations: "Show me today's turnovers", "Which cleanings are running late?", "Booking velocity this week", "Recent guest complaints by property".
5. **Exception Board filter chips** — both roles see All, Critical, Guest, Operations, Pricing, Pipeline, Compliance. The card *instances* surfacing differ by role-relevance (owner: Owner Question, Revenue Anomaly; operations: Cleaner, Maintenance, Quality). All categories show for both.
6. **Settings page** — show role pill near user name. Both roles edit profile, notifications, agent toggles. No financial gating in Phase 1 (Denika is full admin).

---

## Exception Board (home, `/`)

Single column, ~1000px max width, centered, off-white background.

1. **Greeting block** — uppercase tracking-wide eyebrow ("OWNER VIEW"/"OPERATIONS VIEW"); large serif headline "Good {timeOfDay}, {firstName}."; sans subtitle.
2. **Status pills row (4)** — "7 pending" (red bg, white text), "1 critical" (light red bg, dark red text), "3 medium" (light yellow bg, dark amber text), "0 resolved today" (gray). Counts driven by data; animate updates on realtime change.
3. **Filter chip row (7)** — All (selected default, Casa blue bg, white text), Critical, Guest, Operations, Pricing, Pipeline, Compliance (white bg, gray border). Multi-select.
4. **Exception card stack** — one card per exception, sorted by urgency (Critical → High → Medium → Low) then `created_at` DESC. Card: colored dot; category pill (uppercase, color-coded); time-ago (right, `date-fns/formatDistanceToNow`); bold serif title; property + neighborhood subtitle (gray-500); 2–3 sentence narrative body; **Suggested block** (gray-50 bg, italic, bold "Suggested:" label); action button row (primary Casa blue, secondary outline, "Dismiss" plain link); footer (source attribution + booking ID, gray-400). Left border accent matches category.
5. **Empty state** — large serif "All clear." + sans "Nothing in this category needs your attention right now."

**Category color coding:**

| Category | Pill bg | Pill text | Left border | Dot |
|---|---|---|---|---|
| Guest | red-50 | red-700 | red-500 | red-500 |
| Cleaner | red-50 | red-700 | red-500 | red-500 |
| Pricing | yellow-50 | yellow-800 | yellow-500 | yellow-500 |
| Pipeline | green-50 | green-700 | green-500 | green-500 |
| Compliance | purple-50 | purple-700 | purple-500 | purple-500 |
| Owner | blue-50 | blue-700 | blue-500 | blue-500 |
| Revenue | blue-50 | blue-700 | blue-500 | blue-500 |
| Maintenance | orange-50 | orange-700 | orange-500 | orange-500 |

**Action buttons by category:**
- guest_complaint → Approve Fix / Call Guest / Dismiss
- cleaner_no_response → Call Cleaner / Dispatch Backup / Resolve
- claims_draft → Approve Claim / Edit Draft / Reject
- pricing_alert (single) → Approve Rate / Adjust % / Ignore
- pricing_alert (portfolio-wide) → Approve Increase / Adjust % / Ignore
- pipeline_followup → Schedule Call / View Brief / Dismiss
- compliance_expiry → Mark Renewed / Snooze 7 Days / Assign
- owner_inquiry → Send Draft / Edit & Send / Call Owner
- revenue_anomaly → Review Listing / Adjust Pricing / Investigate

**Removed:** the 4 KPI tiles (replaced by 4 status pills); the right rail (Today's Cleanings / Check-ins / Activity — info moves into Vault); the standalone Pricing Approval Queue route. Each weekly pricing recommendation becomes a PRICING exception card; the bulk-approval workflow is preserved as a "Pricing Week of [date]" mega-card that opens a side-sheet with the 26-property Approve/Edit/Reject table.

---

## Vault

`/vault` is the data-discovery surface. Landing: header "Admin Vault" (serif) + "Central
repository for all operational data and AI agent records." subtitle; 4×2 grid of 8 cards
(2×4 on mobile).

**Card:** icon top-left in soft colored square; title (sans semibold); subtitle (count
or summary); "PINNED FOR {ROLE}" green badge + border if pinned for current role.

| Card | Icon | Subtitle | Pinned: Owner | Pinned: Operations |
|---|---|---|---|---|
| Properties | building | "26 properties" | ✓ | — |
| Owners | users | "18 owners" | ✓ | — |
| Bookings | calendar | "{count} bookings" | — | ✓ |
| Pipeline | target | "34 prospects" | — | — |
| Turnovers | spray-bottle | "{count} turnovers" | — | ✓ |
| Financials | dollar-sign | "P&L Summary" | ✓ | — |
| Compliance | shield-check | "{count} certificates" | — | — |
| Agent Logs | robot | "{count} actions" | — | — |

Click a card → `/vault/[card-name]`.

**Vault sub-pages (table views)** — same pattern: breadcrumb "← Vault"; header (serif) +
count subtitle; filter row (search + status/type chips); sortable table with status pills
and inline visualizations where applicable; row click opens a right side-sheet (~500px,
overlay backdrop, full-screen on mobile).

**Side-sheet drill-down** — slide from right; close X; heading + subtitle; 4-tile stat
grid; key/value detail rows; entity-specific action button row.

**Agent Logs sub-page (`/vault/agent-logs`)** — header + "All agent activity across the
system"; 4 agent summary cards in a 2×2 grid (Pricing / Guest / Ops / SOP with status
pill, role description, 4 stat tiles, sparkline, link to detail); below: recent activity
feed table (Timestamp / Agent / Property / Action / Status / Cost — 50 most recent).
Click an agent card → `/vault/agent-logs/[agent]`.

**Critical:** do NOT lose the Pricing Agent detail page. Move the existing `/agents/pricing`
contents verbatim to `/vault/agent-logs/pricing` — same 9 sections (At a Glance, Live
Activity, Configuration, Performance, Decisions, Properties, Validation, Prompt History,
Controls). Stub Guest / Ops / SOP with the same structure + agent-appropriate mock data.

---

## Assistant (`/assistant`)

Single-column centered, ~700px max width. Bot avatar + bot bubble with role-aware
greeting; 4 suggested prompt chips (role-aware); conversation history; fixed bottom input
bar ("Ask about properties, revenue, or agent actions...") + Casa-blue send button.

**Phase 1 demo behavior:** clicking a chip populates + sends the input; sending shows a
user bubble + loading indicator + a canned response after a 1–2s delay. Real Claude
integration via OpenRouter comes later.

**Canned responses (examples):**
- "Which properties are underperforming?" → "Three properties are 20%+ below portfolio average MTD: 1233 W Cordova (Coal Harbour, -24%), 2592 W Broadway (West End, -18%), 3119 Hastings (West End, -16%). Want me to flag these as exception cards?"
- "What's our occupancy this month?" → "Portfolio occupancy MTD is 76% — up from 71% in October. Best: 1455 Howe (Yaletown, 94%). Lowest: 1233 W Cordova (Coal Harbour, 58%)."
- "Show me today's turnovers" → "Seven cleanings scheduled today. Three completed, two in progress, one dispatched, one waiting on Andrea's response (60min mark)."

---

## Design tokens

- **Primary brand color: Casa blue `#1E5FBF`** — active nav underline, primary buttons, key indicators. Do NOT switch to sage green.
- **Typography:** keep Playfair Display (serif headings/reasoning), Inter (sans body). Bump body to 16px base.
- **Background:** off-white (~`#FAFAF7`), softer than pure white.
- **Cards:** pure white, light gray-200 border, 4px radius (subtle).
- **Spacing:** generous vertical rhythm — headings `mb-4`, body `mb-3`, card padding `p-6`, section spacing `space-y-8`.

Existing Casa design-system rules in `globals.css` / `tailwind.config.ts` / DESIGN.md
remain binding where not explicitly overridden above.

---

## Mock data rewrite

Replace mock-data content with narrative, specific content. Each exception card should
read like a real situation.

**Cleaner roster (real):** Andrea, Carly, Sabrina, Juli (main team); Stana, Andrea L.
(Langley team). Replace any "Maria L." / "Jason K." / "Priya S." placeholders.

**Real Vancouver addresses (26 properties):** 1455 Howe St (Yaletown), 989 Nelson St
(Downtown), 3280 W Broadway (Pt Grey), 2255 Davie St (West End), 1633 Quebec St (Olympic
Village), 5550 Cambie St (Cambie), 788 Hamilton St (Yaletown), 1100 Granville St
(Downtown), 4321 Main St (Mt Pleasant), 601 Beach Crescent (Yaletown), 1818 Robson St
(West End), 2400 Cornwall Ave (Kitsilano), 900 Pacific Blvd (Yaletown), 1120 Hamilton St
(Yaletown Loft), 1322 Bidwell St (West End), 110 Switchmen St (Olympic Village), 845
Hornby St (Downtown), 3050 Heather St (Fairview), 1500 Robson St (West End), 2025 Larch
St (Kitsilano), 4500 Oak St (Cambie), 1700 Comox St (West End), 525 Smithe St (Downtown),
3700 Knight St (Kensington), 2640 Yew St (Kitsilano), 4900 Joyce St (East Van), 1502 Howe
St (Coal Harbour), 1233 W Cordova St (Coal Harbour), 1826 Nelson St (West End), 2592 W
Broadway (West End), 3119 Hastings St (West End), 3226 Hastings St (West End), 1620 Davie
St (West End), 5825 Cambie St (Cambie), 6800 Granville St (Marpole), 2105 W 4th Ave
(Kitsilano).

**Seed exception cards (7 anchor cards, plus 5–10 more across mixed categories):**

1. **Critical · Guest** — "Guest complaint — hot water issue", 989 Nelson St (Downtown Condo). "Guest reported no hot water 2 hours after check-in. Mid-stay for a 3-night booking via Airbnb. Sentiment analysis: negative." Suggested: "Apologize immediately. Dispatch emergency plumber. Offer 15% discount code for next direct booking." Buttons: Approve Fix / Call Guest / Dismiss. Source: Guest Agent · BK-2847. 9 min ago.
2. **Critical · Cleaner** — "Cleaner no response — 1455 Howe St" (Yaletown Suite). "WhatsApp confirmation sent 2 hours ago after guest checkout. Cleaner Andrea has not responded. Next guest checks in at 3:00 PM today." Suggested: "Call Andrea directly. If no answer within 30 min, dispatch backup cleaner (Carly)." Buttons: Call Cleaner / Dispatch Backup / Resolve. Source: Ops Agent · BK-2851. ~1 hr ago.
3. **Medium · Pricing** — "Rate adjustment — Taylor Swift concert weekend", Portfolio-wide (12 properties). "Taylor Swift Eras Tour at BC Place Nov 15-17. Current weekend rates 22% below comparable listings. 12 of 26 properties have availability." Suggested: "Increase rates by 35-50% for Nov 15-17 across all 12 available properties. Estimated additional revenue: $4,200-6,800." Buttons: Approve Increase / Adjust % / Ignore. Source: Pricing Agent. ~2 hr ago.
4. **Medium · Pipeline** — "Hot lead — property owner callback requested", 2105 W 4th Ave (Kitsilano). "Owner Sarah Chen responded to cold-call follow-up SMS: 'Yeah I'd be interested in hearing more about your management services. Can you call me tomorrow around 11?' Score: 82/100." Suggested: "Call Sarah Chen tomorrow at 11 AM. Pre-call brief attached. 2BR condo, currently self-managed on Airbnb with 4.2 stars." Buttons: Schedule Call / View Brief / Dismiss. Source: Sales Agent. ~5 hr ago.
5. **Medium · Compliance** — "STR license expires in 12 days", 1120 Hamilton St (Yaletown Loft). "City of Vancouver Short-Term Rental business license expires March 30, 2026. Renewal requires proof of principal residence or operator license. 14-day alert threshold reached." Suggested: "Initiate renewal through City of Vancouver portal. Processing time: 5-10 business days." Buttons: Mark Renewed / Snooze 7 Days / Assign. Source: System. ~12 hr ago.
6. **Low · Owner** — "Owner question — November revenue report", 3280 W Broadway (Point Grey House). "Owner James Park emailed asking why November revenue was 18% lower than October. Draft response prepared with seasonal occupancy data and rate comparison." Suggested: "Review draft response. Key points: seasonal demand drop (normal for Nov), occupancy 72% vs 85% in Oct, rates competitive for the period." Buttons: Send Draft / Edit & Send / Call Owner. Source: Owner Agent. ~8 hr ago.
7. **Low · Revenue** — "Underperformance — Coal Harbour unit", 1233 W Cordova St (Coal Harbour). "Property revenue 24% below portfolio average for the past 3 weeks. Occupancy: 58% vs portfolio avg 78%. No negative reviews. Pricing appears competitive." Suggested: "Review listing photos (last updated 6 months ago). Consider refreshing photography and description. Check if building amenity access has changed." Buttons: Review Listing / Adjust Pricing / Investigate. Source: Owner Agent. 1 day ago.

Every exception card must have a `Suggested:` italic block and a source-attribution footer.

---

## Remove / relocate checklist

- Delete `src/app/(dashboard)/agents`; relocate content to `(dashboard)/vault/agent-logs/`.
- Delete `(dashboard)/pricing/page.tsx` as a standalone route; fold the bulk-approve queue into the "Pricing Week of [date]" exception-card side-sheet.
- Delete `(dashboard)/cleanings`, `/claims`, `/properties`, `/bookings` as top-level routes; redirect to `/vault/` equivalents.
- Delete the left sidebar component from `(dashboard)/layout.tsx`.
- Delete the right rail from the Home page.
- Delete the 4 KPI tiles from Home; replace with 4 status pills.
- Delete `(dashboard)/reports` as a top-level route; fold into agent detail pages as a Validation section.
- Update `tailwind.config.ts` if drifted from Casa blue.
- Update `src/lib/auth/context.tsx` to expose `role: 'owner' | 'operations'`.

---

## Verification checklist

1. `/` renders Exception Board (greeting / status pills / filter chips / card list) — no sidebar.
2. Top nav has 3 tabs only + user dropdown on right.
3. Carlos sees "OWNER VIEW" and owner-pinned cards in Vault.
4. Denika sees "OPERATIONS VIEW" and operations-pinned cards in Vault.
5. Clicking a Vault card drills into a sub-page; clicking a row opens a side-sheet.
6. `/vault/agent-logs/pricing` renders the existing rich 9-section Pricing Agent page (preserved verbatim).
7. Pricing approval workflow reachable via a "Pricing Week of [date]" PRICING exception card → side-sheet with the 26-row bulk-approve table.
8. Assistant has role-aware greeting + 4 suggested prompts + canned-response demo.
9. Casa blue is the primary accent throughout — no sage green leakage.
10. All 26 mock properties use real Vancouver addresses with correct neighborhoods.
11. All cleaner references use Casa's real roster (Andrea, Carly, Sabrina, Juli, Stana, Andrea L.).
12. Every exception card has a `Suggested:` italic block + source-attribution footer.
13. Settings reachable only via user dropdown (not top nav).
14. No console errors on any route.
15. Mobile: top nav → hamburger drawer; Vault grid → 2 cols then 1; tables horizontal-scroll; side-sheets full-screen.

`npm run build` must succeed with no broken imports. Test all 3 top-nav routes + ≥3 Vault
drill-downs + the Pricing Agent detail page + Assistant on both Carlos and Denika accounts.

---

## Keep unchanged

- Supabase schema and queries (note: per ROADMAP, the real data layer is built in Phase 2 — Phase 1 stays on rewritten *mock* data).
- Pricing Agent detail page (move it, don't rewrite it).
- Existing shadcn/ui primitives.
- Existing fonts (Playfair Display + Inter) and brand-font decisions.
- Existing mock-data *structure* (rewrite the content to be narrative).
- App Router routing conventions.
- Existing auth context (extend for roles, don't replace).
- Existing component library in `src/components/` (build on top, don't rebuild).

---

## Open items for discuss-phase

- The brief assumes "Supabase schema and queries — data layer is solid"; per ROADMAP the real data layer lands in Phase 2. Confirm Phase 1 operates entirely on rewritten **mock data** (`src/lib/mock-data/`), keeping the `src/lib/data/*` seam for Phase 2.
- `/reports` disposition: Validation section inside each agent detail page, vs a standalone `/vault/validation-reports`.
- Whether to register formal REQUIREMENTS.md IDs for the new IA/UX scope, or treat Phase 1 as a structural-refactor phase tracked by success criteria only.
- Mobile drawer behavior detail (full nav drawer vs. condensed).
- `humanos-logo` asset: brief references `/public/humanos-logo.svg`; repo currently has `humanos-logo.png` — confirm asset.
