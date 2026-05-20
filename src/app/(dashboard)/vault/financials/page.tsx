"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FINANCIALS } from "@/lib/mock-data/financials";

/**
 * Vault › Financials — a SUMMARY view, not a table-with-sheet. Modeled on
 * reports/page.tsx: KPI tiles + a per-property revenue breakdown from
 * FINANCIALS. One Playfair 40px headline; the breakdown is a plain
 * .pricing-table read-out (no row drill-down — financials has no [id] route).
 */
const money = (n: number) => "$" + n.toLocaleString("en-CA");

const TREND_LABEL: Record<string, string> = {
  up: "Up",
  flat: "Flat",
  down: "Down",
};

export default function VaultFinancialsPage() {
  const f = FINANCIALS;
  const kpis = [
    { label: "YTD Revenue", value: money(f.ytdRevenue) },
    { label: "YTD Expenses", value: money(f.ytdExpenses) },
    { label: "YTD Net", value: money(f.ytdNet) },
    { label: "Avg Occupancy", value: `${f.avgOccupancy}%` },
  ];

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
          Financials
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          Portfolio P&amp;L summary · {f.period} · net{" "}
          {f.netChangePct >= 0 ? "+" : ""}
          {f.netChangePct}% vs prior period.
        </p>
      </header>

      {/* KPI tiles */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
        {kpis.map((k) => (
          <div key={k.label} className="border border-rule rounded-[2px] p-5">
            <div className="section-eyebrow">{k.label}</div>
            <div className="font-display text-[30px] tracking-tight mt-2 tabular-nums">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly P&L */}
      <div className="mb-10">
        <h2 className="font-display text-[18px] tracking-tight mb-3">
          Monthly P&amp;L
        </h2>
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Net</th>
                <th>Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {f.monthly.map((m) => (
                <tr key={m.month}>
                  <td className="font-display text-[14.5px] tracking-tight">
                    {m.month}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(m.revenue)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(m.expenses)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(m.net)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {m.occupancy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-property revenue breakdown */}
      <div>
        <h2 className="font-display text-[18px] tracking-tight mb-3">
          By Property
        </h2>
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Neighbourhood</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Net</th>
                <th>Occupancy</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {f.byProperty.map((p) => (
                <tr key={p.propertyId}>
                  <td className="font-display text-[14.5px] tracking-tight">
                    {p.name}
                  </td>
                  <td className="text-neutral-700">{p.neighborhood}</td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(p.revenue)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(p.expenses)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {money(p.net)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {p.occupancy}%
                  </td>
                  <td className="text-neutral-700">{TREND_LABEL[p.trend]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
