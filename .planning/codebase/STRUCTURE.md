# Codebase Structure

**Analysis Date:** 2026-05-14

## Directory Layout

```
Casa/                             # Project root
├── src/
│   ├── app/                      # Next.js App Router root
│   │   ├── layout.tsx            # Root layout — fonts, AuthProvider
│   │   ├── globals.css           # Design system: 948-line CSS component library
│   │   ├── login/
│   │   │   └── page.tsx          # Login page (unauthenticated entry point)
│   │   └── (dashboard)/          # Route group — shares dashboard layout
│   │       ├── layout.tsx        # Auth guard, Sidebar, TopBar, CommandPalette
│   │       ├── page.tsx          # Home — exceptions, KPIs, daily rail
│   │       ├── pricing/
│   │       │   └── page.tsx      # Pricing recommendations approval
│   │       ├── cleanings/
│   │       │   └── page.tsx      # Cleaning board + detail sheet
│   │       ├── claims/
│   │       │   └── page.tsx      # Damage claims review + edit sheet
│   │       ├── properties/
│   │       │   ├── page.tsx      # Property grid with search/filter
│   │       │   └── [id]/
│   │       │       └── page.tsx  # Property detail (tabs: Profile, Reviews, Activity…)
│   │       ├── bookings/
│   │       │   ├── page.tsx      # Bookings table (last 30 days)
│   │       │   └── [id]/
│   │       │       └── page.tsx  # Booking detail — conversation + agent log
│   │       ├── agents/
│   │       │   ├── page.tsx      # Agents overview grid
│   │       │   ├── pricing/
│   │       │   │   └── page.tsx  # Pricing Agent detail (fully built)
│   │       │   ├── guest/
│   │       │   │   └── page.tsx  # Guest Agent (AgentSkeleton)
│   │       │   ├── ops/
│   │       │   │   └── page.tsx  # Ops Agent (AgentSkeleton)
│   │       │   └── sop/
│   │       │       └── page.tsx  # SOP Agent (AgentSkeleton)
│   │       ├── reports/
│   │       │   └── page.tsx      # Validation reports — alignment vs PriceLabs/VAs
│   │       └── settings/
│   │           └── page.tsx      # Profile, Notifications, Agents, API Status, Branding
│   ├── components/
│   │   ├── casa/                 # Project-specific shared components
│   │   │   ├── sidebar.tsx       # Left nav with groups, user menu
│   │   │   ├── topbar.tsx        # Global header — logo, search, bell
│   │   │   ├── command-palette.tsx # ⌘K search overlay
│   │   │   ├── sparkline.tsx     # Inline SVG trend chart
│   │   │   └── agent-skeleton.tsx # Stub shell for unbuilt agent pages
│   │   └── ui/                   # shadcn/ui directory (currently empty)
│   ├── lib/
│   │   ├── auth/
│   │   │   └── context.tsx       # AuthProvider, useAuth, fake credential map
│   │   ├── mock-data/            # All domain data (no network calls)
│   │   │   ├── index.ts          # Barrel re-export of all mock data modules
│   │   │   ├── properties.ts     # 26 Vancouver STR properties + types
│   │   │   ├── bookings.ts       # Bookings, channel/status helpers, TODAY_CHECKINS/CHECKOUTS
│   │   │   ├── cleanings.ts      # CLEANINGS_TODAY, CLEANING_THREAD, TODAY_CLEANINGS_SUMMARY
│   │   │   ├── claims.ts         # CLAIMS (pending/submitted/resolved), PendingClaim type
│   │   │   ├── exceptions.ts     # EXCEPTIONS, URGENCY_RANK, AGENT_ACTIVITY, ExceptionItem type
│   │   │   ├── pricing.ts        # PRICING_BASE, changeClass helper
│   │   │   ├── agents.ts         # AGENTS array, PROMPT_VERSIONS, modeClass/modeLabel helpers
│   │   │   ├── reviews.ts        # REVIEWS_BY_PROP, ACTIVITY_BY_PROP keyed by property id
│   │   │   └── reports.ts        # REPORT_CUMULATIVE with per-agent alignment data
│   │   └── utils.ts              # cn() — clsx + tailwind-merge utility
│   ├── utils/
│   │   └── supabase/             # Supabase SSR client factories (scaffolded)
│   │       ├── client.ts         # createBrowserClient for client components
│   │       ├── server.ts         # createServerClient for RSC / server actions
│   │       └── middleware.ts     # updateSession() — cookie refresh for Next.js middleware
│   └── middleware.ts             # Next.js edge middleware — runs updateSession on all routes
├── public/
│   └── humanos-logo.png          # HumanOS brand mark used in TopBar and Login
├── package.json
├── tsconfig.json
├── tailwind.config.ts            # Design tokens: colors, fonts, border-radius, letter-spacing
├── components.json               # shadcn/ui config (path aliases, style: default)
├── next.config.mjs
├── postcss.config.mjs
├── PRODUCT.md                    # Product spec and phase roadmap
└── DESIGN.md                     # Design principles and visual language
```

## Directory Purposes

**`src/app/(dashboard)/`:**
- Purpose: All authenticated views. The `(dashboard)` route group applies the shared layout (auth guard, sidebar, topbar) without affecting URL paths.
- Contains: One `layout.tsx`, one `page.tsx` per route, one dynamic segment (`[id]`) each for properties and bookings
- Key files: `layout.tsx` (the auth gate), `page.tsx` (Home/Exceptions hub)

**`src/components/casa/`:**
- Purpose: Application-specific shared components. Not generic primitives — all are tied to Casa domain concepts.
- Contains: Five files, all `"use client"`
- Key files: `sidebar.tsx`, `topbar.tsx`, `command-palette.tsx`

**`src/components/ui/`:**
- Purpose: Reserved for shadcn/ui generated components. Currently empty — Radix UI dependencies are installed but no shadcn CLI components have been added.
- Contains: Nothing yet

**`src/lib/mock-data/`:**
- Purpose: The entire data layer of the application. Replaces a real database for the current demo phase.
- Contains: Nine TypeScript modules — typed constants and helper functions
- Key files: `properties.ts` (26 properties, the central reference entity), `exceptions.ts` (drives the Home page), `index.ts` (barrel)

**`src/lib/auth/`:**
- Purpose: React context-based auth with hardcoded demo credentials. Placeholder for Supabase Auth integration.
- Contains: Single file `context.tsx`

**`src/utils/supabase/`:**
- Purpose: Supabase client factories following the `@supabase/ssr` pattern for Next.js App Router. Scaffolded but not yet called by any page.
- Contains: `client.ts`, `server.ts`, `middleware.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, font loading, `AuthProvider` wrap
- `src/app/login/page.tsx`: Unauthenticated entry — sign-in form, demo account shortcuts
- `src/app/(dashboard)/layout.tsx`: Auth guard, chrome (sidebar + topbar + command palette)
- `src/app/(dashboard)/page.tsx`: Default authenticated view — Home / Exceptions hub
- `src/middleware.ts`: Next.js edge middleware entry point

**Configuration:**
- `tailwind.config.ts`: Design tokens — `ink`, `paper`, `rule`, `accent`, `softgray` colors; Playfair Display as `font-display`; `tracking-eyebrow` / `tracking-wordmark` letter-spacing; `borderRadius` locked to 2px/4px
- `components.json`: shadcn/ui CLI configuration — aliases `@/components`, `@/lib/utils`, `@/components/ui`
- `tsconfig.json`: Path alias `@/` → `./src/`

**Core Logic:**
- `src/lib/mock-data/index.ts`: Single import point for all domain data
- `src/lib/mock-data/properties.ts`: Central entity — 26 properties referenced by bookings, cleanings, claims, reviews
- `src/lib/auth/context.tsx`: Auth state — the only shared React context
- `src/lib/utils.ts`: `cn()` utility function

**Design System:**
- `src/app/globals.css`: 948-line CSS component class library. Defines all button styles, card styles, layout primitives, sheet overlays, status pills, urgency pills, pricing table, tabs, chat bubbles, etc.

## Naming Conventions

**Files:**
- Page files: always `page.tsx` (Next.js convention)
- Layout files: always `layout.tsx`
- Component files: `kebab-case.tsx` (e.g., `agent-skeleton.tsx`, `command-palette.tsx`)
- Mock data files: `kebab-case.ts` (e.g., `mock-data/bookings.ts`)
- Utility files: `kebab-case.ts` (e.g., `utils.ts`, `client.ts`)

**Directories:**
- Route groups: parentheses `(dashboard)` — does not appear in URL
- Dynamic segments: brackets `[id]` — matches Next.js convention
- Feature directories: singular noun (`agents`, `properties`, `bookings`, `cleanings`, `claims`, `pricing`)

**Exports:**
- Mock data constants: `SCREAMING_SNAKE_CASE` (e.g., `EXCEPTIONS`, `PROPERTIES`, `CLEANINGS_TODAY`)
- Mock data types: `PascalCase` (e.g., `Property`, `ExceptionItem`, `Cleaning`, `PendingClaim`)
- Helper functions: `camelCase` (e.g., `getProperty`, `formatDate`, `channelClass`, `modeLabel`)
- React components: `PascalCase` (e.g., `Sidebar`, `TopBar`, `AgentSkeleton`)
- CSS classes: `.kebab-case` (e.g., `.ex-card`, `.kpi-card`, `.btn-sm-primary`, `.urgency-pill`)

## Route Map (App Router)

| URL Path | Component File | Purpose |
|----------|----------------|---------|
| `/login` | `src/app/login/page.tsx` | Login — unauthenticated entry |
| `/` | `src/app/(dashboard)/page.tsx` | Home — exceptions hub, KPIs, daily rail |
| `/pricing` | `src/app/(dashboard)/pricing/page.tsx` | Pricing recommendation approval table |
| `/cleanings` | `src/app/(dashboard)/cleanings/page.tsx` | Cleaning board + detail sheet |
| `/claims` | `src/app/(dashboard)/claims/page.tsx` | Damage claims review |
| `/properties` | `src/app/(dashboard)/properties/page.tsx` | Property grid (search + filter) |
| `/properties/[id]` | `src/app/(dashboard)/properties/[id]/page.tsx` | Property detail (Profile, Reviews, Activity) |
| `/bookings` | `src/app/(dashboard)/bookings/page.tsx` | Bookings table |
| `/bookings/[id]` | `src/app/(dashboard)/bookings/[id]/page.tsx` | Booking detail — conversation + agent log |
| `/agents` | `src/app/(dashboard)/agents/page.tsx` | Agent overview grid |
| `/agents/pricing` | `src/app/(dashboard)/agents/pricing/page.tsx` | Pricing Agent detail (fully built) |
| `/agents/guest` | `src/app/(dashboard)/agents/guest/page.tsx` | Guest Agent (AgentSkeleton stub) |
| `/agents/ops` | `src/app/(dashboard)/agents/ops/page.tsx` | Ops Agent (AgentSkeleton stub) |
| `/agents/sop` | `src/app/(dashboard)/agents/sop/page.tsx` | SOP Agent (AgentSkeleton stub) |
| `/reports` | `src/app/(dashboard)/reports/page.tsx` | Validation reports — alignment vs benchmarks |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Profile, notifications, agent controls, API status |

## Where to Add New Code

**New dashboard page (e.g., `/owner-reports`):**
- Create: `src/app/(dashboard)/owner-reports/page.tsx`
- Add `"use client"` directive
- Add nav entry to `NAV_GROUPS` in `src/components/casa/sidebar.tsx`
- Add mock data module to `src/lib/mock-data/owner-reports.ts` and re-export from `src/lib/mock-data/index.ts`

**New dynamic route (e.g., `/agents/[id]` replacing individual agent pages):**
- Create: `src/app/(dashboard)/agents/[id]/page.tsx`
- Remove individual `guest/`, `ops/`, `sop/` subdirectory pages once dynamic route handles them

**New shared UI component:**
- If Casa-specific: `src/components/casa/my-component.tsx`
- If generic primitive (shadcn): run `npx shadcn@latest add <component>` → lands in `src/components/ui/`

**New mock data entity:**
- Create: `src/lib/mock-data/[entity].ts` with exported constant (`ENTITY_NAME`) and types
- Add re-export to `src/lib/mock-data/index.ts`
- Import in page via `@/lib/mock-data` or the specific module path

**New utility function:**
- Add to `src/lib/utils.ts` if general-purpose
- Add to the relevant mock data module if domain-specific (e.g., `formatDate` lives in `bookings.ts`)

**New Supabase query (when moving from mock data to real data):**
- Server-side fetch: use `src/utils/supabase/server.ts` factory in an RSC page (remove `"use client"`)
- Client-side fetch: use `src/utils/supabase/client.ts` factory in a `"use client"` component

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents (this file and siblings)
- Generated: By GSD mapper agents
- Committed: Yes (planning artifacts)

**`.impeccable/`:**
- Purpose: Impeccable annotation and session tracking (separate tooling)
- Generated: Yes
- Committed: Unknown — likely yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (gitignored)

**`public/`:**
- Purpose: Static assets served at root
- Contains: `humanos-logo.png`
- Committed: Yes

---

*Structure analysis: 2026-05-14*
