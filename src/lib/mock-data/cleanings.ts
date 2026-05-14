export type CleanStatus =
  | "Assigned"
  | "Dispatched"
  | "InProgress"
  | "Completed"
  | "NoResponse";

export type Cleaning = {
  id: string;
  propertyId: string;
  time: string;
  cleaner: string;
  cleanerInitials: string;
  status: CleanStatus;
  booking: string | null;
  score: number | null;
};

export const CLEANINGS_TODAY: Cleaning[] = [
  { id: "c1", propertyId: "p07", time: "11:00–14:00", cleaner: "Andrea C.", cleanerInitials: "AC", status: "InProgress", booking: "BK-2026-0467", score: null },
  { id: "c2", propertyId: "p10", time: "12:00–15:00", cleaner: "Carly B.", cleanerInitials: "CB", status: "Dispatched", booking: "BK-2026-0466", score: null },
  { id: "c3", propertyId: "p09", time: "13:30–16:00", cleaner: "Andrea C.", cleanerInitials: "AC", status: "Assigned", booking: null, score: null },
  { id: "c4", propertyId: "p13", time: "09:30–11:30", cleaner: "Andrea C.", cleanerInitials: "AC", status: "Completed", booking: "BK-2026-0465", score: 5 },
  { id: "c5", propertyId: "p15", time: "10:00–12:30", cleaner: "Juli D.", cleanerInitials: "JD", status: "Completed", booking: "BK-2026-0464", score: 5 },
  { id: "c6", propertyId: "p04", time: "08:30–10:00", cleaner: "Sabrina A.", cleanerInitials: "SA", status: "Completed", booking: "BK-2026-0468", score: 4 },
  { id: "c7", propertyId: "p02", time: "11:00–13:00", cleaner: "Sabrina A.", cleanerInitials: "SA", status: "NoResponse", booking: "BK-2026-0470", score: null },
];

export const cleanStatusLabel = (s: CleanStatus) =>
  s === "NoResponse" ? "No Response" : s === "InProgress" ? "In Progress" : s;

export type ChatMessage = {
  who: "us" | "them";
  text: string;
  time: string;
  photo?: boolean;
};

export const CLEANING_THREAD: Record<string, ChatMessage[]> = {
  c1: [
    { who: "us", text: "Hi Andrea, turnover at 1455 Howe today, 11:00. Standard checklist.", time: "08:42" },
    { who: "them", text: "Got it, on my way. Bringing Carly today.", time: "10:15" },
    { who: "us", text: "Building intercom: 4321. Lockbox 5588.", time: "10:16" },
    { who: "them", text: "In the unit, starting now.", time: "11:04" },
    { who: "them", text: "Photo: living room. Looks good, two glasses on counter.", time: "11:12", photo: true },
    { who: "them", text: "Bedroom done. Linens swapped.", time: "12:30" },
  ],
  c7: [
    { who: "us", text: "Sabrina, turnover at 989 Nelson today 11:00. Checkout at 11.", time: "08:30" },
    { who: "us", text: "Bumping. Are you on your way?", time: "11:15" },
    { who: "us", text: "Sabrina, we have a same-day check-in at 4pm. Please confirm.", time: "12:55" },
  ],
  c2: [
    { who: "us", text: "Hi Carly, 601 Beach Cres today 12:00. Family group, deep wipe of kitchen requested.", time: "09:15" },
    { who: "them", text: "Heading there now.", time: "11:48" },
  ],
  c4: [
    { who: "us", text: "Andrea, quick turn at 900 Pacific. Two-night stay, light clean.", time: "08:50" },
    { who: "them", text: "Done, photos attached.", time: "11:24", photo: true },
    { who: "us", text: "Beautiful. Ready for 4pm check-in.", time: "11:26" },
  ],
};

export const TODAY_CLEANINGS_SUMMARY = [
  { property: "1455 Howe St", window: "11:00–14:30", cleaner: "Andrea C.", status: "In progress" },
  { property: "601 Beach Cres.", window: "12:00–15:00", cleaner: "Carly B.", status: "Scheduled" },
  { property: "4321 Main St", window: "13:30–16:00", cleaner: "Sabrina A.", status: "Scheduled" },
];
