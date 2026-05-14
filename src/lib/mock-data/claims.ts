export type PendingClaim = {
  id: string;
  propertyId: string;
  guestName: string;
  bookingDates: string;
  bookingId: string;
  damage: string;
  cost: number;
  photos: number;
  raisedBy: string;
  timeAgo: string;
  draft: string;
};

export type LedgerClaim = {
  id: string;
  propertyId: string;
  guestName: string;
  bookingDates: string;
  cost: number;
  status: string;
};

export const CLAIMS: {
  pending: PendingClaim[];
  submitted: LedgerClaim[];
  resolved: LedgerClaim[];
} = {
  pending: [
    {
      id: "CL-2026-0042",
      propertyId: "p03",
      guestName: "Mei L.",
      bookingDates: "Apr 22 — Apr 27, 2026",
      bookingId: "BK-2026-0440",
      damage:
        "Long scratch (~14 in.) across hardwood in the dining area. Likely from chair leg dragged without felt pad. Discovered during turnover.",
      cost: 480,
      photos: 6,
      raisedBy: "Ops Agent",
      timeAgo: "1 hr ago",
      draft:
        "During the standard post-stay inspection on April 27, the cleaning team identified a scratch approximately 14 inches long across the hardwood flooring in the dining area of 3280 W Broadway. The mark is consistent with a chair leg dragged across the floor without a protective felt pad.\n\nWe are filing a damage claim of $480 to cover refinishing the affected board section. Photos before and after the stay are attached for reference.",
    },
    {
      id: "CL-2026-0043",
      propertyId: "p11",
      guestName: "Walsh, P.",
      bookingDates: "Apr 18 — Apr 21, 2026",
      bookingId: "BK-2026-0431",
      damage:
        "Bedside table lamp shattered on the bedroom floor. Wax stain on the living room carpet near the sofa, approx 10cm.",
      cost: 215,
      photos: 6,
      raisedBy: "Ops Agent",
      timeAgo: "4 hr ago",
      draft:
        "During the post-stay inspection on April 21, the cleaning team identified two damages at 1818 Robson St:\n\n1. Bedside table lamp (ceramic base) shattered on the bedroom floor.\n2. A wax stain approximately 10cm across on the living room carpet, near the sofa.\n\nWe are filing a combined damage claim of $215 ($95 lamp replacement, $120 carpet treatment).",
    },
  ],
  submitted: [
    { id: "CL-2026-0038", propertyId: "p10", guestName: "Sato, R.", bookingDates: "Apr 12 — Apr 16, 2026", cost: 320, status: "Submitted to Airbnb" },
    { id: "CL-2026-0035", propertyId: "p07", guestName: "Brown, K.", bookingDates: "Apr 04 — Apr 09, 2026", cost: 145, status: "Awaiting guest reply" },
    { id: "CL-2026-0031", propertyId: "p05", guestName: "Iyer, P.", bookingDates: "Mar 28 — Apr 01, 2026", cost: 800, status: "Disputed by guest" },
    { id: "CL-2026-0029", propertyId: "p13", guestName: "Cole, R.", bookingDates: "Mar 22 — Mar 25, 2026", cost: 90, status: "Submitted to Vrbo" },
  ],
  resolved: [
    { id: "CL-2026-0024", propertyId: "p01", guestName: "Ng, T.", bookingDates: "Mar 10 — Mar 14, 2026", cost: 220, status: "Paid" },
  ],
};

export const photoSeed = (claimId: string, kind: string, i: number) =>
  `https://picsum.photos/seed/${claimId}-${kind}-${i}/240/240`;
