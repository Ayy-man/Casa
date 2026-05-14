export type PropertyStatus = "Active" | "Maintenance" | "New";

export type Property = {
  id: string;
  name: string;
  neighborhood: string;
  type: string;
  rate: number;
  status: PropertyStatus;
  sqft: number;
  beds: number;
  baths: number;
  maxGuests: number;
  owner: string;
  ownerEmail: string;
  ownerPhone: string;
  commPref: "WhatsApp" | "Email" | "Phone";
};

export const PROPERTIES: Property[] = [
  { id: "p01", name: "1455 Howe St", neighborhood: "Yaletown", type: "2BR Condo", rate: 285, status: "Active", sqft: 920, beds: 2, baths: 2, maxGuests: 4, owner: "Helena Wong", ownerEmail: "helena.wong@example.com", ownerPhone: "+1 604 555 0142", commPref: "WhatsApp" },
  { id: "p02", name: "989 Nelson St", neighborhood: "Downtown", type: "Studio", rate: 165, status: "Active", sqft: 480, beds: 0, baths: 1, maxGuests: 2, owner: "Marc Eldridge", ownerEmail: "marc.eld@example.com", ownerPhone: "+1 604 555 0188", commPref: "Email" },
  { id: "p03", name: "3280 W Broadway", neighborhood: "Pt Grey", type: "3BR House", rate: 420, status: "Active", sqft: 1820, beds: 3, baths: 2.5, maxGuests: 6, owner: "David Tremblay", ownerEmail: "d.tremblay@example.com", ownerPhone: "+1 604 555 0119", commPref: "Phone" },
  { id: "p04", name: "2255 Davie St", neighborhood: "West End", type: "1BR Condo", rate: 220, status: "Active", sqft: 640, beds: 1, baths: 1, maxGuests: 2, owner: "Aisha Rahman", ownerEmail: "aisha.r@example.com", ownerPhone: "+1 604 555 0170", commPref: "WhatsApp" },
  { id: "p05", name: "1633 Quebec St", neighborhood: "Olympic Village", type: "2BR Condo", rate: 310, status: "Active", sqft: 1040, beds: 2, baths: 2, maxGuests: 4, owner: "James Park", ownerEmail: "james.park@example.com", ownerPhone: "+1 604 555 0151", commPref: "Email" },
  { id: "p06", name: "5550 Cambie St", neighborhood: "Cambie", type: "1BR Condo", rate: 195, status: "Maintenance", sqft: 720, beds: 1, baths: 1, maxGuests: 2, owner: "Priya Shah", ownerEmail: "priya.s@example.com", ownerPhone: "+1 604 555 0193", commPref: "WhatsApp" },
  { id: "p07", name: "788 Hamilton St", neighborhood: "Yaletown", type: "1BR Loft", rate: 360, status: "Active", sqft: 880, beds: 1, baths: 1.5, maxGuests: 3, owner: "Olivia Smith", ownerEmail: "olivia.s@example.com", ownerPhone: "+1 604 555 0114", commPref: "Email" },
  { id: "p08", name: "1100 Granville St", neighborhood: "Downtown", type: "1BR Condo", rate: 175, status: "Active", sqft: 580, beds: 1, baths: 1, maxGuests: 2, owner: "Rohan Mehta", ownerEmail: "rohan.m@example.com", ownerPhone: "+1 604 555 0167", commPref: "WhatsApp" },
  { id: "p09", name: "4321 Main St", neighborhood: "Mt Pleasant", type: "2BR Condo", rate: 240, status: "Active", sqft: 880, beds: 2, baths: 1, maxGuests: 4, owner: "Sasha Belkin", ownerEmail: "s.belkin@example.com", ownerPhone: "+1 604 555 0136", commPref: "Phone" },
  { id: "p10", name: "601 Beach Crescent", neighborhood: "Yaletown", type: "2BR Condo", rate: 295, status: "Active", sqft: 1100, beds: 2, baths: 2, maxGuests: 4, owner: "Lily Tanaka", ownerEmail: "l.tanaka@example.com", ownerPhone: "+1 604 555 0103", commPref: "WhatsApp" },
  { id: "p11", name: "1818 Robson St", neighborhood: "West End", type: "1BR Condo", rate: 215, status: "Active", sqft: 600, beds: 1, baths: 1, maxGuests: 2, owner: "Ben Mercier", ownerEmail: "ben.m@example.com", ownerPhone: "+1 604 555 0144", commPref: "Email" },
  { id: "p12", name: "2400 Cornwall Ave", neighborhood: "Kitsilano", type: "2BR Condo", rate: 275, status: "Active", sqft: 980, beds: 2, baths: 2, maxGuests: 4, owner: "Maya Lutz", ownerEmail: "maya.l@example.com", ownerPhone: "+1 604 555 0185", commPref: "WhatsApp" },
  { id: "p13", name: "900 Pacific Blvd", neighborhood: "Yaletown", type: "1BR Condo", rate: 230, status: "Active", sqft: 700, beds: 1, baths: 1, maxGuests: 2, owner: "Carlos Robles", ownerEmail: "carlos.r@example.com", ownerPhone: "+1 604 555 0179", commPref: "WhatsApp" },
  { id: "p14", name: "1322 Bidwell St", neighborhood: "West End", type: "Studio", rate: 155, status: "Active", sqft: 460, beds: 0, baths: 1, maxGuests: 2, owner: "Theo Aldred", ownerEmail: "t.aldred@example.com", ownerPhone: "+1 604 555 0123", commPref: "Email" },
  { id: "p15", name: "2933 Granville St", neighborhood: "South Granville", type: "2BR Condo", rate: 245, status: "Active", sqft: 920, beds: 2, baths: 2, maxGuests: 4, owner: "Simone Park", ownerEmail: "s.park@example.com", ownerPhone: "+1 604 555 0162", commPref: "WhatsApp" },
  { id: "p16", name: "110 Switchmen St", neighborhood: "Olympic Village", type: "2BR Condo", rate: 305, status: "Active", sqft: 1080, beds: 2, baths: 2, maxGuests: 4, owner: "Jordan Reyes", ownerEmail: "j.reyes@example.com", ownerPhone: "+1 604 555 0152", commPref: "Email" },
  { id: "p17", name: "845 Hornby St", neighborhood: "Downtown", type: "1BR Condo", rate: 200, status: "Active", sqft: 620, beds: 1, baths: 1, maxGuests: 2, owner: "Yara Singh", ownerEmail: "yara.s@example.com", ownerPhone: "+1 604 555 0148", commPref: "WhatsApp" },
  { id: "p18", name: "3050 Heather St", neighborhood: "Fairview", type: "2BR Condo", rate: 235, status: "New", sqft: 880, beds: 2, baths: 1, maxGuests: 4, owner: "Will Maeda", ownerEmail: "w.maeda@example.com", ownerPhone: "+1 604 555 0117", commPref: "Email" },
  { id: "p19", name: "1500 Robson St", neighborhood: "West End", type: "2BR Condo", rate: 320, status: "Active", sqft: 1080, beds: 2, baths: 2, maxGuests: 4, owner: "Naomi Chow", ownerEmail: "naomi.c@example.com", ownerPhone: "+1 604 555 0156", commPref: "WhatsApp" },
  { id: "p20", name: "2025 Larch St", neighborhood: "Kitsilano", type: "1BR Condo", rate: 215, status: "Active", sqft: 640, beds: 1, baths: 1, maxGuests: 2, owner: "Felix Brun", ownerEmail: "felix.b@example.com", ownerPhone: "+1 604 555 0173", commPref: "Email" },
  { id: "p21", name: "4500 Oak St", neighborhood: "Cambie", type: "2BR Condo", rate: 190, status: "Active", sqft: 920, beds: 2, baths: 2, maxGuests: 4, owner: "Indira Nair", ownerEmail: "i.nair@example.com", ownerPhone: "+1 604 555 0181", commPref: "WhatsApp" },
  { id: "p22", name: "1700 Comox St", neighborhood: "West End", type: "Studio", rate: 165, status: "Active", sqft: 480, beds: 0, baths: 1, maxGuests: 2, owner: "Owen Davies", ownerEmail: "owen.d@example.com", ownerPhone: "+1 604 555 0177", commPref: "Email" },
  { id: "p23", name: "525 Smithe St", neighborhood: "Downtown", type: "2BR Condo", rate: 290, status: "Maintenance", sqft: 980, beds: 2, baths: 2, maxGuests: 4, owner: "Pippa Holst", ownerEmail: "pippa.h@example.com", ownerPhone: "+1 604 555 0184", commPref: "WhatsApp" },
  { id: "p24", name: "3700 Knight St", neighborhood: "Kensington", type: "2BR Condo", rate: 220, status: "Active", sqft: 880, beds: 2, baths: 1, maxGuests: 4, owner: "Alec Kowalski", ownerEmail: "alec.k@example.com", ownerPhone: "+1 604 555 0193", commPref: "WhatsApp" },
  { id: "p25", name: "2640 Yew St", neighborhood: "Kitsilano", type: "1BR Condo", rate: 250, status: "New", sqft: 660, beds: 1, baths: 1, maxGuests: 2, owner: "Rita Salgado", ownerEmail: "rita.s@example.com", ownerPhone: "+1 604 555 0102", commPref: "Email" },
  { id: "p26", name: "4900 Joyce St", neighborhood: "East Van", type: "3BR House", rate: 260, status: "Active", sqft: 1640, beds: 3, baths: 2, maxGuests: 6, owner: "Tomas Vega", ownerEmail: "t.vega@example.com", ownerPhone: "+1 604 555 0166", commPref: "WhatsApp" },
];

export const propertyImg = (p: Pick<Property, "id">) =>
  `https://picsum.photos/seed/casa-${p.id}/640/480`;

export const getProperty = (id: string): Property | undefined =>
  PROPERTIES.find((p) => p.id === id);
