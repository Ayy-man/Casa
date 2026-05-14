# Technology Stack

**Analysis Date:** 2026-05-14

## Languages

**Primary:**
- TypeScript 5.x — all application code under `src/`

**Secondary:**
- CSS (via Tailwind utility classes and `@layer` component definitions in `src/app/globals.css`)

## Runtime

**Environment:**
- Node.js v22.17.0 (confirmed at analysis time)
- No `engines` field in `package.json`; no `.nvmrc` or `.node-version` file present

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (committed)

## Frameworks

**Core:**
- Next.js 14.2.18 — App Router, RSC enabled (`"rsc": true` in `components.json`), deployed as a Node.js server
- React 18.3.1 — UI library
- React DOM 18.3.1 — DOM renderer

**Build/Dev:**
- TypeScript compiler via `tsconfig.json` (target ES2017, `moduleResolution: bundler`, strict mode on, path alias `@/*` → `./src/*`)
- PostCSS (`postcss.config.mjs`) with Tailwind CSS and Autoprefixer plugins
- ESLint 8 with `eslint-config-next` 14.2.18
- `tailwindcss-animate` 1.0.7 — keyframe animation plugin (accordion open/close animations)

**Testing:**
- Not configured — no Jest, Vitest, Playwright, or Cypress config present

## UI System

**Styling Engine:**
- Tailwind CSS 3.4.14 — configured in `tailwind.config.ts`
- Custom design tokens: `ink` (#1A1A1A), `paper` (#FFFFFF), `rule` (#E5E5E5), `accent` (#1E5FBF), `softgray` (#F7F7F6)
- Custom letter-spacing tokens: `eyebrow` (0.18em), `wordmark` (0.32em)
- Border-radius deliberately small: `lg` = 4px, `md` = 2px, `sm` = 2px
- Dark mode configured (`darkMode: ["class"]`) but not actively used in the UI

**Component System:**
- shadcn/ui style — `components.json` configures style `"default"`, base color `"neutral"`, CSS variables disabled
- Component aliases: `@/components/ui` (shadcn primitives), `@/components/casa` (app-specific)
- Radix UI primitives installed (all direct deps):
  - `@radix-ui/react-checkbox` ^1.1.2
  - `@radix-ui/react-dialog` ^1.1.2
  - `@radix-ui/react-dropdown-menu` ^2.1.2
  - `@radix-ui/react-label` ^2.1.0
  - `@radix-ui/react-popover` ^1.1.2
  - `@radix-ui/react-select` ^2.1.2
  - `@radix-ui/react-separator` ^1.1.0
  - `@radix-ui/react-slot` ^1.1.0
  - `@radix-ui/react-switch` ^1.1.1
  - `@radix-ui/react-tabs` ^1.1.1

**Note:** The Radix UI packages are installed as dependencies but no files under `src/components/ui/` exist yet (the directory is empty). The radix primitives have not been composed into shadcn component wrappers. All current UI components live in `src/components/casa/` and use raw HTML with Tailwind classes.

**Utility Libraries:**
- `class-variance-authority` 0.7.0 (`cva`) — variant-based class composition (installed, not yet used in source)
- `clsx` 2.1.1 — conditional class names
- `tailwind-merge` 2.5.4 — conflict-safe class merging
- Combined in `src/lib/utils.ts` as the `cn()` helper

**Icons:**
- `lucide-react` 0.453.0 — all icons in the app (Building2, CalendarDays, Bell, Search, etc.)

**Fonts:**
- Inter (sans-serif body) — loaded via `next/font/google`, variable `--font-inter`; weights 300/400/500/600/700
- Playfair Display (serif display/headings) — loaded via `next/font/google`, variable `--font-playfair`; weights 400/500/600/700, normal + italic

**Notifications/Toasts:**
- `sonner` 1.7.0 — installed but not yet wired up; current toast UI uses local `useState` patterns in `src/app/(dashboard)/page.tsx` and `src/app/(dashboard)/claims/page.tsx`

## Key Dependencies

**Critical:**
- `@supabase/ssr` 0.10.3 — SSR-safe Supabase client factory for browser, server, and middleware contexts
- `@supabase/supabase-js` 2.105.4 — Supabase JS client (database, auth, realtime)
- `next` 14.2.18 — full-stack framework (App Router, middleware, image optimization, Google Fonts)

**Infrastructure:**
- `tailwind-merge` 2.5.4 — prevents conflicting Tailwind classes in the `cn()` utility

## Configuration

**Environment:**
- `.env.local` file is present (gitignored via `.env*.local` in `.gitignore`)
- Required variables read in code:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (browser-exposed)
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/publishable key (browser-exposed)
- No server-only secret env vars detected in source; the Supabase clients all use the publishable key

**TypeScript:**
- Strict mode enabled (`"strict": true`)
- Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json` and mirrored in `components.json` aliases)
- Target: ES2017

**Next.js:**
- Config file: `next.config.mjs`
- Image optimization: remote images allowed from `picsum.photos` (used for placeholder property photos)
- No custom webpack, redirects, rewrites, or headers configured

**Build:**
- `npm run dev` — `next dev`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run lint` — `next lint`

## Platform Requirements

**Development:**
- Node.js (v22 confirmed; no minimum specified)
- npm (lockfile present)
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Production:**
- Designed for Node.js server deployment (standard Next.js output)
- No Vercel-specific config detected; no `vercel.json`, no `output: "export"` or `output: "standalone"` in `next.config.mjs`
- Static assets served from `public/` (includes `humanos-logo.png`)

---

*Stack analysis: 2026-05-14*
