export type CertType =
  | "STR License"
  | "Liability Insurance"
  | "Fire Safety"
  | "Business License"
  | "Building Permit";

export type CertStatus = "Valid" | "Expiring" | "Expired" | "Pending";

export type Certificate = {
  id: string;
  propertyId: string;
  property: string;
  neighborhood: string;
  type: CertType;
  status: CertStatus;
  /** ISO date the certificate was issued. */
  issued: string;
  /** ISO date the certificate expires. */
  expires: string;
  authority: string;
  /** Permit / policy / licence reference number. */
  reference: string;
  note: string;
};

/**
 * Compliance certificates across the portfolio. Two entries are locked to the
 * exception cards: the STR License on 1120 Hamilton St (p23, expiring — the
 * 12-day expiry card) and the Liability Insurance on 2255 Davie St (p04,
 * expiring May 31 — the end-of-month lapse card). Modeled on bookings.ts —
 * a typed array plus a `getCertificate` id lookup.
 */
export const COMPLIANCE: Certificate[] = [
  { id: "C-3201", propertyId: "p23", property: "1120 Hamilton St", neighborhood: "Yaletown", type: "STR License", status: "Expiring", issued: "2025-06-01", expires: "2026-06-01", authority: "City of Vancouver", reference: "STR-2025-118430", note: "Renewal requires proof of principal residence or operator licence. 14-day alert threshold reached." },
  { id: "C-3202", propertyId: "p04", property: "2255 Davie St", neighborhood: "West End", type: "Liability Insurance", status: "Expiring", issued: "2025-05-31", expires: "2026-05-31", authority: "Westland Insurance", reference: "POL-884217", note: "Short-term rental liability policy lapses end of month — no renewal on file yet." },
  { id: "C-3203", propertyId: "p01", property: "1455 Howe St", neighborhood: "Yaletown", type: "STR License", status: "Valid", issued: "2025-09-12", expires: "2026-09-12", authority: "City of Vancouver", reference: "STR-2025-104221", note: "Current. Next renewal alert fires August 2026." },
  { id: "C-3204", propertyId: "p01", property: "1455 Howe St", neighborhood: "Yaletown", type: "Fire Safety", status: "Valid", issued: "2025-11-04", expires: "2026-11-04", authority: "Vancouver Fire & Rescue", reference: "FS-2025-77310", note: "Annual smoke / CO inspection passed." },
  { id: "C-3205", propertyId: "p02", property: "989 Nelson St", neighborhood: "Downtown", type: "STR License", status: "Valid", issued: "2025-08-20", expires: "2026-08-20", authority: "City of Vancouver", reference: "STR-2025-100884", note: "Current." },
  { id: "C-3206", propertyId: "p03", property: "3280 W Broadway", neighborhood: "Point Grey", type: "STR License", status: "Valid", issued: "2025-10-01", expires: "2026-10-01", authority: "City of Vancouver", reference: "STR-2025-110552", note: "Current." },
  { id: "C-3207", propertyId: "p03", property: "3280 W Broadway", neighborhood: "Point Grey", type: "Liability Insurance", status: "Valid", issued: "2026-01-15", expires: "2027-01-15", authority: "Intact Insurance", reference: "POL-902118", note: "Renewed in January — full year of coverage." },
  { id: "C-3208", propertyId: "p06", property: "5550 Cambie St", neighborhood: "Cambie", type: "Building Permit", status: "Pending", issued: "2026-04-02", expires: "2026-10-02", authority: "City of Vancouver", reference: "BP-2026-04419", note: "Kitchen-refresh permit open while the unit is in maintenance." },
  { id: "C-3209", propertyId: "p07", property: "788 Hamilton St", neighborhood: "Yaletown", type: "STR License", status: "Valid", issued: "2025-07-18", expires: "2026-07-18", authority: "City of Vancouver", reference: "STR-2025-098771", note: "Current — renewal window opens June." },
  { id: "C-3210", propertyId: "p10", property: "601 Beach Crescent", neighborhood: "Yaletown", type: "Fire Safety", status: "Valid", issued: "2025-12-09", expires: "2026-12-09", authority: "Vancouver Fire & Rescue", reference: "FS-2025-79944", note: "Annual inspection passed." },
  { id: "C-3211", propertyId: "p12", property: "2400 Cornwall Ave", neighborhood: "Kitsilano", type: "STR License", status: "Valid", issued: "2025-09-30", expires: "2026-09-30", authority: "City of Vancouver", reference: "STR-2025-107203", note: "Current." },
  { id: "C-3212", propertyId: "p13", property: "900 Pacific Blvd", neighborhood: "Yaletown", type: "Business License", status: "Valid", issued: "2026-01-01", expires: "2026-12-31", authority: "City of Vancouver", reference: "BL-2026-22018", note: "Annual operator business licence — current." },
  { id: "C-3213", propertyId: "p17", property: "3050 Heather St", neighborhood: "Fairview", type: "STR License", status: "Pending", issued: "2026-04-28", expires: "2027-04-28", authority: "City of Vancouver", reference: "STR-2026-002914", note: "New listing — licence application submitted, awaiting city approval." },
  { id: "C-3214", propertyId: "p18", property: "1500 Robson St", neighborhood: "West End", type: "Liability Insurance", status: "Valid", issued: "2025-11-22", expires: "2026-11-22", authority: "Westland Insurance", reference: "POL-889640", note: "Current." },
  { id: "C-3215", propertyId: "p22", property: "525 Smithe St", neighborhood: "Downtown", type: "STR License", status: "Expired", issued: "2025-03-15", expires: "2026-03-15", authority: "City of Vancouver", reference: "STR-2025-090117", note: "Lapsed — unit is in maintenance and owner is offboarding; no renewal planned." },
  { id: "C-3216", propertyId: "p23", property: "1120 Hamilton St", neighborhood: "Yaletown", type: "Fire Safety", status: "Valid", issued: "2026-02-18", expires: "2027-02-18", authority: "Vancouver Fire & Rescue", reference: "FS-2026-80217", note: "Annual inspection passed." },
  { id: "C-3217", propertyId: "p25", property: "4900 Joyce St", neighborhood: "East Van", type: "STR License", status: "Pending", issued: "2026-03-21", expires: "2027-03-21", authority: "City of Vancouver", reference: "STR-2026-001755", note: "Onboarding property — licence pending alongside listing setup." },
  { id: "C-3218", propertyId: "p26", property: "1233 W Cordova St", neighborhood: "Coal Harbour", type: "STR License", status: "Valid", issued: "2025-10-14", expires: "2026-10-14", authority: "City of Vancouver", reference: "STR-2025-111906", note: "Current." },
  { id: "C-3219", propertyId: "p26", property: "1233 W Cordova St", neighborhood: "Coal Harbour", type: "Liability Insurance", status: "Valid", issued: "2026-01-08", expires: "2027-01-08", authority: "Intact Insurance", reference: "POL-901442", note: "Current." },
  { id: "C-3220", propertyId: "p05", property: "1633 Quebec St", neighborhood: "Olympic Village", type: "Fire Safety", status: "Valid", issued: "2025-12-30", expires: "2026-12-30", authority: "Vancouver Fire & Rescue", reference: "FS-2025-80031", note: "Annual inspection passed." },
];

export const getCertificate = (id: string): Certificate | undefined =>
  COMPLIANCE.find((c) => c.id === id);
