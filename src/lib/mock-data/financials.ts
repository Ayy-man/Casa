export type FinancialTrend = "up" | "flat" | "down";

/** One month of portfolio-level P&L, used for the Financials summary chart. */
export type MonthlyFinancial = {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
  /** Portfolio occupancy for the month, 0–100. */
  occupancy: number;
};

/** Year-to-date P&L for a single property. */
export type PropertyFinancial = {
  propertyId: string;
  name: string;
  neighborhood: string;
  revenue: number;
  expenses: number;
  net: number;
  /** Year-to-date occupancy, 0–100. */
  occupancy: number;
  trend: FinancialTrend;
};

export type FinancialSummary = {
  /** Reporting window covered by these figures. */
  period: string;
  ytdRevenue: number;
  ytdExpenses: number;
  ytdNet: number;
  /** Portfolio-wide average occupancy YTD, 0–100. */
  avgOccupancy: number;
  /** Net change vs the prior comparable period, as a percentage. */
  netChangePct: number;
  monthly: MonthlyFinancial[];
  byProperty: PropertyFinancial[];
};

/**
 * Casa's portfolio P&L for Jan–May 2026. Per-property figures are year-to-date.
 * The Coal Harbour unit (p26 · 1233 W Cordova) carries a `down` trend,
 * consistent with the revenue-anomaly exception card and the Assistant's
 * "underperforming" canned response.
 */
export const FINANCIALS: FinancialSummary = {
  period: "Jan 1 – May 20, 2026",
  ytdRevenue: 612480,
  ytdExpenses: 198920,
  ytdNet: 413560,
  avgOccupancy: 76,
  netChangePct: 7.0,
  monthly: [
    { month: "Jan 2026", revenue: 104200, expenses: 35600, net: 68600, occupancy: 68 },
    { month: "Feb 2026", revenue: 112800, expenses: 36900, net: 75900, occupancy: 71 },
    { month: "Mar 2026", revenue: 128400, expenses: 41200, net: 87200, occupancy: 79 },
    { month: "Apr 2026", revenue: 134900, expenses: 42100, net: 92800, occupancy: 81 },
    { month: "May 2026", revenue: 132180, expenses: 43120, net: 89060, occupancy: 76 },
  ],
  byProperty: [
    { propertyId: "p01", name: "1455 Howe St", neighborhood: "Yaletown", revenue: 38420, expenses: 11200, net: 27220, occupancy: 94, trend: "up" },
    { propertyId: "p02", name: "989 Nelson St", neighborhood: "Downtown", revenue: 27110, expenses: 8400, net: 18710, occupancy: 78, trend: "flat" },
    { propertyId: "p03", name: "3280 W Broadway", neighborhood: "Point Grey", revenue: 41880, expenses: 13900, net: 27980, occupancy: 72, trend: "down" },
    { propertyId: "p04", name: "2255 Davie St", neighborhood: "West End", revenue: 24880, expenses: 7900, net: 16980, occupancy: 80, trend: "flat" },
    { propertyId: "p05", name: "1633 Quebec St", neighborhood: "Olympic Village", revenue: 31960, expenses: 10100, net: 21860, occupancy: 77, trend: "up" },
    { propertyId: "p06", name: "5550 Cambie St", neighborhood: "Cambie", revenue: 16240, expenses: 9200, net: 7040, occupancy: 54, trend: "down" },
    { propertyId: "p07", name: "788 Hamilton St", neighborhood: "Yaletown", revenue: 41870, expenses: 12600, net: 29270, occupancy: 86, trend: "up" },
    { propertyId: "p08", name: "1100 Granville St", neighborhood: "Downtown", revenue: 21340, expenses: 6800, net: 14540, occupancy: 74, trend: "flat" },
    { propertyId: "p09", name: "4321 Main St", neighborhood: "Mt Pleasant", revenue: 22640, expenses: 7400, net: 15240, occupancy: 71, trend: "flat" },
    { propertyId: "p10", name: "601 Beach Crescent", neighborhood: "Yaletown", revenue: 34980, expenses: 10800, net: 24180, occupancy: 83, trend: "up" },
    { propertyId: "p11", name: "1818 Robson St", neighborhood: "West End", revenue: 23110, expenses: 7300, net: 15810, occupancy: 76, trend: "flat" },
    { propertyId: "p12", name: "2400 Cornwall Ave", neighborhood: "Kitsilano", revenue: 28760, expenses: 9100, net: 19660, occupancy: 79, trend: "up" },
    { propertyId: "p13", name: "900 Pacific Blvd", neighborhood: "Yaletown", revenue: 29340, expenses: 9000, net: 20340, occupancy: 81, trend: "flat" },
    { propertyId: "p14", name: "1322 Bidwell St", neighborhood: "West End", revenue: 16880, expenses: 5600, net: 11280, occupancy: 73, trend: "flat" },
    { propertyId: "p15", name: "110 Switchmen St", neighborhood: "Olympic Village", revenue: 26450, expenses: 8500, net: 17950, occupancy: 75, trend: "up" },
    { propertyId: "p16", name: "845 Hornby St", neighborhood: "Downtown", revenue: 20920, expenses: 6700, net: 14220, occupancy: 72, trend: "flat" },
    { propertyId: "p17", name: "3050 Heather St", neighborhood: "Fairview", revenue: 12640, expenses: 6100, net: 6540, occupancy: 58, trend: "up" },
    { propertyId: "p18", name: "1500 Robson St", neighborhood: "West End", revenue: 30180, expenses: 9400, net: 20780, occupancy: 80, trend: "up" },
    { propertyId: "p19", name: "2025 Larch St", neighborhood: "Kitsilano", revenue: 22870, expenses: 7200, net: 15670, occupancy: 77, trend: "flat" },
    { propertyId: "p20", name: "4500 Oak St", neighborhood: "Cambie", revenue: 19440, expenses: 6300, net: 13140, occupancy: 70, trend: "flat" },
    { propertyId: "p21", name: "1700 Comox St", neighborhood: "West End", revenue: 17320, expenses: 5700, net: 11620, occupancy: 74, trend: "flat" },
    { propertyId: "p22", name: "525 Smithe St", neighborhood: "Downtown", revenue: 14260, expenses: 8800, net: 5460, occupancy: 49, trend: "down" },
    { propertyId: "p23", name: "1120 Hamilton St", neighborhood: "Yaletown", revenue: 35640, expenses: 10900, net: 24740, occupancy: 84, trend: "up" },
    { propertyId: "p24", name: "2640 Yew St", neighborhood: "Kitsilano", revenue: 13180, expenses: 6400, net: 6780, occupancy: 61, trend: "up" },
    { propertyId: "p25", name: "4900 Joyce St", neighborhood: "East Van", revenue: 21060, expenses: 7600, net: 13460, occupancy: 69, trend: "flat" },
    { propertyId: "p26", name: "1233 W Cordova St", neighborhood: "Coal Harbour", revenue: 24370, expenses: 9420, net: 14950, occupancy: 58, trend: "down" },
  ],
};

export const getPropertyFinancial = (
  propertyId: string,
): PropertyFinancial | undefined =>
  FINANCIALS.byProperty.find((p) => p.propertyId === propertyId);
