<!-- GSD:project-start source:PROJECT.md -->
## Project

**Casa Command Center**

Casa Command Center is the human supervisor layer for Casa Properties' AI agents
(Pricing, Guest, Ops, SOP). It is the single-tenant operator dashboard that
Carlos Robles (CEO) and Denika Patel (Portfolio Manager) open to review and act
on agent decisions across 26 short-term rental homes in Vancouver, BC.

The UI skin shipped as a demo. This milestone replaces the mock data and fake
action buttons with a real Supabase backend, wires the dashboard to n8n-hosted
agent workflows, and makes the dashboard the operational surface that lets
Carlos let his day-shift VA go on May 15.

**Core Value:** Carlos can resolve a day's exceptions in under 10 minutes and never feels the
need to open Hostaway, PriceLabs, or WhatsApp directly — because the agents do
the routine work and Carlos approves or overrides only the few decisions that
require judgment.

### Constraints

- **Tech stack**: Next.js 14.2.18 App Router · TypeScript · Tailwind +
  globals.css component classes · Supabase (Postgres + pgvector + realtime) ·
  Vercel Cron · n8n (external, fyi-media.app.n8n.cloud) · Claude Sonnet 4.5
  via OpenRouter (external, called from n8n only) — Decided; changing the
  stack would invalidate the demo skin. Add `zod@^3.23.8` + `nanoid@^5.0.7`
  this milestone; everything else stays pinned.
- **Timeline**: May 15 hard deadline — Carlos's day-shift VA leaves that day.
  Guest Agent + Ops Agent cleaner dispatch must replace VA's work by then.
- **Brand**: PRODUCT.md and DESIGN.md are binding. Editorial, restrained,
  premium. No SaaS dashboard tropes, no dark-mode AI aesthetic, no consumer
  Airbnb-warm. Anti-references: Hostaway / Lodgify / PriceLabs / Guesty UI
  patterns are explicitly rejected.
- **Accessibility**: WCAG 2.1 AA pragmatic across daily flows (Home, Pricing,
  Cleanings, Claims, Properties, Bookings). Status colors always carry a
  textual label, never color alone. Keyboard reachable. `:focus-visible` 3px
  ring. `prefers-reduced-motion` honored.
- **Auth**: Hardcoded demo creds through May/June. Two accounts:
  `carlos@casa.com` / `denika@casa.com`, both password `demo`. No real auth
  this milestone.
- **Multi-tenant future-proofing**: `NEXT_PUBLIC_WORKSPACE_NAME` env-driven so
  Plan Insurance can be deployed as a second HumanOS instance later. Do not
  extract tenant abstractions now; just keep the door open.
- **Dependencies**: External integrations (Hostaway, Breezeway, PriceLabs,
  Meta WhatsApp) are gated on Rachit's access forwarding. Build against
  Supabase mocks and n8n smoke flows until creds land.
- **Scope discipline**: This is a working-product milestone, not a polish
  milestone. The UI is good enough. Substance beats polish until May 15.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x — all application code under `src/`
- CSS (via Tailwind utility classes and `@layer` component definitions in `src/app/globals.css`)
## Runtime
- Node.js v22.17.0 (confirmed at analysis time)
- No `engines` field in `package.json`; no `.nvmrc` or `.node-version` file present
- npm
- Lockfile: `package-lock.json` present (committed)
## Frameworks
- Next.js 14.2.18 — App Router, RSC enabled (`"rsc": true` in `components.json`), deployed as a Node.js server
- React 18.3.1 — UI library
- React DOM 18.3.1 — DOM renderer
- TypeScript compiler via `tsconfig.json` (target ES2017, `moduleResolution: bundler`, strict mode on, path alias `@/*` → `./src/*`)
- PostCSS (`postcss.config.mjs`) with Tailwind CSS and Autoprefixer plugins
- ESLint 8 with `eslint-config-next` 14.2.18
- `tailwindcss-animate` 1.0.7 — keyframe animation plugin (accordion open/close animations)
- Not configured — no Jest, Vitest, Playwright, or Cypress config present
## UI System
- Tailwind CSS 3.4.14 — configured in `tailwind.config.ts`
- Custom design tokens: `ink` (#1A1A1A), `paper` (#FFFFFF), `rule` (#E5E5E5), `accent` (#1E5FBF), `softgray` (#F7F7F6)
- Custom letter-spacing tokens: `eyebrow` (0.18em), `wordmark` (0.32em)
- Border-radius deliberately small: `lg` = 4px, `md` = 2px, `sm` = 2px
- Dark mode configured (`darkMode: ["class"]`) but not actively used in the UI
- shadcn/ui style — `components.json` configures style `"default"`, base color `"neutral"`, CSS variables disabled
- Component aliases: `@/components/ui` (shadcn primitives), `@/components/casa` (app-specific)
- Radix UI primitives installed (all direct deps):
- `class-variance-authority` 0.7.0 (`cva`) — variant-based class composition (installed, not yet used in source)
- `clsx` 2.1.1 — conditional class names
- `tailwind-merge` 2.5.4 — conflict-safe class merging
- Combined in `src/lib/utils.ts` as the `cn()` helper
- `lucide-react` 0.453.0 — all icons in the app (Building2, CalendarDays, Bell, Search, etc.)
- Inter (sans-serif body) — loaded via `next/font/google`, variable `--font-inter`; weights 300/400/500/600/700
- Playfair Display (serif display/headings) — loaded via `next/font/google`, variable `--font-playfair`; weights 400/500/600/700, normal + italic
- `sonner` 1.7.0 — installed but not yet wired up; current toast UI uses local `useState` patterns in `src/app/(dashboard)/page.tsx` and `src/app/(dashboard)/claims/page.tsx`
## Key Dependencies
- `@supabase/ssr` 0.10.3 — SSR-safe Supabase client factory for browser, server, and middleware contexts
- `@supabase/supabase-js` 2.105.4 — Supabase JS client (database, auth, realtime)
- `next` 14.2.18 — full-stack framework (App Router, middleware, image optimization, Google Fonts)
- `tailwind-merge` 2.5.4 — prevents conflicting Tailwind classes in the `cn()` utility
## Configuration
- `.env.local` file is present (gitignored via `.env*.local` in `.gitignore`)
- Required variables read in code:
- No server-only secret env vars detected in source; the Supabase clients all use the publishable key
- Strict mode enabled (`"strict": true`)
- Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json` and mirrored in `components.json` aliases)
- Target: ES2017
- Config file: `next.config.mjs`
- Image optimization: remote images allowed from `picsum.photos` (used for placeholder property photos)
- No custom webpack, redirects, rewrites, or headers configured
- `npm run dev` — `next dev`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run lint` — `next lint`
## Platform Requirements
- Node.js (v22 confirmed; no minimum specified)
- npm (lockfile present)
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Designed for Node.js server deployment (standard Next.js output)
- No Vercel-specific config detected; no `vercel.json`, no `output: "export"` or `output: "standalone"` in `next.config.mjs`
- Static assets served from `public/` (includes `humanos-logo.png`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Source of Truth for Visual Conventions
## TypeScript
- `"strict": true` — full strict mode enforced via `tsconfig.json`
- `"noEmit": true` — compile for type-checking only; Next.js handles emit
- `"isolatedModules": true` — each file must be independently compilable
- `target: "ES2017"`, `module: "esnext"`, `moduleResolution: "bundler"`
- `"resolveJsonModule": true` — JSON imports permitted
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- Use `@/` for all non-relative imports. No `../../` chains.
- Types declared with `type` (not `interface`) for data shapes: `type NavItem = { ... }`
- Union types used for constrained strings: `type AgentMode = "Shadow" | "Live"`
- `as const` used on literal arrays: `const FILTERS = ["All", "Active", ...] as const`
- Discriminated unions for result types: `type SignInResult = { ok: true } | { ok: false; error: string }`
- React props typed inline in function signatures: `function Sidebar({ ... }: { ... })`
- `React.ReactNode` for children props
- `LucideIcon` type imported and used for icon props
## Naming Patterns
- Route pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx`
- Shared components: `kebab-case.tsx` — e.g., `command-palette.tsx`, `agent-skeleton.tsx`
- Mock data: `kebab-case.ts` — e.g., `mock-data/properties.ts`, `mock-data/cleanings.ts`
- Utility: `utils.ts`
- PascalCase named exports: `export function Sidebar()`, `export function TopBar()`
- Default exports for pages: `export default function PropertiesPage()`
- No anonymous default exports
- SCREAMING_SNAKE_CASE for module-level data arrays: `PROPERTIES`, `CLEANINGS_TODAY`, `NAV_GROUPS`, `EXCEPTIONS`
- camelCase for local variables and state: `railOpen`, `paletteOpen`, `filterProp`
- Prefix `on` for event handlers passed as props: `onOpenPalette`, `onClose`, `onAction`
- PascalCase: `Property`, `AuthUser`, `AgentMode`, `NavGroup`
## Module Patterns
- `src/lib/mock-data/index.ts` re-exports all mock-data modules with `export * from`
- Import from the barrel when consuming multiple modules; import directly from the file when consuming one
## React Server Components vs. Client Components
- All route pages under `src/app/(dashboard)/` — every `page.tsx`
- `src/app/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- All components in `src/components/casa/` — `sidebar.tsx`, `topbar.tsx`, `command-palette.tsx`, `agent-skeleton.tsx`
- `src/lib/auth/context.tsx`
- `src/app/layout.tsx` — root layout, font injection
- `src/components/casa/sparkline.tsx` — pure SVG renderer (no hooks)
- All `src/lib/mock-data/*.ts` modules — plain data exports
## Tailwind Usage
| Token | Value | Meaning |
|---|---|---|
| `ink` | `#1A1A1A` | Primary text / near-black |
| `paper` | `#FFFFFF` | Surface / background |
| `rule` | `#E5E5E5` | Border lines |
| `accent` | `#1E5FBF` | Signal blue — single saturated accent |
| `softgray` | `#F7F7F6` | Hover surface |
| `muted.foreground` | `#737373` | Secondary text |
| `destructive` | `#8A2B1F` | Danger/critical text |
| `font-sans` | Inter via `--font-inter` | Body / UI font |
| `font-serif` / `font-display` | Playfair Display via `--font-playfair` | Headings and reasoning |
| `tracking-eyebrow` | `0.18em` | Section label tracking |
| `tracking-wordmark` | `0.32em` | Logo tracking |
| `rounded-lg` | `4px` | Max corner radius (palette, bubble-tail) |
| `rounded-md` / `rounded-sm` | `2px` | Standard card/button radius |
- **`@layer components` in `globals.css`** for named component classes: `.btn-primary`, `.kpi-card`, `.ex-card`, `.panel`, `.urgency-pill`, `.pill-Critical`, `.ch-Airbnb`, `.status-Confirmed`, `.clean-status`, `.tab-trigger`, `.sheet`, `.cmdk-shell`, `.reasoning`, `.mono`, `.section-eyebrow`, `.page-pad`, `.route-fade`, etc.
- **Tailwind utilities** for layout, spacing adjustments, and one-off overrides within JSX
- Use named CSS component classes (`.ex-card`, `.btn-sm-primary`, `.urgency-pill`) for any Casa design-system component. Do not re-implement these inline.
- Use Tailwind utilities for layout (`flex`, `grid`, `gap-*`, `min-w-0`, `overflow-hidden`) and contextual sizing.
- Use inline `style={{}}` only for values that vary per-instance (e.g., computed `background` color from status, dynamic `gridTemplateColumns`).
## Design System Conventions (Binding)
### Typography
- **Headings and KPI numbers:** `font-display` class (Playfair Display). One Headline (40px) per route, no exceptions.
- **UI body text, labels, table cells:** `font-sans` (Inter). Default body size is 13px.
- **Reasoning prose:** `.reasoning` CSS class (Playfair, 14px, line-height 1.55, max-width 60ch).
- **Booking IDs, timestamps, costs, mono codes:** `.mono` CSS class (SF Mono, 11.5px) + `tabular-nums`.
- **Eyebrow labels:** `.section-eyebrow` CSS class (10.5px, 0.18em tracking, uppercase, `#8C8C8C`).
- **Sidebar group labels:** `.group-label` CSS class (Playfair italic, 11px, uppercase — the only italic in the system).
### Color
- **Never use `#000` or `#FFF`.** Use `#1A1A1A` (ink) and `#FFFFFF` (paper).
- **Signal Blue (`#1E5FBF`)** is used sparingly: active nav borders, "View all" links, KPI card hover rule, sparklines, draft-bubble outlines. Never as a background fill for anything larger than a pill.
- **Status colors are quartets.** Always apply all four steps (dot, text, soft-fill, border) as a set. The CSS classes `.pill-Critical`, `.pill-High`, `.pill-Medium`, `.pill-Low` encode the quartet. Never mix quartet members across statuses.
- **`surface-cockpit` (`#1A1F2A`)** used only on agent detail page heroes. Applied as inline `style={{ background: "#1A1F2A", color: "#FFFFFF" }}` directly on the cockpit band `<div>`.
### Corner Radius
- **2px** everywhere: cards, buttons, fields, sheets, table wrappers. Expressed as `rounded-[2px]` in Tailwind or via `border-radius: 2px` in CSS classes.
- **999px pill** for urgency pills, channel pills, status pills, filter chips, avatars. Use `.rounded-full` or `border-radius: 999px`.
- **4px** only for command palette shell and bubble tails. No mid-range radii (8px, 12px, etc.) on Casa surfaces.
### Elevation and Shadows
| Context | Shadow value |
|---|---|
| KPI card hover | `0 12px 32px -16px rgba(26,26,26,0.18)` |
| Exception card hover | `0 14px 38px -22px rgba(26,26,26,0.22)` |
| Property card hover | `0 18px 40px -22px rgba(26,26,26,0.22)` |
| Notification dropdown | `0 18px 36px -16px rgba(26,26,26,0.18)` — `.shadow-soft` |
| Command palette | `0 24px 60px -16px rgba(26,26,26,0.32)` |
| Toast | `0 12px 32px -8px rgba(26,26,26,0.4)` |
| Dialog | `0 30px 80px -20px rgba(0,0,0,0.25)` |
### Buttons
- `.btn-primary` — 44px, `#1A1A1A` bg, white text, uppercase, 0.06em tracking. One per surface.
- `.btn-sm .btn-sm-primary` — 32px, same ink/white. Multiple per surface allowed.
- `.btn-sm .btn-sm-outline` — 32px, paper bg, ink text, `#E5E5E5` border.
- `.btn-ghost` — 36px, paper bg, `#E5E5E5` border. For header secondary actions.
- `.icon-btn` — 30×30, with optional `.approve` or `.reject` semantic variants.
### Pills
- `.urgency-pill .pill-{Critical|High|Medium|Low}` — 22px, urgency signals
- `.ch-pill .ch-{Airbnb|Vrbo|BookingCom|Direct}` — 22px, booking channel
- `.status-pill .status-{Confirmed|CheckedIn|CheckedOut|Cancelled}` — 24px, booking state
- `.clean-status .cs-{Assigned|Dispatched|InProgress|Completed|NoResponse}` — 30px, cleaning state
- `.change-pill .change-{up-strong|up-mild|flat|down-mild|down-strong}` — 22px, pricing delta
### Animations
- **Route entrance:** `.route-fade` class (220ms opacity + 2px Y translate). Apply to the root `<div>` of every page.
- **Sheet entrance:** `.sheet` class (280ms `cubic-bezier(0.2, 0.7, 0.2, 1)` translate + opacity).
- **No layout property animations.** Use `transform` and `opacity` only.
- **No bounce, no elastic.** Ease-out curves only.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables `.route-fade`, `.sheet`, `.sheet-overlay` animations and card hover transitions. This is already wired in `globals.css`.
### Accessibility
- Use `:focus-visible`, not `:focus`, for keyboard-only ring behavior.
- Text selection highlight uses `rgba(30, 95, 191, 0.15)` (Signal Blue soft).
- Live regions: `role="status"` + `aria-live="polite"` on toast, as seen in `src/app/(dashboard)/page.tsx:380–381`.
- `aria-label` on interactive KPI cards that lack visible text labels: `aria-label="${value} ${label}, ${trend}"`.
- All icon-only buttons must carry a `title` attribute at minimum.
## Import Organization
## Error Handling
- Auth context throws synchronously on missing provider: `throw new Error("useAuth must be used within AuthProvider")`
- Supabase env vars asserted with `!` (non-null assertion): `createBrowserClient(url!, key!)` — no runtime guard
- `try/catch` around `localStorage` access in auth context — graceful no-op on failure
- Form errors surfaced via local state: `const [error, setError] = useState("")` displayed inline below the form
## Comments
- Inline comments explain non-obvious design intent, not what the code does
- CSS comments reference the design system rules they implement:
- No JSDoc on component functions — props are typed inline
## Tabular Numerals
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- Every page file is a client component (`"use client"` directive present on all 14+ page files)
- No React Server Components (RSC) are used in the implementation today — the `rsc: true` shadcn flag is set but unused
- No server actions exist (`"use server"` appears nowhere in the codebase)
- Data flows: hardcoded TypeScript constant → import in page → local React state
- Authentication is fake: hardcoded credentials in `src/lib/auth/context.tsx`, persisted to `localStorage`
- Supabase SSR package is installed and clients are scaffolded, but no page or component calls them
## Layers
- Purpose: Defines URL structure and renders page UI
- Location: `src/app/`
- Contains: `layout.tsx` files, `page.tsx` files, route groups
- Depends on: mock-data layer, casa component library, auth context
- Used by: Next.js router
- Purpose: Gate dashboard access, expose user identity
- Location: `src/lib/auth/context.tsx`
- Contains: `AuthProvider`, `useAuth` hook, `AuthUser` type, hardcoded `USERS` map
- Depends on: `localStorage` (browser only)
- Used by: Dashboard layout, Sidebar, TopBar, Settings, Login page
- Purpose: Supplies all domain data (properties, bookings, cleanings, claims, exceptions, pricing, agents, reviews, reports)
- Location: `src/lib/mock-data/`
- Contains: Typed TypeScript constants and helper functions (`getProperty`, `getBooking`, `formatDate`, `channelClass`, etc.)
- Depends on: Nothing (pure data)
- Used by: All page components and the CommandPalette
- Purpose: Shared, reusable UI shells (Sidebar, TopBar, CommandPalette, Sparkline, AgentSkeleton)
- Location: `src/components/casa/`
- Contains: Five `"use client"` components
- Depends on: mock-data layer, auth context, lucide-react, Next.js navigation hooks
- Used by: Dashboard layout, page components
- Purpose: Future real-data backend
- Location: `src/utils/supabase/`
- Contains: Browser client factory (`client.ts`), server client factory (`server.ts`), middleware session refresher (`middleware.ts`)
- Depends on: `@supabase/ssr`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars
- Used by: `src/middleware.ts` (session refresh path only — no auth enforcement gates)
- Purpose: Design tokens and component utility classes
- Location: `src/app/globals.css` (948 lines), `tailwind.config.ts`
- Contains: Full CSS component class system (`.btn-primary`, `.btn-sm`, `.ex-card`, `.panel`, `.kpi-card`, `.sheet`, `.urgency-pill`, `.field`, `.nav-item`, etc.) plus Tailwind token extensions
- Used by: All components (className strings reference globals.css classes directly)
## Data Flow
### Primary Request Path (current — mock data)
### Authentication Flow
### Supabase Middleware Path (session-only, no auth enforcement)
- No global state library. All state is local `useState` per page component.
- Auth state lives in React context (`AuthProvider` at root layout).
- Decision/filter/tab/sheet open state is colocated in each page file.
## Key Abstractions
- Purpose: Typed domain data that stands in for real database tables
- Examples: `src/lib/mock-data/properties.ts`, `src/lib/mock-data/exceptions.ts`, `src/lib/mock-data/bookings.ts`
- Pattern: Named export constant (e.g., `PROPERTIES`, `EXCEPTIONS`) + helper functions (e.g., `getProperty(id)`) + exported TypeScript types
- Purpose: Shared visual primitives without a component abstraction overhead
- Examples: `.ex-card`, `.kpi-card`, `.btn-sm`, `.btn-sm-primary`, `.btn-sm-outline`, `.sheet`, `.urgency-pill`, `.panel`, `.page-pad`
- Pattern: Defined in `@layer components {}` in `src/app/globals.css` — used as raw className strings in JSX
- Purpose: Provides `user`, `signIn`, `signOut`, `ready` to any client component
- Location: `src/lib/auth/context.tsx`
- Pattern: `createContext` + `useContext` hook (`useAuth()`) — wrapped at root layout
- Purpose: Reusable inline SVG trend chart
- Location: `src/components/casa/sparkline.tsx`
- Pattern: Pure render function, accepts `values: number[]`, `w`, `h`, `color` props
- Purpose: Placeholder UI for three of the four agent detail pages (Guest, Ops, SOP)
- Location: `src/components/casa/agent-skeleton.tsx`
- Pattern: Accepts `name`, `tagline`, `mode` — renders dark header + dashed stub body pointing to Pricing Agent as the reference
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: All routes
- Responsibilities: Load Inter + Playfair Display fonts, wrap tree in `AuthProvider`
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated users (redirected by dashboard layout)
- Responsibilities: Email/password form, demo account shortcuts, call `signIn`
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Any `(dashboard)` route
- Responsibilities: Auth guard, render `TopBar` + `Sidebar` + `CommandPalette` shell
- Location: `src/app/(dashboard)/page.tsx`
- Responsibilities: Status banner, KPI cards (Open Exceptions, Cleanings Today, Pricing Recs, Claims Pending), exception cards sorted by urgency, collapsible rail panels (cleanings, check-ins/outs, agent activity), action toast with undo
- Location: `src/app/(dashboard)/pricing/page.tsx`
- Responsibilities: Shadow-mode banner, bulk approve/reject actions, week selector, property-level approve/reject/edit per pricing recommendation
- Location: `src/app/(dashboard)/cleanings/page.tsx`
- Responsibilities: Today's cleaning board list, detail sheet (WhatsApp thread, checklist, quality score, dispatch actions)
- Location: `src/app/(dashboard)/claims/page.tsx`
- Responsibilities: Pending/Submitted/Resolved tabs, before/after photo strips, copy claim text, download evidence, claim edit sheet
- Location: `src/app/(dashboard)/properties/page.tsx`
- Responsibilities: Searchable, filterable property grid (All / Active / Maintenance / New)
- Location: `src/app/(dashboard)/properties/[id]/page.tsx`
- Responsibilities: Property hero image, specs, owner contact, access/utilities, channel listings, Reviews tab, Activity tab, Flag for Correction dialog
- Location: `src/app/(dashboard)/bookings/page.tsx`
- Responsibilities: Table of last-30-day bookings with channel/status pills
- Location: `src/app/(dashboard)/bookings/[id]/page.tsx`
- Responsibilities: Guest conversation thread, agent decisions log, booking financial breakdown
- Location: `src/app/(dashboard)/agents/page.tsx`
- Responsibilities: 2-column grid of agent cards with sparklines, mode badges, links to detail
- Location: `src/app/(dashboard)/agents/pricing/page.tsx`
- Responsibilities: At a Glance KPIs, Live Activity table, Configuration, Performance charts (SVG), Recent Decisions, Property Breakdown, Shadow Mode Validation, Prompt History, Controls
- Location: `src/app/(dashboard)/agents/guest/page.tsx`, `agents/ops/page.tsx`, `agents/sop/page.tsx`
- Responsibilities: Render `AgentSkeleton` with agent-specific name/tagline/mode — full UI deferred
- Location: `src/app/(dashboard)/reports/page.tsx`
- Responsibilities: Cumulative alignment KPIs, per-agent accordion with drift areas and comparison tables
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
### All pages as client components
## Error Handling
- Dynamic route pages (`/properties/[id]`, `/bookings/[id]`) check for `null` result from `getProperty`/`getBooking` and render an inline "not found" message with a back button.
- Auth `signIn` returns a typed `{ ok: false, error: string }` union — the login page surfaces the error string inline.
- Supabase client factories use `!` non-null assertions on env vars — no runtime validation.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
