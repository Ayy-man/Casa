export type ProspectStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost";

export type Prospect = {
  id: string;
  /** Prospective owner / contact name. */
  owner: string;
  address: string;
  neighborhood: string;
  units: number;
  /** Lead score 0–100 — higher is hotter. */
  score: number;
  status: ProspectStatus;
  source: string;
  /** ISO date of the most recent touch. */
  lastContact: string;
  /** Estimated monthly revenue if onboarded, in CAD. */
  estMonthly: number;
  note: string;
};

/**
 * Casa's 34-prospect sales pipeline. Two entries are locked to the exception
 * cards: Sarah Chen / 2105 W 4th Ave (score 82, callback requested) and the
 * James Park referral / 5825 Cambie St (score 64). Modeled on bookings.ts —
 * a typed array plus a `getProspect` id lookup.
 */
export const PIPELINE: Prospect[] = [
  { id: "L-1042", owner: "Sarah Chen", address: "2105 W 4th Ave", neighborhood: "Kitsilano", units: 1, score: 82, status: "Qualified", source: "Cold-call follow-up SMS", lastContact: "2026-05-20", estMonthly: 6400, note: "Self-managed on Airbnb at 4.2 stars. Asked for a callback tomorrow at 11 AM." },
  { id: "L-1041", owner: "Greg Tomlin", address: "5825 Cambie St", neighborhood: "Cambie", units: 1, score: 64, status: "New", source: "Referral — James Park", lastContact: "2026-05-19", estMonthly: 4900, note: "Renovated 2BR. Not yet contacted — send intro email and book a walk-through." },
  { id: "L-1040", owner: "Priya Anand", address: "1480 Howe St", neighborhood: "Yaletown", units: 2, score: 78, status: "Proposal", source: "Website inquiry", lastContact: "2026-05-18", estMonthly: 11200, note: "Two-unit owner shopping three managers. Proposal sent — decision expected next week." },
  { id: "L-1039", owner: "Devon Clarke", address: "3360 Commercial Dr", neighborhood: "East Van", units: 1, score: 55, status: "Contacted", source: "Instagram DM", lastContact: "2026-05-16", estMonthly: 3800, note: "First-time STR owner, still deciding between long-term and short-term let." },
  { id: "L-1038", owner: "Naomi Bridges", address: "899 Seymour St", neighborhood: "Downtown", units: 1, score: 71, status: "Qualified", source: "Google search", lastContact: "2026-05-17", estMonthly: 5200, note: "Ready to switch managers; current manager unresponsive. Strong fit." },
  { id: "L-1037", owner: "Aaron Liu", address: "2588 Yukon St", neighborhood: "Cambie", units: 1, score: 43, status: "Contacted", source: "Referral — Lily Tanaka", lastContact: "2026-05-12", estMonthly: 3300, note: "Lukewarm. Wants to see a sample owner statement before committing." },
  { id: "L-1036", owner: "Hannah Reid", address: "1875 Barclay St", neighborhood: "West End", units: 1, score: 88, status: "Proposal", source: "Owner referral", lastContact: "2026-05-19", estMonthly: 5800, note: "Hot lead — ready to sign, awaiting management agreement countersignature." },
  { id: "L-1035", owner: "Marco Penner", address: "4120 Fraser St", neighborhood: "East Van", units: 3, score: 67, status: "Qualified", source: "Website inquiry", lastContact: "2026-05-15", estMonthly: 9600, note: "Three-unit walk-up. Wants a portfolio rate, not per-unit." },
  { id: "L-1034", owner: "Elise Fournier", address: "950 Drake St", neighborhood: "Downtown", units: 1, score: 36, status: "Lost", source: "Trade show", lastContact: "2026-04-30", estMonthly: 4100, note: "Chose a competitor on price. Revisit in Q4." },
  { id: "L-1033", owner: "Sam Whitaker", address: "2230 Cornwall Ave", neighborhood: "Kitsilano", units: 1, score: 74, status: "Qualified", source: "Cold call", lastContact: "2026-05-14", estMonthly: 6100, note: "Beachfront 1BR. Concerned about cleaner reliability — share the Ops dashboard." },
  { id: "L-1032", owner: "Bianca Torres", address: "611 Alexander St", neighborhood: "East Van", units: 1, score: 51, status: "Contacted", source: "Instagram DM", lastContact: "2026-05-11", estMonthly: 3500, note: "Heritage conversion. Needs guidance on STR licensing for the area." },
  { id: "L-1031", owner: "Owen Patel", address: "1318 Cardero St", neighborhood: "West End", units: 1, score: 79, status: "Proposal", source: "Owner referral — Theo Aldred", lastContact: "2026-05-18", estMonthly: 5400, note: "Studio owner referred by an existing client. Proposal under review." },
  { id: "L-1030", owner: "Renata Silva", address: "3771 Oak St", neighborhood: "Cambie", units: 1, score: 60, status: "Contacted", source: "Website inquiry", lastContact: "2026-05-13", estMonthly: 4400, note: "Comparing Casa against self-management ROI." },
  { id: "L-1029", owner: "Caleb Norton", address: "210 Carrall St", neighborhood: "Gastown", units: 2, score: 85, status: "Proposal", source: "Cold-call follow-up", lastContact: "2026-05-19", estMonthly: 10400, note: "Gastown loft pair. Very engaged — wants to onboard before July peak." },
  { id: "L-1028", owner: "Ingrid Holm", address: "1655 Nelson St", neighborhood: "West End", units: 1, score: 47, status: "Contacted", source: "Google search", lastContact: "2026-05-09", estMonthly: 3900, note: "Slow to respond. Send a final follow-up before marking dormant." },
  { id: "L-1027", owner: "Victor Mwangi", address: "488 Helmcken St", neighborhood: "Yaletown", units: 1, score: 73, status: "Qualified", source: "Website inquiry", lastContact: "2026-05-16", estMonthly: 5600, note: "Yaletown high-rise. Wants quarterly in-person reviews." },
  { id: "L-1026", owner: "Dana Kovac", address: "2920 Trafalgar St", neighborhood: "Kitsilano", units: 1, score: 58, status: "Contacted", source: "Referral — Olivia Smith", lastContact: "2026-05-10", estMonthly: 4700, note: "Owner travels often; wants a fully hands-off arrangement." },
  { id: "L-1025", owner: "Theo Brandt", address: "1090 Burnaby St", neighborhood: "West End", units: 1, score: 90, status: "Won", source: "Owner referral", lastContact: "2026-05-08", estMonthly: 5100, note: "Signed. Onboarding handed to the Ops team — photography booked." },
  { id: "L-1024", owner: "Lucia Marin", address: "3455 W 10th Ave", neighborhood: "Kitsilano", units: 1, score: 41, status: "Lost", source: "Trade show", lastContact: "2026-04-22", estMonthly: 4300, note: "Decided to keep the unit as a long-term rental." },
  { id: "L-1023", owner: "Felix Osei", address: "777 Richards St", neighborhood: "Downtown", units: 2, score: 76, status: "Qualified", source: "Cold call", lastContact: "2026-05-15", estMonthly: 9100, note: "Two downtown condos. Negotiating the management fee tier." },
  { id: "L-1022", owner: "Mona El-Sayed", address: "2150 W 8th Ave", neighborhood: "Kitsilano", units: 1, score: 69, status: "Contacted", source: "Website inquiry", lastContact: "2026-05-12", estMonthly: 5000, note: "Wants a same-week walk-through. Schedule with Denika." },
  { id: "L-1021", owner: "Gavin Pruitt", address: "330 E 2nd Ave", neighborhood: "East Van", units: 1, score: 33, status: "Lost", source: "Instagram DM", lastContact: "2026-04-18", estMonthly: 3200, note: "Budget mismatch. Not a fit this cycle." },
  { id: "L-1020", owner: "Sienna Wallace", address: "1483 Pendrell St", neighborhood: "West End", units: 1, score: 81, status: "Proposal", source: "Owner referral — Ben Mercier", lastContact: "2026-05-18", estMonthly: 5300, note: "Strong referral. Proposal sent — expect a yes." },
  { id: "L-1019", owner: "Hugo Lindqvist", address: "2755 Quebec St", neighborhood: "Mt Pleasant", units: 1, score: 62, status: "Contacted", source: "Google search", lastContact: "2026-05-11", estMonthly: 4600, note: "Mt Pleasant condo. Needs reassurance on guest screening." },
  { id: "L-1018", owner: "Adaeze Obi", address: "1640 Davie St", neighborhood: "West End", units: 1, score: 70, status: "Qualified", source: "Cold-call follow-up", lastContact: "2026-05-14", estMonthly: 5200, note: "Davie St 1BR. Ready for a proposal next week." },
  { id: "L-1017", owner: "Patrick Shaw", address: "525 W 8th Ave", neighborhood: "Fairview", units: 1, score: 49, status: "Contacted", source: "Website inquiry", lastContact: "2026-05-08", estMonthly: 4000, note: "Fairview condo. Still weighing options." },
  { id: "L-1016", owner: "Yuki Tanabe", address: "1166 Melville St", neighborhood: "Coal Harbour", units: 1, score: 87, status: "Proposal", source: "Cold call", lastContact: "2026-05-19", estMonthly: 7200, note: "Coal Harbour luxury 1BR. High-value lead — prioritize." },
  { id: "L-1015", owner: "Rosa Mendez", address: "3290 Main St", neighborhood: "Mt Pleasant", units: 2, score: 65, status: "Qualified", source: "Referral — Diana Okafor", lastContact: "2026-05-13", estMonthly: 8400, note: "Two Mt Pleasant units. Wants a phased onboarding." },
  { id: "L-1014", owner: "Cole Beaumont", address: "1255 Seymour St", neighborhood: "Downtown", units: 1, score: 54, status: "Contacted", source: "Trade show", lastContact: "2026-05-07", estMonthly: 4500, note: "Downtown condo. Asked for client references." },
  { id: "L-1013", owner: "Amara Diallo", address: "2025 Stephens St", neighborhood: "Kitsilano", units: 1, score: 72, status: "Qualified", source: "Website inquiry", lastContact: "2026-05-15", estMonthly: 5500, note: "Kitsilano character home suite. Good fit, schedule a call." },
  { id: "L-1012", owner: "Liam Frost", address: "808 Pacific St", neighborhood: "Yaletown", units: 1, score: 38, status: "Lost", source: "Instagram DM", lastContact: "2026-04-15", estMonthly: 4800, note: "Went with an in-house manager." },
  { id: "L-1011", owner: "Nadia Petrova", address: "1444 Alberni St", neighborhood: "West End", units: 1, score: 84, status: "Proposal", source: "Owner referral", lastContact: "2026-05-18", estMonthly: 5700, note: "Alberni St 1BR. Engaged and responsive — proposal under review." },
  { id: "L-1010", owner: "Ethan Cross", address: "3680 Fraser St", neighborhood: "East Van", units: 1, score: 46, status: "Contacted", source: "Google search", lastContact: "2026-05-06", estMonthly: 3700, note: "East Van 1BR. Needs a clearer picture of seasonal demand." },
  { id: "L-1009", owner: "Grace Lin", address: "1925 Alberni St", neighborhood: "West End", units: 1, score: 91, status: "Won", source: "Cold-call follow-up", lastContact: "2026-05-05", estMonthly: 5900, note: "Signed last week. Onboarding underway." },
];

export const getProspect = (id: string): Prospect | undefined =>
  PIPELINE.find((p) => p.id === id);
