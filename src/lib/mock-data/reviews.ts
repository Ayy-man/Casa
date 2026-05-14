export type Review = {
  rating: number;
  guest: string;
  date: string;
  channel: "Airbnb" | "Vrbo" | "BookingCom" | "Direct";
  text: string;
};

export const REVIEWS_BY_PROP: Record<string, Review[]> = {
  default: [
    { rating: 5, guest: "Helena", date: "Apr 29, 2026", channel: "Airbnb", text: "Spotless, beautiful light, walkable to everything. We’d come back." },
    { rating: 5, guest: "Aaron", date: "Apr 24, 2026", channel: "BookingCom", text: "The check-in instructions were the clearest I’ve ever seen." },
    { rating: 4, guest: "Mei", date: "Apr 18, 2026", channel: "Vrbo", text: "Beautiful place. The hot water took a while to come on." },
    { rating: 5, guest: "Jamil", date: "Apr 09, 2026", channel: "Airbnb", text: "Casa’s response to a small heater question was almost instant." },
    { rating: 5, guest: "Ines", date: "Apr 02, 2026", channel: "Airbnb", text: "Stylish, exactly as photographed. Linens were lovely." },
    { rating: 5, guest: "Wei", date: "Mar 28, 2026", channel: "Direct", text: "Effortless from booking to check-out." },
    { rating: 4, guest: "Owen", date: "Mar 21, 2026", channel: "Airbnb", text: "Great location, the building elevator was slow but that’s not on Casa." },
    { rating: 5, guest: "Tara", date: "Mar 14, 2026", channel: "Vrbo", text: "Spacious and clean. Coffee setup is a nice touch." },
    { rating: 5, guest: "Simon", date: "Mar 06, 2026", channel: "Airbnb", text: "Felt like a hotel run by people who actually care." },
    { rating: 5, guest: "Lara", date: "Feb 28, 2026", channel: "BookingCom", text: "Very thoughtful welcome note. Would book again." },
  ],
};

export type ActivityEntry = {
  time: string;
  agent: string;
  text: string;
  status: "shadow" | "sent" | "exception";
};

export const ACTIVITY_BY_PROP: Record<string, ActivityEntry[]> = {
  default: [
    { time: "Today, 09:42", agent: "Pricing", text: "Recommended +19.3% for Week of May 4. FIFA week demand.", status: "shadow" },
    { time: "Today, 08:17", agent: "Guest", text: "Drafted reply to Wong re: parking, awaiting human approval.", status: "sent" },
    { time: "Today, 07:55", agent: "Ops", text: "Confirmed turnover assigned to Andrea C. for 11:00.", status: "sent" },
    { time: "Yest, 18:02", agent: "Pricing", text: "Pulled comp set for next 14 nights.", status: "sent" },
    { time: "Yest, 14:30", agent: "SOP", text: "Verified lockbox code unchanged from last quarter.", status: "sent" },
    { time: "Yest, 11:11", agent: "Guest", text: "Auto-replied to FAQ: \"Is the parking included?\"", status: "sent" },
    { time: "Apr 29, 16:48", agent: "Ops", text: "Flagged exception: cleaner ETA missed by 12 min.", status: "exception" },
    { time: "Apr 29, 09:00", agent: "Pricing", text: "Confirmed last week’s recs without override.", status: "sent" },
  ],
};
