"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { CLAIMS } from "@/lib/mock-data/claims";
import { getProperty } from "@/lib/mock-data/properties";
import { VaultSheet } from "@/components/casa/vault-sheet";
import { claimDetail } from "@/lib/vault/detail";

/**
 * Vault › Claims — derived from the reference table. The claims module splits
 * pending / submitted / resolved; the table unifies them into one sortable
 * list. Only `pending` claims carry the full PendingClaim shape, so only
 * those open the detail side-sheet (and back the /vault/claims/[id] route).
 */
type ClaimRow = {
  id: string;
  propertyId: string;
  guestName: string;
  bookingDates: string;
  cost: number;
  stage: "Pending" | "Submitted" | "Resolved";
  status: string;
  hasDetail: boolean;
};

const ALL_CLAIMS: ClaimRow[] = [
  ...CLAIMS.pending.map((c) => ({
    id: c.id,
    propertyId: c.propertyId,
    guestName: c.guestName,
    bookingDates: c.bookingDates,
    cost: c.cost,
    stage: "Pending" as const,
    status: "Pending review",
    hasDetail: true,
  })),
  ...CLAIMS.submitted.map((c) => ({
    id: c.id,
    propertyId: c.propertyId,
    guestName: c.guestName,
    bookingDates: c.bookingDates,
    cost: c.cost,
    stage: "Submitted" as const,
    status: c.status,
    hasDetail: false,
  })),
  ...CLAIMS.resolved.map((c) => ({
    id: c.id,
    propertyId: c.propertyId,
    guestName: c.guestName,
    bookingDates: c.bookingDates,
    cost: c.cost,
    stage: "Resolved" as const,
    status: c.status,
    hasDetail: false,
  })),
];

const FILTERS = ["All", "Pending", "Submitted", "Resolved"] as const;
type SortKey = "id" | "guestName" | "cost" | "stage";

export default function VaultClaimsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = ALL_CLAIMS.filter((c) => {
      const p = getProperty(c.propertyId);
      return (
        (filter === "All" || c.stage === filter) &&
        (q === "" ||
          `${c.id} ${c.guestName} ${p?.name ?? ""}`.toLowerCase().includes(ql))
      );
    });
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

  const open = openId
    ? CLAIMS.pending.find((c) => c.id === openId)
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
          Claims
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {ALL_CLAIMS.length} damage claims across the portfolio.
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
            placeholder="Search by claim, guest, or property…"
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
          {rows.length} of {ALL_CLAIMS.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("id")} style={{ cursor: "pointer" }}>
                Claim
              </th>
              <th>Property</th>
              <th onClick={() => sort("guestName")} style={{ cursor: "pointer" }}>
                Guest
              </th>
              <th>Booking Dates</th>
              <th onClick={() => sort("cost")} style={{ cursor: "pointer" }}>
                Amount
              </th>
              <th onClick={() => sort("stage")} style={{ cursor: "pointer" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const p = getProperty(c.propertyId);
              return (
                <tr
                  key={c.id}
                  onClick={() => c.hasDetail && setOpenId(c.id)}
                  style={{ cursor: c.hasDetail ? "pointer" : "default" }}
                >
                  <td>
                    <span className="mono text-neutral-700">{c.id}</span>
                  </td>
                  <td>
                    <div className="font-display text-[14.5px] tracking-tight">
                      {p?.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {p?.neighborhood}
                    </div>
                  </td>
                  <td className="text-neutral-800">{c.guestName}</td>
                  <td className="text-neutral-700">{c.bookingDates}</td>
                  <td className="text-neutral-700 tabular-nums">
                    ${c.cost.toLocaleString("en-CA")}
                  </td>
                  <td className="text-neutral-700">
                    {c.stage} · {c.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <VaultSheet detail={claimDetail(open)} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
