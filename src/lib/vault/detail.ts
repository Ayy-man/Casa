/**
 * Vault detail-config — one builder per entity, mapping a mock-data record to
 * the VaultDetail shape consumed by casa/vault-sheet.tsx. Centralizing this
 * means a table-page row click and a deep-linked /vault/{name}/[id] route
 * render the SAME detail surface (plan 01-04, Task 3 acceptance criterion).
 *
 * Pure data — no JSX. Action buttons are mock-only (Phase 1, L1).
 */
import type { VaultDetail } from "@/components/casa/vault-sheet";
import { getProperty, type Property } from "@/lib/mock-data/properties";
import {
  channelLabel,
  formatDate,
  statusLabel,
  type Booking,
} from "@/lib/mock-data/bookings";
import { cleanStatusLabel, type Cleaning } from "@/lib/mock-data/cleanings";
import type { PendingClaim } from "@/lib/mock-data/claims";
import type { Owner } from "@/lib/mock-data/owners";

const money = (n: number) => "$" + n.toLocaleString("en-CA");

export function propertyDetail(p: Property): VaultDetail {
  return {
    eyebrow: `Property · ${p.id.toUpperCase()}`,
    title: p.name,
    subtitle: `${p.neighborhood} · ${p.type}`,
    stats: [
      { label: "Nightly Rate", value: money(p.rate) },
      { label: "Status", value: p.status },
      { label: "Bedrooms", value: String(p.beds) },
      { label: "Sleeps", value: String(p.maxGuests) },
    ],
    rows: [
      { key: "Neighborhood", value: p.neighborhood },
      { key: "Type", value: p.type },
      { key: "Square Feet", value: p.sqft.toLocaleString("en-CA") },
      { key: "Beds / Baths", value: `${p.beds} bed · ${p.baths} bath` },
      { key: "Owner", value: p.owner },
      { key: "Owner Email", value: p.ownerEmail },
      { key: "Owner Phone", value: p.ownerPhone },
      { key: "Comm. Preference", value: p.commPref },
    ],
    actions: [
      { label: "Edit Property", kind: "accent" },
      { label: "View Bookings", kind: "outline" },
      { label: "Flag for Correction", kind: "tertiary" },
    ],
  };
}

export function bookingDetail(b: Booking): VaultDetail {
  const p = getProperty(b.propertyId);
  const total = b.rate + b.fees + b.taxes;
  return {
    eyebrow: `Booking · ${b.id}`,
    title: b.guest,
    subtitle: `${p?.name ?? "Unknown property"} · ${formatDate(b.checkIn)}–${formatDate(b.checkOut)}`,
    stats: [
      { label: "Nightly Rate", value: money(b.rate) },
      { label: "Total", value: money(total) },
      { label: "Channel", value: channelLabel(b.channel) },
      { label: "Status", value: statusLabel(b.status) },
    ],
    rows: [
      { key: "Property", value: p?.name ?? "—" },
      { key: "Guest", value: b.guest },
      { key: "Check-in", value: formatDate(b.checkIn) },
      { key: "Check-out", value: formatDate(b.checkOut) },
      { key: "Channel", value: channelLabel(b.channel) },
      { key: "Status", value: statusLabel(b.status) },
      { key: "Fees", value: money(b.fees) },
      { key: "Taxes", value: money(b.taxes) },
      { key: "Last Message", value: b.lastMsg },
    ],
    actions: [
      { label: "Message Guest", kind: "accent" },
      { label: "View Property", kind: "outline" },
    ],
  };
}

export function cleaningDetail(c: Cleaning): VaultDetail {
  const p = getProperty(c.propertyId);
  return {
    eyebrow: `Turnover · ${c.id.toUpperCase()}`,
    title: p?.name ?? "Unknown property",
    subtitle: `${c.cleaner} · ${c.time}`,
    stats: [
      { label: "Cleaner", value: c.cleaner },
      { label: "Window", value: c.time },
      { label: "Status", value: cleanStatusLabel(c.status) },
      { label: "Quality", value: c.score != null ? `${c.score} / 5` : "—" },
    ],
    rows: [
      { key: "Property", value: p?.name ?? "—" },
      { key: "Neighborhood", value: p?.neighborhood ?? "—" },
      { key: "Cleaner", value: c.cleaner },
      { key: "Window", value: c.time },
      { key: "Status", value: cleanStatusLabel(c.status) },
      { key: "Booking", value: c.booking ?? "—" },
      { key: "Quality Score", value: c.score != null ? `${c.score} / 5` : "Not yet scored" },
    ],
    actions: [
      { label: "Message Cleaner", kind: "accent" },
      { label: "Dispatch Backup", kind: "outline" },
    ],
  };
}

export function claimDetail(c: PendingClaim): VaultDetail {
  const p = getProperty(c.propertyId);
  return {
    eyebrow: `Claim · ${c.id}`,
    title: `${c.guestName} — ${money(c.cost)}`,
    subtitle: `${p?.name ?? "Unknown property"} · ${c.bookingDates}`,
    stats: [
      { label: "Claim Amount", value: money(c.cost) },
      { label: "Photos", value: String(c.photos) },
      { label: "Raised By", value: c.raisedBy },
      { label: "Booking", value: c.bookingId },
    ],
    rows: [
      { key: "Property", value: p?.name ?? "—" },
      { key: "Guest", value: c.guestName },
      { key: "Booking Dates", value: c.bookingDates },
      { key: "Booking ID", value: c.bookingId },
      { key: "Damage", value: c.damage },
      { key: "Estimated Cost", value: money(c.cost) },
      { key: "Photos", value: `${c.photos} attached` },
      { key: "Raised By", value: c.raisedBy },
      { key: "Filed", value: c.timeAgo },
    ],
    actions: [
      { label: "Approve Claim", kind: "accent" },
      { label: "Edit Draft", kind: "outline" },
      { label: "Reject", kind: "tertiary" },
    ],
  };
}

export function ownerDetail(o: Owner): VaultDetail {
  const propertyNames = o.properties
    .map((id) => getProperty(id)?.name ?? id)
    .join(", ");
  return {
    eyebrow: `Owner · ${o.id.toUpperCase()}`,
    title: o.name,
    subtitle: `${o.properties.length} ${o.properties.length === 1 ? "property" : "properties"} · ${o.status}`,
    stats: [
      { label: "Properties", value: String(o.properties.length) },
      { label: "YTD Payout", value: money(o.ytdPayout) },
      { label: "Status", value: o.status },
      { label: "Comm.", value: o.commPref },
    ],
    rows: [
      { key: "Email", value: o.email },
      { key: "Phone", value: o.phone },
      { key: "Comm. Preference", value: o.commPref },
      { key: "Properties", value: propertyNames },
      { key: "With Casa Since", value: o.since },
      { key: "Status", value: o.status },
      { key: "Payout Method", value: o.payoutMethod },
      { key: "YTD Payout", value: money(o.ytdPayout) },
      { key: "Notes", value: o.notes },
    ],
    actions: [
      { label: "Contact Owner", kind: "accent" },
      { label: "View Statement", kind: "outline" },
    ],
  };
}
