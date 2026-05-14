export type BookingStatus = "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
export type Channel = "Airbnb" | "Vrbo" | "BookingCom" | "Direct";

export type Booking = {
  id: string;
  propertyId: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  channel: Channel;
  status: BookingStatus;
  rate: number;
  fees: number;
  taxes: number;
  lastMsg: string;
};

export const BOOKINGS: Booking[] = [
  { id: "BK-2026-0471", propertyId: "p01", guest: "Helena W.", checkIn: "2026-05-01", checkOut: "2026-05-04", channel: "Airbnb", status: "CheckedIn", rate: 285, fees: 60, taxes: 92, lastMsg: "Hi, do you have an extra parking spot for our second car?" },
  { id: "BK-2026-0470", propertyId: "p02", guest: "Aaron H.", checkIn: "2026-04-29", checkOut: "2026-05-01", channel: "BookingCom", status: "CheckedOut", rate: 165, fees: 45, taxes: 51, lastMsg: "Thanks, left the keys on the counter as instructed." },
  { id: "BK-2026-0469", propertyId: "p03", guest: "Mei L.", checkIn: "2026-05-02", checkOut: "2026-05-09", channel: "Vrbo", status: "Confirmed", rate: 420, fees: 90, taxes: 196, lastMsg: "Looking forward to the stay! Any tips on the neighbourhood?" },
  { id: "BK-2026-0468", propertyId: "p04", guest: "Yusra K.", checkIn: "2026-05-01", checkOut: "2026-05-03", channel: "Direct", status: "Confirmed", rate: 220, fees: 30, taxes: 48, lastMsg: "Confirmed — see you Friday afternoon." },
  { id: "BK-2026-0467", propertyId: "p07", guest: "Wong, J.", checkIn: "2026-05-01", checkOut: "2026-05-04", channel: "Airbnb", status: "Confirmed", rate: 360, fees: 60, taxes: 110, lastMsg: "Will it be possible to check in slightly earlier, around 3?" },
  { id: "BK-2026-0466", propertyId: "p10", guest: "Becker, K.", checkIn: "2026-05-01", checkOut: "2026-05-05", channel: "Vrbo", status: "Confirmed", rate: 320, fees: 80, taxes: 138, lastMsg: "Thanks for the recs!" },
  { id: "BK-2026-0465", propertyId: "p13", guest: "Holm, P.", checkIn: "2026-04-28", checkOut: "2026-05-01", channel: "Airbnb", status: "CheckedOut", rate: 230, fees: 45, taxes: 71, lastMsg: "Apartment was perfect. Tagging you on a 5-star." },
  { id: "BK-2026-0464", propertyId: "p15", guest: "Okafor, T.", checkIn: "2026-04-27", checkOut: "2026-05-01", channel: "Direct", status: "CheckedOut", rate: 245, fees: 30, taxes: 73, lastMsg: "All good, thanks for the stay." },
  { id: "BK-2026-0463", propertyId: "p05", guest: "Lee, S.", checkIn: "2026-05-04", checkOut: "2026-05-08", channel: "Airbnb", status: "Confirmed", rate: 310, fees: 60, taxes: 130, lastMsg: "Just confirming a 4pm check-in is fine." },
  { id: "BK-2026-0462", propertyId: "p11", guest: "Walsh, P.", checkIn: "2026-05-06", checkOut: "2026-05-09", channel: "BookingCom", status: "Confirmed", rate: 215, fees: 45, taxes: 70, lastMsg: "Booked. Will send arrival time soon." },
  { id: "BK-2026-0461", propertyId: "p14", guest: "Reyes, J.", checkIn: "2026-04-25", checkOut: "2026-04-30", channel: "Airbnb", status: "Cancelled", rate: 155, fees: 30, taxes: 42, lastMsg: "Plans changed — cancelling within window." },
  { id: "BK-2026-0460", propertyId: "p16", guest: "Nguyen, A.", checkIn: "2026-05-02", checkOut: "2026-05-04", channel: "Vrbo", status: "Confirmed", rate: 305, fees: 60, taxes: 96, lastMsg: "See you Saturday — thanks." },
  { id: "BK-2026-0459", propertyId: "p18", guest: "Brun, F.", checkIn: "2026-05-08", checkOut: "2026-05-12", channel: "Direct", status: "Confirmed", rate: 235, fees: 30, taxes: 75, lastMsg: "Confirmed." },
  { id: "BK-2026-0458", propertyId: "p20", guest: "Tanaka, R.", checkIn: "2026-05-03", checkOut: "2026-05-06", channel: "Airbnb", status: "Confirmed", rate: 215, fees: 45, taxes: 65, lastMsg: "Excited!" },
  { id: "BK-2026-0457", propertyId: "p26", guest: "Vega, M.", checkIn: "2026-05-12", checkOut: "2026-05-19", channel: "Vrbo", status: "Confirmed", rate: 260, fees: 60, taxes: 218, lastMsg: "Family of 5 — thanks for the early heads-up about parking." },
];

export const channelClass = (c: Channel) => "ch-" + c;
export const channelLabel = (c: Channel) => (c === "BookingCom" ? "Booking.com" : c);
export const statusClass = (s: BookingStatus) => "status-" + s;
export const statusLabel = (s: BookingStatus) =>
  s === "CheckedIn" ? "Checked-in" : s === "CheckedOut" ? "Checked-out" : s;

export const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};

export const getBooking = (id: string) => BOOKINGS.find((b) => b.id === id);

export const TODAY_CHECKINS = [
  { property: "788 Hamilton St — Yaletown Loft", who: "Wong, party of 3", time: "4:00 PM" },
  { property: "5550 Cambie St", who: "Becker, party of 2", time: "6:30 PM" },
];

export const TODAY_CHECKOUTS = [
  { property: "989 Nelson St", who: "Holm, party of 2", time: "11:00 AM" },
  { property: "2255 Davie St", who: "Okafor, party of 4", time: "11:00 AM" },
];
