"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { COMPLIANCE, type CertStatus } from "@/lib/mock-data/compliance";
import { VaultSheet, type VaultDetail } from "@/components/casa/vault-sheet";

/**
 * Vault › Compliance — derived from the reference table. Compliance has no
 * deep-link [id] route, so the row-click side-sheet detail is built inline.
 */
const FILTERS: ("All" | CertStatus)[] = [
  "All",
  "Valid",
  "Expiring",
  "Expired",
  "Pending",
];
type SortKey = "property" | "type" | "status" | "expires";

export default function VaultCompliancePage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("expires");
  const [sortAsc, setSortAsc] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const filtered = COMPLIANCE.filter(
      (c) =>
        (filter === "All" || c.status === filter) &&
        (q === "" ||
          `${c.property} ${c.neighborhood} ${c.type} ${c.reference}`
            .toLowerCase()
            .includes(ql)),
    );
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

  const open = openId ? COMPLIANCE.find((c) => c.id === openId) : undefined;
  const detail: VaultDetail | undefined = open && {
    eyebrow: `Certificate · ${open.id}`,
    title: open.type,
    subtitle: `${open.property} · ${open.neighborhood}`,
    stats: [
      { label: "Status", value: open.status },
      { label: "Type", value: open.type },
      { label: "Issued", value: open.issued },
      { label: "Expires", value: open.expires },
    ],
    rows: [
      { key: "Property", value: open.property },
      { key: "Neighborhood", value: open.neighborhood },
      { key: "Certificate Type", value: open.type },
      { key: "Status", value: open.status },
      { key: "Issued", value: open.issued },
      { key: "Expires", value: open.expires },
      { key: "Authority", value: open.authority },
      { key: "Reference", value: open.reference },
      { key: "Note", value: open.note },
    ],
    actions: [
      { label: "Mark Renewed", kind: "accent" },
      { label: "View Property", kind: "outline" },
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
          Compliance
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          {COMPLIANCE.length} certificates across the portfolio.
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
            placeholder="Search by property, type, or reference…"
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
          {rows.length} of {COMPLIANCE.length} shown
        </span>
      </div>

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="pricing-table">
          <thead>
            <tr>
              <th onClick={() => sort("property")} style={{ cursor: "pointer" }}>
                Property
              </th>
              <th onClick={() => sort("type")} style={{ cursor: "pointer" }}>
                Type
              </th>
              <th>Authority</th>
              <th onClick={() => sort("expires")} style={{ cursor: "pointer" }}>
                Expires
              </th>
              <th onClick={() => sort("status")} style={{ cursor: "pointer" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                onClick={() => setOpenId(c.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="font-display text-[14.5px] tracking-tight">
                    {c.property}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {c.neighborhood}
                  </div>
                </td>
                <td className="text-neutral-700">{c.type}</td>
                <td className="text-neutral-700">{c.authority}</td>
                <td className="text-neutral-700 tabular-nums">{c.expires}</td>
                <td className="text-neutral-700">{c.status}</td>
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
