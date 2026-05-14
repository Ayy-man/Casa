export type PricingRow = {
  property: string;
  current: number;
  recommended: number;
  change: number;
  reasoning: string;
};

export const PRICING_BASE: PricingRow[] = [
  { property: "1455 Howe St — Yaletown 2BR", current: 285, recommended: 340, change: 19.3, reasoning: "FIFA week — competitor avg jumped to $355. Demand +47%." },
  { property: "989 Nelson St — Downtown Studio", current: 165, recommended: 195, change: 18.2, reasoning: "FIFA week + Canucks playoff game Wed. Comp set repricing." },
  { property: "3280 W Broadway — Pt Grey 3BR", current: 420, recommended: 480, change: 14.3, reasoning: "Family group bookings high for FIFA fan zone proximity." },
  { property: "2255 Davie St — West End 1BR", current: 220, recommended: 245, change: 11.4, reasoning: "Modest demand uplift. Conservative rec given soft midweek." },
  { property: "1633 Quebec St — Olympic Village", current: 310, recommended: 285, change: -8.1, reasoning: "Comp set softened. Two competitors dropped 12%+ this week." },
  { property: "5550 Cambie St — Cambie Village", current: 195, recommended: 210, change: 7.7, reasoning: "Steady demand, slight occupancy bump justifies marginal raise." },
  { property: "788 Hamilton St — Yaletown Loft", current: 360, recommended: 380, change: 5.6, reasoning: "FIFA proximity premium. Tight but defensible." },
  { property: "1100 Granville St — Downtown 1BR", current: 175, recommended: 175, change: 0.0, reasoning: "No change — current pricing tracks comp set within 2%." },
  { property: "4321 Main St — Mt Pleasant", current: 240, recommended: 230, change: -4.2, reasoning: "Light demand softness. Suggest small dip to maintain occupancy." },
  { property: "601 Beach Crescent — Yaletown 2BR", current: 295, recommended: 320, change: 8.5, reasoning: "Waterfront premium plus FIFA. Holding back on aggressive ask." },
  { property: "1818 Robson St — West End 1BR", current: 215, recommended: 268, change: 24.7, reasoning: "Robson retail corridor, FIFA weekend stays. Comp set $260–$290." },
  { property: "2400 Cornwall Ave — Kits 2BR", current: 275, recommended: 332, change: 20.7, reasoning: "Kitsilano beach proximity. Saturday demand +62% YoY." },
  { property: "900 Pacific Blvd — Yaletown 1BR", current: 230, recommended: 270, change: 17.4, reasoning: "Stadium-adjacent. Both Canucks and FIFA traffic." },
  { property: "1322 Bidwell St — West End Studio", current: 155, recommended: 178, change: 14.8, reasoning: "English Bay walk-up demand. Solo travelers booking ahead." },
  { property: "2933 Granville St — South Granville", current: 245, recommended: 274, change: 11.8, reasoning: "Gallery row event weekend. 3-night minimum constraint relaxes." },
  { property: "110 Switchmen St — Olympic Village", current: 305, recommended: 332, change: 8.9, reasoning: "Seawall access, family room layout. Steady weekly bookings." },
  { property: "845 Hornby St — Downtown 1BR", current: 200, recommended: 213, change: 6.5, reasoning: "Art gallery / VAG corridor. Modest weekend uplift." },
  { property: "3050 Heather St — Fairview", current: 235, recommended: 245, change: 4.3, reasoning: "Cambie Bridge access. Light demand uplift, hold conservative." },
  { property: "1500 Robson St — West End 2BR", current: 320, recommended: 332, change: 3.8, reasoning: "Slow midweek, strong weekend. Net positive for the week." },
  { property: "2025 Larch St — Kitsilano 1BR", current: 215, recommended: 220, change: 2.3, reasoning: "Comp set holding. Tiny lift to test demand sensitivity." },
  { property: "4500 Oak St — Cambie Quiet", current: 190, recommended: 192, change: 1.1, reasoning: "No real movement — within model noise." },
  { property: "1700 Comox St — West End Studio", current: 165, recommended: 162, change: -1.8, reasoning: "Very mild softness. Likely model overreaction — review next week." },
  { property: "525 Smithe St — Downtown 2BR", current: 290, recommended: 278, change: -4.1, reasoning: "Comp set dropped after a new building came online with 12 listings." },
  { property: "3700 Knight St — Kensington 2BR", current: 220, recommended: 207, change: -5.9, reasoning: "Off-corridor. Outside FIFA zone, demand flat. Pull back to keep occupancy." },
  { property: "2640 Yew St — Kits Beach 1BR", current: 250, recommended: 230, change: -8.0, reasoning: "Late-spring rain forecast. Beach-driven listing softens midweek." },
  { property: "4900 Joyce St — East Van 3BR", current: 260, recommended: 229, change: -11.9, reasoning: "Distant from FIFA fan zone. Comp set undercut by $40 nightly." },
];

export const changeClass = (n: number) => {
  if (n > 5) return "change-up-strong";
  if (n > 1) return "change-up-mild";
  if (n >= -1) return "change-flat";
  if (n >= -5) return "change-down-mild";
  return "change-down-strong";
};
