/**
 * Agent-appropriate mock data for the Guest / Ops / SOP detail pages
 * (`/vault/agent-logs/{guest,ops,sop}`). Phase 1 mirrors the 9-section
 * STRUCTURE of the relocated Pricing Agent detail page — full functional
 * parity is a later phase (Claude's Discretion per 01-CONTEXT.md).
 *
 * All strings render as plain React text children — no
 * dangerouslySetInnerHTML anywhere (threat T-01-13: mitigate).
 */

export type AgentDetailKpi = {
  l: string;
  v: string;
  trend: string;
  spark: number[] | null;
};

export type AgentDetailRow = {
  time: string;
  property: string;
  action: string;
  status: "Logged" | "Sent" | "Flagged";
  cost: string;
};

export type AgentDetailConfig = { key: string; value: string };

export type AgentDetailPromptVersion = {
  v: string;
  when: string;
  by: string;
  note: string;
  diff: string;
};

export type AgentDetail = {
  key: "guest" | "ops" | "sop";
  name: string;
  eyebrow: string;
  tagline: string;
  mode: "Shadow" | "Live";
  lastAction: string;
  kpis: AgentDetailKpi[];
  activity: AgentDetailRow[];
  config: { left: AgentDetailConfig[]; right: AgentDetailConfig[] };
  performance: { p50: string; p95: string; p99: string; successSeries: number[] };
  decisions: AgentDetailRow[];
  prompts: AgentDetailPromptVersion[];
  validationNote: string;
  configFooter: string;
};

const guest: AgentDetail = {
  key: "guest",
  name: "Guest Agent",
  eyebrow: "Agents",
  tagline:
    "Drafts replies to guest inquiries within minutes. Escalates anything sensitive.",
  mode: "Shadow",
  lastAction: "6 min ago",
  kpis: [
    { l: "Actions Today", v: "47", trend: "+9 vs avg", spark: [22, 31, 28, 41, 38, 44, 47] },
    { l: "Actions This Week", v: "284", trend: "steady", spark: null },
    { l: "Success Rate", v: "94%", trend: "+1%", spark: [90, 91, 93, 92, 94, 93, 94] },
    { l: "Escalation Rate", v: "4%", trend: "-1%", spark: [7, 6, 5, 5, 4, 5, 4] },
    { l: "Tokens MTD", v: "318.6k", trend: "on plan", spark: [40, 78, 120, 168, 220, 270, 319] },
    { l: "Cost MTD", v: "$1.42", trend: "on plan", spark: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.42] },
  ],
  activity: [
    { time: "09:48", property: "788 Hamilton St · Yaletown", action: "Drafted reply re: parking access", status: "Sent", cost: "0.014" },
    { time: "09:21", property: "1818 Robson St · West End", action: "Escalated noise complaint to operator", status: "Flagged", cost: "0.019" },
    { time: "08:55", property: "989 Nelson St · Downtown", action: "Sent early check-in confirmation", status: "Sent", cost: "0.011" },
    { time: "08:30", property: "2255 Davie St · West End", action: "Drafted reply re: late checkout", status: "Logged", cost: "0.013" },
    { time: "08:02", property: "601 Beach Crescent · Yaletown", action: "Logged guest sentiment scan", status: "Logged", cost: "0.009" },
    { time: "07:40", property: "1233 W Cordova St · Coal Harbour", action: "Drafted reply re: wifi password", status: "Sent", cost: "0.010" },
  ],
  config: {
    left: [
      { key: "Model", value: "Claude Sonnet 4.6" },
      { key: "Prompt version", value: "v2.1 · 3 days ago" },
      { key: "Triggers", value: "Inbound message webhook (Hostaway + WhatsApp)" },
    ],
    right: [
      { key: "Tools", value: "get_thread, get_booking, draft_reply, escalate, create_exception" },
      { key: "Channels", value: "Airbnb, Vrbo, Booking.com, Direct, WhatsApp" },
      { key: "Owner", value: "Ayman · Engineering" },
    ],
  },
  performance: {
    p50: "3.1 s",
    p95: "8.4 s",
    p99: "14.2 s",
    successSeries: [90, 91, 92, 91, 93, 92, 94, 93, 94, 93, 94, 94, 95, 94],
  },
  decisions: [
    { time: "Today, 09:48", property: "788 Hamilton St", action: "Reply drafted — parking access question answered from house guide", status: "Sent", cost: "0.014" },
    { time: "Today, 09:21", property: "1818 Robson St", action: "Escalated — refund request flagged for operator judgement", status: "Flagged", cost: "0.019" },
    { time: "Today, 08:30", property: "2255 Davie St", action: "Reply drafted — late checkout offered, pending operator approval", status: "Logged", cost: "0.013" },
    { time: "Yesterday, 18:05", property: "3280 W Broadway", action: "Reply drafted — owner-relayed maintenance update sent to guest", status: "Sent", cost: "0.012" },
    { time: "Yesterday, 16:22", property: "1633 Quebec St", action: "Reply drafted — amenity question answered", status: "Sent", cost: "0.011" },
  ],
  prompts: [
    { v: "v2.1", when: "3 days ago", by: "Ayman", note: "Tightened escalation triggers for refund and safety language.", diff: "+9 lines, -3 lines" },
    { v: "v2.0", when: "9 days ago", by: "Ayman", note: "Rewrote tone guide for restrained, operator-grade voice.", diff: "+22 lines, -14 lines" },
    { v: "v1.0", when: "Week 1 launch", by: "Ayman", note: "Initial prompt.", diff: "Initial" },
  ],
  validationNote:
    "Shadow-mode drafts are logged for operator review and compared against the reply the operator actually sends.",
  configFooter:
    "Configuration last modified 3 days ago by Ayman · Runs on inbound message events.",
};

const ops: AgentDetail = {
  key: "ops",
  name: "Ops Agent",
  eyebrow: "Agents",
  tagline: "Coordinates cleaning calendar, supply runs, and small repairs.",
  mode: "Live",
  lastAction: "34 min ago",
  kpis: [
    { l: "Actions Today", v: "12", trend: "on plan", spark: [9, 11, 8, 13, 7, 10, 12] },
    { l: "Actions This Week", v: "78", trend: "steady", spark: null },
    { l: "Success Rate", v: "100%", trend: "stable", spark: [98, 99, 100, 99, 100, 100, 100] },
    { l: "Exception Rate", v: "8%", trend: "-2%", spark: [12, 11, 10, 9, 9, 8, 8] },
    { l: "Tokens MTD", v: "64.8k", trend: "on plan", spark: [8, 16, 25, 34, 44, 55, 65] },
    { l: "Cost MTD", v: "$0.31", trend: "on plan", spark: [0.04, 0.09, 0.14, 0.19, 0.24, 0.28, 0.31] },
  ],
  activity: [
    { time: "09:34", property: "601 Beach Crescent · Yaletown", action: "Confirmed Carly's turnover", status: "Sent", cost: "0.006" },
    { time: "09:05", property: "4900 Joyce St · East Van", action: "Dispatched backup cleaner (Andrea L.)", status: "Flagged", cost: "0.008" },
    { time: "08:38", property: "1455 Howe St · Yaletown", action: "Scheduled supply run for linens", status: "Logged", cost: "0.005" },
    { time: "08:10", property: "2640 Yew St · Kitsilano", action: "Logged maintenance follow-up", status: "Logged", cost: "0.004" },
    { time: "07:46", property: "5825 Cambie St · Cambie", action: "Confirmed Sabrina's turnover", status: "Sent", cost: "0.006" },
    { time: "07:20", property: "1120 Hamilton St · Yaletown", action: "Logged checklist completion", status: "Logged", cost: "0.004" },
  ],
  config: {
    left: [
      { key: "Model", value: "Claude Sonnet 4.6" },
      { key: "Prompt version", value: "v1.4 · 6 days ago" },
      { key: "Triggers", value: "Checkout event + daily 7:00 AM PT calendar scan" },
    ],
    right: [
      { key: "Tools", value: "get_calendar, dispatch_cleaner, send_whatsapp, schedule_supply, create_exception" },
      { key: "Cleaner roster", value: "Andrea, Carly, Sabrina, Juli, Stana, Andrea L." },
      { key: "Owner", value: "Ayman · Engineering" },
    ],
  },
  performance: {
    p50: "2.4 s",
    p95: "6.1 s",
    p99: "9.8 s",
    successSeries: [98, 99, 99, 100, 99, 100, 100, 99, 100, 100, 100, 100, 100, 100],
  },
  decisions: [
    { time: "Today, 09:34", property: "601 Beach Crescent", action: "Turnover confirmed — Carly acknowledged WhatsApp dispatch", status: "Sent", cost: "0.006" },
    { time: "Today, 09:05", property: "4900 Joyce St", action: "Backup dispatched — Stana unreachable, reassigned to Andrea L.", status: "Flagged", cost: "0.008" },
    { time: "Today, 08:38", property: "1455 Howe St", action: "Supply run scheduled — linen restock for the week", status: "Logged", cost: "0.005" },
    { time: "Yesterday, 15:40", property: "2640 Yew St", action: "Maintenance follow-up logged — heat pump service booked", status: "Logged", cost: "0.004" },
    { time: "Yesterday, 11:18", property: "5825 Cambie St", action: "Turnover confirmed — Sabrina acknowledged dispatch", status: "Sent", cost: "0.006" },
  ],
  prompts: [
    { v: "v1.4", when: "6 days ago", by: "Ayman", note: "Added backup-cleaner reassignment after a 20-minute no-response window.", diff: "+11 lines, -2 lines" },
    { v: "v1.2", when: "12 days ago", by: "Ayman", note: "Added supply-run scheduling for low-stock signals.", diff: "+8 lines, -1 line" },
    { v: "v1.0", when: "Week 1 launch", by: "Ayman", note: "Initial prompt.", diff: "Initial" },
  ],
  validationNote:
    "Ops Agent runs Live — dispatch actions are pushed to cleaners directly. Decisions are logged for audit.",
  configFooter:
    "Configuration last modified 6 days ago by Ayman · Runs on checkout events.",
};

const sop: AgentDetail = {
  key: "sop",
  name: "SOP Agent",
  eyebrow: "Agents",
  tagline:
    "Keeps every property's playbook current. Flags drift from Casa standards.",
  mode: "Live",
  lastAction: "1 hr ago",
  kpis: [
    { l: "Actions Today", v: "0", trend: "no drift", spark: [1, 0, 2, 0, 0, 1, 0] },
    { l: "Actions This Week", v: "6", trend: "low", spark: null },
    { l: "Success Rate", v: "100%", trend: "stable", spark: [100, 100, 100, 100, 100, 100, 100] },
    { l: "Drift Rate", v: "0%", trend: "stable", spark: [2, 1, 1, 0, 0, 0, 0] },
    { l: "Tokens MTD", v: "12.1k", trend: "on plan", spark: [1, 3, 5, 7, 9, 11, 12] },
    { l: "Cost MTD", v: "$0.00", trend: "on plan", spark: [0, 0, 0, 0, 0, 0, 0] },
  ],
  activity: [
    { time: "08:50", property: "1455 Howe St · Yaletown", action: "Updated lockbox code in playbook", status: "Logged", cost: "0.003" },
    { time: "Yesterday, 16:12", property: "989 Nelson St · Downtown", action: "Audited listing detail against Casa standard", status: "Logged", cost: "0.002" },
    { time: "Yesterday, 11:30", property: "3280 W Broadway · Point Grey", action: "Flagged drift — house-rules text out of date", status: "Flagged", cost: "0.003" },
    { time: "May 18, 09:05", property: "601 Beach Crescent · Yaletown", action: "Refreshed check-in instructions", status: "Logged", cost: "0.002" },
    { time: "May 17, 14:48", property: "2255 Davie St · West End", action: "Logged playbook completeness audit", status: "Logged", cost: "0.002" },
  ],
  config: {
    left: [
      { key: "Model", value: "Claude Sonnet 4.6" },
      { key: "Prompt version", value: "v1.1 · 10 days ago" },
      { key: "Triggers", value: "Weekly Sun 5:00 AM PT playbook audit" },
    ],
    right: [
      { key: "Tools", value: "get_playbook, get_listing, compare_standard, update_playbook, create_exception" },
      { key: "Standard set", value: "Casa property playbook v3 (binding)" },
      { key: "Owner", value: "Ayman · Engineering" },
    ],
  },
  performance: {
    p50: "5.0 s",
    p95: "12.6 s",
    p99: "19.1 s",
    successSeries: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  },
  decisions: [
    { time: "Today, 08:50", property: "1455 Howe St", action: "Playbook updated — new lockbox code synced to all channels", status: "Logged", cost: "0.003" },
    { time: "Yesterday, 11:30", property: "3280 W Broadway", action: "Drift flagged — house-rules text differs from Casa standard", status: "Flagged", cost: "0.003" },
    { time: "May 18, 09:05", property: "601 Beach Crescent", action: "Check-in instructions refreshed against current standard", status: "Logged", cost: "0.002" },
    { time: "May 17, 14:48", property: "2255 Davie St", action: "Playbook completeness audit logged — no drift detected", status: "Logged", cost: "0.002" },
  ],
  prompts: [
    { v: "v1.1", when: "10 days ago", by: "Ayman", note: "Added channel-listing drift detection alongside playbook checks.", diff: "+14 lines, -2 lines" },
    { v: "v1.0", when: "Week 1 launch", by: "Ayman", note: "Initial prompt.", diff: "Initial" },
  ],
  validationNote:
    "SOP Agent runs Live — playbook updates are applied directly. Drift flags are logged for operator review.",
  configFooter:
    "Configuration last modified 10 days ago by Ayman · Runs on the weekly audit schedule.",
};

export const AGENT_DETAILS: Record<"guest" | "ops" | "sop", AgentDetail> = {
  guest,
  ops,
  sop,
};

export const getAgentDetail = (
  key: string
): AgentDetail | undefined =>
  key === "guest" || key === "ops" || key === "sop"
    ? AGENT_DETAILS[key]
    : undefined;
