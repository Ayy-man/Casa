---
phase: 01-casa-360-redesign
plan: 06
subsystem: assistant / phase-verification
tags: [assistant, chat, role-aware, canned-response, verification-gate, wave-4]
requires:
  - "01-01: top-nav shell + /assistant tab target + useRole() hook"
  - "01-02: narrative mock-data — assistant.ts (greetings, prompts, canned responses)"
  - "01-03: Exception Board home route"
  - "01-04: /vault/* table sub-pages"
  - "01-05: agent-logs + legacy-route retirement"
provides:
  - "/assistant — role-aware chat surface (greeting bubble + 4 prompt chips + history + input bar)"
  - "casa/assistant.tsx — Assistant component with canned-response demo (1-2s delay, no network)"
  - "full-phase build-clean + cross-account + mobile verification gate (Task 2 checkpoint)"
affects:
  - "src/app/globals.css — adds .assistant-dot typing-indicator class"
tech-stack:
  added: []
  patterns:
    - "useRef<Map> setTimeout timer + useEffect cleanup for the canned-response delay (page.tsx toast-timer pattern)"
    - "user-typed input rendered as a plain React text child (React-escaped, no dangerouslySetInnerHTML) — T-01-15 mitigation"
    - "opacity-only typing-indicator animation, disabled under prefers-reduced-motion"
key-files:
  created:
    - "src/components/casa/assistant.tsx"
    - "src/app/(dashboard)/assistant/page.tsx"
    - ".eslintrc.json"
  modified:
    - "src/app/globals.css"
decisions:
  - "Added .eslintrc.json (extends next/core-web-vitals) so `npm run lint` runs non-interactively — the repo had no ESLint config, so `next lint` prompted for setup and blocked the automated gate (deviation Rule 3)."
  - "Typing indicator built as a new .assistant-dot CSS class (opacity-pulse, reduced-motion-honored) rather than reusing an existing class — no chat-typing-indicator class exists in globals.css."
  - "send() picks a random 1000-2000ms delay per the Interaction Contract's '1-2s' spec; input + chips disable while a reply is pending to prevent overlapping timers."
metrics:
  duration: "~25 min"
  completed: 2026-05-21
  tasks: 2
  files: 4
---

# Phase 1 Plan 06: Assistant + Full-Phase Verification Summary

Role-aware `/assistant` chat tab — greeting bubble, 4 role-aware suggested-prompt chips,
conversation history, and a fixed Casa-blue-send input bar — backed by a canned-response
demo (1-2s `setTimeout`, no network); plus the full-phase build-clean + cross-account +
mobile verification gate for the whole Casa 360 redesign.

## What Was Built

### Task 1 — Assistant component + route (commit `ad888c3`)

- **`src/components/casa/assistant.tsx`** — `"use client"` component exporting `Assistant`.
  - Single 700px-max-width centered column with a fixed bottom input bar.
  - **Greeting:** a bot avatar (Casa-blue soft circle + `Bot` icon) beside a `.bubble.them`
    bubble carrying the role-aware greeting from `ASSISTANT_GREETINGS[useRole()]`.
  - **4 suggested-prompt chips:** `.filter-chip` base, sourced from `promptsForRole(role)`
    — owner and operations get different prompt sets (verbatim from `assistant.ts`).
  - **Conversation history:** messages render as `.bubble.them` (bot) / `.bubble.us`
    (user) inside `.chat-row`s — the `bookings/[id]` chat-thread analog.
  - **Demo behavior:** clicking a chip or submitting the input pushes a user bubble + a
    pending typing-indicator bubble, then after a random 1000-2000ms `window.setTimeout`
    swaps the indicator for the canned response from `getAssistantResponse()`. Unknown
    free-text falls back to `ASSISTANT_FALLBACK`. No network, no eval, no `innerHTML`.
  - **Timer hygiene:** timers tracked in a `useRef<Map>` and cleared in a `useEffect`
    cleanup on unmount (T-01-16 — no leaked/unbounded timers).
  - **Input bar:** text input with the `Ask about properties, revenue, or agent
    actions...` placeholder + a Casa-blue `.btn-sm-accent` send button.
- **`src/app/(dashboard)/assistant/page.tsx`** — thin `"use client"` route page with the
  `route-fade page-pad` root rendering `<Assistant />`. No 40px Playfair headline — the
  greeting bubble is the route's primary heading surface, per the plan.
- **`src/app/globals.css`** — added `.assistant-dot` (opacity-pulse typing indicator) and
  registered it in the `prefers-reduced-motion` block.

### Task 2 — Full-phase verification gate (checkpoint:human-verify)

Ran the automated gate; see "Automated Verification Gate Results" below. All
auto-fixable failures fixed and committed. The remaining human-verification checklist is
in the checkpoint return to the orchestrator — a person must confirm it on both demo
accounts.

## Automated Verification Gate Results

| Gate check | Result |
|------------|--------|
| `npm run build` exits 0 | PASS — `/assistant` route built (4.05 kB); embedded lint + typecheck pass clean |
| `npx tsc --noEmit` exits 0 | PASS |
| `npm run lint` no errors | PASS — ESLint reports 0 errors, 1 pre-existing warning (see Deviations + Deferred Issues) |
| `grep -rn 'casa/sidebar' src/` empty | PASS |
| no sage green (`green-500/600`, `emerald`, sage hex) | PASS |
| `grep -rn 'humanos-logo.svg' src/` empty | PASS |
| `date-fns` in `package.json` | PASS (`^3.6.0`) |
| no thick `border-left` in `exception-card.tsx` | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing ESLint config so the lint gate can run**
- **Found during:** Task 2 automated gate.
- **Issue:** The repository had no `.eslintrc.*` / `eslint.config.*` file, so
  `npm run lint` (`next lint`) dropped into an interactive "How would you like to
  configure ESLint?" prompt and never completed — blocking the plan's mandated
  `npm run lint` gate check.
- **Fix:** Created `.eslintrc.json` with `{ "extends": "next/core-web-vitals" }` — the
  canonical config for the already-installed `eslint-config-next@14.2.18` dependency.
  No new package installed.
- **Files modified:** `.eslintrc.json` (created)
- **Commit:** see Task 2 commit.

## Deferred Issues

**`react-hooks/exhaustive-deps` warning — `src/app/(dashboard)/page.tsx:122`**
- ESLint emits 1 warning (0 errors): the Exception Board's toast-timer cleanup
  `useEffect` reads `timers.current` directly in its return function.
- Pre-existing code from plan 01-03 — not introduced by plan 01-06, so out of
  scope per the SCOPE BOUNDARY rule. The lint gate's "no errors" bar is met.
- Logged to `.planning/phases/01-casa-360-redesign/deferred-items.md` with the
  one-line fix (the same `const map = timers.current;` pattern plan 01-06's
  `assistant.tsx` already uses correctly).

## Known Stubs

The Assistant is a deliberate Phase-1 demo stub: canned responses, no real LLM. This is
explicitly in scope per CONTEXT.md ("No real LLM / OpenRouter integration — the Assistant
uses canned responses") and the brief ("Real Claude integration via OpenRouter comes
later"). Resolved in a later phase. Not a blocking stub — the goal (a working role-aware
chat demo) is achieved.

## Self-Check: PASSED

- `src/components/casa/assistant.tsx` — FOUND
- `src/app/(dashboard)/assistant/page.tsx` — FOUND
- `.eslintrc.json` — FOUND
- `src/app/globals.css` (`.assistant-dot` added) — FOUND
- `.planning/phases/01-casa-360-redesign/01-06-SUMMARY.md` — FOUND
- `.planning/phases/01-casa-360-redesign/deferred-items.md` — FOUND
- Task 1 commit `ad888c3` — FOUND in git log
- Task 2 verification-gate commit — created in the same final commit as this SUMMARY
