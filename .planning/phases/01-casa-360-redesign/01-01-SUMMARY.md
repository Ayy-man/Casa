---
phase: 01-casa-360-redesign
plan: 01
subsystem: nav-shell-and-auth-foundation
tags: [navigation, auth, roles, design-system, css]
requires: []
provides:
  - "casa/top-nav.tsx — 3-tab sticky top navigation (Exception Board / Vault / Assistant)"
  - "useRole() hook + Role type + workspaceRole field on AuthUser"
  - "date-fns ^3.6.0 dependency"
  - "globals.css: .filter-chip--accent, .btn-sm-accent, .sheet--vault, 8 .cat-* quartets, .cat-rule, 4 status-count pills, .nav-drawer"
affects:
  - "src/app/(dashboard)/layout.tsx — now mounts TopNav over a single <main>"
  - "every authenticated route — renders inside the new top-nav chrome"
tech-stack:
  added: ["date-fns@^3.6.0"]
  patterns: ["Radix Dropdown for the user menu", "CSS custom property (--cat-rule) drives the inner 2px category rule"]
key-files:
  created:
    - "src/components/casa/top-nav.tsx"
    - ".planning/phases/01-casa-360-redesign/01-01-SUMMARY.md"
  modified:
    - "package.json"
    - "package-lock.json"
    - "src/lib/auth/context.tsx"
    - "src/app/(dashboard)/layout.tsx"
    - "src/app/globals.css"
  deleted:
    - "src/components/casa/sidebar.tsx"
decisions:
  - "tailwind.config.ts accent already #1E5FBF — confirmed, no change made (Pattern Map: confirm only)"
  - "Legacy routes (/pricing, /agents/*, etc.) left untouched — their deletion/relocation is owned by later Wave-2/3 plans; they still build because only layout.tsx referenced the deleted Sidebar"
metrics:
  duration: "~6 min"
  completed: 2026-05-20
---

# Phase 1 Plan 01: Nav Shell & Auth Foundation Summary

3-tab sticky top navigation replaces the left sidebar on every authenticated route, the auth context exposes a typed `useRole()` hook for both demo accounts, `date-fns` is pinned, and the shared `globals.css` vocabulary every later slice consumes (`.filter-chip--accent`, `.btn-sm-accent`, `.sheet--vault`, 8 category quartets, status pills, mobile drawer) now exists with a clean build.

## What Was Built

**Task 1 — date-fns + role-aware auth** (`828c274`)
- Added `date-fns@^3.6.0` to `package.json` dependencies; `npm install` resolved it (verified `date-fns` 3.6.0, MIT, official npm registry — threat T-01-03 mitigation).
- Extended `src/lib/auth/context.tsx`: new `Role = "owner" | "operations"` type; `workspaceRole: Role` field added to `AuthUser` (the existing free-string `role` display label is kept untouched); `carlos@casa.com` → `owner`, `denika@casa.com` → `operations` in the `USERS` map; `workspaceRole` carried into the `next` object inside `signIn`; new `useRole(): Role` hook modeled exactly on `useAuth()`.

**Task 2 — 3-tab top-nav, sidebar deleted** (`86c5921`)
- Created `src/components/casa/top-nav.tsx` (`"use client"`, exports `TopNav`, ~362 lines). Merges the `topbar.tsx` analog (logo+wordmark, notification bell, outside-click dropdown) and the `sidebar.tsx` analog (active-link detection, user menu, `signOut`). Search is dropped from the redesigned nav per UI-SPEC.
  - Sticky 70px white bar, 1px `#E5E5E5` bottom border.
  - Left: `humanos-logo.png` (PNG per L5) + rule separator + `Casa Properties` wordmark.
  - Center: three `<Link>` tabs using the existing `.tab-trigger`/`.tab-trigger.active` classes — `Exception Board` → `/` (end-match), `Vault` → `/vault` (prefix-match), `Assistant` → `/assistant` (end-match).
  - Right: notification bell (`.notif-badge` with `EXCEPTIONS.length`) carrying both `aria-label="Notifications"` and `title="Notifications"` (Checker item 12); Radix user dropdown styled with `.menu-pop-floating` — full name + email + an `OWNER`/`OPERATIONS` role pill derived from `useRole()`, `Settings` → `/settings`, `Sign out` → `signOut()` + `/login`.
  - Mobile (`<=767px`): hamburger button opens a full slide-in drawer (the 3 tabs + user/role section), Esc-closeable, route-change-closeable.
- Deleted `src/components/casa/sidebar.tsx`.

**Task 3 — layout mount + globals.css** (`a214313`)
- Rewrote `src/app/(dashboard)/layout.tsx`: removed the `Sidebar` and `TopBar` imports and the two-column flex shell; renders `<TopNav />` over a single `<main className="flex-1 min-w-0 overflow-y-auto">`. Auth-guard redirect, `CommandPalette` mount, and the `Cmd/Ctrl-K` listener are preserved.
- Extended `src/app/globals.css` (`@layer components`):
  - `.filter-chip--accent` — Casa-blue `#1E5FBF` fill, white text, label weight 500 (AA contrast caveat).
  - `.btn-sm-accent` — 32px Casa-blue button for per-card primary CTAs + Assistant send.
  - `.sheet--vault` — 500px width modifier on `.sheet`.
  - 8 exception-category quartet classes (`.cat-Guest/Cleaner/Pricing/Maintenance/Owner/Revenue/Pipeline/Compliance`) using the reconciled UI-SPEC hex values; Owner/Revenue text is `#134E8B`; Pipeline is the muted slate-teal, Compliance the muted plum. Each exposes a `--cat-rule` custom property.
  - `.cat-rule` — the inner 2px category accent bar (absolutely-positioned, modeled on `.kpi-card .kpi-rule`, NOT a thick `border-left`).
  - 4 status-count pill classes (`.status-pending/critical/medium/resolved`) — pending uses the Critical soft quartet, never solid red.
  - `.nav-drawer` + `.nav-drawer-item` — the mobile slide-in drawer (`transform: translateX()` only) + a `status-count-pop` count-change keyframe.
  - Extended the `prefers-reduced-motion` block to disable `.nav-drawer` and the status-count animation (Checker item 10).
- `tailwind.config.ts` `accent` was already `#1E5FBF` — confirmed, no edit.

## Verification

- Task 1: `grep` for `date-fns`/`useRole`/`workspaceRole` all pass; `npx tsc --noEmit` exits 0.
- Task 2: `top-nav.tsx` exists & exports `TopNav`; `sidebar.tsx` deleted; logo references `.png` never `.svg`; bell carries `aria-label` + `title`.
- Task 3: layout renders `<TopNav />` with no `Sidebar` reference; all new globals.css classes present; non-comment green/sage scan returns 0 matches; `npm run build` exits 0 (all 17 routes compile).
- `grep -rn 'casa/sidebar' src/` returns no matches.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 2 commit initially missed `top-nav.tsx`**
- **Found during:** Task 2 commit step.
- **Issue:** `git rm src/components/casa/sidebar.tsx` had already staged the deletion. The subsequent `git add src/components/casa/top-nav.tsx src/components/casa/sidebar.tsx` failed atomically — `sidebar.tsx` no longer existed as a working-tree path — so `top-nav.tsx` was never staged and the commit captured only the deletion.
- **Fix:** Verified via `git status` that `top-nav.tsx` was still untracked, then `git add` + `git commit --amend` to fold it into the same Task 2 commit. Final commit `86c5921` correctly contains both the new file and the deletion (362 insertions / 187 deletions).
- **Files modified:** none — git-staging correction only.
- **Commit:** `86c5921`

### Verification-script note (not a code change)

The Task 3 verify command's green/sage scan (`grep -viE '^\s*(/\*|\*)' ... | grep -ciE 'green-(500|600)|...'`) initially returned 1 match. The match was the literal text `green-500/600` inside a multi-line CSS *comment* I had written — the comment-filter regex only skips lines that *start* with `/*` or `*`, and that line started with comment body text. There was no actual sage-green or `green-500` color value in the CSS. The comment was rephrased to describe the quartets without the literal forbidden tokens; the scan now returns 0. No design-system rule was violated at any point.

## Authentication Gates

None — no auth gates encountered (this plan touches only the demo auth context shape, not any external auth flow).

## Known Stubs

None. The mobile drawer's `.nav-drawer`/`.nav-drawer-item` classes and the new accent/quartet classes are fully implemented and consumed (the drawer by `top-nav.tsx`; the CSS vocabulary is intentionally provided for Wave-2/3 plans per the plan's stated purpose).

## Threat Flags

None — no new security-relevant surface. `useRole()`/`workspaceRole` is a client-side UX signal only, consistent with threat register dispositions T-01-01/T-01-02 (accept). The single dependency add (`date-fns`) was verified as an official 3.x release per T-01-03.

## Self-Check: PASSED

- FOUND: src/components/casa/top-nav.tsx
- FOUND: src/lib/auth/context.tsx (modified — exports Role, useRole, workspaceRole)
- FOUND: src/app/(dashboard)/layout.tsx (modified — mounts TopNav)
- FOUND: src/app/globals.css (modified — new classes present)
- DELETED (confirmed): src/components/casa/sidebar.tsx
- FOUND commit: 828c274 (Task 1)
- FOUND commit: 86c5921 (Task 2)
- FOUND commit: a214313 (Task 3)
