"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { PROPERTIES, type PropertyStatus } from "@/lib/mock-data/properties";
import { VaultSheet } from "@/components/casa/vault-sheet";
import { propertyDetail } from "@/lib/vault/detail";

/**
 * Vault › Properties — the REFERENCE table sub-page. The other 6 table pages
 * derive from this one (breadcrumb + Playfair header + count + filter row +
 * .pricing-table + row-click side-sheet); only the data source and columns
 * differ. Filter row + useMemo pattern from properties/page.tsx; table base
 * is .pricing-table; breadcrumb from bookings/[id]/page.tsx.
 */
const FILTERS: ("All" | PropertyStatus)[] = ["All", "Active", "Maintenance", "New"];
type SortKey = "name" | "neighborhood" | "type" | "rate" | "status";

export default function VaultPropertiesPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = PROPERTIES.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (q === "" ||
          `${p.name} ${p.neighborhood} ${p.type}`.toLowerCase().includes(ql)),
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

  const open = openId ? PROPERTIES.find((p) => p.id === openId) : undefined;

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
          Properties
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {PROPERTIES.length} properties under management.
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
            placeholder="Search by address or neighbourhood…"
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
          {rows.length} of {PROPERTIES.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("name")} style={{ cursor: "pointer" }}>
                Property
              </th>
              <th onClick={() => sort("neighborhood")} style={{ cursor: "pointer" }}>
                Neighbourhood
              </th>
              <th onClick={() => sort("type")} style={{ cursor: "pointer" }}>
                Type
              </th>
              <th onClick={() => sort("rate")} style={{ cursor: "pointer" }}>
                Rate
              </th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
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
                    {p.name}
                  </div>
                </td>
                <td className="text-neutral-700">{p.neighborhood}</td>
                <td className="text-neutral-700">{p.type}</td>
                <td className="text-neutral-700 tabular-nums">${p.rate}</td>
                <td className="text-neutral-700">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <VaultSheet
          detail={propertyDetail(open)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
