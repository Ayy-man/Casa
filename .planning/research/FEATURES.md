# Feature Research

**Domain:** AI-agent supervisor dashboard (single-tenant, single-operator)
**Researched:** 2026-05-14
**Confidence:** HIGH for category patterns (multiple converging sources: LangSmith,
OpenAI Operator, Lindy, Devin, Anthropic Computer Use, n8n, AI SDK 6); MEDIUM
for what specifically Carlos needs to "trust enough to fire the VA" (inferred
from trust-calibration literature + the operator-level signal in PROJECT.md).

## Frame

The relevant category is **agent supervision consoles**, not property management
software. Anti-references (Hostaway / Guesty / PriceLabs / Lodgify) optimize
for "manage 100 properties," which is the wrong UX center of gravity. The
right reference set:

- **LangSmith** — trace inspection, run annotation, human-in-loop feedback
- **OpenAI Operator / ChatGPT Agent** — approval gates on consequential actions,
  on-screen narration of what the agent is doing right now
- **Anthropic Claude Code** — "explicit permission before modifying files,"
  configurable autonomy spectrum, allow-lists, decisions ship from the human
- **Cognition Devin 2.0** — interactive plan-before-execute, fork/rollback,
  async handoff (start a task, leave, come back to review)
- **Lindy** — approval checkpoints baked in, dashboard tracks every action and
  every escalation
- **n8n execution log** — durable run history, retry-with-original-data,
  workflow versioning, debug-and-rerun
- **Vercel AI SDK 6** — `needsApproval` as a first-class flag, DevTools-style
  inspect-every-step pane, message metadata (model, token count, timestamp)
  attached to each turn

The unifying pattern: **the agent does the work; the human inspects, approves,
overrides, and (rarely) intervenes — at a tempo the human controls.** Casa is
a single-operator instance of that pattern, which sharpens the priorities: no
team-collaboration features, no role-based approval routing, no SLA
dashboards. Just one person who needs to read every meaningful decision
quickly and trust the system enough to stop reading every decision.

## Feature Landscape

### Table Stakes (must exist for shadow-mode trust to develop)

Features Carlos must have to credibly let the VA go on May 15. Missing any of
these and the dashboard feels like a black box he can't supervise.

| Feature | Why Expected | Complexity | Maps to | Notes |
|---------|--------------|------------|---------|-------|
| **Real agent decisions in `agent_logs`, not math-generated mocks** | Carlos cannot trust a number that the dashboard invented. Every decision he reads must be the actual decision the agent committed to. | HIGH | REQ-DATA-01, REQ-AGENT-01 | The single most important feature — without it nothing else matters. Pricing Agent is the integration validation target per PROJECT.md. |
| **Reasoning visible per decision (the "why")** | Every agent supervisor product (LangSmith, Operator, Devin, Lindy) exposes the reasoning chain. Without it, "approve / reject" is gambling. | MEDIUM | REQ-DATA-01 (`agent_logs` schema), REQ-AGENT-01..04 | Store `reasoning` text + `inputs_seen` JSON on each agent log row. Surface in exception cards and on the per-agent Decisions table. Casa's existing Pricing Agent page already has the slot. |
| **Source data visible per decision (what the agent saw)** | Distinct from reasoning. Carlos must be able to verify the inputs weren't garbage. Operator does on-screen narration; LangSmith shows the full trace including tool I/O. | MEDIUM | REQ-DATA-01 | For pricing: comp set + occupancy + events. For guest: inbound message + booking context + brand-voice guide retrieved from pgvector. For ops: checkout event + cleaner schedule. |
| **Exceptions, not decisions, surface to Home** | Surfacing every decision = noise. Surfacing only the ones requiring judgment = trustable signal. PROJECT.md core value: "resolve a day's exceptions in under 10 minutes." | MEDIUM | REQ-INT-02 (n8n notifies Casa); already partially in the demo skin | Existing 4-exception-card pattern is correct. Backend wiring is what's missing. |
| **Mode toggle (Shadow / Live) that actually gates dispatch** | Currently UI-only. Shadow mode is the rollout strategy the whole product depends on. The toggle must persist to the agent_config row and the n8n webhook handler must check it. | MEDIUM | REQ-AGENT-01 (Pricing Agent's mode toggle as the pattern) | Per-agent, not global. Different agents go autonomous at different times. |
| **Audit trail / decision history per agent** | "What did the Pricing Agent decide last week?" is a question Carlos will ask Monday morning every week. EU AI Act and NIST AI RMF treat this as compliance baseline. | MEDIUM | REQ-DATA-01, REQ-AGENT-01..04 | Existing Pricing Agent page already has "Recent Decisions" table. Extend to Guest/Ops/SOP via REQ-UI-01. Filter by date range, by outcome (approved/rejected/auto). |
| **Functional Undo on exception action toast** | Currently cosmetic per PROJECT.md. Undo lets Carlos take action quickly because the cost of being wrong drops. This is a trust-tempo multiplier. | MEDIUM | REQ-UI-03 | Time-boxed (5-10 sec). Reverses the Supabase write AND fires an n8n compensation webhook for actions already dispatched. Anthropic Claude Code, OpenAI Operator, and Lindy all have analogous "interrupt / take over" affordances. |
| **Action buttons that actually do something** | 13+ `console.log` stubs per PROJECT.md known issues. Until every Approve / Reject / Dispatch / Override hits Supabase and the right n8n webhook, the dashboard is theater. | HIGH | REQ-INT-03 | Across exception cards, claim sheets, pricing rows, cleaning dispatch, agent controls. Atomic: Supabase write + webhook fire + optimistic UI + rollback on n8n failure. |
| **Pause / kill switch per agent** | Every agent platform has this (Lindy "human approval checkpoints," Anthropic "explicit permission," Operator "interrupt at any point"). EU AI Act mandates it. Casa needs it because n8n is hosted externally; if a flow misbehaves, Carlos needs to stop it from his dashboard without logging into n8n cloud. | LOW-MEDIUM | New, but trivial extension to `agent_config` row | One-click "Pause this agent." Writes a flag. n8n flow checks the flag at start of each run and exits early. Lower priority if the Mode toggle already gates dispatch end-to-end. |
| **Realtime refresh on the dashboard** | If Carlos opens the dashboard at 9:01 and sees Friday's exceptions, he has to refresh. Every supervision console assumes live data. | MEDIUM | REQ-DATA-02 | Supabase Realtime subscriptions on `exceptions`, `agent_logs`, `cleanings`. 30-second polling is an acceptable fallback per PROJECT.md. |
| **Render hardcoded dates from current date + live counts** | "Today · Friday, May 1" rendered on a Thursday in October breaks the entire illusion. | LOW | REQ-UI-02 | Trivial; deserves its own ticket. |
| **Live agent activity feed (what's running right now)** | Operator's on-screen narration, Devin's "watch Devin work" stream, LangSmith's live traces. Casa needs a low-stakes version: "Pricing Agent is checking comp set for 14 properties. Guest Agent drafted a reply 30 sec ago." | MEDIUM | REQ-INT-02 | Existing right-rail "Agent activity" panel on Home is the slot. Needs realtime data behind it. |
| **Per-agent detail page parity** | Pricing Agent page is the gold standard per PROJECT.md. Guest, Ops, SOP currently render `<AgentSkeleton>`. Without parity Carlos can supervise Pricing but is blind on the agents that actually replace the VA. | HIGH | REQ-UI-01 | Reuse the Pricing Agent page's section structure verbatim. Different data slots, same scaffold. |

### Differentiators (Casa-specific competitive advantage)

Features that, if Casa nails them, make the dashboard feel premium and
purpose-built for Carlos's situation in a way LangSmith / Operator / Lindy
cannot. These align with PRODUCT.md and DESIGN.md's "editorial restraint"
positioning.

| Feature | Value Proposition | Complexity | Maps to | Notes |
|---------|-------------------|------------|---------|-------|
| **Cumulative validation alignment report (Shadow vs Live agreement %)** | The headline shadow-mode metric per the rollout literature: "agreement rate" — % of time the agent's recommendation matches what the human did. PROJECT.md already has the slot (Reports page, Cumulative tab). Wiring this to real `agent_logs` data is what flips it from demo to instrument. | MEDIUM | REQ-DATA-01 + extends Reports page | This is the single number that tells Carlos "the Pricing Agent can go autonomous next week" or "it can't yet." Critical for the per-agent shadow-vs-autonomous decision deferred in PROJECT.md. |
| **Per-decision reasoning audit (drift areas, comparison tables)** | Demo skin already has the slot on the Reports per-agent accordion. Wiring it means Carlos can see specifically WHERE the agent disagrees with him most (e.g., "agent priced 8% higher than Carlos approved on 4-bed Yaletown homes during NHL playoffs"). | MEDIUM | REQ-DATA-01 + extends Reports per-agent | Concrete drift areas, not vague accuracy %. This is where Casa beats generic LLMOps tools. |
| **Editorial restraint in the chrome** | DESIGN.md is binding: Playfair + Inter, ink-on-white, single blue accent, generous whitespace. Anti-references: SaaS dashboard tropes, dark-mode AI aesthetic. Already shipped. The differentiator is preserving this through the real-data wiring (don't let "loading..." spinners or error toasts break the editorial register). | LOW (mostly preservation) | All UI work | When data is loading, skeleton states must be editorial. When errors occur, the empty/error state must match the design system. Don't import shadcn defaults. |
| **Per-property knowledge base citations on Guest Agent decisions** | pgvector per-property KB is in the architecture. When the Guest Agent replies "the parking is in the back lane behind the building," it should show *which KB chunk it cited.* This is RAG-with-provenance and is rare in production agent UIs today. Lifts the Guest Agent from "AI assistant" to "concierge that quotes the right manual." | MEDIUM-HIGH | REQ-AGENT-03 + REQ-DATA-01 (pgvector schema) | Citation snippet appears inline with the draft reply. Click to view full KB chunk. Operator-style "this is what I saw" but for retrieved context. |
| **Decision provenance: prompt version + model version + agent_config version on every log row** | EU AI Act, NIST AI RMF, and every AI audit-trail vendor (MightyBot, FireTail, FloQast) treat this as table stakes for compliance. Most products don't ship it. Casa shipping it from day one is a moat once multi-tenant lands. | MEDIUM | REQ-DATA-01 (schema includes `prompt_version_id`, `model_version`, `config_version`) | "Prompt History" section on Pricing Agent page already has the slot. Extend the data layer so every log row pins these three. |
| **Async handoff: catch-up view on first open of day** | Devin's "start a task, go offline, come back to review" generalized to the daily supervision rhythm. When Carlos opens the dashboard at 7 AM Monday, the Home should be "since you last opened: 14 decisions auto-approved, 3 awaiting your judgment, here are the 3." Beats a blank exception list or a 14-item firehose. | MEDIUM | REQ-INT-02 + new "last_seen_at" on session | Differentiator because most agent dashboards assume continuous monitoring, not 5-10 opens/day per PROJECT.md context. |
| **Per-language guest message preview** | Guest Agent replies in EN / Mandarin / Japanese / French. The supervisor view shows the source language + Carlos's preferred display language (English) side-by-side so he can confirm the Japanese reply isn't tonally wrong without speaking Japanese. | MEDIUM | REQ-AGENT-03 | Distinctive to Casa's brand voice constraint. No LLMOps product has this because they aren't tied to a per-language brand voice spec. |
| **One-click "promote to autonomous" with eligibility check** | Tied to the validation report. When agreement % crosses 90% for two weeks, a "Ready to promote" pill appears next to the agent. One click flips Shadow → Live. The system records the promotion event with full audit context. | LOW-MEDIUM | REQ-AGENT-01 | Removes the "TBD per agent" anxiety in PROJECT.md by making the promotion gesture lightweight and reversible. |
| **Pricing Agent's "Property Breakdown" extended to operator-readable narrative** | Existing UI already has the section. The differentiator is making it readable in 30 seconds: "Yaletown 4BR up 4% (NHL game Thu), Kits 2BR flat, Pt Grey holds underpriced by 6% vs comp set." Editorial language, not a JSON dump. | MEDIUM | REQ-AGENT-01 | Aligns with PRODUCT.md "editorial, restrained, premium" voice. |
| **Workspace-name env branding (`NEXT_PUBLIC_WORKSPACE_NAME`)** | Future-proofing for Plan Insurance as a second HumanOS tenant. Not a Carlos-facing feature but it's the difference between "single-tenant tool" and "single-tenant deployment of a multi-tenant product." | LOW | Per PROJECT.md Active section | Already a stated constraint. Surface it: header logo + page title pull from env. |

### Anti-Features (deliberately NOT building)

Features that competitor / generic agent platforms have and that *seem* good
for a supervisor dashboard but would actively harm Casa's positioning or
Carlos's trust calibration.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Gamified "approval rate %" prominently displayed** | Looks impressive; every dashboard has a Big Number. | Trains Carlos to optimize for the number, not the outcome. Per-decision quality matters far more than aggregate approval rate. PROJECT.md core value is "surface exceptions, not vanity KPIs" — explicit anti-pattern. | The Cumulative validation alignment report (under Reports, not Home). Surfaces alignment as a tool for the promote-to-autonomous decision, not a vanity metric. |
| **Chat with the agent ("ask the Pricing Agent why")** | Familiar from ChatGPT UX, intuitive for non-technical operators. | Conversational interrogation is slow, non-reproducible, and lets the agent rationalize bad decisions post-hoc. Carlos needs deterministic reasoning audit (the `reasoning` field captured AT decision time), not a chat that may hallucinate justifications. | Reasoning is captured and stored at decision time. The detail view shows what the agent thought THEN, not what it can confabulate NOW. |
| **"Rate this decision" stars or thumbs** | LangSmith / Humanloop have it; standard LLMOps pattern for collecting eval data. | (a) Adds friction to an action Carlos takes 5-10 times per day; (b) reduces a rich Approve/Reject/Override gesture to a coarse star rating; (c) implies the dashboard's purpose is to train the model, when its purpose is to run the business. Casa is single-tenant, not a labeling factory. | The Approve / Reject / Override action *is* the feedback. Override carries a free-text note. That's enough signal. |
| **Multi-user approval routing / role-based permissions** | Enterprise dashboard table stakes. | Casa is single-tenant with three known users on a shared demo password (PROJECT.md). Adding routing logic now is premature abstraction. | Defer until real Supabase Auth migration (Phase 2). Until then, both users see the same view. |
| **Real-time WebSocket "agent is typing..." streaming UI** | LangSmith has streaming traces; feels modern. | Carlos opens the dashboard 5-10 times per day. He doesn't sit and watch the agent think. Streaming UI is overhead with no upside for his usage tempo. | Decision logs are written when the agent completes. The Live Activity panel updates via Supabase Realtime (or 30-sec poll). Good enough. |
| **Cost/token-usage dashboards prominently displayed** | Standard LLMOps view. Datadog, Langfuse, Traceloop all have it. | Casa runs through OpenRouter; pricing is n8n-side. Showing token spend on the supervisor dashboard either duplicates info from OpenRouter or surfaces a number Carlos can't act on. Worse, it trains him to optimize spend instead of judgment. | Surface token cost only on the Settings → API Status page as health info. Not on Home. |
| **A/B test framework for prompts** | Humanloop's selling point. Reasonable for product teams iterating on prompts. | Casa's agent prompts live in n8n, version-controlled there. The dashboard is not the prompt authoring environment. Building A/B infra duplicates n8n's job and creates two sources of truth. | Show prompt version on each decision. Prompt authoring stays in n8n. The Prompt History section on the Pricing Agent page already strikes the right balance. |
| **"Confidence score" on every decision** | Looks scientific; every AI demo shows a confidence number. | LLM-derived confidence scores are notoriously unreliable. Showing one to Carlos creates false trust calibration (high-confidence wrong answers feel safer to approve). | Don't surface a confidence number. Surface the reasoning + the source data. Let Carlos calibrate trust from substance, not a synthetic score. Trust-calibration literature backs this. |
| **Notifications matrix with 30 toggles** | Settings → Notifications already exists in the demo. Tempting to grow it. | Carlos opens the dashboard 5-10 times per day; he doesn't need granular push channels. PROJECT.md scope discipline: "substance beats polish until May 15." | Keep the existing notifications panel cosmetic. Wire push notifications only for the one signal Carlos truly needs out-of-band: SEV-1 exceptions (cleaner no-show 120min escalation, etc.). One channel, one signal class. |
| **"Approve all" / bulk-everything affordances on Home** | Power-user feature; saves time if there are many similar exceptions. | Bulk-approve on Home defeats the entire purpose of exception cards (each should warrant a judgment). Bulk-approve already exists on the Pricing page (correct: pricing recs are homogeneous and routinely bulk-approved). Don't replicate the affordance where it would corrode supervision discipline. | Per-card approve on Home. Bulk approve only on Pricing. |
| **Agent leaderboard / "best agent of the week"** | Gamification, looks playful. | Anti-pattern: agents aren't competing; they're tools. Conflicts with editorial restraint. Would be embarrassing in a stakeholder demo to Plan Insurance. | Just don't. |
| **Embedded chat history of guest conversations with sentiment indicators** | Hostaway / Guesty have it. | Anti-reference per PROJECT.md. Sentiment indicators are noise; the Guest Agent's escalation rules already flag the right messages. | The Bookings detail page guest conversation thread (already in demo) is correct. No sentiment overlays. |

## Feature Dependencies

```
REQ-DATA-01 (Supabase schema + seed)
    ├──required-for──> REQ-INT-01 (outbound n8n webhooks)
    ├──required-for──> REQ-INT-02 (inbound n8n webhooks)
    ├──required-for──> REQ-INT-03 (functional action buttons)
    ├──required-for──> REQ-AGENT-01 (Pricing wired)
    ├──required-for──> REQ-AGENT-02 (Ops wired)
    ├──required-for──> REQ-AGENT-03 (Guest wired)
    └──required-for──> REQ-AGENT-04 (SOP wired)

REQ-AGENT-01 (Pricing Agent backend)
    ├──validates──> the Casa <-> Supabase <-> n8n integration pattern
    └──required-before──> REQ-AGENT-02, REQ-AGENT-03 (pattern reuse)

REQ-INT-03 (functional action buttons)
    ├──requires──> REQ-INT-01 (webhooks must work)
    └──required-for──> REQ-UI-03 (Undo, which composes write + webhook)

REQ-UI-01 (Guest/Ops/SOP detail pages)
    └──requires──> REQ-DATA-01 + the relevant REQ-AGENT-0X
       (no point building the detail UI before there's real data to show)

REQ-DATA-02 (realtime refresh)
    └──enhances──> all the above (data layer can ship without it; once it's
       wired, the dashboard stops feeling stale)

Mode toggle persistence (sub-feature of REQ-AGENT-01)
    ├──required-for──> trustworthy shadow-mode rollout
    └──required-before──> any agent going Live

Reasoning + inputs on every agent_log row (sub-feature of REQ-DATA-01)
    ├──required-for──> Reports page real validation (currently mocked)
    └──required-for──> per-decision reasoning audit (differentiator)

REQ-UI-02 (rendered dates) ──independent──> everything else (can ship anytime)
```

### Dependency Notes

- **Pricing Agent first is correct:** PROJECT.md already decides this. Pricing
  has no Rachit-blocked external integrations, so it's fully buildable today
  and validates the entire Casa ↔ Supabase ↔ n8n pattern before the May 15
  critical-path agents (Guest, Ops).
- **Data layer is the gate on everything:** Without REQ-DATA-01, every other
  feature is theatrical. The mock-data → real-data boundary has no abstraction
  layer today (per CONCERNS.md mentioned in PROJECT.md), so the schema design
  needs an explicit query-module convention to replace the mock-data imports
  cleanly.
- **REQ-UI-01 cannot precede its agent backend:** Building the Guest Agent
  detail page UI before REQ-AGENT-03 produces another `<AgentSkeleton>`-class
  artifact with no real data to render. Order each agent's UI page right after
  its backend goes live.
- **Realtime is not a launch blocker:** 30-second polling is acceptable per
  PROJECT.md. Ship REQ-DATA-02 as polling first; upgrade to Supabase Realtime
  subscriptions when bandwidth allows.

## MVP Definition

### Launch With (by May 15 — Carlos lets VA go)

In priority order, mirroring PROJECT.md's build order:

- [ ] **REQ-DATA-01** — Real Supabase schema deployed, seeded, query modules
      replace mock imports. Every existing page renders from real data.
- [ ] **REQ-AGENT-01** — Pricing Agent fully wired end-to-end. Validates the
      Casa ↔ Supabase ↔ n8n pattern.
- [ ] **REQ-INT-01 + REQ-INT-02 + REQ-INT-03** — All webhooks bidirectional;
      every action button writes real data and fires real webhooks.
- [ ] **REQ-AGENT-02** — Ops Agent cleaner dispatch (checkout → Andrea →
      Carly → escalation). May 15 critical path. Mock the WhatsApp send until
      Rachit forwards Meta access.
- [ ] **REQ-AGENT-03** — Guest Agent (inbound replies, brand voice,
      multi-language, 12 booking touchpoints, sensitive escalation). May 15
      critical path: this is the agent that directly replaces the VA's work.
- [ ] **REQ-UI-01** (partial) — Guest and Ops agent detail pages at parity
      with Pricing Agent. SOP can stay as skeleton until post-May 15.
- [ ] **REQ-UI-02** — Hardcoded dates replaced with `new Date()` + live counts.
- [ ] **REQ-UI-03** — Functional Undo on action toasts.
- [ ] **Mode toggle persistence** — Shadow / Live actually gates dispatch
      per-agent. Subset of REQ-AGENT-01.
- [ ] **Reasoning + inputs on every `agent_logs` row** — Subset of REQ-DATA-01,
      required for the Reports page to mean anything.

### Add After Validation (post-May 15)

- [ ] **REQ-DATA-02** — Supabase Realtime subscriptions (upgrade from polling).
- [ ] **REQ-AGENT-04** — SOP Agent (listing-push). Lowest urgency per PROJECT.md.
- [ ] **REQ-UI-01 (SOP page)** — Replace SOP `<AgentSkeleton>`.
- [ ] **One-click "promote to autonomous" with eligibility check**.
- [ ] **Async handoff catch-up view on first open of day**.
- [ ] **Per-property KB citations on Guest Agent decisions** (pgvector
      provenance).
- [ ] **Per-agent pause/kill switch** — Beyond the mode toggle; immediate halt
      for a misbehaving flow.

### Future Consideration (v2+, multi-tenant pivot)

- [ ] **Real Supabase Auth + RLS** — Phase 2, before real-user cutover.
- [ ] **Multi-tenant abstraction (Plan Insurance instance)** — Future
      milestone per PROJECT.md.
- [ ] **Per-decision compliance export** (NIST AI RMF / EU AI Act format) —
      Only if a regulated tenant requires it.
- [ ] **Cross-agent dependency visualization** — When Casa runs >4 agents.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Maps to |
|---------|------------|---------------------|----------|---------|
| Real `agent_logs` data layer | HIGH | HIGH | P1 | REQ-DATA-01 |
| Pricing Agent wired end-to-end | HIGH | HIGH | P1 | REQ-AGENT-01 |
| Outbound + inbound n8n integration | HIGH | MEDIUM | P1 | REQ-INT-01/02 |
| Functional action buttons | HIGH | MEDIUM | P1 | REQ-INT-03 |
| Ops Agent cleaner dispatch | HIGH | HIGH | P1 | REQ-AGENT-02 |
| Guest Agent (inbound + touchpoints) | HIGH | HIGH | P1 | REQ-AGENT-03 |
| Reasoning + inputs on every log row | HIGH | LOW | P1 | sub of REQ-DATA-01 |
| Mode toggle persistence (per-agent) | HIGH | LOW | P1 | sub of REQ-AGENT-01 |
| Functional Undo | MEDIUM | LOW | P1 | REQ-UI-03 |
| Rendered current date + live counts | LOW | LOW | P1 | REQ-UI-02 |
| Guest + Ops detail pages at Pricing parity | HIGH | MEDIUM | P1 | REQ-UI-01 (partial) |
| Cumulative validation alignment (real data) | HIGH | MEDIUM | P1 | extends Reports |
| Per-decision drift areas (real data) | MEDIUM | MEDIUM | P2 | extends Reports per-agent |
| Realtime refresh (subscriptions) | MEDIUM | MEDIUM | P2 | REQ-DATA-02 |
| SOP Agent wired | LOW | MEDIUM | P2 | REQ-AGENT-04 |
| SOP detail page | LOW | MEDIUM | P2 | REQ-UI-01 (SOP slice) |
| Async handoff "since you last opened" | MEDIUM | MEDIUM | P2 | new |
| Per-property KB citation provenance | MEDIUM | MEDIUM | P2 | new, on REQ-AGENT-03 |
| Pause/kill per agent | MEDIUM | LOW | P2 | new |
| Promote-to-autonomous eligibility pill | MEDIUM | LOW | P2 | new |
| Per-language guest message preview | MEDIUM | MEDIUM | P2 | new, on REQ-AGENT-03 |
| Real Supabase Auth + RLS | HIGH (eventually) | HIGH | P3 | Phase 2 |
| Multi-tenant tenant abstraction | HIGH (future) | HIGH | P3 | future milestone |
| Compliance export (NIST/EU AI Act format) | LOW (today) | MEDIUM | P3 | future |

**Priority key:**
- **P1:** Must have for May 15 — Carlos cannot let VA go without it
- **P2:** Should have, ship post-May 15 in the trust-deepening phase
- **P3:** Future, tied to multi-tenant or compliance milestones

## Competitor Feature Analysis

The cross-product comparison clarifies where Casa is parity vs differentiated.

| Feature | LangSmith | OpenAI Operator | Lindy | Devin 2.0 | n8n | Casa's Approach |
|---------|-----------|-----------------|-------|-----------|-----|-----------------|
| Trace inspection per decision | Yes (full trace tree) | Yes (on-screen narration) | Yes (action log) | Yes (interactive plan) | Yes (execution log) | **Reasoning + inputs on every `agent_logs` row, surfaced in the decision detail view. No streaming trace tree — Carlos doesn't need that depth.** |
| Approval gates | Optional (eval annotation) | Mandatory on sensitive sites | Per-action checkpoints | Plan-then-go | N/A | **Mode toggle gates dispatch per-agent. Exception cards as the approval surface for one-off judgments.** |
| Human feedback capture | Stars + free text | Implicit (interrupt/take over) | Approve / decline | Edit and continue | Manual edit + rerun | **Approve / Reject / Override + free-text note. No star ratings.** |
| Prompt versioning | Yes (LangSmith Hub) | Internal | Internal | Internal | Workflow history | **Prompt version pinned on every decision row. Authoring stays in n8n.** |
| Cost / token tracking | Yes (prominent) | No (consumer) | Yes (billing) | Yes | No | **Settings → API Status only. Not on Home.** |
| Realtime live agent activity | Yes (streaming) | Yes (narration) | Yes (timeline) | Yes (watch Devin) | Execution list polling | **Right-rail Agent Activity panel via Supabase Realtime or 30-sec poll. Not live streaming.** |
| Undo / reverse action | No | Take-over | No | Fork/rollback | Re-run with old data | **Time-boxed Undo on action toast. Reverses Supabase write + fires n8n compensation.** |
| Multi-user / RBAC | Yes | No | Yes | Yes | Yes | **Deferred to Phase 2. Single-tenant, three known users on shared creds.** |
| Per-agent mode toggle | N/A | Implicit | Yes (active/paused) | Implicit (start/stop) | Activate/deactivate | **Per-agent Shadow / Live, persisted, gates dispatch.** |
| Alignment / agreement % metric | Yes (eval) | No | No | No | No | **Cumulative validation alignment report — Casa-specific, central to the rollout strategy.** |
| Audit trail (compliance-grade) | Yes (400-day retention) | Limited | Yes | Yes | Yes | **Every decision row pins prompt version, model version, config version. Exportable later if needed.** |
| Editorial / restrained design | No (developer tool) | Functional | Bright SaaS | Developer tool | Functional | **Casa's moat. Playfair + Inter, ink-on-white, single blue accent. Preserved through real-data wiring.** |

## Trust-Building Sequence (How Carlos Gets to "VA can go")

This is the read-through of the feature set against the operator-trust
literature and PROJECT.md context. Use it to sanity-check the roadmap order.

1. **Substrate (Day 1):** Real `agent_logs` data + reasoning + inputs visible.
   Carlos can read what the agent decided and why. Demo theater ends.
2. **Validate one (Day 1-7):** Pricing Agent runs in Shadow. Carlos reads
   every decision. Cumulative alignment ticks up. He starts trusting the
   pattern.
3. **Add the May 15 critical-path agents (Day 7-30):** Guest + Ops wired.
   Both run in Shadow at first. Exception escalation works. Action buttons
   actually act. Carlos starts approving in bulk where the pattern is clear.
4. **Trust calibration tightens (Day 30+):** Validation report shows
   agreement % per agent. Carlos sees specifically where each agent drifts
   from him. He overrides less.
5. **Promote (Day 45-60):** Mode toggle flipped per agent as agreement
   crosses a threshold. The agent goes Live for the routine cases; exceptions
   still surface. VA is gone. Carlos opens dashboard 5-10x/day, resolves in
   under 10 minutes per PROJECT.md core value.

The features above are exactly the ones this trust sequence requires.
Anything that doesn't serve this sequence is in the Anti-Features table.

## Sources

- [LangSmith Platform overview](https://www.langchain.com/langsmith-platform)
- [LangSmith Human Feedback / Annotation](https://apxml.com/courses/langchain-production-llm/chapter-5-evaluation-monitoring-observability/human-feedback-annotation)
- [OpenAI Operator launch announcement](https://openai.com/index/introducing-operator/)
- [OpenAI Agents SDK — Human-in-the-Loop](https://openai.github.io/openai-agents-python/human_in_the_loop/)
- [Anthropic Claude Code product page](https://www.anthropic.com/product/claude-code)
- [Cognition Devin 2.0 announcement](https://cognition.ai/blog/devin-2)
- [Lindy AI platform](https://www.lindy.ai/)
- [n8n Workflow-level Executions docs](https://docs.n8n.io/workflows/executions/single-workflow-executions/)
- [n8n Debug and re-run past executions](https://docs.n8n.io/workflows/executions/debug/)
- [Humanloop platform](https://humanloop.com/home)
- [Vercel AI SDK 6 — needsApproval and DevTools](https://vercel.com/blog/ai-sdk-6)
- [Shadow Mode Rollouts for AI Agents — Brightlume](https://brightlume.ai/blog/shadow-mode-rollouts-ai-agents-pilot-production)
- [Post-Launch Reviews: Shadow Mode, Gradual Autonomy — Cobbai](https://cobbai.com/blog/ai-rollout-post-launch-review)
- [Designing for Agentic AI: UX Patterns for Control, Consent, Accountability — Smashing Magazine](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/)
- [Trust Calibration for AI Software Builders — Fly.io](https://fly.io/blog/trust-calibration-for-ai-software-builders/)
- [AI Agent Kill Switches — Pedowitz Group](https://www.pedowitzgroup.com/ai-agent-kill-switches-practical-safeguards-that-work)
- [KILLSWITCH.md Standard](https://killswitch.md/)
- [AI Audit Trail for Compliance — FireTail](https://www.firetail.ai/complete-ai-audit-trail)
- [Transparency and Explainability in Agentic AI — Token Security](https://www.token.security/blog/transparency-and-explainability-in-agentic-ai-decision-making)
- Casa internal: `.planning/PROJECT.md` (Core Value, Validated, Active sections)
- Casa internal: `.planning/codebase/ARCHITECTURE.md` (existing demo skin and slots)
- Casa internal: PRODUCT.md and DESIGN.md (editorial brand voice constraints)

---
*Feature research for: AI-agent supervisor dashboard (Casa Command Center, single-tenant)*
*Researched: 2026-05-14*
