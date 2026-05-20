"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import {
  CLEANINGS_TODAY,
  cleanStatusLabel,
  type CleanStatus,
} from "@/lib/mock-data/cleanings";
import { getProperty } from "@/lib/mock-data/properties";
import { VaultSheet } from "@/components/casa/vault-sheet";
import { cleaningDetail } from "@/lib/vault/detail";

/** Vault › Cleanings — the Turnovers card destination. Derived from the reference table. */
const FILTERS: ("All" | CleanStatus)[] = [
  "All",
  "Assigned",
  "Dispatched",
  "InProgress",
  "Completed",
  "NoResponse",
];
type SortKey = "time" | "cleaner" | "status";

export default function VaultCleaningsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortAsc, setSortAsc] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = CLEANINGS_TODAY.filter((c) => {
      const p = getProperty(c.propertyId);
      return (
        (filter === "All" || c.status === filter) &&
        (q === "" ||
          `${c.cleaner} ${p?.name ?? ""} ${c.booking ?? ""}`
            .toLowerCase()
            .includes(ql))
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

  const open = openId
    ? CLEANINGS_TODAY.find((c) => c.id === openId)
    : undefined;

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
          Cleanings
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {CLEANINGS_TODAY.length} turnovers on today&rsquo;s board.
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
            placeholder="Search by cleaner, property, or booking…"
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
              {f === "All" ? f : cleanStatusLabel(f as CleanStatus)}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <span className="text-[11.5px] text-neutral-400">
          {rows.length} of {CLEANINGS_TODAY.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Property</th>
              <th onClick={() => sort("time")} style={{ cursor: "pointer" }}>
                Window
              </th>
              <th onClick={() => sort("cleaner")} style={{ cursor: "pointer" }}>
                Cleaner
              </th>
              <th>Booking</th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
              </th>
              <th>Quality</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const p = getProperty(c.propertyId);
              return (
                <tr
                  key={c.id}
                  onClick={() => setOpenId(c.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div className="font-display text-[14.5px] tracking-tight">
                      {p?.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {p?.neighborhood}
                    </div>
                  </td>
                  <td className="text-neutral-700 tabular-nums">{c.time}</td>
                  <td className="text-neutral-800">{c.cleaner}</td>
                  <td>
                    <span className="mono text-neutral-700">
                      {c.booking ?? "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`clean-status cs-${c.status}`}>
                      {cleanStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {c.score != null ? `${c.score} / 5` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <VaultSheet
          detail={cleaningDetail(open)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
