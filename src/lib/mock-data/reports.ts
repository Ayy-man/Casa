export type AgentReport = {
  key: string;
  name: string;
  alignment: number;
  drift: string[];
  samples: { property: string; ours: string; theirs: string; delta: string }[];
};

export type CumulativeReport = {
  alignment: number;
  drift: number;
  cutover: string;
  delivered: string;
  agents: AgentReport[];
};

export const REPORT_CUMULATIVE: CumulativeReport = {
  alignment: 92,
  drift: 4,
  cutover: "2 of 4",
  delivered: "3 of 4",
  agents: [
    {
      key: "pricing",
      name: "Pricing Agent",
      alignment: 94,
      drift: [
        "FIFA event pricing 3% higher than PriceLabs — investigating",
        "Owner-restricted properties: 2 cases of agent attempting overrides outside guardrail",
      ],
      samples: [
        { property: "1455 Howe St — Yaletown 2BR", ours: "+19.3%", theirs: "+17.8%", delta: "1.5pp" },
        { property: "989 Nelson St — Downtown Studio", ours: "+18.2%", theirs: "+16.1%", delta: "2.1pp" },
        { property: "3280 W Broadway — Pt Grey 3BR", ours: "+14.3%", theirs: "+13.0%", delta: "1.3pp" },
        { property: "1633 Quebec St — Olympic Village", ours: "−8.1%", theirs: "−7.0%", delta: "1.1pp" },
        { property: "4321 Main St — Mt Pleasant", ours: "−4.2%", theirs: "−3.2%", delta: "1.0pp" },
      ],
    },
    {
      key: "guest",
      name: "Guest Agent",
      alignment: 91,
      drift: [
        "Late-night messages: agent drafted 2 replies a VA would have escalated",
        "Refund language: tone slightly more accommodating than house policy",
      ],
      samples: [
        { property: "Yaletown 2BR · Maria L.", ours: "Drafted apology + 10% credit", theirs: "Apology only, no credit", delta: "Tone" },
        { property: "West End 1BR · Daniel K.", ours: "Same-day check-in approved", theirs: "Escalated to host", delta: "Authority" },
        { property: "Pt Grey 3BR · Nora P.", ours: "Polite decline", theirs: "Polite decline", delta: "—" },
      ],
    },
    {
      key: "ops",
      name: "Ops Agent",
      alignment: 96,
      drift: ["Cleaner dispatch radius slightly tighter than VA baseline (1.4km vs 2.0km)"],
      samples: [
        { property: "Cambie Village · turnover", ours: "Dispatched Andrea 11:00", theirs: "Dispatched Andrea 10:45", delta: "15 min" },
        { property: "Mt Pleasant · supply run", ours: "Skipped (low priority)", theirs: "Scheduled", delta: "Decision" },
      ],
    },
    {
      key: "sop",
      name: "SOP Agent",
      alignment: 88,
      drift: [
        "Listing copy tone more formal than Casa’s house voice on 4 properties",
        "Photo selection: agent prefers exteriors, VAs prefer interior hero shot",
      ],
      samples: [
        { property: "Yaletown Loft", ours: "Generated 3 paragraphs", theirs: "Edited to 2", delta: "Length" },
        { property: "West End 1BR", ours: "Hero: building exterior", theirs: "Hero: living room", delta: "Photo" },
      ],
    },
  ],
};
