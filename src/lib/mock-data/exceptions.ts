export type Urgency = "Critical" | "High" | "Medium" | "Low";

export type ExceptionItem = {
  id: number;
  type: string;
  typeLabel: string;
  urgency: Urgency;
  agent: string;
  property: string;
  summary: string;
  timeAgo: string;
  actions: string[];
};

export const EXCEPTIONS: ExceptionItem[] = [
  {
    id: 1,
    type: "guest_complaint",
    typeLabel: "Guest Complaint",
    urgency: "Critical",
    agent: "Guest Agent",
    property: "1455 Howe St · Yaletown 2BR",
    summary: "Guest reports broken AC, 32°C inside. Demands resolution or refund.",
    timeAgo: "8 min ago",
    actions: ["Approve Resolution", "Call Guest", "Assign Contractor"],
  },
  {
    id: 2,
    type: "cleaner_no_response",
    typeLabel: "Cleaner No-Response",
    urgency: "High",
    agent: "Ops Agent",
    property: "989 Nelson St · Downtown Studio",
    summary:
      "Cleaner Sabrina hasn’t confirmed dispatch 2hr after WhatsApp sent. Checkout was at 11am.",
    timeAgo: "23 min ago",
    actions: ["Call Cleaner", "Dispatch Backup", "Resolve"],
  },
  {
    id: 3,
    type: "claims_draft",
    typeLabel: "Claim Drafted",
    urgency: "Medium",
    agent: "Ops Agent",
    property: "3280 W Broadway · Pt Grey 3BR",
    summary:
      "Damage claim drafted: scratched hardwood floor. Estimated cost $480.",
    timeAgo: "1 hr ago",
    actions: ["Approve Claim", "Edit", "Reject"],
  },
  {
    id: 4,
    type: "pricing_alert",
    typeLabel: "Weekly Pricing Recs",
    urgency: "Low",
    agent: "Pricing Agent",
    property: "Multiple properties (8)",
    summary:
      "Weekly recommendations ready. 8 properties suggested for rate changes >5%.",
    timeAgo: "Today, 6:00 AM",
    actions: ["Review All", "Snooze", "Dismiss"],
  },
];

export const URGENCY_RANK: Record<Urgency, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const AGENT_ACTIVITY = [
  { agent: "Pricing", text: "Repriced 18 listings for week of May 4", time: "2 min ago" },
  { agent: "Guest", text: "Drafted reply to Wong (1455 Howe) re: parking", time: "11 min ago" },
  { agent: "Ops", text: "Confirmed turnover at 3280 W Broadway", time: "34 min ago" },
  { agent: "SOP", text: "Updated lockbox code for 601 Beach Cres.", time: "1 hr ago" },
  { agent: "Pricing", text: "Flagged 8 properties for >5% weekly change", time: "Today, 6:00 AM" },
];
