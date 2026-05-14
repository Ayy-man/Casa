# Coding Conventions

**Analysis Date:** 2026-05-14

## Source of Truth for Visual Conventions

`DESIGN.md` (repo root) is the binding design specification. It defines the full color system, typography hierarchy, elevation model, component rules, named constraints, and Do/Don't list. All visual decisions — color values, spacing, radius, font choices, component behavior — must be reconciled against `DESIGN.md` before implementation. When in doubt, `DESIGN.md` wins.

---

## TypeScript

**Compiler:**
- `"strict": true` — full strict mode enforced via `tsconfig.json`
- `"noEmit": true` — compile for type-checking only; Next.js handles emit
- `"isolatedModules": true` — each file must be independently compilable
- `target: "ES2017"`, `module: "esnext"`, `moduleResolution: "bundler"`
- `"resolveJsonModule": true` — JSON imports permitted

**Path alias:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- Use `@/` for all non-relative imports. No `../../` chains.

**Typing patterns observed:**
- Types declared with `type` (not `interface`) for data shapes: `type NavItem = { ... }`
- Union types used for constrained strings: `type AgentMode = "Shadow" | "Live"`
- `as const` used on literal arrays: `const FILTERS = ["All", "Active", ...] as const`
- Discriminated unions for result types: `type SignInResult = { ok: true } | { ok: false; error: string }`
- React props typed inline in function signatures: `function Sidebar({ ... }: { ... })`
- `React.ReactNode` for children props
- `LucideIcon` type imported and used for icon props

**Examples from codebase:**
```typescript
// src/lib/mock-data/properties.ts
export type PropertyStatus = "Active" | "Maintenance" | "New";
export type Property = { id: string; name: string; rate: number; ... };

// src/lib/auth/context.tsx
type SignInResult = { ok: true } | { ok: false; error: string };
type AuthContextValue = { user: AuthUser | null; signIn: ...; ready: boolean };
```

---

## Naming Patterns

**Files:**
- Route pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx`
- Shared components: `kebab-case.tsx` — e.g., `command-palette.tsx`, `agent-skeleton.tsx`
- Mock data: `kebab-case.ts` — e.g., `mock-data/properties.ts`, `mock-data/cleanings.ts`
- Utility: `utils.ts`

**Components:**
- PascalCase named exports: `export function Sidebar()`, `export function TopBar()`
- Default exports for pages: `export default function PropertiesPage()`
- No anonymous default exports

**Variables / constants:**
- SCREAMING_SNAKE_CASE for module-level data arrays: `PROPERTIES`, `CLEANINGS_TODAY`, `NAV_GROUPS`, `EXCEPTIONS`
- camelCase for local variables and state: `railOpen`, `paletteOpen`, `filterProp`
- Prefix `on` for event handlers passed as props: `onOpenPalette`, `onClose`, `onAction`

**Types:**
- PascalCase: `Property`, `AuthUser`, `AgentMode`, `NavGroup`

---

## Module Patterns

**Barrel exports:**
- `src/lib/mock-data/index.ts` re-exports all mock-data modules with `export * from`
- Import from the barrel when consuming multiple modules; import directly from the file when consuming one

**Context pattern:**
```typescript
// src/lib/auth/context.tsx
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) { ... }
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```
Always throw on missing context — never return null silently.

**Utility function:**
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```
Use `cn()` for all conditional class composition. Never concatenate class strings manually.

---

## React Server Components vs. Client Components

**Rule:** Every page and interactive component carries `"use client"` at line 1. The project currently uses client components pervasively because all pages require state (tabs, filters, open sheets, palette, auth checks).

**Files with `"use client"`:**
- All route pages under `src/app/(dashboard)/` — every `page.tsx`
- `src/app/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- All components in `src/components/casa/` — `sidebar.tsx`, `topbar.tsx`, `command-palette.tsx`, `agent-skeleton.tsx`
- `src/lib/auth/context.tsx`

**Files without `"use client"` (true RSC):**
- `src/app/layout.tsx` — root layout, font injection
- `src/components/casa/sparkline.tsx` — pure SVG renderer (no hooks)
- All `src/lib/mock-data/*.ts` modules — plain data exports

**Guideline for new code:** Default to `"use client"` for any component that uses hooks, browser APIs, or event handlers. Only omit it for pure data modules and leaf components with no interactivity.

---

## Tailwind Usage

**Config file:** `tailwind.config.ts`

**Design tokens defined in config:**
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

**Mix of Tailwind utilities and CSS component classes:**
The codebase uses a deliberate split:
- **`@layer components` in `globals.css`** for named component classes: `.btn-primary`, `.kpi-card`, `.ex-card`, `.panel`, `.urgency-pill`, `.pill-Critical`, `.ch-Airbnb`, `.status-Confirmed`, `.clean-status`, `.tab-trigger`, `.sheet`, `.cmdk-shell`, `.reasoning`, `.mono`, `.section-eyebrow`, `.page-pad`, `.route-fade`, etc.
- **Tailwind utilities** for layout, spacing adjustments, and one-off overrides within JSX

**When to use which:**
- Use named CSS component classes (`.ex-card`, `.btn-sm-primary`, `.urgency-pill`) for any Casa design-system component. Do not re-implement these inline.
- Use Tailwind utilities for layout (`flex`, `grid`, `gap-*`, `min-w-0`, `overflow-hidden`) and contextual sizing.
- Use inline `style={{}}` only for values that vary per-instance (e.g., computed `background` color from status, dynamic `gridTemplateColumns`).

**Tailwind classes for one-off spacing/sizing observed in practice:**
```tsx
className="flex items-center gap-3 min-w-0"
className="grid grid-cols-3 gap-5"
className="font-display text-[40px] leading-[1.1] tracking-tight"
```

---

## Design System Conventions (Binding)

These are architectural conventions, not stylistic preferences. Violating them produces a product that contradicts `DESIGN.md`.

### Typography

- **Headings and KPI numbers:** `font-display` class (Playfair Display). One Headline (40px) per route, no exceptions.
- **UI body text, labels, table cells:** `font-sans` (Inter). Default body size is 13px.
- **Reasoning prose:** `.reasoning` CSS class (Playfair, 14px, line-height 1.55, max-width 60ch).
- **Booking IDs, timestamps, costs, mono codes:** `.mono` CSS class (SF Mono, 11.5px) + `tabular-nums`.
- **Eyebrow labels:** `.section-eyebrow` CSS class (10.5px, 0.18em tracking, uppercase, `#8C8C8C`).
- **Sidebar group labels:** `.group-label` CSS class (Playfair italic, 11px, uppercase — the only italic in the system).

```tsx
// Correct heading
<h1 className="font-display text-[40px] leading-[1.1] tracking-tight">Properties</h1>

// Correct eyebrow
<div className="section-eyebrow">Portfolio</div>

// Correct mono
<td className="mono tabular-nums">{r.time}</td>
```

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

Follow the four-tier model from `DESIGN.md`. Shadow names and values:

| Context | Shadow value |
|---|---|
| KPI card hover | `0 12px 32px -16px rgba(26,26,26,0.18)` |
| Exception card hover | `0 14px 38px -22px rgba(26,26,26,0.22)` |
| Property card hover | `0 18px 40px -22px rgba(26,26,26,0.22)` |
| Notification dropdown | `0 18px 36px -16px rgba(26,26,26,0.18)` — `.shadow-soft` |
| Command palette | `0 24px 60px -16px rgba(26,26,26,0.32)` |
| Toast | `0 12px 32px -8px rgba(26,26,26,0.4)` |
| Dialog | `0 30px 80px -20px rgba(0,0,0,0.25)` |

Tier 0 and Tier 1 surfaces have **zero shadow at rest**. Shadows are hover or overlay credentials only.

### Buttons

Three families — use the correct CSS class, never re-implement:
- `.btn-primary` — 44px, `#1A1A1A` bg, white text, uppercase, 0.06em tracking. One per surface.
- `.btn-sm .btn-sm-primary` — 32px, same ink/white. Multiple per surface allowed.
- `.btn-sm .btn-sm-outline` — 32px, paper bg, ink text, `#E5E5E5` border.
- `.btn-ghost` — 36px, paper bg, `#E5E5E5` border. For header secondary actions.
- `.icon-btn` — 30×30, with optional `.approve` or `.reject` semantic variants.

### Pills

Five pill families. Never mix families within a single row (Pill-Family-Single-Row Rule):
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

Focus management follows the PRODUCT.md a11y promise, implemented in `globals.css`:

```css
/* Default focus ring: ink-tinted, 3px, 2px offset */
:focus-visible {
  outline: 3px solid rgba(26, 26, 26, 0.18);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Primary CTAs get Signal Blue focus ring */
.btn-primary:focus-visible,
.btn-sm-primary:focus-visible {
  outline-color: rgba(30, 95, 191, 0.55);
}
```

- Use `:focus-visible`, not `:focus`, for keyboard-only ring behavior.
- Text selection highlight uses `rgba(30, 95, 191, 0.15)` (Signal Blue soft).
- Live regions: `role="status"` + `aria-live="polite"` on toast, as seen in `src/app/(dashboard)/page.tsx:380–381`.
- `aria-label` on interactive KPI cards that lack visible text labels: `aria-label="${value} ${label}, ${trend}"`.
- All icon-only buttons must carry a `title` attribute at minimum.

---

## Import Organization

No ESLint import-order rule is configured (no `.eslintrc*` file found; ESLint runs via `eslint-config-next` defaults in `next lint`).

**Observed order convention:**
1. React and Next.js built-ins (`import { useState } from "react"`, `import Link from "next/link"`)
2. Third-party packages (`lucide-react`, `class-variance-authority`)
3. Internal aliases with `@/` — mock-data, components, utils, auth
4. Types with `type` keyword inline or in the same block

---

## Error Handling

- Auth context throws synchronously on missing provider: `throw new Error("useAuth must be used within AuthProvider")`
- Supabase env vars asserted with `!` (non-null assertion): `createBrowserClient(url!, key!)` — no runtime guard
- `try/catch` around `localStorage` access in auth context — graceful no-op on failure
- Form errors surfaced via local state: `const [error, setError] = useState("")` displayed inline below the form

---

## Comments

- Inline comments explain non-obvious design intent, not what the code does
- CSS comments reference the design system rules they implement:
  ```css
  /* Focus rings: PRODUCT.md a11y promise. 3px on :focus-visible… */
  /* Reduced motion: honor PRODUCT.md a11y promise across route fades… */
  /* Home KPI hierarchy: Open Exceptions leads at 60px display… */
  ```
- No JSDoc on component functions — props are typed inline

---

## Tabular Numerals

Every numeric value that appears in a table column, KPI card, or financial figure must carry `tabular-nums` (either the `.change-pill` CSS class which encodes it, or the `tabular-nums` Tailwind utility, or `font-variant-numeric: tabular-nums` in CSS). This is the Tabular-Numerals-Always Rule from `DESIGN.md`.

---

*Convention analysis: 2026-05-14*
