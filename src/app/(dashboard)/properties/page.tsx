"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus, Search, X } from "lucide-react";
import { PROPERTIES, propertyImg, type PropertyStatus } from "@/lib/mock-data/properties";

const FILTERS: ("All" | PropertyStatus)[] = ["All", "Active", "Maintenance", "New"];

export default function PropertiesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return PROPERTIES.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (q === "" ||
          `${p.name} ${p.neighborhood} ${p.type}`.toLowerCase().includes(ql))
    );
  }, [filter, q]);

  return (
    <div className="route-fade page-pad">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">Portfolio</div>
          <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
            Properties
          </h1>
          <p className="text-[13.5px] text-neutral-500 mt-2">
            26 properties under management.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost flex items-center gap-2"
          onClick={() => console.log("add property")}
        >
          <Plus size={14} strokeWidth={1.5} />
          <span>Add Property</span>
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-8">
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
          {filtered.length} of {PROPERTIES.length} shown
        </span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filtered.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`} className="prop-card">
            <div
              className="prop-hero"
              style={{ backgroundImage: `url(${propertyImg(p)})` }}
            >
              {p.status !== "Active" && (
                <span className="status-chip-overlay">{p.status}</span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display text-[18px] tracking-tight leading-tight">
                  {p.name}
                </h3>
                <span className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400 shrink-0 mt-1.5">
                  {p.neighborhood}
                </span>
              </div>
              <div className="text-[12px] text-neutral-500">
                {p.type} · sleeps {p.maxGuests}
              </div>
              <div className="font-display text-[26px] tracking-tight mt-3">
                ${p.rate}
                <span className="text-[12px] text-neutral-400 font-sans ml-1">/night</span>
              </div>
              <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                <span className="check-pill ok">
                  <Check size={11} strokeWidth={2} />
                  <span>KB</span>
                </span>
                <span
                  className={`check-pill ${
                    p.status === "Maintenance" ? "bad" : "ok"
                  }`}
                >
                  {p.status === "Maintenance" ? (
                    <X size={11} strokeWidth={2} />
                  ) : (
                    <Check size={11} strokeWidth={2} />
                  )}
                  <span>Cleaner</span>
                </span>
                <span className="check-pill ok">
                  <Check size={11} strokeWidth={2} />
                  <span>Compliance</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
