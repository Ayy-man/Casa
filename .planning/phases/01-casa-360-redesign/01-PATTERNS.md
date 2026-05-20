# Phase 1: Casa 360 Redesign - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 41 (created / modified / deleted)
**Analogs found:** 30 / 33 buildable files (3 net-new with partial analogs)

> Phase 1 is a **structural refactor** of an existing, shipped Next.js 14 App Router
> demo skin — not a greenfield build. Almost every "new" file descends directly from an
> existing analog in the same repo. This map ties each new/modified file to its closest
> analog with concrete code excerpts (real line ranges, real signatures, real
> `globals.css` class names) so the planner and executor replicate existing Casa
> conventions instead of inventing new ones. The dominant move is: copy the structure of
> an existing route page / component, swap routing + content, never re-skin.

---

## File Classification

### Files to CREATE

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `src/components/casa/top-nav.tsx` | shared component | request-response (nav) | `src/components/casa/topbar.tsx` + `sidebar.tsx` | role-match (merge of two analogs) |
| `src/components/casa/exception-card.tsx` | shared component | event-driven (action callbacks) | `ExceptionCard` fn in `src/app/(dashboard)/page.tsx:61-158` | exact |
| `src/components/casa/vault-card.tsx` | shared component | request-response (link card) | `prop-card` `<Link>` in `src/app/(dashboard)/properties/page.tsx:77-127` + `.prop-card` CSS | exact |
| `src/components/casa/assistant.tsx` | shared component | event-driven (chat/timeout) | `.bubble`/`.chat-row` in `src/app/(dashboard)/bookings/[id]/page.tsx:104-125` | role-match |
| `src/app/(dashboard)/page.tsx` (rewrite) | route page | event-driven | existing `src/app/(dashboard)/page.tsx` (Home) | exact (same file, restructured) |
| `src/app/(dashboard)/vault/page.tsx` | route page | CRUD (landing grid) | `src/app/(dashboard)/agents/page.tsx` (2-col card grid) | role-match |
| `src/app/(dashboard)/vault/properties/page.tsx` | route page | CRUD (table) | `src/app/(dashboard)/pricing/page.tsx` (table) + `properties/page.tsx` (filter) | role-match |
| `src/app/(dashboard)/vault/bookings/page.tsx` | route page | CRUD (table) | `src/app/(dashboard)/bookings/page.tsx` | exact |
| `src/app/(dashboard)/vault/cleanings/page.tsx` | route page | CRUD (table + sheet) | `src/app/(dashboard)/cleanings/page.tsx` | exact |
| `src/app/(dashboard)/vault/claims/page.tsx` | route page | CRUD (table + sheet) | `src/app/(dashboard)/claims/page.tsx` | exact |
| `src/app/(dashboard)/vault/owners/page.tsx` | route page | CRUD (table + sheet) | `src/app/(dashboard)/bookings/page.tsx` + `cleanings/page.tsx` sheet | role-match |
| `src/app/(dashboard)/vault/pipeline/page.tsx` | route page | CRUD (table) | `src/app/(dashboard)/bookings/page.tsx` | role-match |
| `src/app/(dashboard)/vault/financials/page.tsx` | route page | request-response (summary) | `src/app/(dashboard)/reports/page.tsx` (KPI + accordion) | role-match |
| `src/app/(dashboard)/vault/compliance/page.tsx` | route page | CRUD (table) | `src/app/(dashboard)/bookings/page.tsx` | role-match |
| `src/app/(dashboard)/vault/properties/[id]/page.tsx` | route page (detail) | request-response (deep link) | `src/app/(dashboard)/bookings/[id]/page.tsx` (not-found pattern) | exact |
| `src/app/(dashboard)/vault/bookings/[id]/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/bookings/[id]/page.tsx` | exact |
| `src/app/(dashboard)/vault/cleanings/[id]/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/bookings/[id]/page.tsx` | exact |
| `src/app/(dashboard)/vault/claims/[id]/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/bookings/[id]/page.tsx` | exact |
| `src/app/(dashboard)/vault/owners/[id]/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/bookings/[id]/page.tsx` | exact |
| `src/app/(dashboard)/vault/agent-logs/page.tsx` | route page (index) | CRUD (grid + feed) | `src/app/(dashboard)/agents/page.tsx` | exact |
| `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/agents/pricing/page.tsx` (MOVE verbatim) | exact (relocate, do not restyle) |
| `src/app/(dashboard)/vault/agent-logs/guest/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/agents/guest/page.tsx` (3-line `AgentSkeleton` wrapper) | exact |
| `src/app/(dashboard)/vault/agent-logs/ops/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/agents/ops/page.tsx` | exact |
| `src/app/(dashboard)/vault/agent-logs/sop/page.tsx` | route page (detail) | request-response | `src/app/(dashboard)/agents/sop/page.tsx` | exact |
| `src/app/(dashboard)/assistant/page.tsx` | route page | event-driven | new `casa/assistant.tsx` (thin wrapper) | role-match |
| `src/lib/mock-data/owners.ts` | mock-data module | data export | `src/lib/mock-data/properties.ts` | exact |
| `src/lib/mock-data/pipeline.ts` | mock-data module | data export | `src/lib/mock-data/bookings.ts` | exact |
| `src/lib/mock-data/financials.ts` | mock-data module | data export | `src/lib/mock-data/reports.ts` | role-match |
| `src/lib/mock-data/compliance.ts` | mock-data module | data export | `src/lib/mock-data/bookings.ts` | exact |
| `src/lib/mock-data/assistant.ts` | mock-data module | data export | `src/lib/mock-data/agents.ts` (`PROMPT_VERSIONS` pattern) | role-match |

### Files to MODIFY

| Modified File | Role | What Changes | Closest Pattern Source |
|---------------|------|--------------|------------------------|
| `src/lib/auth/context.tsx` | auth context | Add `role: 'owner' \| 'operations'` to `AuthUser`; derive from email in `USERS`; add `useRole()` hook | `useAuth()` hook at `context.tsx:97-101` |
| `src/app/(dashboard)/layout.tsx` | layout | Delete `<Sidebar />` import + mount; replace `<TopBar>` with `<TopNav>`; drop two-column flex | existing `layout.tsx:1-57` |
| `src/lib/mock-data/exceptions.ts` | mock-data module | Rewrite `EXCEPTIONS` content (7 anchor cards + 5-10 more); add `category`, `suggested`, `source`, `createdAt`, `neighborhood` fields; keep module shape | existing `exceptions.ts:1-87` |
| `src/lib/mock-data/properties.ts` | mock-data module | Rewrite all 26 to real Vancouver addresses + neighborhoods; keep `Property` type + helpers | existing `properties.ts:1-54` |
| `src/lib/mock-data/cleanings.ts` | mock-data module | Replace cleaner names with real roster (Andrea/Carly/Sabrina/Juli/Stana/Andrea L.) | existing `cleanings.ts` |
| `src/lib/mock-data/index.ts` | mock-data barrel | Add `export *` lines for owners/pipeline/financials/compliance/assistant | existing `index.ts:1-9` |
| `package.json` | config | Add `date-fns` (pin stable v3.x) to `dependencies` | existing `dependencies` block `package.json:11-33` |
| `src/app/globals.css` | CSS | Add `.filter-chip--accent`, `.btn-sm-accent`, `.sheet--vault`, category-quartet classes, status-pill classes, drawer + status-pill-count animations; extend `prefers-reduced-motion` block | existing `@layer components` (`.filter-chip:783`, `.sheet:821`, `.ex-card:459`, reduced-motion `:1157`) |
| `src/components/casa/command-palette.tsx` | shared component | Update `go` targets to `/vault/*` routes | existing `command-palette.tsx:42-82` |
| `tailwind.config.ts` | config | Verify `accent` is `#1E5FBF` (likely no change — confirm only) | existing token block |

### Files to DELETE

| Deleted File | Reason | Where Content Goes |
|--------------|--------|--------------------|
| `src/components/casa/sidebar.tsx` | 3-tab top nav replaces left sidebar | nav model → `casa/top-nav.tsx`; user menu → top-nav dropdown |
| `src/app/(dashboard)/pricing/page.tsx` | Standalone pricing route removed | 26-row table → "Pricing Week of" mega-card side-sheet on Exception Board |
| `src/app/(dashboard)/properties/page.tsx` | Top-level route removed | → `/vault/properties` (redirect or delete) |
| `src/app/(dashboard)/properties/[id]/page.tsx` | Top-level route removed | → `/vault/properties/[id]` |
| `src/app/(dashboard)/bookings/page.tsx` | Top-level route removed | → `/vault/bookings` |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | Top-level route removed | → `/vault/bookings/[id]` |
| `src/app/(dashboard)/cleanings/page.tsx` | Top-level route removed | → `/vault/cleanings` |
| `src/app/(dashboard)/claims/page.tsx` | Top-level route removed | → `/vault/claims` |
| `src/app/(dashboard)/agents/*` (whole dir) | Relocated under Vault | → `/vault/agent-logs/*` |
| `src/app/(dashboard)/reports/page.tsx` | Folded into agent detail "Validation" section (L2) | → `Validation` section per agent page |

> **Redirect note (Claude's Discretion item):** the App-Router-idiomatic approach is a
> one-line `page.tsx` calling `redirect()` from `next/navigation` at each legacy path
> (e.g. `src/app/(dashboard)/cleanings/page.tsx` → `redirect("/vault/cleanings")`).
> This keeps legacy deep links alive without `next.config.mjs` rewrites and without
> middleware. Dynamic legacy routes (`/properties/[id]`) redirect with the id
> interpolated. Planner picks: redirect-stub vs hard-delete per route — redirect-stub is
> recommended for the 5 table routes + agents so external links don't 404.

---

## Pattern Assignments

### `src/components/casa/top-nav.tsx` (shared component, NEW)

**Analogs:** `src/components/casa/topbar.tsx` (logo + bell + outside-click dropdown) and
the deleted `src/components/casa/sidebar.tsx` (active-link detection + user menu +
`signOut`). The new file MERGES both.

**Component signature** — top-nav takes no `onOpenPalette` prop (search is dropped from the
redesigned nav per UI-SPEC); it is a self-contained `"use client"` component:
```typescript
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/lib/auth/context";
import { EXCEPTIONS } from "@/lib/mock-data/exceptions";

export function TopNav() { /* ... */ }
```

**Logo + wordmark pattern** — copy verbatim from `topbar.tsx:33-44` (L5 — PNG, never SVG):
```typescript
<div className="flex items-center gap-3">
  <Image src="/humanos-logo.png" alt="HumanOS" width={120} height={30}
    style={{ height: 30, width: "auto", display: "block" }} priority />
  <div className="h-5 w-px bg-rule" />
  <div className="font-display text-[15px] tracking-tight text-ink">Casa Properties</div>
</div>
```

**Active-tab detection** — port `isActive()` from `sidebar.tsx:80-83`. The 3 tabs are
`/` (end-match), `/vault` (prefix-match so `/vault/*` highlights Vault), `/assistant`.
Active tab = 2px Casa-blue underline + ink text; inactive = `#737373`. Reuse the existing
`.tab-trigger` / `.tab-trigger.active` classes (`globals.css:797-808`) — they already
encode a 2px `#1e5fbf` `border-bottom` and `color:#1a1a1a` active state, exactly the
brief's spec. No new CSS needed for the tabs themselves.

**Notification bell** — copy the bell `<button>` + `.notif-badge` + outside-click
dropdown from `topbar.tsx:90-168`. The bell button at `topbar.tsx:91-109` already carries
`aria-label`, `title` is required (Checker watch-list item 12 — `topbar.tsx` currently
sets `aria-label` but NOT `title`; the new component MUST add `title="Notifications"`).
`.notif-badge` (`globals.css:283-299`) is already `#1E5FBF` — reuse, do not restyle.

**User dropdown** — use Radix `Dropdown` (the pattern is live at
`src/app/(dashboard)/page.tsx:118-145`) styled with `.menu-pop-floating` /
`.menu-pop-item` (`globals.css:348-365`). Content: full name + email + role pill
(`OWNER`/`OPERATIONS`), `Settings` → `router.push("/settings")`, `Sign out` →
`signOut()` then `router.push("/login")`. The avatar + name + role markup descends from
`sidebar.tsx:172-183` (`<span className="avatar">` + name + `role`).

**Mobile drawer (L4)** — NEW, no analog. Hamburger `<button>` (Menu icon) toggles a
slide-in panel. Reuse `.sheet-overlay` (`globals.css:810-819`) for the scrim. Slide via
`transform: translateX()` only (Interaction Contract). Drawer must be added to the
`prefers-reduced-motion` block in `globals.css:1157-1178`.

---

### `src/components/casa/exception-card.tsx` (shared component, NEW)

**Analog:** the `ExceptionCard` function component at `src/app/(dashboard)/page.tsx:61-158`
— extract it to its own file and extend. This is an **exact** match: it already renders
urgency dot + pill + agent eyebrow + serif title + property subtitle + body + action row.

**Base structure to copy** (`page.tsx:74-93`):
```typescript
<article className="ex-card scroll-mt-6" id={...}>
  <header className="flex items-start justify-between gap-4 mb-3">
    <div className="flex items-center gap-3 min-w-0">
      <span className={`urgency-dot urg-${ex.urgency}`} />
      <span className={`urgency-pill pill-${ex.urgency}`}>{ex.urgency}</span>
      <span className="agent-eyebrow">{ex.agent}</span>
    </div>
    <span className="text-[12px] text-neutral-600 shrink-0 tabular-nums">{ex.timeAgo}</span>
  </header>
  <h3 className="font-display text-[20px] leading-tight tracking-tight">{ex.typeLabel}</h3>
  <div className="text-[12.5px] text-neutral-600 mt-1">{ex.property}</div>
  <p className="reasoning mt-3" style={{ maxWidth: "60ch" }}>{ex.summary}</p>
```

**Extensions required by the brief/UI-SPEC** (not in the current analog):
- **Category pill** — replace/augment `agent-eyebrow` with an 8-category color pill. Add
  `.cat-{Guest|Cleaner|Pricing|Maintenance|Owner|Revenue|Pipeline|Compliance}` classes to
  `globals.css` modeled on the existing `.urgency-pill` base (`globals.css:481-498`). Use
  the **reconciled** quartets from UI-SPEC "8 Exception-Category color quartets" — NOT the
  brief's raw Tailwind palette.
- **Inner 2px colored rule** — the category accent. Copy the `.kpi-card .kpi-rule`
  technique (`globals.css:424-444`): an absolutely-positioned 2px bar **inside** the card
  border. Checker watch-list item 2 fails any `border-left-width > 1px`.
- **time-ago** — replace the static `ex.timeAgo` string with `date-fns`
  `formatDistanceToNow(new Date(ex.createdAt))`. Requires `date-fns` in `package.json`.
- **`Suggested:` italic block** — NEW. `#F7F7F6` (`softgray`) fill, `Suggested:` label
  Inter 13px weight 500, suggestion text italic. Every card must have it (Checker item 6).
- **Source-attribution footer** — NEW. Source + booking ID, `.mono` for the ID, muted text.
- **Action row** — current analog uses primary + `MoreHorizontal` overflow dropdown
  (`page.tsx:99-155`). The redesign wants visible primary + secondary + tertiary text link.
  Primary uses the NEW `.btn-sm-accent` (Casa-blue fill); secondary `.btn-sm-outline`;
  tertiary `Dismiss`/`Resolve`/etc. as a plain ink-soft `#737373` text link. Per-category
  copy is locked in the UI-SPEC Copywriting Contract table.

**`PublishButton` reuse** — the existing `requiresConfirm` two-step confirm pattern
(`page.tsx:100-116`, `src/components/ui/publish-button.tsx`) is PRESERVED — keep it for
any action flagged `requiresConfirm` on the data.

---

### `src/components/casa/vault-card.tsx` (shared component, NEW)

**Analog:** the `.prop-card` `<Link>` block in `src/app/(dashboard)/properties/page.tsx:77-127`
and the `.prop-card` CSS (`globals.css:730-741`, hover lift at `:741`).

**Structure to copy/adapt:**
```typescript
<Link href={`/vault/${card.slug}`} className="prop-card">
  <div className="p-6">
    {/* icon in soft colored square (top-left) */}
    {/* title — font-display, sans semibold per brief */}
    {/* subtitle — count, text-[12px] text-neutral-500 */}
  </div>
</Link>
```
The `.prop-card` class already provides the 2px radius, 1px `#E5E5E5` border, and the
hover lift `0 18px 40px -22px` shadow (Flat-at-Rest). The `agents/page.tsx:22-27`
`prop-card` usage with `style={{ aspectRatio: "auto" }}` shows how to use `.prop-card`
for a non-image card — copy that.

**Pinned state (L6 / Resolved Tension 3 — CASA BLUE, NOT GREEN):** `PINNED FOR {ROLE}`
badge — `#EAF1FB` fill, `#1E5FBF` text, `#C9D9F0` border (the Signal Blue Soft quartet,
same values as the existing `.ch-Vrbo` pill at `globals.css:871`). Pinned card border
goes `#C9D9F0`. Pin set comes from `useRole()`: owner → Properties/Owners/Financials;
operations → Bookings/Turnovers.

---

### `src/components/casa/assistant.tsx` (shared component, NEW)

**Analog:** the chat thread render in `src/app/(dashboard)/bookings/[id]/page.tsx:104-125`
plus the `.bubble` CSS (`globals.css:911-930`).

**Bubble pattern to copy** (`bookings/[id]/page.tsx:109-124`):
```typescript
{thread.map((m, i) => (
  <div key={i} className={`chat-row ${m.who}`}>
    <div>
      <div className={`bubble ${m.who}`}>{m.text}</div>
      <div className="bubble-meta" style={{ textAlign: m.who === "them" ? "left" : "right" }}>
        {m.time}
      </div>
    </div>
  </div>
))}
```
`.bubble.them` (`#f2f2f1`) = the bot, `.bubble.us` (`#1a1a1a`) = the user. The bot
greeting renders as a `.bubble.them`.

**Demo-behavior pattern** — the timeout-driven local-state mutation copies the toast
timer pattern from `src/app/(dashboard)/page.tsx:216-239` (`useRef<Map>` of timers,
`window.setTimeout`, cleanup in `useEffect` return). Chip click → push user bubble →
push loading indicator → after 1-2s `window.setTimeout` push canned response. No network.

**Suggested-prompt chips** — reuse `.filter-chip` (`globals.css:783-793`) for the 4
role-aware chips. Greeting + chip text + canned responses are role-driven via `useRole()`
and come verbatim from the UI-SPEC Copywriting Contract + brief canned examples.

**Send button** — Casa-blue, uses the NEW `.btn-sm-accent` class.

**Layout constant:** column `max-width: 700px`, centered; fixed bottom input bar.

---

### `src/app/(dashboard)/page.tsx` — Exception Board (route page, REWRITE)

**Analog:** the existing Home page (same file). KEEP: `"use client"`, `route-fade` root
div, `useMemo` urgency-sort (`page.tsx:207-213`), `URGENCY_RANK` import, the toast
timer machinery (`page.tsx:216-239`), `.toast-row`/`.toast-undo` (`globals.css:1107-1139`).

**Urgency sort to keep + extend** (`page.tsx:208-212`) — extend the comparator to add the
`created_at DESC` tiebreaker the brief specifies:
```typescript
[...EXCEPTIONS].sort((a, b) =>
  URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);
```

**REMOVE** (per CONTEXT.md "Removed"): the 4 KPI tiles (`page.tsx:314-353`), the right
rail `<aside className="home-rail">` (`page.tsx:423-517`), the `status-banner` block
(`page.tsx:253-305`), the `LEAD_KPI`/`SECONDARY_KPIS` constants (`page.tsx:31-41`).

**ADD:** greeting block (role eyebrow via `useRole()` + Playfair 40px headline + subtitle
— see Shared Patterns → Headline), 4 status pills, 7 multi-select filter chips, empty
state, the "Pricing Week of" mega-card. Render the card stack via the new
`casa/exception-card.tsx`. Multi-select filter = `useState<Set<string>>` toggled on chip
click; active chip uses `.filter-chip--accent`.

---

### Vault table sub-pages (`/vault/{properties,bookings,cleanings,claims,owners,pipeline,compliance}/page.tsx`)

**Primary analog:** `src/app/(dashboard)/bookings/page.tsx` (table) for the table shell;
`src/app/(dashboard)/properties/page.tsx:46-74` for the search + filter-chip row;
`src/app/(dashboard)/pricing/page.tsx:148-270` for the `.pricing-table` markup
(`globals.css:635-654`) which the UI-SPEC names as the table base.

**Filter row pattern to copy** (`properties/page.tsx:46-69`):
```typescript
<div className="flex flex-wrap items-center gap-3 mb-8">
  <div className="relative flex-1 max-w-[360px]">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
      <Search size={14} strokeWidth={1.5} />
    </span>
    <input value={q} onChange={(e) => setQ(e.target.value)} className="topbar-search" ... />
  </div>
  {FILTERS.map((f) => (
    <button key={f} onClick={() => setFilter(f)}
      className={`filter-chip ${filter === f ? "active" : ""}`}>{f}</button>
  ))}
</div>
```

**`useMemo` filter pattern** — copy `properties/page.tsx:14-22` (lowercase query match
across joined fields).

**Breadcrumb** — `← Vault` link. Copy the `ChevronLeft` back-link pattern from
`bookings/[id]/page.tsx:64-70`, change target to `/vault` and label to `Vault`.

**Header** — one Playfair 40px headline + count subtitle. Copy `properties/page.tsx:26-35`.

**Row click → side-sheet** — copy the `openId` state + sheet conditional from
`cleanings/page.tsx:26-27,112` and the `CleaningSheet` structure (see Side-sheet pattern
below). Detail must also be deep-linkable, so each table also has a `[id]/page.tsx`.

---

### Side-sheet (Vault drill-down) — used by all `[id]` pages + table row clicks

**Analog:** `CleaningSheet` in `src/app/(dashboard)/cleanings/page.tsx:117-355` and the
`.sheet` CSS family (`globals.css:810-858`).

**Sheet shell to copy** (`cleanings/page.tsx:136-159`):
```typescript
<>
  <div className="sheet-overlay" onClick={onClose} />
  <aside className="sheet">
    <div className="sheet-header">
      <div className="flex-1">
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="font-display text-[26px] tracking-tight leading-tight mt-1">{title}</h2>
        <div className="text-[12.5px] text-neutral-500 mt-1">{subtitle}</div>
      </div>
      <button type="button" className="close-btn" onClick={onClose}>
        <X size={14} strokeWidth={1.6} />
      </button>
    </div>
    <div className="sheet-body"> {/* 4-tile stat grid + .def-row rows + action row */} </div>
  </aside>
</>
```

**Width variant:** the existing `.sheet` is `600px` (`globals.css:826`). UI-SPEC requires
a `~500px` `.sheet--vault` modifier — add it to `globals.css`. Mobile full-screen
(`width:100vw`) is already covered by `globals.css:1189` — no change needed.

**Key/value rows** — reuse `.def-row` / `.def-key` exactly as `bookings/[id]/page.tsx:183-202`:
```typescript
<div className="def-row">
  <span className="def-key">Nightly rate</span>
  <span className="tabular-nums">${booking.rate}</span>
</div>
```

**Deep-link not-found** — copy the null-guard from `bookings/[id]/page.tsx:24-37` verbatim;
swap copy to the UI-SPEC "Not-found" strings (`Not found.` / `That record doesn't exist...`).

---

### `src/app/(dashboard)/vault/page.tsx` — Vault landing (route page, NEW)

**Analog:** `src/app/(dashboard)/agents/page.tsx` — a card-grid landing page. Copy its
`route-fade page-pad` root, `header` block (`agents/page.tsx:9-18`), and the
`grid` → `<Link className="prop-card">` map (`agents/page.tsx:20-64`). Change the grid to
4×2 (`grid-cols-4`, responsive to 2-col then 1-col), render `casa/vault-card.tsx` per
card. 8 cards with counts from mock-data. Header: `Admin Vault` + the subtitle from the
Copywriting Contract.

---

### `src/app/(dashboard)/vault/agent-logs/page.tsx` — Agent Logs index (route page, NEW)

**Analog:** `src/app/(dashboard)/agents/page.tsx` — exact. Copy the 2-col agent-card grid
including the `<Sparkline values={a.spark} color="#1E5FBF" />` usage (`agents/page.tsx:59`,
`src/components/casa/sparkline.tsx` PRESERVED). Add below it a 50-row recent-activity
feed table using the `.pricing-table` base (`globals.css:635`). Card links go to
`/vault/agent-logs/[key]`.

---

### `src/app/(dashboard)/vault/agent-logs/pricing/page.tsx` (route page, RELOCATE)

**Analog:** `src/app/(dashboard)/agents/pricing/page.tsx` — **MOVE VERBATIM, do not
restyle** (CONTEXT.md, brief line 172, UI-SPEC Component Inventory). The only edits
permitted: update internal back-links from `/agents` → `/vault/agent-logs` and any
`href` the 9-section page contains. The `SECTIONS` array (`agents/pricing/page.tsx:15-25`)
already includes a `validation` section (L2 — `/reports` folds in here).

---

### `src/app/(dashboard)/vault/agent-logs/{guest,ops,sop}/page.tsx` (route pages, NEW)

**Analog:** `src/app/(dashboard)/agents/guest/page.tsx` (a 3-line `<AgentSkeleton>`
wrapper) and `src/components/casa/agent-skeleton.tsx` (PRESERVED). Copy the wrapper
verbatim, update the `AgentSkeleton` internal `Link href="/agents"` → `/vault/agent-logs`
(`agent-skeleton.tsx:21`, `:56`). Build out to the 9-section structure with
agent-appropriate mock data (Claude's Discretion — full Pricing parity is a later phase).

---

### `src/lib/auth/context.tsx` (auth context, MODIFY)

**Analog:** the file itself — EXTEND, do not replace (brief "Keep unchanged" line 290).

**Add `role` to `AuthUser`** (currently `context.tsx:12-17` has a free-string `role`):
```typescript
export type Role = "owner" | "operations";
export type AuthUser = {
  email: string;
  name: string;
  initials: string;
  role: string;       // existing display role ("CEO / Founder")
  workspaceRole: Role; // NEW — drives greetings, pinning, prompts
};
```
Derive `workspaceRole` in the `USERS` map (`context.tsx:28-41`): `carlos@casa.com` →
`owner`, `denika@casa.com` → `operations`. Carry it into the `next` object in `signIn`
(`context.tsx:64-69`).

**Add `useRole()` hook** — model exactly on the existing `useAuth()` at `context.tsx:97-101`:
```typescript
export function useRole(): Role {
  const { user } = useAuth();
  return user?.workspaceRole ?? "operations";
}
```

---

### Mock-data modules (CREATE + MODIFY)

**New modules** — `owners.ts`, `pipeline.ts`, `compliance.ts` copy the
`src/lib/mock-data/properties.ts` shape exactly: an exported `type`, a SCREAMING_SNAKE
const array, `getX(id)` helper. `financials.ts` follows `reports.ts`. `assistant.ts`
follows the `PROMPT_VERSIONS` flat-array shape in `agents.ts:26-31`.

**Module template** (from `properties.ts:1-53`):
```typescript
export type Owner = { id: string; name: string; /* ... */ };
export const OWNERS: Owner[] = [ { id: "o01", /* ... */ } ];
export const getOwner = (id: string): Owner | undefined => OWNERS.find((o) => o.id === id);
```

**`exceptions.ts` rewrite** — keep the `ExceptionItem` type + `EXCEPTIONS` array +
`URGENCY_RANK` (`exceptions.ts:1-78`). ADD fields: `category` (8-value union),
`neighborhood`, `suggested` (string), `source` (string), `createdAt` (ISO string —
replaces the static `timeAgo` string so `date-fns` can compute it). Seed the 7 anchor
cards verbatim from the brief + 5-10 more. The existing `requiresConfirm` flag
(`exceptions.ts:13-18`) stays.

**`index.ts` barrel** — add `export *` lines (`index.ts:1-9` pattern) for the 5 new modules.

---

## Shared Patterns

### Role awareness
**Source:** `src/lib/auth/context.tsx` `useAuth()` (`:97-101`); new `useRole()` hook.
**Apply to:** Exception Board greeting, Vault landing (pinned cards), Assistant
(greeting + prompts), top-nav user dropdown (role pill), Settings page.
```typescript
const role = useRole(); // "owner" | "operations"
```

### One Playfair Headline per route (40px)
**Source:** `src/app/(dashboard)/properties/page.tsx:29-31`.
**Apply to:** every new route page — exactly one per route (Checker watch-list item 5).
```typescript
<h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">Properties</h1>
```
Section/card headings use the 18px tier: `font-display text-[18px] tracking-tight`
(seen at `cleanings/page.tsx:188`, `bookings/[id]/page.tsx:102`).

### Route entrance + page padding
**Source:** every existing page — `globals.css:301-313` (`.route-fade`), `:368-372`
(`.page-pad`).
**Apply to:** every new route page root div.
```typescript
<div className="route-fade page-pad"> ... </div>
```

### Filter chips (multi-select on Exception Board, single-select on Vault tables)
**Source:** `.filter-chip` / `.filter-chip.active` (`globals.css:783-794`); usage at
`properties/page.tsx:59-68`.
**Apply to:** Exception Board 7-chip row, every Vault table filter row, Assistant prompt
chips. Exception Board active chip needs the NEW `.filter-chip--accent` (Casa-blue fill,
white text) — the existing `.active` is ink `#1a1a1a`. Checker item 11: re-verify
white-on-`#1E5FBF` contrast at implementation.

### Side-sheet
**Source:** `.sheet` family `globals.css:810-858`; `CleaningSheet` `cleanings/page.tsx:117-355`.
**Apply to:** all 5 Vault `[id]` detail surfaces. Add `.sheet--vault` (500px) variant.

### Toast-with-Undo (action receipts)
**Source:** `.toast-row` / `.toast-undo` `globals.css:1107-1139`; timer machinery
`page.tsx:216-239`; markup `page.tsx:372-402` (`role="status"` `aria-live="polite"`).
**Apply to:** Exception Board action buttons (incl. `Dismiss` per Copywriting Contract).

### Radix Dropdown styling
**Source:** `page.tsx:118-145` (`Dropdown.Root/Trigger/Portal/Content`) +
`.menu-pop-floating` / `.menu-pop-item` (`globals.css:348-365`).
**Apply to:** top-nav user dropdown, exception-card overflow menu (if retained).

### Chat bubbles
**Source:** `.bubble` / `.chat-row` `globals.css:911-930`; `bookings/[id]/page.tsx:109-124`.
**Apply to:** the Assistant conversation.

### Deep-link not-found guard
**Source:** `bookings/[id]/page.tsx:24-37`.
**Apply to:** all 5 Vault `[id]` pages. Swap copy to UI-SPEC "Not-found" strings.

### Outside-click dropdown close
**Source:** `topbar.tsx:21-29` and `sidebar.tsx:91-99` (`useRef` + `mousedown` listener).
**Apply to:** any custom (non-Radix) popovers in top-nav.

### Icon-only button accessibility (binding — CLAUDE.md)
**Source:** `topbar.tsx:79-87` shows `aria-label` + `title` together.
**Apply to:** notification bell (`aria-label="Notifications"` + `title` — Checker item 12),
hamburger trigger, sheet close buttons.

### `prefers-reduced-motion`
**Source:** `globals.css:1157-1178`.
**Apply to:** EXTEND this block to cover the new mobile drawer slide + status-pill count
animation (Checker watch-list item 10).

---

## No Analog Found

Files with no close existing match — planner builds from the brief/UI-SPEC spec directly,
using the named `globals.css` classes:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Greeting block (inside `(dashboard)/page.tsx`) | component fragment | request-response | No time-of-day greeting exists; build from UI-SPEC Copywriting Contract. Headline tier is borrowed (see Shared Patterns). |
| 4 status-pill row (inside `(dashboard)/page.tsx`) | component fragment | request-response | No data-driven count-pill row exists. Closest visual is `.urgency-pill` (`globals.css:481`) — reuse the pill base + the UI-SPEC "4 Exception Board status pills" quartet table. |
| Mobile slide-in nav drawer (inside `top-nav.tsx`) | component fragment | event-driven | No drawer/hamburger exists anywhere in the codebase (L4). Reuse `.sheet-overlay` scrim; build the panel new with `transform` slide. |

> None of these are stand-alone files — they are fragments inside files that DO have
> analogs. The planner builds them inline from the UI-SPEC, reusing pill/sheet base
> classes. No `RESEARCH.md` exists (research disabled) — the UI-SPEC IS the spec.

---

## Metadata

**Analog search scope:** `src/app/(dashboard)/**`, `src/components/casa/**`,
`src/components/ui/**`, `src/lib/auth/**`, `src/lib/mock-data/**`, `src/app/globals.css`,
`package.json`, `tailwind.config.ts`, `src/middleware.ts`.
**Files scanned:** 41 source/config files (full `src/` tree + root config).
**Pattern extraction date:** 2026-05-20
**Key constraint:** read-only — this map is the only file written. All cited line ranges
are from the codebase at HEAD (commit `6777240`).
