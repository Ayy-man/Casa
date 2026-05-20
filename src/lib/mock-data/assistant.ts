export type AssistantRole = "owner" | "operations";

/** A role-aware suggested prompt chip and its canned demo response. */
export type SuggestedPrompt = {
  role: AssistantRole;
  prompt: string;
  response: string;
};

/** A single turn in the seeded Assistant conversation history. */
export type ChatTurn = {
  role: AssistantRole;
  speaker: "user" | "assistant";
  text: string;
};

/**
 * Role-aware Assistant greeting bubble copy. Verbatim from REDESIGN-BRIEF.md.
 */
export const ASSISTANT_GREETINGS: Record<AssistantRole, string> = {
  owner:
    "Hey Carlos — I have access to all your property data, bookings, financials, and agent activity. Ask me anything.",
  operations:
    "Hey Denika — I can pull up turnovers, cleaner activity, bookings, or anything else in operations. What do you need?",
};

/**
 * The 8 suggested-prompt chips — 4 per role. The three brief-locked examples
 * ("Which properties are underperforming?", "What's our occupancy this
 * month?", "Show me today's turnovers") carry their copy verbatim; the
 * remaining five have narrative responses consistent with the mock data.
 * Modeled on the flat-array shape of agents.ts `PROMPT_VERSIONS`.
 */
export const ASSISTANT_PROMPTS: SuggestedPrompt[] = [
  {
    role: "owner",
    prompt: "Which properties are underperforming?",
    response:
      "Three properties are 20%+ below portfolio average MTD: 1233 W Cordova (Coal Harbour, -24%), 2592 W Broadway (West End, -18%), 3119 Hastings (West End, -16%). Want me to flag these as exception cards?",
  },
  {
    role: "owner",
    prompt: "What's our occupancy this month?",
    response:
      "Portfolio occupancy MTD is 76% — up from 71% in October. Best: 1455 Howe (Yaletown, 94%). Lowest: 1233 W Cordova (Coal Harbour, 58%).",
  },
  {
    role: "owner",
    prompt: "Show me November revenue",
    response:
      "November portfolio revenue was $118,400 — down 14% from October's $137,900. The drop is seasonal: occupancy fell from 85% to 72% as winter demand softened. Net payout to owners was $79,600 across the month.",
  },
  {
    role: "owner",
    prompt: "Compare Q1 vs Q2",
    response:
      "Q1 (Jan–Mar) brought in $345,400 in revenue at 73% average occupancy. Q2 so far (Apr–May 20) is at $267,080 and trending stronger — 79% occupancy in April, the best month of the year. If June holds, Q2 will clear Q1 on both revenue and net.",
  },
  {
    role: "operations",
    prompt: "Show me today's turnovers",
    response:
      "Seven cleanings scheduled today. Three completed, two in progress, one dispatched, one waiting on Andrea's response (60min mark).",
  },
  {
    role: "operations",
    prompt: "Which cleanings are running late?",
    response:
      "One turnover is at risk: Andrea hasn't acknowledged the 1455 Howe St dispatch sent two hours ago, and the next guest checks in at 3:00 PM. The Langley team's East Van turnover (4900 Joyce St) is also unconfirmed — Stana is 90 minutes out. Everything else is on schedule.",
  },
  {
    role: "operations",
    prompt: "Booking velocity this week",
    response:
      "14 new bookings in the last 7 days, up from 11 the week prior. Airbnb drove 8, Vrbo 4, Direct 2. Yaletown and the West End are absorbing most of the demand; the two units in maintenance are the only ones with open gaps.",
  },
  {
    role: "operations",
    prompt: "Recent guest complaints by property",
    response:
      "Three open guest issues right now: 989 Nelson St (no hot water, critical — plumber being dispatched), 1818 Robson St (late-night noise, refund requested), and 601 Beach Crescent (heat pump fault, HVAC tech scheduled). No other properties have negative sentiment in the last 48 hours.",
  },
];

/**
 * Prompt-text → canned-response lookup. Keys are the exact `prompt` strings
 * from ASSISTANT_PROMPTS so the Assistant surface can resolve a chip click or
 * an exact-match typed query to a response.
 */
export const ASSISTANT_RESPONSES: Record<string, string> =
  Object.fromEntries(ASSISTANT_PROMPTS.map((p) => [p.prompt, p.response]));

/** The fallback reply when a typed query has no canned match (Phase 1 demo). */
export const ASSISTANT_FALLBACK =
  "I can't answer that from the demo data yet — live answers arrive once the Assistant is wired to the agents. Try one of the suggested prompts above.";

/** Suggested-prompt chips for a given role. */
export const promptsForRole = (role: AssistantRole): SuggestedPrompt[] =>
  ASSISTANT_PROMPTS.filter((p) => p.role === role);

/** Resolve a prompt to its canned response, or the fallback if unmatched. */
export const getAssistantResponse = (prompt: string): string =>
  ASSISTANT_RESPONSES[prompt.trim()] ?? ASSISTANT_FALLBACK;

/**
 * Seeded conversation history per role — gives the Assistant surface a
 * non-empty thread on first load for the Phase 1 demo.
 */
export const ASSISTANT_HISTORY: ChatTurn[] = [
  { role: "owner", speaker: "user", text: "What's our occupancy this month?" },
  {
    role: "owner",
    speaker: "assistant",
    text:
      "Portfolio occupancy MTD is 76% — up from 71% in October. Best: 1455 Howe (Yaletown, 94%). Lowest: 1233 W Cordova (Coal Harbour, 58%).",
  },
  { role: "operations", speaker: "user", text: "Show me today's turnovers" },
  {
    role: "operations",
    speaker: "assistant",
    text:
      "Seven cleanings scheduled today. Three completed, two in progress, one dispatched, one waiting on Andrea's response (60min mark).",
  },
];

/** Seeded conversation for a given role. */
export const historyForRole = (role: AssistantRole): ChatTurn[] =>
  ASSISTANT_HISTORY.filter((t) => t.role === role);
