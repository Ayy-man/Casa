---
phase: 01-casa-360-redesign
plan: 05
subsystem: routing / agent-logs
tags: [routing, agent-logs, vault, ia-collapse, redirect]
requires:
  - "01-01: top-nav shell + /vault tab target"
  - "01-02: narrative mock-data"
  - "01-03: Exception Board home route (absorbs the Pricing bulk-approve table)"
  - "01-04: /vault/* table sub-pages (redirect destinations)"
provides:
  - "/vault/agent-logs index — 4-agent grid + 50-row recent-activity feed"
  - "/vault/agent-logs/pricing — 9-section Pricing Agent detail relocated verbatim"
  - "/vault/agent-logs/{guest,ops,sop} — 9-section structural-parity detail pages"
  - "13 legacy routes retired as redirect stubs"
affects:
  - "src/components/casa/command-palette.tsx — go targets now /vault/*"
  - "src/components/casa/agent-skeleton.tsx — internal links repointed"
tech-stack:
  added: []
  patterns:
    - "Next.js App Router redirect() one-line page.tsx stubs for legacy routes"
    - "shared 9-section renderer component (agent-detail-page.tsx) consumed by thin page wrappers"
key-files:
  created:
    - "src/app/(dashboard)/vault/agent-logs/page.tsx"
    - "src/app/(dashboard)/vault/agent-logs/pricing/page.tsx"
    - "src/app/(dashboard)/vault/agent-logs/guest/page.tsx"
    - "src/app/(dashboard)/vault/agent-logs/ops/page.tsx"
    - "src/app/(dashboard)/vault/agent-logs/sop/page.tsx"
    - "src/components/casa/agent-detail-page.tsx"
    - "src/lib/mock-data/agent-detail.ts"
  modified:
    - "src/components/casa/agent-skeleton.tsx"
    - "src/components/casa/command-palette.tsx"
    - "src/app/(dashboard)/pricing/page.tsx"
    - "src/app/(dashboard)/cleanings/page.tsx"
    - "src/app/(dashboard)/claims/page.tsx"
    - "src/app/(dashboard)/properties/page.tsx"
    - "src/app/(dashboard)/properties/[id]/page.tsx"
    - "src/app/(dashboard)/bookings/page.tsx"
    - "src/app/(dashboard)/bookings/[id]/page.tsx"
    - "src/app/(dashboard)/agents/page.tsx"
    - "src/app/(dashboard)/agents/pricing/page.tsx"
    - "src/app/(dashboard)/agents/guest/page.tsx"
    - "src/app/(dashboard)/agents/ops/page.tsx"
    - "src/app/(dashboard)/agents/sop/page.tsx"
    - "src/app/(dashboard)/reports/page.tsx"
decisions:
  - "Used redirect() stubs (not hard-delete) for /pricing and /reports — keeps external deep links alive without a 404 and satisfies the plan's key_links 'redirect' pattern check for pricing/page.tsx"
  - "Built a shared AgentDetailPage component rather than duplicating ~400 lines per Guest/Ops/SOP page — the three route files are 3-line wrappers feeding agent-specific mock data"
metrics:
  duration: "~25 min"
  completed: "2026-05-21"
  tasks: 3
  files-created: 7
  files-modified: 15
---

# Phase 1 Plan 05: Relocate Agent Surfaces Under Vault Summary

Collapsed the last legacy routes into the 3-tab IA — relocated the 9-section
Pricing Agent detail verbatim to `/vault/agent-logs/pricing`, built the Agent
Logs index plus structural-parity Guest/Ops/SOP detail pages, and retired all
13 legacy top-level routes as `redirect()` stubs.

## What Was Built

**Task 1 — Pricing Agent relocation + Agent Logs index** (`e0c4de4`)
- `vault/agent-logs/pricing/page.tsx` is the 687-line Pricing Agent detail
  moved verbatim from `agents/pricing/page.tsx`. The only edit: the back-link
  `href` rewritten from `/agents` to `/vault/agent-logs`. All 9 sections (At a
  Glance, Live Activity, Configuration, Performance, Decisions, Properties,
  Validation, Prompt History, Controls) and the `SECTIONS` array preserved.
- `vault/agent-logs/page.tsx` — the Agent Logs index: a 4-agent 2-col grid
  (status pill + 4 stat tiles + sparkline, card-grid descending from
  `agents/page.tsx`), a 50-row recent-activity feed table on the `.pricing-table`
  base (Timestamp / Agent / Property / Action / Status / Cost), a `← Vault`
  breadcrumb, and the one Playfair 40px headline `Agent Logs`. Cards link to
  `/vault/agent-logs/[key]`.

**Task 2 — Guest/Ops/SOP detail at 9-section parity** (`ec9035c`)
- `src/lib/mock-data/agent-detail.ts` — agent-appropriate mock data for the
  three agents (Guest = message drafts/escalations, Ops = cleaner dispatch,
  SOP = playbook updates/drift flags). Keeps the `src/lib/mock-data` module
  shape; exposes `AGENT_DETAILS` + `getAgentDetail`.
- `src/components/casa/agent-detail-page.tsx` — a shared renderer mirroring the
  Pricing Agent's 9-section structure. Drives the three routes from data so the
  ~400-line layout is not triplicated.
- `vault/agent-logs/{guest,ops,sop}/page.tsx` — 3-line wrappers; each renders
  the shared component with its agent data. Each page has a `← Vault` breadcrumb
  and exactly one Playfair 36px headline (the cockpit hero headline, matching
  the relocated Pricing page verbatim).
- `agent-skeleton.tsx` internal `Link href="/agents"` (×2) repointed to
  `/vault/agent-logs`. The component is no longer imported by any `/vault/*`
  page (the new pages fully replace the skeleton) but is preserved per UI-SPEC.

**Task 3 — Legacy route retirement + command palette** (`c0e7b2c`)
- All 13 legacy route pages replaced with one-line `redirect()` stubs:
  `/cleanings,/claims,/properties,/bookings` (+ `[id]`) → `/vault/*` homes;
  `/agents` + `/agents/{pricing,guest,ops,sop}` → `/vault/agent-logs/*`;
  `/pricing` → `/` (its bulk-approve table is the Exception Board mega-card);
  `/reports` → `/vault/agent-logs` (folded into per-agent Validation, L2).
- Dynamic `[id]` stubs interpolate the id into a fixed same-origin `/vault/...`
  prefix (threat T-01-12 mitigation — single dynamic segment, not an open
  redirect).
- `command-palette.tsx` — every `go` navigation target repointed to `/vault/*`
  (`/vault/properties/[id]`, `/vault/bookings/[id]`, `/vault/cleanings`,
  `/vault/agent-logs`). No legacy route navigation target remains.

## Deviations from Plan

None — plan executed exactly as written. The plan's "Claude's Discretion"
redirect-vs-delete choice was resolved to redirect-stubs for all 13 legacy
routes (including `/pricing` and `/reports`, where the plan explicitly
permitted a redirect stub); this keeps external deep links 404-free and
satisfies the `key_links` machine check for a `redirect` pattern in
`pricing/page.tsx`.

## Verification

- `npx tsc --noEmit` exits 0.
- `npm run build` — `✓ Compiled successfully`, no errors or warnings. All 5
  `/vault/agent-logs/*` routes present in the route manifest; the 13 legacy
  routes now build as 180 B redirect stubs.
- `grep -rnE 'href="/agents'` over `src/app/(dashboard)/vault/` and
  `src/components/casa/` returns nothing — no live legacy `/agents` href.
- Command palette `go` targets are all `/vault/*` — no legacy route target.

## Threat Surface

No new threat surface beyond the plan's `<threat_model>`. T-01-12 (open
redirect on `[id]` stubs) is mitigated as planned — fixed `/vault/...` prefix,
single interpolated segment. T-01-13 (XSS in agent-logs rendering) is mitigated
— all agent-detail strings render as plain React text children; no
`dangerouslySetInnerHTML` in any new file.

## Self-Check: PASSED

- Created files: all 7 present on disk (verified).
- Commits: `e0c4de4`, `ec9035c`, `c0e7b2c` all in `git log` (verified).
