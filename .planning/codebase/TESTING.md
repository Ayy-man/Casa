# Testing Patterns

**Analysis Date:** 2026-05-14

## Current State: No Tests Exist

This project has zero automated tests. Confirmed by:

- `package.json` has no `test` script. The only scripts are `dev`, `build`, `start`, and `lint`.
- No test runner installed: no `jest`, `vitest`, `@testing-library/*`, `playwright`, `cypress`, or similar in `dependencies` or `devDependencies`.
- No test configuration files: no `jest.config.*`, `vitest.config.*`, `playwright.config.*`.
- No test files found anywhere in the repository: zero `*.test.*` or `*.spec.*` files.
- No `__tests__` directories.

---

## Current QA Approach

The project relies entirely on **manual UAT against mock-data screens**:

1. **Mock data as fixture layer.** All pages consume static TypeScript data from `src/lib/mock-data/` — `properties.ts`, `bookings.ts`, `cleanings.ts`, `claims.ts`, `exceptions.ts`, `pricing.ts`, `agents.ts`, `reviews.ts`, `reports.ts`. These are the de-facto "test fixtures" for the current iteration.

2. **Demo accounts.** The login page exposes two hardcoded accounts (`carlos@casa.com` / `denika@casa.com`, password `demo`) to allow manual session-flow testing without a live backend.

3. **Console.log stubs.** Unimplemented actions are stubbed with `console.log(...)` calls rather than throwing errors, so the UI remains exercisable during manual review. Examples: `onClick={() => console.log("add property")}`, `onClick={() => console.log("dispatch backup", cleaning.id)}`.

4. **Agent skeleton.** `src/components/casa/agent-skeleton.tsx` is an explicit placeholder component acknowledging that Guest, Ops, and SOP agent pages are not yet built. It is documented inline.

5. **`next lint`** — ESLint (via `eslint-config-next`) is the only automated code-quality gate. Run with `npm run lint`.

---

## Recommended Testing Posture

Based on the current stack (Next.js 14, TypeScript strict, Radix UI, mock-data architecture), the following approach is appropriate for this project's scale (single operator, ~2 active users, 26 properties, pre-production).

### Priority 1 — Unit Tests for Business Logic (Immediate)

The mock-data modules contain pure functions that encode business rules. These are the highest-risk untested code:

| File | Functions to test |
|---|---|
| `src/lib/mock-data/pricing.ts` | `changeClass(change)` — pricing delta classification logic |
| `src/lib/mock-data/agents.ts` | `modeClass(mode)`, `modeLabel(mode)` — agent mode display |
| `src/lib/mock-data/cleanings.ts` | `cleanStatusLabel(status)` — cleaning status label mapping |
| `src/lib/auth/context.tsx` | `signIn` credential lookup and result typing |
| `src/components/casa/sidebar.tsx` | `isActive(pathname, to, end)` — nav active-state logic |
| `src/lib/utils.ts` | `cn(...inputs)` — class merge utility |

**Recommended runner:** Vitest (zero-config for ESM/TypeScript, fast, compatible with Next.js).

```bash
npm install -D vitest
```

Example test structure for `isActive`:
```typescript
// src/components/casa/sidebar.test.ts
import { describe, it, expect } from "vitest";
// extract isActive as a named export for testability
import { isActive } from "@/components/casa/sidebar";

describe("isActive", () => {
  it("exact match when end=true", () => {
    expect(isActive("/", "/", true)).toBe(true);
    expect(isActive("/pricing", "/", true)).toBe(false);
  });
  it("prefix match when end=false", () => {
    expect(isActive("/agents/pricing", "/agents", false)).toBe(true);
    expect(isActive("/properties", "/agents", false)).toBe(false);
  });
});
```

### Priority 2 — Component Tests for Design System Primitives (Short-term)

When Radix primitives and CSS component classes are wired together, visual regressions are a real risk. Test the components that encode the most critical design constraints:

- **Pill families** — confirm correct class application for each urgency/status value
- **KPI card** — confirm `.kpi-rule` renders inside the card boundary (not as a side stripe border)
- **Tab trigger** — confirm active state applies correct `border-bottom-color` and weight
- **Button variants** — confirm `.btn-primary` vs `.btn-sm-primary` vs `.btn-sm-outline` applied correctly

**Recommended library:** `@testing-library/react` + `vitest`.

```bash
npm install -D @testing-library/react @testing-library/user-event jsdom
```

Example test:
```typescript
// src/components/casa/sparkline.test.tsx
import { render } from "@testing-library/react";
import { Sparkline } from "./sparkline";
import { describe, it, expect } from "vitest";

describe("Sparkline", () => {
  it("renders an SVG polyline", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} />);
    expect(container.querySelector("polyline")).toBeTruthy();
  });
});
```

### Priority 3 — Integration / E2E Tests for Critical Flows (When Real Auth Lands)

When the Supabase backend replaces the mock auth context (`src/lib/auth/context.tsx`), the following flows become critical enough to warrant Playwright tests:

1. **Login flow** — valid credentials → redirect to `/` with status banner
2. **Login rejection** — invalid credentials → inline error displayed
3. **Auth guard** — unauthenticated visit to `/pricing` → redirect to `/login`
4. **Middleware coverage** — `src/middleware.ts` calls `updateSession` via Supabase SSR; this is currently untestable with mock auth

**Recommended runner:** Playwright (first-party Next.js support, TypeScript-native).

```bash
npm install -D @playwright/test
npx playwright install
```

### Priority 4 — Snapshot Tests for Design-Critical Pages (Optional)

Because the design system is densely specified (exact pixel sizes, exact hex values, named component classes), snapshot or visual regression tests could prevent accidental drift:

- Home page exception card structure
- Agent pricing page cockpit hero band
- Login page (Display type + accent rule)

These are lower priority than logic tests but become valuable before the product is shown to the operator (Carlos).

---

## Vitest Configuration Recommendation

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Add to `package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

---

## File Placement Convention (When Tests Are Added)

Place test files co-located with the source file they test:

```
src/
  lib/
    mock-data/
      pricing.ts
      pricing.test.ts       ← unit tests for changeClass etc.
    utils.ts
    utils.test.ts
  components/
    casa/
      sidebar.tsx
      sidebar.test.ts       ← unit test for isActive
      sparkline.tsx
      sparkline.test.tsx    ← component render test
  app/
    (dashboard)/
      page.tsx
      page.test.tsx         ← integration test for home page flows
```

---

## What Warrants No Test Right Now

- **All mock-data arrays** — `PROPERTIES`, `BOOKINGS`, etc. These are static fixtures, not logic. Test correctness by inspection, not automation.
- **CSS class application** — The design system classes (`urgency-pill`, `kpi-card`, etc.) are defined in `globals.css`. Their visual correctness is verified by manual review against `DESIGN.md`, not unit tests.
- **Radix UI primitive behavior** — Radix components (Dropdown, Dialog, Switch) are already tested by the library. Do not re-test their internal behavior.

---

*Testing analysis: 2026-05-14*
