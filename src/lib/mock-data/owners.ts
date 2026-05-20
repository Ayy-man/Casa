export type OwnerStatus = "Active" | "Onboarding" | "Offboarding";

export type Owner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  commPref: "WhatsApp" | "Email" | "Phone";
  /** Property ids (see properties.ts) this owner has under Casa management. */
  properties: string[];
  /** ISO date the owner joined Casa's management program. */
  since: string;
  status: OwnerStatus;
  payoutMethod: string;
  /** Year-to-date net payout to this owner, in CAD. */
  ytdPayout: number;
  notes: string;
};

/**
 * Casa's 18 property owners. Names and contact details stay consistent with
 * the `owner` field on properties.ts and the owner-facing exception cards
 * (James Park — November revenue question; Sarah Chen — also a pipeline
 * prospect). Eight owners hold a second unit, so 18 owners cover all 26
 * properties.
 */
export const OWNERS: Owner[] = [
  { id: "o01", name: "Helena Wong", email: "helena.wong@example.com", phone: "+1 604 555 0142", commPref: "WhatsApp", properties: ["p01"], since: "2022-03-14", status: "Active", payoutMethod: "Direct deposit · RBC", ytdPayout: 38420, notes: "Original cohort. Prefers WhatsApp for anything urgent, monthly statement by email." },
  { id: "o02", name: "Marc Eldridge", email: "marc.eld@example.com", phone: "+1 604 555 0188", commPref: "Email", properties: ["p02"], since: "2022-06-02", status: "Active", payoutMethod: "Direct deposit · TD", ytdPayout: 27110, notes: "Downtown studio. Hands-off owner, reviews the quarterly summary only." },
  { id: "o03", name: "James Park", email: "james.park@example.com", phone: "+1 604 555 0119", commPref: "Phone", properties: ["p03", "p17"], since: "2021-11-20", status: "Active", payoutMethod: "Cheque", ytdPayout: 71240, notes: "Two units. Asked about the November revenue dip — draft response pending. Referral source for the Cambie prospect." },
  { id: "o04", name: "Aisha Rahman", email: "aisha.r@example.com", phone: "+1 604 555 0170", commPref: "WhatsApp", properties: ["p04"], since: "2023-01-09", status: "Active", payoutMethod: "Direct deposit · Vancity", ytdPayout: 24880, notes: "Liability insurance certificate for the Davie St unit lapses end of month — renewal flagged." },
  { id: "o05", name: "Sarah Chen", email: "sarah.chen@example.com", phone: "+1 604 555 0151", commPref: "Email", properties: ["p05"], since: "2023-04-27", status: "Active", payoutMethod: "Direct deposit · RBC", ytdPayout: 31960, notes: "Owns the Olympic Village condo with Casa; self-manages a second Kitsilano unit — active sales prospect." },
  { id: "o06", name: "Diana Okafor", email: "diana.o@example.com", phone: "+1 604 555 0193", commPref: "WhatsApp", properties: ["p06", "p20"], since: "2022-08-15", status: "Active", payoutMethod: "Direct deposit · TD", ytdPayout: 44530, notes: "Cambie pair. The 5550 Cambie unit is mid-maintenance — kitchen refresh." },
  { id: "o07", name: "Olivia Smith", email: "olivia.s@example.com", phone: "+1 604 555 0114", commPref: "Email", properties: ["p07"], since: "2021-09-03", status: "Active", payoutMethod: "Direct deposit · BMO", ytdPayout: 41870, notes: "Yaletown loft. Long-tenured owner, strong reviews, low-touch." },
  { id: "o08", name: "Rohan Mehta", email: "rohan.m@example.com", phone: "+1 604 555 0167", commPref: "WhatsApp", properties: ["p08", "p16"], since: "2022-12-11", status: "Active", payoutMethod: "Direct deposit · Scotiabank", ytdPayout: 36240, notes: "Two downtown condos. Wants a consolidated statement across both." },
  { id: "o09", name: "Sasha Belkin", email: "s.belkin@example.com", phone: "+1 604 555 0136", commPref: "Phone", properties: ["p09"], since: "2023-07-19", status: "Active", payoutMethod: "Cheque", ytdPayout: 22640, notes: "Mt Pleasant 2BR. Reachable by phone only — no app, no email replies." },
  { id: "o10", name: "Lily Tanaka", email: "l.tanaka@example.com", phone: "+1 604 555 0103", commPref: "WhatsApp", properties: ["p10", "p19"], since: "2022-02-28", status: "Active", payoutMethod: "Direct deposit · RBC", ytdPayout: 47920, notes: "Yaletown + Kitsilano. High performer; considering adding a third unit." },
  { id: "o11", name: "Ben Mercier", email: "ben.m@example.com", phone: "+1 604 555 0144", commPref: "Email", properties: ["p11", "p18"], since: "2023-03-05", status: "Active", payoutMethod: "Direct deposit · Vancity", ytdPayout: 39510, notes: "Two West End condos on Robson St." },
  { id: "o12", name: "Maya Holt", email: "maya.h@example.com", phone: "+1 604 555 0185", commPref: "WhatsApp", properties: ["p12", "p24"], since: "2022-10-22", status: "Active", payoutMethod: "Direct deposit · TD", ytdPayout: 33780, notes: "Kitsilano pair; the Yew St unit is a recent New listing still ramping." },
  { id: "o13", name: "Carlos Robles", email: "carlos.r@example.com", phone: "+1 604 555 0179", commPref: "WhatsApp", properties: ["p13"], since: "2021-07-01", status: "Active", payoutMethod: "Internal", ytdPayout: 29340, notes: "Casa's CEO; runs his own Yaletown unit through the platform as the reference case." },
  { id: "o14", name: "Theo Aldred", email: "t.aldred@example.com", phone: "+1 604 555 0123", commPref: "Email", properties: ["p14", "p21"], since: "2023-05-30", status: "Active", payoutMethod: "Direct deposit · BMO", ytdPayout: 21070, notes: "Two West End studios — compact units, steady mid-week demand." },
  { id: "o15", name: "Simone Park", email: "s.park@example.com", phone: "+1 604 555 0162", commPref: "WhatsApp", properties: ["p15"], since: "2024-01-16", status: "Active", payoutMethod: "Direct deposit · RBC", ytdPayout: 26450, notes: "Olympic Village 2BR. Joined last year; first full season with Casa." },
  { id: "o16", name: "Pippa Holst", email: "pippa.h@example.com", phone: "+1 604 555 0184", commPref: "WhatsApp", properties: ["p22"], since: "2023-09-08", status: "Offboarding", payoutMethod: "Direct deposit · Scotiabank", ytdPayout: 18920, notes: "Smithe St unit in maintenance; owner is selling the property — managed offboarding in progress." },
  { id: "o17", name: "Daniel Reyes", email: "d.reyes@example.com", phone: "+1 604 555 0152", commPref: "Email", properties: ["p23", "p26"], since: "2022-05-12", status: "Active", payoutMethod: "Direct deposit · TD", ytdPayout: 52380, notes: "1120 Hamilton STR license needs renewal. Also owns the Coal Harbour unit flagged for underperformance." },
  { id: "o18", name: "Tomas Vega", email: "t.vega@example.com", phone: "+1 604 555 0166", commPref: "WhatsApp", properties: ["p25"], since: "2024-03-21", status: "Onboarding", payoutMethod: "Pending setup", ytdPayout: 0, notes: "East Van 3BR. Onboarding — listing photography and pricing baseline still in progress." },
];

export const getOwner = (id: string): Owner | undefined =>
  OWNERS.find((o) => o.id === id);

/** The owner who manages a given property id, or undefined if unowned. */
export const getOwnerByProperty = (propertyId: string): Owner | undefined =>
  OWNERS.find((o) => o.properties.includes(propertyId));
