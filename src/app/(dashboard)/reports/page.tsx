"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { REPORT_CUMULATIVE } from "@/lib/mock-data/reports";

const TABS = ["Cumulative", "Week 1", "Week 2", "Week 3", "Week 4"] as const;
type Tab = (typeof TABS)[number];

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("Cumulative");
  return (
    <div className="route-fade page-pad">
      <header className="mb-6">
        <div className="section-eyebrow">System</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Validation Reports
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          Weekly side-by-side comparison: agents vs VAs / PriceLabs.
        </p>
      </header>

      <div className="border-b border-rule mb-8 flex items-center gap-1">
        {TABS.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-[40px] text-[12.5px] tracking-wide ${
              tab === t ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
            style={{
              borderBottom:
                tab === t ? "2px solid #1A1A1A" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Cumulative" ? <Cumulative /> : <WeekStub week={tab} />}
    </div>
  );
}

function Cumulative() {
  const [open, setOpen] = useState<Record<string, boolean>>({ pricing: true });
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          {
            l: "Overall Alignment",
            v: REPORT_CUMULATIVE.alignment + "%",
            sub: "Pricing + Guest + Ops + SOP",
          },
          {
            l: "Drift Areas",
            v: REPORT_CUMULATIVE.drift,
            sub: "Across all agents",
          },
          {
            l: "Suggested Cutover",
            v: REPORT_CUMULATIVE.cutover,
            sub: "Ops, SOP · ready",
          },
          {
            l: "Reports Delivered",
            v: REPORT_CUMULATIVE.delivered,
            sub: "Weeks Carlos has signed off",
          },
        ].map((s) => (
          <div key={s.l} className="kpi-card" style={{ cursor: "default" }}>
            <span className="kpi-rule" />
            <div className="section-eyebrow">{s.l}</div>
            <div>
              <div className="font-display text-[34px] leading-none tracking-tight">
                {s.v}
              </div>
              <div className="text-[11px] text-neutral-500 mt-2">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-[26px] tracking-tight mb-4">
        Per Agent Breakdown
      </h2>
      <div className="border border-rule rounded-[2px] overflow-hidden">
        {REPORT_CUMULATIVE.agents.map((a, i) => {
          const isOpen = !!open[a.key];
          return (
            <div key={a.key} className={i > 0 ? "border-t border-rule" : ""}>
              <button
                type="button"
                onClick={() =>
                  setOpen((o) => ({ ...o, [a.key]: !o[a.key] }))
                }
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#FAFAFA] text-left"
              >
                <div className="flex items-center gap-4">
                  {isOpen ? (
                    <ChevronDown size={14} strokeWidth={1.5} />
                  ) : (
                    <ChevronRight size={14} strokeWidth={1.5} />
                  )}
                  <span className="font-display text-[20px] tracking-tight">
                    {a.name}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[11.5px] text-neutral-500">Alignment</span>
                  <span className="font-display text-[22px] tracking-tight tabular-nums">
                    {a.alignment}%
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pl-[44px] grid gap-4">
                  <div>
                    <div className="section-eyebrow mb-2">Drift areas</div>
                    <ul className="text-[13px] text-neutral-800 space-y-1.5 list-disc pl-5">
                      {a.drift.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="section-eyebrow mb-2">Sample comparisons</div>
                    <div className="border border-rule rounded-[2px] overflow-hidden">
                      <table className="pricing-table">
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Agent</th>
                            <th>VA / PriceLabs</th>
                            <th>Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.samples.map((s, k) => (
                            <tr key={k}>
                              <td>{s.property}</td>
                              <td>{s.ours}</td>
                              <td>{s.theirs}</td>
                              <td className="font-medium">{s.delta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function WeekStub({ week }: { week: string }) {
  return (
    <div className="border border-dashed border-rule rounded-[2px] p-12 text-center">
      <div className="font-display text-[22px] tracking-tight">{week} report</div>
      <p className="text-[13px] text-neutral-500 mt-2 max-w-[480px] mx-auto">
        Same shape as Cumulative, scoped to a single week. Filled in once that week’s
        validation data lands.
      </p>
    </div>
  );
}
