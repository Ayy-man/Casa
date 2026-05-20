"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import {
  BOOKINGS,
  channelClass,
  channelLabel,
  formatDate,
  statusClass,
  statusLabel,
  type BookingStatus,
} from "@/lib/mock-data/bookings";
import { getProperty } from "@/lib/mock-data/properties";
import { VaultSheet } from "@/components/casa/vault-sheet";
import { bookingDetail } from "@/lib/vault/detail";

/** Vault › Bookings — derived from the properties reference table. */
const FILTERS: ("All" | BookingStatus)[] = [
  "All",
  "Confirmed",
  "CheckedIn",
  "CheckedOut",
  "Cancelled",
];
type SortKey = "id" | "guest" | "checkIn" | "checkOut" | "channel" | "status";

export default function VaultBookingsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortAsc, setSortAsc] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = BOOKINGS.filter((b) => {
      const p = getProperty(b.propertyId);
      return (
        (filter === "All" || b.status === filter) &&
        (q === "" ||
          `${b.id} ${b.guest} ${p?.name ?? ""}`.toLowerCase().includes(ql))
      );
    });
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? cmp : -cmp;
    });
  }, [q, filter, sortKey, sortAsc]);

  const sort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const open = openId ? BOOKINGS.find((b) => b.id === openId) : undefined;

  return (
    <div className="route-fade page-pad">
      <Link
        href="/vault"
        className="text-[11.5px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 mb-5 w-fit"
      >
        <ChevronLeft size={12} strokeWidth={1.5} />
        <span>Vault</span>
      </Link>

      <header className="mb-8">
        <div className="section-eyebrow">Vault</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Bookings
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          Last 30 days · {BOOKINGS.length} bookings.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[360px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Search size={14} strokeWidth={1.5} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="topbar-search"
            placeholder="Search by booking, guest, or property…"
          />
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-chip ${filter === f ? "active" : ""}`}
            >
              {f === "CheckedIn"
                ? "Checked-in"
                : f === "CheckedOut"
                  ? "Checked-out"
                  : f}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <span className="text-[11.5px] text-neutral-400">
          {rows.length} of {BOOKINGS.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("id")} style={{ cursor: "pointer" }}>
                Booking
              </th>
              <th>Property</th>
              <th onClick={() => sort("guest")} style={{ cursor: "pointer" }}>
                Guest
              </th>
              <th onClick={() => sort("checkIn")} style={{ cursor: "pointer" }}>
                Check-in
              </th>
              <th onClick={() => sort("checkOut")} style={{ cursor: "pointer" }}>
                Check-out
              </th>
              <th onClick={() => sort("channel")} style={{ cursor: "pointer" }}>
                Channel
              </th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const p = getProperty(b.propertyId);
              return (
                <tr
                  key={b.id}
                  onClick={() => setOpenId(b.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <span className="mono text-neutral-700">{b.id}</span>
                  </td>
                  <td>
                    <div className="font-display text-[14.5px] tracking-tight">
                      {p?.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {p?.neighborhood}
                    </div>
                  </td>
                  <td className="text-neutral-800">{b.guest}</td>
                  <td className="text-neutral-700 tabular-nums">
                    {formatDate(b.checkIn)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {formatDate(b.checkOut)}
                  </td>
                  <td>
                    <span className={`ch-pill ${channelClass(b.channel)}`}>
                      {channelLabel(b.channel)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <VaultSheet detail={bookingDetail(open)} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
