"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { PIPELINE, type ProspectStatus } from "@/lib/mock-data/pipeline";
import { VaultSheet, type VaultDetail } from "@/components/casa/vault-sheet";

/**
 * Vault › Pipeline — derived from the reference table. Pipeline has no
 * deep-link [id] route (it is not one of Task 3's five detail entities), so
 * the row-click side-sheet detail is built inline here.
 */
const FILTERS: ("All" | ProspectStatus)[] = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];
type SortKey = "owner" | "neighborhood" | "score" | "status" | "estMonthly";

const money = (n: number) => "$" + n.toLocaleString("en-CA");

export default function VaultPipelinePage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = PIPELINE.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (q === "" ||
          `${p.owner} ${p.address} ${p.neighborhood} ${p.source}`
            .toLowerCase()
            .includes(ql)),
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

  const open = openId ? PIPELINE.find((p) => p.id === openId) : undefined;
  const detail: VaultDetail | undefined = open && {
    eyebrow: `Prospect · ${open.id}`,
    title: open.owner,
    subtitle: `${open.address} · ${open.neighborhood}`,
    stats: [
      { label: "Lead Score", value: String(open.score) },
      { label: "Status", value: open.status },
      { label: "Units", value: String(open.units) },
      { label: "Est. Monthly", value: money(open.estMonthly) },
    ],
    rows: [
      { key: "Address", value: open.address },
      { key: "Neighborhood", value: open.neighborhood },
      { key: "Units", value: String(open.units) },
      { key: "Lead Score", value: `${open.score} / 100` },
      { key: "Status", value: open.status },
      { key: "Source", value: open.source },
      { key: "Last Contact", value: open.lastContact },
      { key: "Est. Monthly Revenue", value: money(open.estMonthly) },
      { key: "Note", value: open.note },
    ],
    actions: [
      { label: "Schedule Call", kind: "accent" },
      { label: "Send Proposal", kind: "outline" },
    ],
  };

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
          Pipeline
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {PIPELINE.length} prospects in the sales pipeline.
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
            placeholder="Search by owner, address, or source…"
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
          {rows.length} of {PIPELINE.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("owner")} style={{ cursor: "pointer" }}>
                Prospect
              </th>
              <th
                onClick={() => sort("neighborhood")}
                style={{ cursor: "pointer" }}
              >
                Neighbourhood
              </th>
              <th onClick={() => sort("score")} style={{ cursor: "pointer" }}>
                Score
              </th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
              </th>
              <th
                onClick={() => sort("estMonthly")}
                style={{ cursor: "pointer" }}
              >
                Est. Monthly
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                onClick={() => setOpenId(p.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="font-display text-[14.5px] tracking-tight">
                    {p.owner}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {p.address}
                  </div>
                </td>
                <td className="text-neutral-700">{p.neighborhood}</td>
                <td className="text-neutral-700 tabular-nums">{p.score}</td>
                <td className="text-neutral-700">{p.status}</td>
                <td className="text-neutral-700 tabular-nums">
                  {money(p.estMonthly)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <VaultSheet detail={detail} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
