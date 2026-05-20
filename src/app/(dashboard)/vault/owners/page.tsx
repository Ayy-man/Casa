"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { OWNERS, type OwnerStatus } from "@/lib/mock-data/owners";
import { VaultSheet } from "@/components/casa/vault-sheet";
import { ownerDetail } from "@/lib/vault/detail";

/** Vault › Owners — derived from the reference table. */
const FILTERS: ("All" | OwnerStatus)[] = [
  "All",
  "Active",
  "Onboarding",
  "Offboarding",
];
type SortKey = "name" | "status" | "ytdPayout";

export default function VaultOwnersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = OWNERS.filter(
      (o) =>
        (filter === "All" || o.status === filter) &&
        (q === "" ||
          `${o.name} ${o.email} ${o.commPref}`.toLowerCase().includes(ql)),
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
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

  const open = openId ? OWNERS.find((o) => o.id === openId) : undefined;

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
          Owners
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {OWNERS.length} property owners under Casa management.
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
            placeholder="Search by name or email…"
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
              {f}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <span className="text-[11.5px] text-neutral-400">
          {rows.length} of {OWNERS.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("name")} style={{ cursor: "pointer" }}>
                Owner
              </th>
              <th>Contact</th>
              <th>Properties</th>
              <th
                onClick={() => sort("ytdPayout")}
                style={{ cursor: "pointer" }}
              >
                YTD Payout
              </th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o.id}
                onClick={() => setOpenId(o.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="font-display text-[14.5px] tracking-tight">
                    {o.name}
                  </div>
                </td>
                <td className="text-neutral-700">{o.email}</td>
                <td className="text-neutral-700 tabular-nums">
                  {o.properties.length}
                </td>
                <td className="text-neutral-700 tabular-nums">
                  ${o.ytdPayout.toLocaleString("en-CA")}
                </td>
                <td className="text-neutral-700">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <VaultSheet detail={ownerDetail(open)} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
