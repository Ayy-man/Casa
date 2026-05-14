# Pitfalls Research

**Domain:** Single-tenant supervisor dashboard wiring a Next.js 14 demo skin to Supabase + externally-hosted n8n/Claude agents under a 4-day hard deadline (May 15, 2026).
**Researched:** 2026-05-14
**Confidence:** HIGH for technical pitfalls (Context7-class sources, well-known footguns); MEDIUM for shadow-mode UX pitfalls (industry pattern literature, Casa-specific framing inferred from PRODUCT.md).

## Severity Legend

| Tag | Meaning |
|-----|---------|
| **CRITICAL** | Blocks the May 15 cutover. The VA leaves and Casa cannot operate without this being correct. |
| **IMPORTANT** | Degrades Carlos / Denika's trust in the dashboard during May 15 shadow validation. Fixable but corrosive. |
| **POST-CUTOVER** | Acceptable to ship May 15 with a known workaround; queue for Phase 2. |

---

## Critical Pitfalls

### Pitfall 1: Mock-data import paths silently survive into the wired dashboard

**Severity:** CRITICAL

**What goes wrong:**
Phase REQ-DATA-01 replaces `src/lib/mock-data/*` with Supabase queries page-by-page. Because every page imports `from "@/lib/mock-data"` directly (no service abstraction layer — see CONCERNS.md "Mock-Data Boundary Has No Enforcement Layer"), it is trivially easy to forget one import and ship a page that displays seeded mock arrays alongside real Supabase rows. The Home page exception count and the Cleanings board are the highest-risk surfaces: both render data from multiple mock modules, and a missed import will produce a screen that *looks* fine but lies to Carlos.

**Why it happens:**
There are 12 page files and 9 mock modules. The conversion is mechanical, and "looks the same as before" is the wrong success signal — the demo skin was designed to look like the real product. Without a build-time guard, the only way to detect a missed mock import is to spot-check every screen against the database.

**How to avoid:**
1. Introduce `src/lib/data/*.ts` as the only path pages may import from for entity data. Each module exports `getExceptions()`, `getCleanings()`, etc. — initially calling mock data, then swapped to Supabase as each phase lands.
2. Add an ESLint rule (or a tiny `scripts/check-imports.ts` in `package.json`'s `predev` / `prebuild` script) that forbids importing from `@/lib/mock-data` outside `src/lib/data/`. Fail the dev server and CI build on violation.
3. Before May 15: `grep -r "from \"@/lib/mock-data\"" src/app` must return zero results.

**Warning signs:**
- A page renders correctly with `.env.local` Supabase keys pointing at an empty database (data appearing from nowhere = mock leak).
- Exception counts that don't change when you insert rows in the Supabase dashboard.
- A `git diff` for a "wired" page that still touches `mock-data/index.ts`.

**Phase to address:**
Phase 1 (data layer) — the abstraction must land *before* the first page is converted, not retrofitted later. Cost of retrofitting after 6 pages are converted is ~3x the cost of doing it up-front.

---

### Pitfall 2: @supabase/ssr cookie handler using the wrong shape (the "random logout" footgun)

**Severity:** CRITICAL

**What goes wrong:**
The `@supabase/ssr` package's Next.js App Router cookie handler has a specific contract — `getAll()` returns cookies from the request, `setAll(cookiesToSet)` writes cookies on *both* the request object and the response. Three mistakes are common and silent:

1. Implementing only `get`/`set`/`remove` (the legacy `@supabase/auth-helpers` shape) instead of `getAll`/`setAll`. The Supabase team migrated the docs; older Stack Overflow answers still show the old shape.
2. Calling `myNewResponse.cookies.setAll(...)` — `NextResponse.cookies` does not actually expose `setAll`; you must iterate and call `.set()` per cookie.
3. Forgetting to wrap `cookieStore.set()` calls inside Server Components in `try/catch`. Server Components cannot mutate cookies; the library swallows this if you let it, but a bare throw will crash the page.

Symptom: users get logged out at random intervals, or middleware fires `getUser()` against a stale token, or the page renders an unauthenticated state on hard refresh.

**Why it happens:**
The package's API surface changed between versions. Two of the three Casa Supabase clients (`server.ts`, `middleware.ts`) were scaffolded in commit `715127c` but have never executed against a real session (see CONCERNS.md "Dual Auth Systems"), so the cookie handler shape has never been validated end-to-end. The bug only manifests once Supabase Auth replaces the localStorage auth — which is *out of scope this milestone* but the cookie plumbing still runs in middleware against every request.

**How to avoid:**
1. Even with hardcoded demo auth, validate the cookie handler shape on day 1 of Phase 1 by hitting any route and verifying `getUser()` in middleware returns `null` (not throws) and that no cookies-related warnings appear in the server log.
2. Use the exact pattern from the current Supabase Next.js App Router docs (May 2026 version): `getAll()` returns `request.cookies.getAll()`; `setAll(cookiesToSet)` runs `cookiesToSet.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); })`.
3. The non-null assertions in `src/utils/supabase/*.ts` (`process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!`) hide a runtime crash if the env var name is wrong (CONCERNS.md "Supabase Environment Variables Use Non-Standard Key Name"). Fix the env var name *and* add startup validation that throws a readable error if either var is missing.

**Warning signs:**
- "cookies() should be awaited" errors in Next.js 14 with Turbopack (known issue, requires `await cookies()`).
- Middleware silently 401s without logging.
- Demo auth works but `/api/*` routes that call `createClient()` from `server.ts` 500 with `TypeError: cannot read property 'auth' of undefined`.

**Phase to address:**
Phase 1, day 1. Even if real Supabase Auth is deferred to post-cutover, the SSR client is required for server-side data queries this milestone. Get the cookie handler right before the first query is written.

---

### Pitfall 3: Approve/Reject buttons double-fire n8n webhooks under network jitter

**Severity:** CRITICAL

**What goes wrong:**
Carlos clicks "Approve" on a pricing recommendation. The button fires `POST /api/pricing/approve`, which writes to Supabase and posts to the n8n webhook that pushes the rate to PriceLabs. The first network round-trip takes 3 seconds (n8n cloud cold start, OpenRouter call). Carlos clicks again because the UI didn't respond. Now PriceLabs receives two override pushes, the second one possibly contradicting the first.

The same shape applies to: Dispatch Cleaner (sends two WhatsApp messages to Andrea), Reject Claim (creates two claim updates), Override Rate (writes two `agent_logs` rows).

**Why it happens:**
1. No idempotency keys on outbound n8n webhooks.
2. The current `console.log` stubs (CONCERNS.md "All Action Buttons That Should Do Something Fire console.log") have no disabled-while-pending state because there's no async work.
3. n8n webhooks are at-least-once by design — even if Casa fires once, n8n itself can retry on transient failures, so the *receiver* side also needs to deduplicate.

**How to avoid:**
1. Every action button must (a) disable on click and remain disabled until the server response, and (b) include a client-generated UUID `idempotency_key` (e.g., `crypto.randomUUID()`) in the request body.
2. The API route writes the idempotency key + action to a `webhook_idempotency` table with a unique constraint on `(idempotency_key)`. The insert is the gate — if it conflicts, return the prior result.
3. The outbound n8n webhook payload includes the same idempotency key. n8n flows must check (Supabase node or Redis) and short-circuit on duplicate before any side effect.
4. Visual: while pending, button shows a low-key spinner (no animation if `prefers-reduced-motion`) and the toast already-present in `(dashboard)/page.tsx` says "Submitting…" not "Approved" until the response lands.

**Warning signs:**
- Two `agent_logs` rows with timestamps < 2 seconds apart for the same property + same action.
- PriceLabs returning rate-override conflict errors.
- Andrea on WhatsApp asking "is this the right address? I got two messages."
- Carlos says "I clicked once but it acted like I clicked twice."

**Phase to address:**
Phase REQ-INT-01 (outbound n8n integration) — this is the first integration phase and the pattern must be established before the second action button is wired. Building idempotency in after 5 actions are wired means revisiting 5 actions.

---

### Pitfall 4: Optimistic UI says "Approved" before n8n actually accepted the work

**Severity:** CRITICAL

**What goes wrong:**
Pattern: button click → `useOptimistic` flips the card to "Approved" → API route writes to Supabase → API route fires n8n webhook → n8n fails or 504s. Now Supabase says approved, the UI says approved, but PriceLabs never received the override. Carlos believes the pricing change is live. It is not. Tomorrow the property is mispriced.

The Casa-specific shape: there are *two* outcomes that matter — Supabase write (durable state) and n8n dispatch (external side effect). Optimistic UI typically optimizes for one. Showing the optimistic state on Supabase write success while n8n is still in flight is the most dangerous middle ground.

**Why it happens:**
- `useOptimistic` rollback on Server Action failure works cleanly for single-system mutations. It does not natively understand "Supabase succeeded but n8n failed."
- Developers reach for optimistic UI because the demo skin is fast and a 3-second n8n call feels broken by comparison.
- The Pricing Agent's existing "Logged (Shadow)" pills are hardcoded based on array index (CONCERNS.md "Pricing Decisions Table Uses Math-Generated Data") — there is no precedent in the codebase for showing "pending external dispatch" state, so it is easy to skip.

**How to avoid:**
1. Action lifecycle has *three* states, not two: `pending` (clicked, no confirmation), `accepted` (Supabase + n8n ACK received), `dispatched` (n8n inbound callback confirms external system accepted — PriceLabs returned 200, WhatsApp delivered). The UI must distinguish all three.
2. Approve buttons should *not* use `useOptimistic` to flip to a terminal-success state. They should flip to "Submitting…" (visual: muted spinner, button disabled, toast says "Sending to Pricing Agent"). The button only shows "Approved" after the API route returns 200 *and* the row in Supabase says `status = 'accepted'`.
3. Treat the n8n callback (REQ-INT-02) as the source of truth for "dispatched" status. The Supabase row stays in `pending_dispatch` until the inbound webhook from n8n updates it.
4. Add a visible "dispatch pending" surface — pricing recommendation cards show a small "Sending to PriceLabs…" label until callback. This sets the right expectation for Carlos.

**Warning signs:**
- A pricing recommendation shows "Approved" but `agent_logs.status = 'pending_dispatch'` more than 60 seconds after click.
- Carlos asks "did this actually go through?" — meaning the UI is not communicating the dispatch state clearly enough.
- Two operators clicking Approve on the same card produces only one PriceLabs update but the UI shows both as approved (this is also the race-condition pitfall, below).

**Phase to address:**
Phase REQ-INT-01 + REQ-INT-02 together. The optimistic-vs-confirmed distinction cannot be retrofitted — it shapes the state model. If you ship REQ-INT-01 with a binary "approved or not" toggle, REQ-INT-02 has nowhere to land its callback signal.

---

### Pitfall 5: Two operators click Approve on the same exception (no row-level claim)

**Severity:** CRITICAL

**What goes wrong:**
Denika opens the Home page at 9:01am and sees the cleaner-no-show exception card. Carlos opens it at 9:02am from his phone. Both click "Dispatch Backup." Two backup cleaners are dispatched. One arrives at a property that has already been turned over. Andrea (the original cleaner) is now uncertain whose job it actually is.

The same shape applies to: two operators approving the same pricing recommendation, two operators rejecting the same claim, two operators escalating the same guest message.

**Why it happens:**
- Casa is single-tenant but multi-user: Carlos + Denika + 1-2 additional portfolio managers. PROJECT.md explicitly notes Denika has "continuous business-hours use."
- The demo skin has no concept of "this exception is being handled by someone." Exception cards have no claim state, no operator attribution.
- Realtime is in the requirements (REQ-DATA-02) but realtime tells you *the data changed*, not *someone is about to change it*.

**How to avoke:**
1. Exception cards need a `claimed_by` field. First click on Approve/Reject/Dispatch sets `claimed_by = <user_id>` and `claimed_at = now()` via an *atomic conditional update* — `UPDATE exceptions SET claimed_by = $1 WHERE id = $2 AND claimed_by IS NULL RETURNING *`. If the update returns zero rows, someone else got there first.
2. The UI on the second operator's screen shows "Carlos is handling this — open anyway?" — a non-blocking advisory, not a hard lock (operators may need to override each other in genuine emergencies).
3. Realtime subscription on the `exceptions` table broadcasts `claimed_by` changes so both screens reflect within 1-2 seconds.
4. Claim auto-expires after 10 minutes of no follow-up action (the operator walked away). After expiry, the exception is up for grabs again.

**Warning signs:**
- Andrea reports duplicate dispatch on WhatsApp.
- Two `agent_logs` rows with different `operator_id` for the same `exception_id`.
- Denika and Carlos say "I thought you handled that one."

**Phase to address:**
Phase REQ-INT-03 (functional action buttons) — must be designed in as the action handlers are written. The atomic-claim pattern is one row in the API route; retrofitting it after the buttons ship requires rewriting every handler.

---

### Pitfall 6: n8n→Casa callback fails silently and Casa shows stale agent state

**Severity:** CRITICAL

**What goes wrong:**
The Guest Agent finishes drafting a reply in n8n. n8n fires its callback to `POST /api/agents/guest/callback`. Casa is restarting (Vercel deploy) and returns 503. n8n's webhook is fire-and-forget — Casa never learns the agent finished. The exception card stays as "Agent processing…" forever. Carlos sees it 4 hours later and assumes the agent is broken. He overrides manually. Meanwhile the agent's draft is already in `agent_logs` with no exception cleared.

**Why it happens:**
- Callback webhooks fail in three common ways: (a) Casa is briefly down, (b) signature verification fails because n8n changed how it signs, (c) the callback succeeds but the route handler throws after writing to Supabase but before responding 200, so n8n retries and Casa double-processes.
- No retry/DLQ pattern in the demo skin. No "callback expected by" timestamp on agent runs.
- n8n itself can lose webhook fires (cold start, plan limits). The receiving side cannot assume callback will arrive.

**How to avoid:**
1. Every agent run has an explicit `expected_callback_by` timestamp. A small polling job (Vercel cron or a Supabase scheduled function — see Phase decision below) sweeps for agent runs that are >N minutes past their expected callback and either (a) re-queries n8n's execution status API, or (b) flags as exception "agent stalled" so a human sees it.
2. The callback route must be idempotent (same idempotency key story as outbound). Multiple n8n retries should produce one Supabase update.
3. The callback route should write to Supabase *after* responding 200 to n8n, or use Supabase's transactional guarantee — do the write first, then respond 200, and if the write fails, return non-200 so n8n retries. Never write twice on retry.
4. Surface stalled agents prominently. The agent detail pages (REQ-UI-01) need a "Stalled runs" section so the operator can see what didn't complete.

**Warning signs:**
- An exception card shows "Agent processing…" for >5 minutes.
- `agent_runs` table has rows where `started_at` is >10 minutes ago and `completed_at` is null.
- Carlos manually overrides exceptions that should have been auto-resolved.
- n8n's execution log shows successes that Casa has no record of.

**Phase to address:**
Phase REQ-INT-02 (inbound n8n integration) — the stalled-callback fallback must be designed alongside the happy-path callback. A simple "agent run watchdog" cron is sufficient for May 15; replace with Supabase Edge Functions later.

---

### Pitfall 7: Webhook HMAC signature verification uses string equality (timing attack) or skips replay protection

**Severity:** CRITICAL

**What goes wrong:**
The n8n→Casa callback is signed with HMAC-SHA256. Common implementation mistakes:

1. `if (computed_signature === provided_signature)` — vulnerable to timing attacks. Use `crypto.timingSafeEqual()` in Node.

2. Parsing the JSON body, then re-stringifying it, then signing the re-stringified version. Field order or whitespace differences break the signature. Must verify against the *raw request body bytes*.

3. No timestamp validation — a signed callback captured by an attacker can be replayed indefinitely. Especially relevant because n8n's public webhook URLs are reachable from anywhere.

4. Storing the webhook secret in `NEXT_PUBLIC_*` (it would be exposed to the browser). The secret must be server-only.

**Why it happens:**
- Quick implementations grab examples from blog posts that use `===` for "simplicity."
- Next.js Route Handlers parse JSON eagerly with `await request.json()` — losing the raw bytes needed for signature verification.
- The 4-day deadline encourages "let's add HMAC after May 15" — but the public webhook URL is reachable before the secret check is added.

**How to avoid:**
1. Read the raw body with `await request.text()` *first*, verify the signature, *then* `JSON.parse()` the validated body.
2. Use `crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))`. Wrap in try/catch — `timingSafeEqual` throws if lengths differ, which itself is a timing oracle if not handled.
3. Include a timestamp in the signed payload. Reject callbacks where `Math.abs(now - timestamp) > 300_000` (5 minutes).
4. Maintain a small recent-nonces table (or in-memory LRU sized to ~10 minutes of expected traffic) to reject exact replays inside the 5-minute window.
5. Webhook secret lives in `WEBHOOK_HMAC_SECRET` (no `NEXT_PUBLIC_` prefix).

**Warning signs:**
- The HMAC check passes for a payload you didn't send (replay).
- Test scripts that re-stringify the body before signing produce different signatures than n8n does.
- Vercel function logs show signature mismatches with payloads that are nearly identical to legitimate ones (whitespace/field order issue).

**Phase to address:**
Phase REQ-INT-02 — must be in place before the callback URL is reachable from n8n cloud. Better to take 2 hours up-front than discover an exposed endpoint after May 15.

---

### Pitfall 8: Cleaner WhatsApp dispatch escalation boundaries (60min/120min) drift from wall-clock

**Severity:** CRITICAL

**What goes wrong:**
The Ops Agent (REQ-AGENT-02) dispatches Andrea at checkout, falls back to Carly at 60 minutes if no reply, and surfaces as an exception card at 120 minutes if neither replies. The implementation likely uses n8n's "Wait" node or a setTimeout-style delay. Four failure modes:

1. **Clock drift between n8n and Casa.** n8n schedules the 60min fallback at `T+3600s` based on n8n's clock; Casa's exception watchdog checks at `T+7200s` based on its clock. If the clocks drift by 30 seconds, edge-case escalations may fire twice or not at all.

2. **n8n cloud cold start eats the wait.** If n8n's Wait node is implemented via in-memory delay (some versions), a cold start drops the scheduled action entirely.

3. **Cleaner reply arrives at minute 59:59.** Race condition — the parser writes "claimed" to Supabase at the same moment the fallback workflow reads "not claimed" and dispatches Carly. Andrea has accepted, Carly is also told to go.

4. **Property has no checkout today** but the dispatch ran anyway because the trigger fired off a stale booking date.

**Why it happens:**
- Time-based workflows in agent orchestrators are notoriously fragile. n8n's documentation recommends queue-based externals for long waits (>1 hour), but the path-of-least-resistance is the in-flow Wait node.
- The state machine (dispatched → reply pending → claimed | fallback | escalated) is implicit in the workflow rather than explicit in Supabase.

**How to avoid:**
1. The state machine for cleaner dispatch lives in Supabase, not n8n. Each transition is an INSERT into `dispatch_events`. n8n reads state, acts, writes state.
2. Use Supabase scheduled functions (or a Vercel cron at 1-minute resolution) to evaluate "is anything 60 minutes past dispatch with no reply?" rather than n8n's Wait node.
3. Cleaner-reply parsing must use an *atomic* state transition: `UPDATE dispatch SET state='claimed', claimed_by=$1 WHERE id=$2 AND state='dispatched' RETURNING *`. The 60-minute fallback uses the same atomic guard: `WHERE state='dispatched'` (will no-op if already claimed).
4. Display dispatch state explicitly on the Cleanings board: "Dispatched 2:34 PM · Andrea has 47 min to reply · escalates 3:34 PM." This makes the timing visible to Carlos and surfaces drift bugs immediately.

**Warning signs:**
- A `dispatch_events` row sequence that shows `dispatched → claimed → fallback_sent` (fallback should not fire after claim).
- Andrea: "I already said yes, why did Carly get a message?"
- The exception card surfaces at minute 90 instead of 120, or doesn't surface at all.
- Two cleaners arrive at the same property.

**Phase to address:**
Phase REQ-AGENT-02 (Ops Agent cleaner dispatch). This is the May-15-critical path — the VA leaves and this workflow is the most operationally consequential. State-in-Supabase pattern is non-negotiable.

---

### Pitfall 9: Mode toggle (Shadow ↔ Live) writes to Supabase but doesn't gate dispatch

**Severity:** CRITICAL

**What goes wrong:**
The current Pricing Agent mode toggle is a known UI-only bug (CONCERNS.md "Mode Toggle in Pricing Agent Is UI-Only"). The obvious fix is "wire it to Supabase." That alone is insufficient. The mode value must *gate the dispatch path*: in Shadow mode, the n8n webhook for PriceLabs override must NOT fire; only the `agent_logs` row is written. In Live mode, both happen.

Casa-specific risk: each agent has independent mode (PROJECT.md: "Per-agent shadow-vs-autonomous bar is TBD — system supports either mode per agent"). It is easy to write a single global mode setting and forget that Pricing might be Live while Guest is Shadow on May 15.

**Why it happens:**
- Mode toggles are a UI-first concept; the gating logic lives deep in the API route or the n8n flow, far from the toggle.
- The shadow-mode banner in the existing Pricing UI ("Recommendations only — Carlos approves manually") makes it feel like the toggle is already wired. It isn't.
- The toggle's value is read in 2-3 places (UI label, API route gate, n8n branch). Skip any one and the gate is half-implemented.

**How to avoid:**
1. Per-agent mode lives in `agents.mode` column (`shadow` | `live`). Every dispatch path begins by reading this value.
2. The API route for any agent action does: `if (agent.mode === 'shadow' && action.requires_external_dispatch) { write_log_only(); return; }`. The n8n flow has the same check as a defense-in-depth.
3. The UI mode toggle is a Supabase write, period. The toggle's local React state mirrors the row value, not the other way around. After mutation, refetch (or rely on realtime).
4. The Pricing Agent "Logged (Shadow)" pill is currently hardcoded by `i % 7 === 3` (CONCERNS.md). Replace with `decision.was_dispatched ? 'Dispatched (Live)' : 'Logged (Shadow)'` driven by the `agent_logs` row.

**Warning signs:**
- Switching to Live, clicking Approve, and seeing no PriceLabs activity — toggle is half-wired.
- A pricing decision row in Supabase with `mode='shadow'` and `was_dispatched=true` — mode and effect disagree.
- The "About shadow mode" link (currently a `console.log`, CONCERNS.md "All Action Buttons") still fires a console.log on May 15.

**Phase to address:**
Phase REQ-AGENT-01 (Pricing Agent backend wired). The mode-as-gate pattern must land as part of the Pricing Agent because Pricing is the integration testbed (Key Decisions: "Pricing Agent is the integration validation target"). Get this right for Pricing, then reuse the pattern for Ops/Guest.

---

## Important Pitfalls

### Pitfall 10: Realtime subscriptions accumulate on route changes (memory leak)

**Severity:** IMPORTANT

**What goes wrong:**
The dashboard has a sidebar nav — Carlos and Denika navigate between Home, Cleanings, Claims, Properties without full page reloads. Each page subscribes to a Supabase realtime channel on mount. If the cleanup function doesn't call `supabase.removeChannel(channel)`, channels accumulate. After ~10 navigations, the browser tab's memory grows noticeably; after a workday, the tab may hang or trigger Chrome's memory warning. On React Strict Mode (default in Next.js 14 dev), `useEffect` fires twice and the wrong cleanup pattern produces two subscriptions per mount.

**Why it happens:**
- Calling `channel.unsubscribe()` doesn't fully release the channel — must use `supabase.removeChannel(channel)`.
- The cleanup runs even when the channel never finished establishing. Returning `() => channel.unsubscribe()` from a useEffect that ran twice in dev can produce ghost channels.
- Casa-specific: Denika opens the dashboard at 9am and doesn't close the tab until 5pm. Memory leaks that are invisible in a 5-minute QA session become daily reliability problems.

**How to avoid:**
1. Standard pattern: `useEffect(() => { const channel = supabase.channel(...).subscribe(); return () => { supabase.removeChannel(channel); }; }, [stable_deps]);`
2. Channel deps should be stable — don't put `filter` inline if it changes on every render; memoize with `useMemo`.
3. Centralize realtime subscriptions in a `useRealtimeChannel(name, config)` custom hook so the cleanup contract is enforced once.
4. Manual test: leave the dashboard open for 30 minutes navigating between pages every 2 minutes. Check Chrome's Task Manager for the tab's memory — should stabilize, not grow.

**Warning signs:**
- Chrome Task Manager shows the Casa tab at >500 MB after an hour.
- Realtime events fire 2x, 4x, 8x for the same database change (one subscription per accumulated channel).
- Network tab shows multiple WebSocket connections to Supabase.

**Phase to address:**
Phase REQ-DATA-02 (realtime data refresh) — must use the centralized hook pattern from the first realtime subscription.

---

### Pitfall 11: TypeScript types from `supabase gen types` drift from schema after migrations

**Severity:** IMPORTANT

**What goes wrong:**
Phase REQ-DATA-01 runs `supabase gen types typescript --local > src/types/database.ts`. Then someone adds a column. The TypeScript types still reflect the pre-migration schema. The code compiles. At runtime, the new column is undefined or the old column is missing. Two specific Casa surfaces are high-risk: `agent_logs` (will gain columns as each agent comes online) and `exceptions` (the `claimed_by` and `expected_callback_by` columns are likely to land mid-milestone).

**Why it happens:**
- Type generation is a manual command, not a git hook. Easy to forget after every migration.
- The non-null assertion habit (already in CONCERNS.md re: env vars) means "type says it's there → I assume it's there" without runtime checks.
- The 4-day deadline encourages "let me just push the migration, I'll regen types later."

**How to avoid:**
1. Add `npm run gen:types` as a script. After every `supabase migration up`, run it. Commit the generated file.
2. Add a CI check: `git diff --exit-code src/types/database.ts` after running gen — fails the build if types weren't regenerated.
3. Use the generated `Database` type as the source of truth: `createClient<Database>()`. This makes any column rename a TypeScript error, not a runtime null.
4. For tables under active schema churn (agent_logs especially), use `Database['public']['Tables']['agent_logs']['Row']` and never widen with `as any` to "make it compile."

**Warning signs:**
- `git log` shows migrations in the last 24 hours but `src/types/database.ts` unchanged.
- Runtime errors of shape `Cannot read property 'X' of undefined` where X is a recently-added column.
- Code that uses `// @ts-expect-error` near Supabase query results.

**Phase to address:**
Phase REQ-DATA-01 — set up the type-gen workflow as soon as the first migration ships. The script costs 10 minutes; the bugs it prevents cost hours.

---

### Pitfall 12: Per-language Guest Agent breaks Casa's display layer

**Severity:** IMPORTANT

**What goes wrong:**
The Guest Agent (REQ-AGENT-03) responds in EN/Mandarin/Japanese/French. The reply lands in Casa's `agent_logs.draft` column. Casa displays it. Two failure modes:

1. **Font fallback for CJK characters.** The editorial design system uses Playfair Display + Inter (PROJECT.md). Neither covers CJK. Without an explicit font-stack fallback, browser default Chinese/Japanese fonts produce a jarring break from the editorial aesthetic — and on some systems, render as `□□□`.

2. **Text direction and line-height assumptions.** Casa's CSS uses tight line-heights tuned for Latin script. Japanese with furigana or vertical layout (rare in chat but possible) will overflow. Mandarin without word-spacing breaks the `word-break` defaults; long messages may not wrap, causing horizontal scroll on the booking detail page's guest conversation thread.

3. **Language detection for display.** If the Guest Agent stores the reply *and the language tag*, Casa can render with the right font stack. If it only stores the text, Casa has to detect — and detection is unreliable for short messages.

**Why it happens:**
- The demo skin was built with English mock data.
- Editorial typography choices (Playfair) feel premium for the chrome but were never tested with the guest-conversation surface in non-Latin scripts.
- The Guest Agent's brand voice is "premium concierge with a warm, polished edge" — this is hard to maintain typographically across scripts and the failure mode is silent (text just looks wrong).

**How to avoid:**
1. The `agent_logs.draft` payload must include a `language` field (ISO 639-1: `en`, `zh`, `ja`, `fr`). The Guest Agent's Claude prompt should produce this; if not, Casa can detect at write-time using a simple library.
2. The guest conversation thread (`bookings/[id]/page.tsx` likely) renders with `lang={message.language}` on the container. CSS uses `font-family` stacks tailored per language: `:lang(zh) { font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif; }` etc.
3. Set `word-break: break-word` and `overflow-wrap: anywhere` on long-message containers. Test with a 500-char Mandarin paragraph.
4. Do NOT use Playfair for guest messages — they're not editorial chrome, they're communication content. Use Inter (which has decent multi-script coverage in its variable variant) with explicit CJK fallbacks.

**Warning signs:**
- Mandarin/Japanese guest messages render in browser default fonts (looks generic, breaks the design system).
- Horizontal scrollbar appears on the booking detail page for non-Latin messages.
- `agent_logs` rows where `draft.language` is null or always `en`.

**Phase to address:**
Phase REQ-AGENT-03 (Guest Agent wired) — must be tested with real multi-language samples before May 15 because Guest Agent is May-15-critical.

---

### Pitfall 13: All pages are `"use client"` → no Supabase server-side queries → over-fetching

**Severity:** IMPORTANT (POST-CUTOVER acceptable workaround exists)

**What goes wrong:**
CONCERNS.md notes "All Pages Are Client Components Without Need" (12 pages). When data wiring begins, the path of least resistance is to keep `"use client"` and fetch from Supabase via the browser client. This means:

1. Initial page load shows a skeleton until the client hits Supabase — slower perceived performance than RSC.
2. Every Supabase call uses the browser's anon key + the user's session — RLS-bound, but currently RLS is disabled (PROJECT.md Out of Scope). Until RLS lands, the browser has read access to potentially anything.
3. Sensitive operations (n8n webhook firing, server-only secrets) cannot happen in a `"use client"` page — must round-trip through `/api/*` Route Handlers. That's fine, but doubles the engineering surface.

**Why it happens:**
- PROJECT.md explicitly defers RSC conversion ("Convert pages opportunistically when their data-fetching gets rewired").
- The demo skin's interactivity (toasts, sheet open/close, tab state) feels like it requires `"use client"` on the page level — actually only the interactive sub-components need it.

**How to avoid:**
1. As each page is rewired, extract the interactive subset (sheets, toasts, tab containers) into a `*.client.tsx` component. The page itself becomes a server component that does the Supabase read and passes data to the client component.
2. Server-side data fetching uses the `server.ts` Supabase client (with cookies for session). Client-side mutations go through `/api/*` Route Handlers.
3. For the May 15 cutover, accept the `"use client"` keep-as-is for pages where the conversion is non-trivial. But the Home page is the entry point Carlos opens 5-10x/day — it should be a server component.

**Warning signs:**
- A page that calls `createClient()` from `src/utils/supabase/client.ts` and fires the read inside a `useEffect`. This is the anti-pattern.
- Initial load showing skeleton for >800ms on the Home page.
- The Network tab showing 5+ XHR calls to Supabase before the page is rendered.

**Phase to address:**
Phase REQ-DATA-01 — for the Home page specifically. Other pages: post-cutover, opportunistic.

---

### Pitfall 14: Validation report (REQ-UI-01's Reports tab) claims X% alignment from too-few samples

**Severity:** IMPORTANT

**What goes wrong:**
The existing Reports page shows "98% alignment" cumulative for the Pricing Agent (current mock data). When real `agent_logs` data lands, the same computation will display real numbers. Two specific risks:

1. **Sample size blindness.** If the agent has produced 3 decisions and 3 were aligned with Carlos's overrides, the page shows "100% alignment (3 decisions)." Carlos reads "100%" and starts trusting the agent. The number is a statistical accident.

2. **Cherry-picked windows.** "Last 7 days" can hide a bad day if the rest of the week was good. Aggregate alignment masks the variance.

3. **No confidence interval.** Industry-standard shadow-mode practice (per ML deployment literature) requires sample sizes that produce statistically significant alignment numbers — minimum N depends on baseline rate but typically 30+ decisions for an initial signal, 100+ for confidence. Casa's shadow window (May 15 onward) may not produce 30 decisions per agent in the first week.

**Why it happens:**
- The demo skin chose "98%" because it looks good. The component will keep computing whatever the data says.
- Shadow-mode literature consistently emphasizes sample size, but the dashboard surfaces "alignment %" as a single bold number with no qualifier.
- Carlos and Denika are not statisticians. They will treat the number as authoritative.

**How to avoid:**
1. Every alignment KPI displays `(N decisions)` alongside the percentage, with N visually de-emphasized but legible: `98% alignment · 47 decisions`.
2. If N < 10, the KPI shows "Not enough data yet — N decisions sampled" instead of a percentage.
3. If N < 30, the KPI is rendered with a muted color and a tooltip: "Confidence: low. Sample size below recommended threshold."
4. The Validation tab on each agent's detail page shows per-day breakdowns, not just cumulative — so a bad day is visible.
5. The Weekly Reports (currently stubs per CONCERNS.md) should not ship the alignment percentage at all until Week 4 has enough decisions. Replace with "decisions sampled this week" + a link to per-decision review.

**Warning signs:**
- Reports page shows 100% or 0% alignment with single-digit N.
- Carlos says "the agent's at 98%, let me promote to Live" without checking how many decisions that's based on.
- Denika reviews a sampled decision and disagrees, but the displayed alignment is unchanged because her review isn't fed back into the metric.

**Phase to address:**
Phase REQ-UI-01 (agent detail pages with Validation) and the existing Reports page. Must be addressed before the first Validation tab is populated with real data, otherwise the displayed numbers will shape decisions about promotion-to-Live during shadow window.

---

### Pitfall 15: Audit log gaps — "who saw what when" trail missing when Denika and Carlos co-operate

**Severity:** IMPORTANT

**What goes wrong:**
Carlos approves a pricing override. Denika overrides the override 20 minutes later. Two days later, the property is mispriced and there's a financial impact. Question: who saw what? Carlos saw the agent's recommendation; did Denika see Carlos's prior approval before overriding, or did she see the original recommendation? Without an explicit "viewed" event log, you cannot tell.

**Why it happens:**
- The demo skin has no concept of viewed/seen state.
- Audit logging is typically thought of as "writes" — actions taken. The "reads" half is forgotten until a postmortem demands it.
- Single-tenant + 2-3 users feels too small to need real auditing. It isn't.

**How to avoid:**
1. Every exception card view fires a `view_events` insert (debounced, ~once per session per exception). Cheap, fire-and-forget.
2. Every action (`agent_logs` write) includes the prior `last_modified_by` and `last_modified_at` it observed. This makes "Denika overrode Carlos at T+20min after Carlos approved at T" traceable.
3. The agent detail page's Decisions table shows the full chain — initial recommendation → Carlos approved → Denika overrode — not just the latest state.

**Warning signs:**
- A postmortem question that the database cannot answer.
- Two operator actions on the same row in `agent_logs` with no causality between them.
- "I didn't know you'd already handled that" conversations between Carlos and Denika.

**Phase to address:**
Phase REQ-INT-03 (functional action buttons) — bake into the API route pattern. View tracking can be POST-CUTOVER if pressed for time, but write-tracking with prior-state attribution is May-15-critical.

---

## Post-Cutover Pitfalls (acceptable to defer)

### Pitfall 16: Login labels not associated with inputs (a11y)

**Severity:** POST-CUTOVER

Already in CONCERNS.md. WCAG 1.3.1 violation. May 15 user set is Carlos + Denika (known, sighted). Fix Phase 2 alongside real auth.

### Pitfall 17: Side-sheets lack `role="dialog"` and focus traps

**Severity:** POST-CUTOVER

Already in CONCERNS.md. The demo skin uses custom `<aside>` without ARIA. WCAG 2.1, 4.1.2. Keyboard users can tab behind the overlay. The May 15 user set uses mouse + trackpad. Fix Phase 2.

### Pitfall 18: No error boundaries

**Severity:** POST-CUTOVER (but consider promoting if time allows)

Already in CONCERNS.md "Missing Critical Features." An unhandled exception crashes the whole dashboard. For May 15 with two known users, manual reload is an acceptable workaround. *However*, once n8n callbacks start arriving, any unhandled throw in a callback handler that bubbles to a parent could blank the dashboard. A single top-level `error.tsx` at `(dashboard)/error.tsx` is ~30 minutes of work and worth it.

### Pitfall 19: No tests

PROJECT.md explicitly defers tests as Phase 1 scope. Manual UAT is the QA bar. Risk: any refactor silently breaks behavior. Mitigation: small, frequent commits + manual smoke test of the integration end-to-end before each merge to main.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip the `src/lib/data/*` abstraction; convert mock imports to Supabase imports in place | Faster first conversion | Every future migration touches every page; mock leak risk per Pitfall 1 | Never — the abstraction is one file per entity, cost is hours, not days |
| Hardcoded auth shared by Carlos + Denika through May/June | Avoids Supabase Auth integration risk on critical path | Cannot attribute actions to user; audit log has only one identity | Through May/June shadow validation (PROJECT.md decision); MUST be replaced before real users beyond Carlos + Denika |
| Optimistic UI showing "Approved" before n8n callback | Feels fast | Lies to Carlos when dispatch fails; Pitfall 4 | Only with explicit "pending dispatch" sub-state and visible callback expectation |
| n8n Wait nodes for 60min/120min cleaner escalation | Implementation lives in one place (n8n) | Time drift, cold-start data loss; Pitfall 8 | Never for >5min waits — externalize state to Supabase |
| `agent_logs` table without idempotency key column | One less migration | Cannot dedupe n8n retries; Pitfall 3 | Never — add idempotency_key UNIQUE constraint from day one |
| Single `agents.mode` global toggle instead of per-agent | One row in DB, simpler UI | Pitfall 9 — Pricing in Live + Guest in Shadow on May 15 is the actual operational reality | Never — per-agent mode is the PROJECT.md key decision |
| Skipping HMAC signature on n8n callbacks "until after May 15" | Hours saved | Public webhook URL is reachable; anyone can poison `agent_logs`; Pitfall 7 | Never — HMAC + timestamp is 2 hours of work, the cost of not having it is unbounded |
| `"use client"` on every page (status quo) | No conversion work | Server-side capabilities (cookies, server secrets, RSC streaming) unavailable; Pitfall 13 | Accept for non-critical pages May 15; promote Home + Cleanings to RSC opportunistically |
| Math-generated decisions table in Pricing Agent (current state) | Demo looked good | Display layer is fragile; React keys based on array index break when sorted | Until REQ-AGENT-01 ships — that phase replaces it |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase `@supabase/ssr` cookies | Implementing `get`/`set`/`remove` (legacy) instead of `getAll`/`setAll`; calling `NextResponse.cookies.setAll(...)` which doesn't exist | Use the documented `getAll/setAll` shape; iterate `cookiesToSet.forEach` to set on both request and response |
| Supabase env vars | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vs canonical `NEXT_PUBLIC_SUPABASE_ANON_KEY` (current Casa bug, CONCERNS.md) | Rename to canonical; add startup validation throwing readable error if missing |
| Supabase realtime | Using `channel.unsubscribe()` instead of `supabase.removeChannel(channel)` in useEffect cleanup | Always `removeChannel`; centralize in custom hook |
| Supabase type generation | Running `gen types` once and never again after migrations | Add to `package.json` script + CI check for `git diff --exit-code` |
| n8n outbound webhook (Casa → n8n) | Fire-and-forget without idempotency key; UI flips to "done" on HTTP 202 | Include `idempotency_key` in payload; treat 202 as "accepted, not done" |
| n8n inbound callback (n8n → Casa) | Trusting HTTP origin; parsing JSON before HMAC check; using `===` for signature compare | Verify HMAC on raw body bytes with `crypto.timingSafeEqual`; check timestamp; store nonce |
| n8n Wait nodes for >5min | Used as the state machine for cleaner escalation | Externalize state to Supabase; Vercel/Supabase cron evaluates timing transitions |
| OpenRouter (Claude Sonnet 4.5 via n8n) | Casa retries on n8n timeout, OpenRouter charges twice for the same Claude call | Idempotency at Casa → n8n hop ensures n8n only invokes Claude once per request |
| Hostaway / Breezeway / PriceLabs / WhatsApp Business | Building against real APIs before Rachit forwards access | Build against typed Supabase mocks; switch to real on credential arrival (PROJECT.md decision) |
| WhatsApp Business (Meta) | Storing message templates inline; webhook verification with non-timing-safe compare | Templates in Supabase as versioned records; same HMAC discipline as n8n callbacks |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Realtime channel accumulation | Memory grows over a workday; events fire 2x, 4x | `removeChannel` in cleanup; centralized hook | After ~50 navigations in a single tab — possible within a Denika workday |
| All client-side data fetching | Skeleton flashes on every page load; Network tab shows N+1 Supabase queries | RSC for non-interactive pages; data loader pattern | Anytime, but most visible on Home (opened 5-10x/day per Carlos) |
| Realtime subscribed without filters | `agent_logs` changes broadcast to every dashboard tab for every property | Use `filter: 'property_id=eq.X'` on per-property subscriptions | At 26 properties × ~10 agent decisions/day, ~260 events/day — manageable, but unfiltered subscriptions amplify by # of operators |
| pgvector queries without index | Knowledge base lookups slow after ~1000 vectors | Create the IVFFlat or HNSW index at migration time, not retroactively | Per-property knowledge bases accumulate over months |
| Pricing Decisions Table with array-index keys (current) | React reconciliation thrash on sort/filter | Use stable `id` (CONCERNS.md "Pricing Decisions Table Uses Math-Generated Data") | When the table is ever sorted or filtered (currently it isn't, but REQ-AGENT-01 likely adds this) |
| Large page client bundles (Pricing Agent: 687 lines, CONCERNS.md) | First-load JS payload grows; interaction-to-paint lag | `React.lazy` below-the-fold sections (Prompt History, Validation, Charts) | Post-cutover concern; not May-15-critical |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Webhook HMAC compare via `===` | Timing attack reveals signature character by character | `crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))` |
| No timestamp / nonce on signed callbacks | Replay attack on captured webhook | Reject `now - timestamp > 5min`; store nonces 10min |
| Webhook secret in `NEXT_PUBLIC_*` env | Secret leaked to browser bundle | Always server-side env var; never `NEXT_PUBLIC_` prefix |
| n8n webhook URLs in client-side fetch | URL leaks to anyone with browser devtools | Casa hits `/api/*` route handlers; route handlers hit n8n server-side |
| Demo auth stored in localStorage (current, CONCERNS.md) | Readable by any script on origin | Acceptable through May/June only; Supabase cookie-based auth Phase 2 |
| Picsum.photos for property images (current, CONCERNS.md) | User browsing patterns leaked to third party | Replace with Supabase Storage / local `/public/` |
| RLS not enabled (PROJECT.md Out of Scope) | Any client with anon key can read tables | Acceptable while auth is hardcoded; MUST land before real auth Phase 2 |
| Service role key used in API routes without scope discipline | One vulnerable route handler can write anywhere | Document which routes use service role; minimize blast radius |
| n8n public webhook URL with no auth other than HMAC | DoS via flood (still rejected, but consumes function compute) | Add rate limiting at Vercel edge or Cloudflare; this is post-cutover unless flood occurs |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| "Approve" is the default keyboard action (Enter) on exception cards | Approval fatigue, rubber-stamping — Carlos hits Enter without reading | Default focus on the card body, not on Approve; Enter doesn't auto-approve; Approve requires explicit click or Cmd+Enter |
| Showing optimistic "Approved" before n8n confirms | Carlos walks away believing the action succeeded; PriceLabs never received it (Pitfall 4) | "Sending…" then "Approved" only after callback confirms; toast persists until terminal state |
| Mode toggle that looks like a switch but doesn't gate (current bug, CONCERNS.md) | Carlos toggles to Live, sees no effect, loses trust in every other toggle | Toggle writes to Supabase, refetches, gates the dispatch path; verified by per-decision badge on Decisions table |
| Single "alignment %" KPI with no sample size (Pitfall 14) | False confidence based on N=3 decisions | Always show `(N decisions)`; "Not enough data yet" if N < 10 |
| All exception cards look equally urgent | Carlos doesn't know which to tackle first | Urgency pills are already in the design system (PRODUCT.md); enforce sorting + visual hierarchy by urgency |
| Two operators see the same exception, both act (Pitfall 5) | Duplicate dispatches; cleaner confusion | Claim state visible per card; non-blocking advisory "Carlos is handling this" |
| Agent stalled silently (Pitfall 6) | Exception card sits in "processing" forever; Carlos overrides manually | Stalled state surfaces visibly; "agent stalled" exception category |
| Per-language guest message rendered in browser default font (Pitfall 12) | Premium aesthetic breaks; messages look generic or unrenderable | Explicit per-language font-stack with `:lang(...)` selectors |
| Hardcoded date strings (current, CONCERNS.md) | App displays "May 1" on May 14 — Carlos thinks the dashboard is broken | Render from `new Date()`; REQ-UI-02 explicitly addresses this |
| Cosmetic Undo button (current, CONCERNS.md) | Carlos believes he can undo and discovers he can't, mid-emergency | REQ-UI-03 makes Undo functional; until then, remove the button or relabel as "Dismiss" |
| Status by color alone on cleaning rail (current, CONCERNS.md) | Color-blind operators (or printout, or low-contrast monitor) lose status info | Already a PRODUCT.md rule — add textual label per CONCERNS.md fix |

---

## "Looks Done But Isn't" Checklist

Verification items for each phase exit. The May-15 cutover is at risk if any of these are unchecked.

- [ ] **Mock data layer removed:** `grep -r "from \"@/lib/mock-data\"" src/app` returns zero. Pages import from `src/lib/data/*` only.
- [ ] **Supabase env var name canonical:** `.env.local` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`; all three client files updated; startup validation in place.
- [ ] **Cookie handler validated:** Hit any route, observe no "cookies() should be awaited" warnings; `getUser()` returns expected shape.
- [ ] **Idempotency keys on every action:** Inspect any `/api/*/approve` or similar route — payload includes `idempotency_key`; `webhook_idempotency` table has unique constraint.
- [ ] **HMAC verification active:** Send a callback with wrong signature → 401. Send with right signature but old timestamp → 401. Send valid → 200.
- [ ] **Action button states wired:** Click any action → button disables → spinner → terminal state. Not just `console.log`.
- [ ] **Mode toggle gates dispatch:** With Pricing Agent in Shadow mode, click Approve → `agent_logs` row written, n8n receives nothing. Switch to Live → n8n receives the dispatch.
- [ ] **Realtime cleanup verified:** Navigate Home → Cleanings → Properties → Home 10 times. Chrome devtools shows one WebSocket, not 10.
- [ ] **Cleaner dispatch state machine in Supabase:** Inspect `dispatch_events` rows — state transitions are atomic. Andrea replying at minute 59 doesn't produce a Carly dispatch at minute 60.
- [ ] **Stalled agent detection:** Manually stop an n8n flow mid-run. Within 5 minutes, the affected exception surfaces as "agent stalled."
- [ ] **Validation report shows sample size:** Open the Pricing Agent's Validation tab. Every alignment % is annotated with `(N decisions)`.
- [ ] **Per-language guest message renders correctly:** Insert a Mandarin and Japanese message into `agent_logs` for an active booking. Open the booking detail — text renders in proper fonts, no `□□□`, no horizontal scroll.
- [ ] **Multi-operator scenario tested:** Carlos and Denika both open the Home page. Carlos clicks Approve on an exception. Denika's screen reflects within 2 seconds and shows "Carlos handled this."
- [ ] **Undo actually undoes:** REQ-UI-03 verified — click Approve, then Undo within the window. `agent_logs` row state reverts; if dispatch was fired, the reverse signal goes to n8n.
- [ ] **Hardcoded dates replaced:** Open the app — date strings reflect today, not "May 1."
- [ ] **Agent stub pages replaced or hidden:** Either Guest/Ops/SOP have real content (REQ-UI-01) or the nav links to them are guarded with "coming soon" labels.
- [ ] **Webhook secrets server-side only:** `grep -r "NEXT_PUBLIC.*SECRET" .env*` returns zero matches.
- [ ] **Mode toggle is per-agent:** `agents` table has one row per agent with its own `mode` column. The Pricing UI toggle affects only Pricing.

---

## Recovery Strategies

Things go wrong on May 15. These are the recovery moves, ranked by cost.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Mock data leak (Pitfall 1) | LOW | `grep` for residual `mock-data` imports; replace per-page; redeploy. ~30 min |
| Cookie handler wrong shape (Pitfall 2) | LOW | Replace the cookie handler functions; redeploy. ~15 min once diagnosed. |
| Double-fired webhook caused duplicate side effect (Pitfall 3) | MEDIUM | Manual remediation per side effect (cancel duplicate PriceLabs override, send "ignore previous" WhatsApp). Add idempotency post-incident. |
| Optimistic UI lied (Pitfall 4) | MEDIUM-HIGH | Audit `agent_logs` for `status='accepted'` but no n8n callback within 5min; manually verify external state; alert Carlos. Add three-state UI. |
| Two operators acted on same exception (Pitfall 5) | MEDIUM | Reconcile duplicate side effects (same as Pitfall 3); add claim state and re-deploy. |
| Callback failed silently (Pitfall 6) | MEDIUM | Re-query n8n execution status for the stalled run; manually mark exception as resolved if external system is correct; ship the watchdog cron. |
| HMAC signature attack | HIGH | If exploited, rotate webhook secret; replay all affected payloads from trusted source; audit `agent_logs` for poisoned rows. Hours-to-days. |
| Cleaner dispatch escalation drift (Pitfall 8) | HIGH | If Andrea + Carly both dispatched: phone call to both; one stand-down; cleaner pay reconciled. Move state machine to Supabase. |
| Mode toggle didn't gate (Pitfall 9) | MEDIUM | If a Shadow-mode action accidentally dispatched: reverse via PriceLabs/WhatsApp manually; add the gate; redeploy. |
| Realtime memory leak | LOW | Refresh the tab. Long-term: fix the hook. |
| Type drift (Pitfall 11) | LOW | Run `gen types`; fix the resulting TypeScript errors; redeploy. ~30 min. |
| Stale alignment % (Pitfall 14) | LOW | Add the sample-size guard to the report component; redeploy. No data loss. |

---

## Pitfall-to-Phase Mapping

How the active requirements (PROJECT.md) should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1: Mock-data leak | REQ-DATA-01 | `grep` returns zero `mock-data` imports outside `src/lib/data/` |
| 2: SSR cookie handler | REQ-DATA-01 (day 1) | No "cookies() should be awaited" warnings; `getUser()` shape correct |
| 3: Double-fired webhooks | REQ-INT-01 | `webhook_idempotency` table populated; duplicate clicks produce single side effect |
| 4: Lying optimistic UI | REQ-INT-01 + REQ-INT-02 | UI distinguishes "pending dispatch" from "accepted"; callback updates terminal state |
| 5: Two-operator race | REQ-INT-03 | Atomic claim-on-action; Denika's screen reflects Carlos's claim within 2s |
| 6: Silent callback failure | REQ-INT-02 | Watchdog cron flags stalled runs; visible "agent stalled" exception category |
| 7: HMAC + replay | REQ-INT-02 | Manual test with wrong signature → 401; old timestamp → 401 |
| 8: Cleaner escalation drift | REQ-AGENT-02 | State machine in `dispatch_events`; atomic transitions; cleaner-reply tests pass |
| 9: Mode toggle gate | REQ-AGENT-01 | Shadow mode click writes log only; Live mode click also fires n8n |
| 10: Realtime memory leak | REQ-DATA-02 | 30-min navigation soak; memory stable; single WebSocket |
| 11: Type drift | REQ-DATA-01 | CI check; `gen types` script in package.json |
| 12: Per-language fonts | REQ-AGENT-03 | Multi-language messages render correctly; no fallback fonts |
| 13: All-`"use client"` | REQ-DATA-01 (Home only); rest post-cutover | Home is a server component reading from Supabase |
| 14: Alignment % without N | REQ-UI-01 + Reports | Every alignment KPI shows N; <10 shows "not enough data" |
| 15: Audit log gaps | REQ-INT-03 | `agent_logs` includes prior-state attribution; co-operator scenario reconstructable |
| 16-19: Post-cutover items | Phase 2 | Tracked but not blocking |

---

## Sources

- Supabase Docs — Creating a Supabase client for SSR (cookie handler `getAll`/`setAll` shape, `getClaims()` warning, cache headers in v0.10.0): https://supabase.com/docs/guides/auth/server-side/creating-a-client — HIGH confidence (official)
- Supabase Docs — Auth server-side advanced guide (random-logout footgun): https://supabase.com/docs/guides/auth/server-side/advanced-guide — HIGH confidence
- Supabase Docs — Migration from auth-helpers to ssr: https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM — HIGH confidence
- Next.js Discussions — `cookies() should be awaited` with Next.js 14 Turbopack: https://github.com/vercel/next.js/discussions/81445 — MEDIUM confidence (active issue thread)
- Supabase realtime memory leak diagnosis: https://drdroid.io/stack-diagnosis/supabase-realtime-client-side-memory-leak — MEDIUM confidence
- Supabase Discussions — unsubscribing realtime broadcast in React 18: https://github.com/orgs/supabase/discussions/8573 — MEDIUM confidence
- n8n webhook idempotency patterns: https://medium.com/@Modexa/idempotent-webhook-retries-in-n8n-without-duplicates-8380273a95a2 — MEDIUM confidence
- n8n production webhook agent (idempotency, retry, DLQ): https://medium.com/@automation.labs/building-a-production-n8n-webhook-agent-idempotency-retry-dlq-ab00024bd39a — MEDIUM confidence
- n8n Community — preventing duplicate webhook executions: https://community.n8n.io/t/preventing-duplicate-webhook-executions-in-n8n-idempotency-gate-workflow/275249 — MEDIUM confidence
- n8n webhook race-condition known issue: https://github.com/n8n-io/n8n/issues/25066 — HIGH confidence (upstream issue)
- Webhook HMAC verification best practices (Hook0): https://documentation.hook0.com/tutorials/webhook-authentication — HIGH confidence
- Webhook security fundamentals (Hooklistener): https://www.hooklistener.com/learn/webhook-security-fundamentals — MEDIUM confidence
- HMAC + timing-safe compare 2026 guide: https://hookray.com/blog/webhook-signature-verification-2026 — MEDIUM confidence
- Approval fatigue (Encyclopedia of Agentic Coding Patterns): https://aipatternbook.com/approval-fatigue — MEDIUM confidence
- Human-in-the-loop, not rubber stamp: https://www.sethserver.com/ai/human-in-the-loop-not-human-as-rubber-stamp.html — MEDIUM confidence
- Review fatigue design pattern: https://ravipalwe.medium.com/review-fatigue-is-breaking-human-in-the-loop-ai-heres-the-design-pattern-that-fixes-it-044d0ab1dd12 — MEDIUM confidence
- Shadow-mode deployment validation: https://mljourney.com/shadow-mode-deployment-for-ml-model-testing/ — MEDIUM confidence
- Shadow deployment sample size considerations (clinical AI): https://nirmitee.io/blog/ab-testing-shadow-deployment-clinical-ai-validating-models-safely/ — MEDIUM confidence
- Next.js useOptimistic with Server Actions: https://dev.to/whoffagents/optimistic-updates-in-nextjs-14-useoptimistic-server-actions-and-automatic-rollback-5hbl — MEDIUM confidence
- Next.js useOptimistic revert issue: https://github.com/vercel/next.js/issues/49619 — HIGH confidence (Next.js issue tracker)
- Casa internal: `.planning/PROJECT.md` — HIGH confidence (project source of truth)
- Casa internal: `.planning/codebase/CONCERNS.md` — HIGH confidence (codebase audit dated 2026-05-14)

---
*Pitfalls research for: Casa Command Center — agent-integration milestone (May 15, 2026 cutover)*
*Researched: 2026-05-14*
