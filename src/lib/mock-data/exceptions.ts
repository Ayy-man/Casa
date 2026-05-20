export type Urgency = "Critical" | "High" | "Medium" | "Low";

/**
 * The 8 exception categories. Drives the category pill colour quartet and the
 * per-category action verbs the Exception Board renders. See 01-UI-SPEC.md
 * "8 Exception-Category color quartets".
 */
export type ExceptionCategory =
  | "Guest"
  | "Cleaner"
  | "Pricing"
  | "Maintenance"
  | "Owner"
  | "Revenue"
  | "Pipeline"
  | "Compliance";

export type ExceptionItem = {
  id: number;
  /** Machine type — drives per-category action verbs; `pricing_week` is the portfolio mega-card. */
  type: string;
  typeLabel: string;
  urgency: Urgency;
  /** The 8-value category union — drives the category pill colour quartet. */
  category: ExceptionCategory;
  agent: string;
  property: string;
  /** Vancouver neighborhood the property sits in (or "Portfolio-wide" for mega-cards). */
  neighborhood: string;
  summary: string;
  /** The italic `Suggested:` block body — the recommended operator action. */
  suggested: string;
  /** Source attribution footer, e.g. "Guest Agent · BK-2847". */
  source: string;
  /** ISO timestamp. The Exception Board computes time-ago with date-fns/formatDistanceToNow. */
  createdAt: string;
  /**
   * Legacy human time-ago string. `createdAt` is the source of truth — the
   * redesigned Exception Board (slice 03) derives time-ago from it via
   * date-fns. This optional field is retained only so the pre-redesign Home
   * page and topbar (rewritten in a later plan) keep type-checking.
   */
  timeAgo?: string;
  actions: string[];
  /**
   * When true, the primary action requires a two-step confirm.
   * Set on the data, not inferred from verb patterns, so future actions
   * like "Issue Refund" or "Override Rate" can opt in explicitly.
   */
  requiresConfirm?: boolean;
};

/**
 * Reference "now" for this milestone is 2026-05-20T09:00:00 local (per the
 * current-date context). Each createdAt below is a real ISO string offset
 * back from that anchor by the interval stated in the brief's seed cards.
 */

export const EXCEPTIONS: ExceptionItem[] = [
  // ── 7 anchor cards (verbatim from REDESIGN-BRIEF.md "Seed exception cards") ──
  {
    id: 1,
    type: "guest_complaint",
    typeLabel: "Guest complaint — hot water issue",
    urgency: "Critical",
    category: "Guest",
    agent: "Guest Agent",
    property: "989 Nelson St · Downtown Condo",
    neighborhood: "Downtown",
    summary:
      "Guest reported no hot water 2 hours after check-in. Mid-stay for a 3-night booking via Airbnb. Sentiment analysis: negative.",
    suggested:
      "Apologize immediately. Dispatch emergency plumber. Offer 15% discount code for next direct booking.",
    source: "Guest Agent · BK-2847",
    createdAt: "2026-05-20T08:51:00-07:00",
    timeAgo: "9 min ago",
    actions: ["Approve Fix", "Call Guest", "Dismiss"],
    requiresConfirm: true,
  },
  {
    id: 2,
    type: "cleaner_no_response",
    typeLabel: "Cleaner no response — 1455 Howe St",
    urgency: "Critical",
    category: "Cleaner",
    agent: "Ops Agent",
    property: "1455 Howe St · Yaletown Suite",
    neighborhood: "Yaletown",
    summary:
      "WhatsApp confirmation sent 2 hours ago after guest checkout. Cleaner Andrea has not responded. Next guest checks in at 3:00 PM today.",
    suggested:
      "Call Andrea directly. If no answer within 30 min, dispatch backup cleaner (Carly).",
    source: "Ops Agent · BK-2851",
    createdAt: "2026-05-20T08:00:00-07:00",
    timeAgo: "1 hr ago",
    actions: ["Call Cleaner", "Dispatch Backup", "Resolve"],
  },
  {
    id: 3,
    type: "pricing_week",
    typeLabel: "Rate adjustment — Taylor Swift concert weekend",
    urgency: "Medium",
    category: "Pricing",
    agent: "Pricing Agent",
    property: "Portfolio-wide · 12 properties",
    neighborhood: "Portfolio-wide",
    summary:
      "Taylor Swift Eras Tour at BC Place Nov 15–17. Current weekend rates 22% below comparable listings. 12 of 26 properties have availability.",
    suggested:
      "Increase rates by 35–50% for Nov 15–17 across all 12 available properties. Estimated additional revenue: $4,200–6,800.",
    source: "Pricing Agent",
    createdAt: "2026-05-20T07:00:00-07:00",
    timeAgo: "2 hr ago",
    actions: ["Approve Increase", "Adjust %", "Ignore"],
  },
  {
    id: 4,
    type: "pipeline_followup",
    typeLabel: "Hot lead — property owner callback requested",
    urgency: "Medium",
    category: "Pipeline",
    agent: "Sales Agent",
    property: "2105 W 4th Ave · Kitsilano",
    neighborhood: "Kitsilano",
    summary:
      "Owner Sarah Chen responded to cold-call follow-up SMS: “Yeah I’d be interested in hearing more about your management services. Can you call me tomorrow around 11?” Score: 82/100.",
    suggested:
      "Call Sarah Chen tomorrow at 11 AM. Pre-call brief attached. 2BR condo, currently self-managed on Airbnb with 4.2 stars.",
    source: "Sales Agent",
    createdAt: "2026-05-20T04:00:00-07:00",
    timeAgo: "5 hr ago",
    actions: ["Schedule Call", "View Brief", "Dismiss"],
  },
  {
    id: 5,
    type: "compliance_expiry",
    typeLabel: "STR license expires in 12 days",
    urgency: "Medium",
    category: "Compliance",
    agent: "System",
    property: "1120 Hamilton St · Yaletown Loft",
    neighborhood: "Yaletown",
    summary:
      "City of Vancouver Short-Term Rental business license expires March 30, 2026. Renewal requires proof of principal residence or operator license. 14-day alert threshold reached.",
    suggested:
      "Initiate renewal through City of Vancouver portal. Processing time: 5–10 business days.",
    source: "System",
    createdAt: "2026-05-19T21:00:00-07:00",
    timeAgo: "12 hr ago",
    actions: ["Mark Renewed", "Snooze 7 Days", "Assign"],
  },
  {
    id: 6,
    type: "owner_inquiry",
    typeLabel: "Owner question — November revenue report",
    urgency: "Low",
    category: "Owner",
    agent: "Owner Agent",
    property: "3280 W Broadway · Point Grey House",
    neighborhood: "Point Grey",
    summary:
      "Owner James Park emailed asking why November revenue was 18% lower than October. Draft response prepared with seasonal occupancy data and rate comparison.",
    suggested:
      "Review draft response. Key points: seasonal demand drop (normal for Nov), occupancy 72% vs 85% in Oct, rates competitive for the period.",
    source: "Owner Agent",
    createdAt: "2026-05-20T01:00:00-07:00",
    timeAgo: "8 hr ago",
    actions: ["Send Draft", "Edit & Send", "Call Owner"],
  },
  {
    id: 7,
    type: "revenue_anomaly",
    typeLabel: "Underperformance — Coal Harbour unit",
    urgency: "Low",
    category: "Revenue",
    agent: "Owner Agent",
    property: "1233 W Cordova St · Coal Harbour",
    neighborhood: "Coal Harbour",
    summary:
      "Property revenue 24% below portfolio average for the past 3 weeks. Occupancy: 58% vs portfolio avg 78%. No negative reviews. Pricing appears competitive.",
    suggested:
      "Review listing photos (last updated 6 months ago). Consider refreshing photography and description. Check if building amenity access has changed.",
    source: "Owner Agent",
    createdAt: "2026-05-19T09:00:00-07:00",
    timeAgo: "1 day ago",
    actions: ["Review Listing", "Adjust Pricing", "Investigate"],
  },

  // ── 8 additional narrative cards (mixed urgency / category) ──
  {
    id: 8,
    type: "maintenance_issue",
    typeLabel: "Heat pump fault — guest reports unit not cooling",
    urgency: "High",
    category: "Maintenance",
    agent: "Ops Agent",
    property: "601 Beach Crescent · Yaletown",
    neighborhood: "Yaletown",
    summary:
      "Guest messaged that the bedroom heat pump is blowing warm air and the suite is sitting at 27°C. Booking is a 5-night Vrbo stay, two nights remaining. No prior service history on the unit this year.",
    suggested:
      "Dispatch HVAC technician today. Offer the guest a fan and a $90 inconvenience credit while the repair is scheduled.",
    source: "Ops Agent · BK-2864",
    createdAt: "2026-05-20T07:30:00-07:00",
    timeAgo: "90 min ago",
    actions: ["Approve Fix", "Call Guest", "Dismiss"],
  },
  {
    id: 9,
    type: "guest_complaint",
    typeLabel: "Noise complaint escalated by guest",
    urgency: "High",
    category: "Guest",
    agent: "Guest Agent",
    property: "1818 Robson St · West End",
    neighborhood: "West End",
    summary:
      "Guest reported repeated late-night noise from an adjacent unit on two consecutive nights and is asking for a partial refund. Sentiment trending negative; the guest has a pending Airbnb review.",
    suggested:
      "Apologize and contact building management about the neighbouring unit. Offer a 10% one-night refund to retain the review score.",
    source: "Guest Agent · BK-2859",
    createdAt: "2026-05-20T06:10:00-07:00",
    timeAgo: "3 hr ago",
    actions: ["Approve Fix", "Call Guest", "Dismiss"],
  },
  {
    id: 10,
    type: "cleaner_no_response",
    typeLabel: "Turnover at risk — Langley team unconfirmed",
    urgency: "High",
    category: "Cleaner",
    agent: "Ops Agent",
    property: "4900 Joyce St · East Van",
    neighborhood: "East Van",
    summary:
      "Stana has not acknowledged the WhatsApp dispatch sent 90 minutes ago for a same-day turnover. Checkout completed at 10:30 AM; next check-in is 4:00 PM.",
    suggested:
      "Call Stana now. If unreachable in 20 min, reassign to Andrea L. and confirm she can cover the East Van route.",
    source: "Ops Agent · BK-2867",
    createdAt: "2026-05-20T07:15:00-07:00",
    timeAgo: "2 hr ago",
    actions: ["Call Cleaner", "Dispatch Backup", "Resolve"],
  },
  {
    id: 11,
    type: "pricing_alert",
    typeLabel: "Rate below market — Kitsilano 1BR",
    urgency: "Medium",
    category: "Pricing",
    agent: "Pricing Agent",
    property: "2640 Yew St · Kitsilano",
    neighborhood: "Kitsilano",
    summary:
      "Comparable Kitsilano one-bedroom listings are pricing 14% higher for the last week of May. This unit has open availability for 5 of those 7 nights.",
    suggested:
      "Approve a 12% rate increase for May 24–30. Projected additional revenue this window: $310.",
    source: "Pricing Agent · p25",
    createdAt: "2026-05-20T06:45:00-07:00",
    timeAgo: "2 hr ago",
    actions: ["Approve Rate", "Adjust %", "Ignore"],
  },
  {
    id: 12,
    type: "claims_draft",
    typeLabel: "Damage claim drafted — scratched hardwood",
    urgency: "Medium",
    category: "Maintenance",
    agent: "Ops Agent",
    property: "3280 W Broadway · Point Grey House",
    neighborhood: "Point Grey",
    summary:
      "Cleaner flagged a deep scratch across the living-room hardwood after checkout. Before/after photos attached. Estimated refinishing cost is $480.",
    suggested:
      "Review the photo evidence and approve the $480 claim against the guest's security deposit before the 14-day Airbnb window closes.",
    source: "Ops Agent · BK-2855",
    createdAt: "2026-05-19T23:30:00-07:00",
    timeAgo: "10 hr ago",
    actions: ["Approve Claim", "Edit Draft", "Reject"],
    requiresConfirm: true,
  },
  {
    id: 13,
    type: "pipeline_followup",
    typeLabel: "New prospect — referral from existing owner",
    urgency: "Low",
    category: "Pipeline",
    agent: "Sales Agent",
    property: "5825 Cambie St · Cambie",
    neighborhood: "Cambie",
    summary:
      "Existing owner James Park referred a neighbour considering short-term management for a renovated 2BR. The prospect has not yet been contacted. Score: 64/100.",
    suggested:
      "Send the standard intro email with the management fee schedule, then schedule a property walk-through within the week.",
    source: "Sales Agent",
    createdAt: "2026-05-19T15:00:00-07:00",
    timeAgo: "18 hr ago",
    actions: ["Schedule Call", "View Brief", "Dismiss"],
  },
  {
    id: 14,
    type: "compliance_expiry",
    typeLabel: "Insurance certificate lapses end of month",
    urgency: "Medium",
    category: "Compliance",
    agent: "System",
    property: "2255 Davie St · West End",
    neighborhood: "West End",
    summary:
      "The short-term rental liability insurance certificate for this unit expires May 31, 2026. The 30-day renewal alert threshold has been reached and no renewal is on file.",
    suggested:
      "Contact the broker to renew the liability policy. Upload the new certificate to the Compliance vault before May 31.",
    source: "System",
    createdAt: "2026-05-19T18:30:00-07:00",
    timeAgo: "14 hr ago",
    actions: ["Mark Renewed", "Snooze 7 Days", "Assign"],
  },
  {
    id: 15,
    type: "owner_inquiry",
    typeLabel: "Owner requests mid-month payout summary",
    urgency: "Low",
    category: "Owner",
    agent: "Owner Agent",
    property: "1633 Quebec St · Olympic Village",
    neighborhood: "Olympic Village",
    summary:
      "Owner emailed asking for an interim payout statement covering May 1–15 ahead of a tax filing. A draft summary with gross revenue, fees, and net payout has been prepared.",
    suggested:
      "Review the draft statement for accuracy and send it. May 1–15 net payout is $3,940 across 11 booked nights.",
    source: "Owner Agent",
    createdAt: "2026-05-19T20:00:00-07:00",
    timeAgo: "13 hr ago",
    actions: ["Send Draft", "Edit & Send", "Call Owner"],
  },
];

export const URGENCY_RANK: Record<Urgency, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const AGENT_ACTIVITY = [
  { agent: "Pricing", text: "Repriced 18 listings for week of May 18", time: "2 min ago" },
  { agent: "Guest", text: "Drafted reply to Wong (788 Hamilton St) re: parking", time: "11 min ago" },
  { agent: "Ops", text: "Confirmed Carly's turnover at 601 Beach Crescent", time: "34 min ago" },
  { agent: "SOP", text: "Updated lockbox code for 1455 Howe St", time: "1 hr ago" },
  { agent: "Pricing", text: "Flagged 12 properties for Taylor Swift weekend pricing", time: "Today, 7:00 AM" },
];
