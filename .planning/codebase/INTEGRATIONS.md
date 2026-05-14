# External Integrations

**Analysis Date:** 2026-05-14

## APIs & External Services

### Integrated in Code

**Supabase:**
- Role: database, auth, and session management backend
- SDK: `@supabase/ssr` 0.10.3 + `@supabase/supabase-js` 2.105.4
- Three client factories implemented:
  - Browser client: `src/utils/supabase/client.ts` (`createBrowserClient` from `@supabase/ssr`)
  - Server Component client: `src/utils/supabase/server.ts` (`createServerClient` with cookie store)
  - Middleware client: `src/utils/supabase/middleware.ts` (`createServerClient` with request/response cookie handling)
- Auth: session refresh runs in `src/middleware.ts` on every non-static request via `updateSession()`; calls `supabase.auth.getUser()` to keep the session alive
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Current usage status:** The Supabase clients are wired up at the infrastructure level (middleware, server, browser factories), but no actual database queries or `supabase.auth.signIn/signOut` calls exist in application code yet. All data is served from static mock data under `src/lib/mock-data/`. Auth in the UI uses a local `localStorage`-based mock (`src/lib/auth/context.tsx`).

**Google Fonts (via next/font/google):**
- Inter and Playfair Display loaded at build time through Next.js font optimization
- No API key required; fonts self-hosted by Next.js at build time
- Configured in `src/app/layout.tsx`

**picsum.photos:**
- External image domain whitelisted in `next.config.mjs` for Next.js `<Image>` optimization
- Used for placeholder property cover images in mock data

### Referenced in Product Context — Not Yet Integrated in Code

The following services are mentioned in `PRODUCT.md` and/or the Settings page API Status UI (`src/app/(dashboard)/settings/page.tsx`). They have no integration code (no SDK imports, no API calls, no env vars) in the current codebase. They represent the intended production integration surface.

**Hostaway:**
- Product context: The platform Casa replaces for property management. "Carlos never needs to open Hostaway directly" is a stated success criterion (PRODUCT.md).
- Settings UI: Listed as "Connected — Last sync 2 min ago" (mock status display only)
- Code integration: None

**PriceLabs:**
- Product context: The platform replaced by the Pricing Agent. The Pricing Agent tagline in `src/lib/mock-data/agents.ts` reads "Replaces PriceLabs."
- Settings UI: Listed as "Connected — Read-only · validation only" (mock status display only)
- Code integration: None

**WhatsApp Business API:**
- Product context: Mentioned in PRODUCT.md as a channel Carlos currently uses directly. The Guest Agent is expected to handle WhatsApp guest communications.
- Settings UI: Listed as "Connected — Last message sent 12 min ago" (mock status display only)
- Code integration: None

**Breezeway:**
- Product context: Not mentioned in PRODUCT.md text, but appears in Settings API Status panel
- Settings UI: Listed as "Connected — Last sync 4 min ago" (mock status display only)
- Code integration: None

**OpenPhone:**
- Settings UI: Listed as "Connected — Webhook healthy" (mock status display only)
- Code integration: None

**Apify:**
- Product context: Implied by Pricing Agent's "competitor analysis" feature (comp set scraping)
- Settings UI: Listed as "Connected — Comp scraping queue: 0" (mock status display only)
- Code integration: None

**Claude API (Anthropic):**
- Product context: The underlying LLM for all four AI agents (Pricing, Guest, Ops, SOP)
- Settings UI: Listed as "Connected — 142K tokens used MTD" (mock status display only)
- Code integration: None — no `@anthropic-ai/sdk` or `openai` package in `package.json`

**QuickBooks:**
- Settings UI: Listed as "Not connected — Phase 2" (explicitly marked as future)
- Code integration: None

## Data Storage

**Databases:**
- Supabase (PostgreSQL) — configured but not yet queried
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/ssr` / `@supabase/supabase-js`
  - Current state: All app data served from in-memory TypeScript mock data modules in `src/lib/mock-data/`

**File Storage:**
- Supabase Storage — not yet used
- Static assets served from `public/` directory (e.g., `public/humanos-logo.png`)

**Caching:**
- None — no Redis, Upstash, or other cache layer

## Authentication & Identity

**Current Implementation (Demo/Mock):**
- Custom `AuthProvider` in `src/lib/auth/context.tsx`
- Hardcoded user roster (carlos@casa.com / denika@casa.com, password: "demo")
- Session persisted to `window.localStorage` under key `casa.auth.user`
- Sign-out clears localStorage

**Intended Implementation (Supabase Auth — not yet active):**
- `supabase.auth.getUser()` is called in `src/utils/supabase/middleware.ts` on every request
- `createServerClient` and `createBrowserClient` factories are ready
- The Supabase Auth flow (email/password or magic link) has not been connected to the login form (`src/app/login/page.tsx`)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or equivalent package

**Logs:**
- `console.log` used in one location (`src/components/casa/topbar.tsx` — help button click handler)
- No structured logging library

## CI/CD & Deployment

**Hosting:**
- Not configured — no `vercel.json`, no Dockerfile, no deployment scripts
- Standard Next.js Node.js server output (no `output: "export"` or `output: "standalone"`)

**CI Pipeline:**
- None — no `.github/workflows/`, no CircleCI, no Buildkite config

## Environment Configuration

**Required env vars (for Supabase infrastructure to function):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project REST/auth URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key

**Secrets location:**
- `.env.local` (present at project root, gitignored via `.env*.local` pattern in `.gitignore`)

**Note:** Both variables are `NEXT_PUBLIC_` prefixed, meaning they are exposed to the browser bundle. This is correct for the Supabase anon (publishable) key, which is designed to be public; Row Level Security on the Supabase project controls actual data access.

## Webhooks & Callbacks

**Incoming:**
- None configured in code

**Outgoing:**
- None configured in code

---

*Integration audit: 2026-05-14*
