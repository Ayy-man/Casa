<!-- refreshed: 2026-05-14 -->
# Architecture

**Analysis Date:** 2026-05-14

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client Layer)                        │
│  All pages are "use client" — React state, hooks, event handlers    │
│                                                                      │
│  src/app/(dashboard)/page.tsx         (Home)                        │
│  src/app/(dashboard)/pricing/page.tsx (Pricing)                     │
│  src/app/(dashboard)/cleanings/page.tsx etc.                        │
└────────────────────┬────────────────────────────────────────────────┘
                     │ imports
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Mock Data Layer                               │
│  src/lib/mock-data/                                                  │
│  (all domain data as hardcoded TypeScript constants and types)       │
│  properties.ts · bookings.ts · cleanings.ts · claims.ts             │
│  exceptions.ts · pricing.ts · agents.ts · reviews.ts · reports.ts  │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼ (wired but unused by pages today)
┌─────────────────────────────────────────────────────────────────────┐
│                  Supabase SSR Clients (scaffolded)                   │
│  src/utils/supabase/client.ts   (browser client)                    │
│  src/utils/supabase/server.ts   (RSC / server action client)        │
│  src/utils/supabase/middleware.ts (session refresh)                 │
│  src/middleware.ts               (Next.js edge middleware)           │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Font loading, AuthProvider wrapper | `src/app/layout.tsx` |
| AuthProvider | Fake credential check + localStorage session | `src/lib/auth/context.tsx` |
| Dashboard Layout | Auth guard redirect, Sidebar, TopBar, CommandPalette | `src/app/(dashboard)/layout.tsx` |
| Sidebar | Nav groups, active-link detection, user menu + sign-out | `src/components/casa/sidebar.tsx` |
| TopBar | Global search trigger (⌘K), notification bell (exceptions), logo | `src/components/casa/topbar.tsx` |
| CommandPalette | Keyboard-driven search across properties/bookings/cleanings/agent actions | `src/components/casa/command-palette.tsx` |
| Sparkline | Inline SVG polyline chart for KPI trends | `src/components/casa/sparkline.tsx` |
| AgentSkeleton | Placeholder shell for Guest/Ops/SOP agent detail pages | `src/components/casa/agent-skeleton.tsx` |
| Mock data barrel | Re-exports all domain data modules | `src/lib/mock-data/index.ts` |
| cn() | Tailwind class merger (clsx + tailwind-merge) | `src/lib/utils.ts` |

## Pattern Overview

**Overall:** Next.js 14 App Router — single route group `(dashboard)` with a shared client-side layout. All page components carry `"use client"` and read entirely from in-memory mock data. Supabase is wired at the infrastructure level (middleware, client/server factories) but is not yet consumed by any page.

**Key Characteristics:**
- Every page file is a client component (`"use client"` directive present on all 14+ page files)
- No React Server Components (RSC) are used in the implementation today — the `rsc: true` shadcn flag is set but unused
- No server actions exist (`"use server"` appears nowhere in the codebase)
- Data flows: hardcoded TypeScript constant → import in page → local React state
- Authentication is fake: hardcoded credentials in `src/lib/auth/context.tsx`, persisted to `localStorage`
- Supabase SSR package is installed and clients are scaffolded, but no page or component calls them

## Layers

**Route Layer:**
- Purpose: Defines URL structure and renders page UI
- Location: `src/app/`
- Contains: `layout.tsx` files, `page.tsx` files, route groups
- Depends on: mock-data layer, casa component library, auth context
- Used by: Next.js router

**Auth Layer:**
- Purpose: Gate dashboard access, expose user identity
- Location: `src/lib/auth/context.tsx`
- Contains: `AuthProvider`, `useAuth` hook, `AuthUser` type, hardcoded `USERS` map
- Depends on: `localStorage` (browser only)
- Used by: Dashboard layout, Sidebar, TopBar, Settings, Login page

**Mock Data Layer:**
- Purpose: Supplies all domain data (properties, bookings, cleanings, claims, exceptions, pricing, agents, reviews, reports)
- Location: `src/lib/mock-data/`
- Contains: Typed TypeScript constants and helper functions (`getProperty`, `getBooking`, `formatDate`, `channelClass`, etc.)
- Depends on: Nothing (pure data)
- Used by: All page components and the CommandPalette

**Casa Component Library:**
- Purpose: Shared, reusable UI shells (Sidebar, TopBar, CommandPalette, Sparkline, AgentSkeleton)
- Location: `src/components/casa/`
- Contains: Five `"use client"` components
- Depends on: mock-data layer, auth context, lucide-react, Next.js navigation hooks
- Used by: Dashboard layout, page components

**Supabase Infrastructure (scaffolded, not yet active):**
- Purpose: Future real-data backend
- Location: `src/utils/supabase/`
- Contains: Browser client factory (`client.ts`), server client factory (`server.ts`), middleware session refresher (`middleware.ts`)
- Depends on: `@supabase/ssr`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars
- Used by: `src/middleware.ts` (session refresh path only — no auth enforcement gates)

**Styling Layer:**
- Purpose: Design tokens and component utility classes
- Location: `src/app/globals.css` (948 lines), `tailwind.config.ts`
- Contains: Full CSS component class system (`.btn-primary`, `.btn-sm`, `.ex-card`, `.panel`, `.kpi-card`, `.sheet`, `.urgency-pill`, `.field`, `.nav-item`, etc.) plus Tailwind token extensions
- Used by: All components (className strings reference globals.css classes directly)

## Data Flow

### Primary Request Path (current — mock data)

1. User navigates to a route → Next.js App Router matches `src/app/(dashboard)/[route]/page.tsx`
2. Dashboard layout (`src/app/(dashboard)/layout.tsx`) checks `useAuth()` — redirects to `/login` if no session
3. Page component renders, imports constants directly from `src/lib/mock-data/` (e.g., `EXCEPTIONS`, `PROPERTIES`, `CLEANINGS_TODAY`)
4. Local `useState` tracks UI interactions (tabs, filters, open panels, decisions, toasts)
5. No network calls — all data is resolved at bundle time

### Authentication Flow

1. Unauthenticated: dashboard layout redirects to `/login` via `useEffect` + `router.replace`
2. Login page (`src/app/login/page.tsx`) calls `signIn(email, password)` from `useAuth`
3. `AuthProvider` checks against hardcoded `USERS` map, writes to `localStorage` on success
4. On subsequent loads, `AuthProvider` hydrates from `localStorage` (`setReady(true)` after read)
5. Demo credentials: `carlos@casa.com / demo`, `denika@casa.com / demo`

### Supabase Middleware Path (session-only, no auth enforcement)

1. `src/middleware.ts` runs on every non-static request
2. Calls `updateSession()` from `src/utils/supabase/middleware.ts`
3. This calls `supabase.auth.getUser()` to refresh the Supabase session cookie
4. No redirect logic — Supabase auth is not enforced; app auth comes from localStorage only

**State Management:**
- No global state library. All state is local `useState` per page component.
- Auth state lives in React context (`AuthProvider` at root layout).
- Decision/filter/tab/sheet open state is colocated in each page file.

## Key Abstractions

**Mock Data Modules:**
- Purpose: Typed domain data that stands in for real database tables
- Examples: `src/lib/mock-data/properties.ts`, `src/lib/mock-data/exceptions.ts`, `src/lib/mock-data/bookings.ts`
- Pattern: Named export constant (e.g., `PROPERTIES`, `EXCEPTIONS`) + helper functions (e.g., `getProperty(id)`) + exported TypeScript types

**globals.css Component Classes:**
- Purpose: Shared visual primitives without a component abstraction overhead
- Examples: `.ex-card`, `.kpi-card`, `.btn-sm`, `.btn-sm-primary`, `.btn-sm-outline`, `.sheet`, `.urgency-pill`, `.panel`, `.page-pad`
- Pattern: Defined in `@layer components {}` in `src/app/globals.css` — used as raw className strings in JSX

**AuthContext:**
- Purpose: Provides `user`, `signIn`, `signOut`, `ready` to any client component
- Location: `src/lib/auth/context.tsx`
- Pattern: `createContext` + `useContext` hook (`useAuth()`) — wrapped at root layout

**Sparkline:**
- Purpose: Reusable inline SVG trend chart
- Location: `src/components/casa/sparkline.tsx`
- Pattern: Pure render function, accepts `values: number[]`, `w`, `h`, `color` props

**AgentSkeleton:**
- Purpose: Placeholder UI for three of the four agent detail pages (Guest, Ops, SOP)
- Location: `src/components/casa/agent-skeleton.tsx`
- Pattern: Accepts `name`, `tagline`, `mode` — renders dark header + dashed stub body pointing to Pricing Agent as the reference

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All routes
- Responsibilities: Load Inter + Playfair Display fonts, wrap tree in `AuthProvider`

**Login Page:**
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated users (redirected by dashboard layout)
- Responsibilities: Email/password form, demo account shortcuts, call `signIn`

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Any `(dashboard)` route
- Responsibilities: Auth guard, render `TopBar` + `Sidebar` + `CommandPalette` shell

**Home (Exceptions + KPIs):**
- Location: `src/app/(dashboard)/page.tsx`
- Responsibilities: Status banner, KPI cards (Open Exceptions, Cleanings Today, Pricing Recs, Claims Pending), exception cards sorted by urgency, collapsible rail panels (cleanings, check-ins/outs, agent activity), action toast with undo

**Pricing:**
- Location: `src/app/(dashboard)/pricing/page.tsx`
- Responsibilities: Shadow-mode banner, bulk approve/reject actions, week selector, property-level approve/reject/edit per pricing recommendation

**Cleanings:**
- Location: `src/app/(dashboard)/cleanings/page.tsx`
- Responsibilities: Today's cleaning board list, detail sheet (WhatsApp thread, checklist, quality score, dispatch actions)

**Claims:**
- Location: `src/app/(dashboard)/claims/page.tsx`
- Responsibilities: Pending/Submitted/Resolved tabs, before/after photo strips, copy claim text, download evidence, claim edit sheet

**Properties (list):**
- Location: `src/app/(dashboard)/properties/page.tsx`
- Responsibilities: Searchable, filterable property grid (All / Active / Maintenance / New)

**Property Detail:**
- Location: `src/app/(dashboard)/properties/[id]/page.tsx`
- Responsibilities: Property hero image, specs, owner contact, access/utilities, channel listings, Reviews tab, Activity tab, Flag for Correction dialog

**Bookings (list):**
- Location: `src/app/(dashboard)/bookings/page.tsx`
- Responsibilities: Table of last-30-day bookings with channel/status pills

**Booking Detail:**
- Location: `src/app/(dashboard)/bookings/[id]/page.tsx`
- Responsibilities: Guest conversation thread, agent decisions log, booking financial breakdown

**Agents Overview:**
- Location: `src/app/(dashboard)/agents/page.tsx`
- Responsibilities: 2-column grid of agent cards with sparklines, mode badges, links to detail

**Pricing Agent Detail (fully built):**
- Location: `src/app/(dashboard)/agents/pricing/page.tsx`
- Responsibilities: At a Glance KPIs, Live Activity table, Configuration, Performance charts (SVG), Recent Decisions, Property Breakdown, Shadow Mode Validation, Prompt History, Controls

**Guest / Ops / SOP Agent Detail (skeleton):**
- Location: `src/app/(dashboard)/agents/guest/page.tsx`, `agents/ops/page.tsx`, `agents/sop/page.tsx`
- Responsibilities: Render `AgentSkeleton` with agent-specific name/tagline/mode — full UI deferred

**Validation Reports:**
- Location: `src/app/(dashboard)/reports/page.tsx`
- Responsibilities: Cumulative alignment KPIs, per-agent accordion with drift areas and comparison tables

**Settings:**
- Location: `src/app/(dashboard)/settings/page.tsx`
- Responsibilities: Profile, Notifications matrix, Agents quick controls, API Status health grid, Branding panel

## Architectural Constraints

- **Rendering model:** All pages are client-side rendered. The App Router shell is server-rendered, but every `page.tsx` carries `"use client"` — there are no RSC data-fetching pages.
- **No server actions:** The string `"use server"` does not appear anywhere. All "save" / "approve" / "reject" actions are either `console.log` stubs or local `useState` mutations.
- **Auth is fake:** `src/lib/auth/context.tsx` contains hardcoded credentials. Supabase Auth is not enforced. `src/middleware.ts` runs the session refresher but there is no middleware redirect for unauthenticated users.
- **Global state:** `AuthContext` is the only shared React context. All other state is page-local.
- **No circular imports:** Mock data modules import nothing from app or component layers.
- **shadcn/ui components installed but unused in pages:** `src/components/ui/` is empty. Radix UI primitives are installed as dependencies (checkbox, dialog, dropdown, select, tabs, etc.) but no pre-built shadcn component wrappers have been generated. The design system is delivered entirely through `globals.css` utility classes.

## Anti-Patterns

### Fake auth with real Supabase middleware

**What happens:** `src/middleware.ts` calls `supabase.auth.getUser()` on every request (session refresh), but the app's actual auth gate is a `useEffect` client redirect in `src/app/(dashboard)/layout.tsx` checking a localStorage fake session.

**Why it's wrong:** The middleware runs on the server with no enforcement power here, while the real gate is client-only — creating a flash-of-unauthenticated-content window and making Supabase Auth useless until the two auth systems are unified.

**Do this instead:** Move auth enforcement into `src/middleware.ts` using Supabase's `getUser()` result to redirect unauthenticated requests server-side, then remove the `useEffect` redirect from `src/app/(dashboard)/layout.tsx`.

### All pages as client components

**What happens:** Every `page.tsx` has `"use client"` even though none of them use browser-only APIs in their render path — they only import static constants.

**Why it's wrong:** Prevents Next.js from streaming or statically rendering any page content, adding unnecessary JS bundle weight and losing RSC data-fetching benefits.

**Do this instead:** When real Supabase queries replace mock data, the `page.tsx` files should be RSC (no directive), fetching data server-side, and delegate interactive sub-trees to dedicated `"use client"` leaf components.

## Error Handling

**Strategy:** Minimal. No error boundaries exist.

**Patterns:**
- Dynamic route pages (`/properties/[id]`, `/bookings/[id]`) check for `null` result from `getProperty`/`getBooking` and render an inline "not found" message with a back button.
- Auth `signIn` returns a typed `{ ok: false, error: string }` union — the login page surfaces the error string inline.
- Supabase client factories use `!` non-null assertions on env vars — no runtime validation.

## Cross-Cutting Concerns

**Logging:** `console.log` stubs for all write actions (approve, reject, send, save). No structured logging.
**Validation:** None. Form inputs are uncontrolled or minimally validated (login requires non-empty email + password).
**Authentication:** Client-side only via `AuthContext` + localStorage. Supabase Auth scaffolded but not enforced.

---

*Architecture analysis: 2026-05-14*
