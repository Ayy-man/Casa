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

/**
 * Today's turnover board. Every cleaner reference uses Casa's real roster:
 * Andrea, Carly, Sabrina, Juli (main team); Stana, Andrea L. (Langley team).
 * No legacy placeholder cleaner names survive. Property references point at
 * real PROPERTIES ids so the data is internally consistent.
 */
export const CLEANINGS_TODAY: Cleaning[] = [
  { id: "c1", propertyId: "p01", time: "11:00–14:00", cleaner: "Andrea", cleanerInitials: "AN", status: "NoResponse", booking: "BK-2851", score: null },
  { id: "c2", propertyId: "p10", time: "12:00–15:00", cleaner: "Carly", cleanerInitials: "CA", status: "Dispatched", booking: "BK-2026-0466", score: null },
  { id: "c3", propertyId: "p07", time: "13:30–16:00", cleaner: "Sabrina", cleanerInitials: "SA", status: "InProgress", booking: "BK-2026-0467", score: null },
  { id: "c4", propertyId: "p13", time: "09:30–11:30", cleaner: "Andrea", cleanerInitials: "AN", status: "Completed", booking: "BK-2026-0465", score: 5 },
  { id: "c5", propertyId: "p15", time: "10:00–12:30", cleaner: "Juli", cleanerInitials: "JU", status: "Completed", booking: "BK-2026-0464", score: 5 },
  { id: "c6", propertyId: "p04", time: "08:30–10:00", cleaner: "Sabrina", cleanerInitials: "SA", status: "Completed", booking: "BK-2026-0468", score: 4 },
  { id: "c7", propertyId: "p25", time: "11:00–14:00", cleaner: "Stana", cleanerInitials: "ST", status: "NoResponse", booking: "BK-2867", score: null },
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
    { who: "us", text: "Hi Andrea, turnover at 1455 Howe today, 11:00. Standard checklist. Next guest checks in at 3 PM.", time: "08:42" },
    { who: "us", text: "Bumping — confirming you can take this one?", time: "10:15" },
    { who: "us", text: "Andrea, we have a same-day check-in at 3 PM. Please confirm or we'll dispatch Carly.", time: "10:55" },
  ],
  c2: [
    { who: "us", text: "Hi Carly, 601 Beach Crescent today 12:00. Family group, deep wipe of kitchen requested.", time: "09:15" },
    { who: "them", text: "Heading there now.", time: "11:48" },
  ],
  c3: [
    { who: "us", text: "Sabrina, turnover at 788 Hamilton today 13:30. Standard checklist.", time: "09:30" },
    { who: "them", text: "Got it. Building intercom code?", time: "12:40" },
    { who: "us", text: "Intercom 4321, lockbox 5588.", time: "12:42" },
    { who: "them", text: "In the unit, starting now.", time: "13:34" },
    { who: "them", text: "Photo: living room after turnover.", time: "14:05", photo: true },
  ],
  c4: [
    { who: "us", text: "Andrea, quick turn at 900 Pacific Blvd. Two-night stay, light clean.", time: "08:50" },
    { who: "them", text: "Done, photos attached.", time: "11:24", photo: true },
    { who: "us", text: "Beautiful. Ready for 4 PM check-in.", time: "11:26" },
  ],
  c7: [
    { who: "us", text: "Stana, turnover at 4900 Joyce St today 11:00. East Van route. Checkout was at 10:30.", time: "09:25" },
    { who: "us", text: "Bumping — are you on your way? Next check-in is 4 PM.", time: "10:50" },
    { who: "us", text: "Stana, no answer. Reassigning to Andrea L. if we don't hear back in 20 min.", time: "11:35" },
  ],
};

export const TODAY_CLEANINGS_SUMMARY = [
  { property: "1455 Howe St", window: "11:00–14:00", cleaner: "Andrea", status: "No response" },
  { property: "601 Beach Crescent", window: "12:00–15:00", cleaner: "Carly", status: "Dispatched" },
  { property: "788 Hamilton St", window: "13:30–16:00", cleaner: "Sabrina", status: "In progress" },
];
