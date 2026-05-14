"use client";

import { useMemo, useState } from "react";
import { Calendar, Check, ChevronDown, EyeOff, Pencil, X } from "lucide-react";
import { PRICING_BASE, changeClass } from "@/lib/mock-data/pricing";

const WEEKS = [
  "Week of May 4, 2026",
  "Week of May 11, 2026",
  "Week of May 18, 2026",
];

type Decision = "approved" | "rejected" | undefined;

export default function PricingPage() {
  const sorted = useMemo(
    () => [...PRICING_BASE].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [weekIdx, setWeekIdx] = useState(0);
  const [weekDropOpen, setWeekDropOpen] = useState(false);
  const shadowMode = true;

  const setDecision = (key: string, val: Decision) =>
    setDecisions((d) => ({ ...d, [key]: val }));

  const approveAll = () =>
    setDecisions(Object.fromEntries(sorted.map((r) => [r.property, "approved" as Decision])));
  const rejectAll = () =>
    setDecisions(Object.fromEntries(sorted.map((r) => [r.property, "rejected" as Decision])));
  const approveUnder5 = () =>
    setDecisions((d) => {
      const next = { ...d };
      sorted.forEach((r) => {
        if (Math.abs(r.change) < 5) next[r.property] = "approved";
      });
      return next;
    });

  const totalApproved = Object.values(decisions).filter((v) => v === "approved").length;
  const totalRejected = Object.values(decisions).filter((v) => v === "rejected").length;

  return (
    <div className="route-fade page-pad">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="section-eyebrow">Daily · Pricing Approval</div>
          <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
            Pricing Recommendations
          </h1>
          <p className="text-[13.5px] text-neutral-500 mt-2">
            {WEEKS[weekIdx]} — 26 properties analyzed.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] tracking-eyebrow uppercase text-neutral-400">Decisions</div>
          <div className="font-display text-[18px] mt-1 tracking-tight">
            <span className="text-[#2E6F2A]">{totalApproved}</span>
            <span className="text-neutral-300 mx-2">/</span>
            <span className="text-[#8A2B1F]">{totalRejected}</span>
            <span className="text-neutral-300 mx-2">/</span>
            <span>{sorted.length - totalApproved - totalRejected}</span>
          </div>
          <div className="text-[10.5px] text-neutral-400 mt-0.5">
            approved · rejected · pending
          </div>
        </div>
      </header>

      {shadowMode && (
        <div className="shadow-banner mb-8">
          <span className="mt-0.5 text-[#7A4A14]">
            <EyeOff size={16} strokeWidth={1.5} />
          </span>
          <div>
            <div className="font-medium">
              Validation only — recommendations are not pushing to Hostaway.
            </div>
            <div className="text-[12px] mt-0.5 opacity-90">
              Cutover decision in Week 4. Approvals here are recorded for audit and accuracy
              comparison only.
            </div>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            className="btn-sm btn-sm-outline"
            style={{
              borderColor: "#EFE3C7",
              background: "rgba(255,255,255,0.6)",
              color: "#6B4A12",
            }}
            onClick={() => console.log("about shadow mode")}
          >
            About shadow mode
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          className="btn-sm btn-sm-outline"
          onClick={approveUnder5}
        >
          Approve all under 5%
        </button>
        <button type="button" className="btn-sm btn-sm-primary" onClick={approveAll}>
          Approve all
        </button>
        <button type="button" className="btn-sm btn-sm-outline" onClick={rejectAll}>
          Reject all
        </button>
        <span className="flex-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setWeekDropOpen((v) => !v)}
            className="btn-sm btn-sm-outline flex items-center gap-2"
          >
            <Calendar size={14} strokeWidth={1.5} />
            <span>{WEEKS[weekIdx]}</span>
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
          {weekDropOpen && (
            <div className="absolute right-0 top-full mt-1 w-[220px] bg-white border border-rule rounded-[2px] shadow-lg z-10">
              {WEEKS.map((w, i) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => {
                    setWeekIdx(i);
                    setWeekDropOpen(false);
                  }}
                  className={`menu-item ${i === weekIdx ? "bg-[#FAFAFA] font-medium" : ""}`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-rule rounded-[2px] overflow-hidden">
        <table className="pricing-table">
          <thead>
            <tr>
              <th style={{ width: "28%" }}>Property</th>
              <th style={{ width: "11%" }}>Current</th>
              <th style={{ width: "11%" }}>Recommended</th>
              <th style={{ width: "10%" }}>Change</th>
              <th>Reasoning</th>
              <th style={{ width: "128px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const decision = decisions[r.property];
              const expanded = expandedId === r.property;
              const dir =
                r.change > 0.05 ? "↑" : r.change < -0.05 ? "↓" : "—";
              return (
                <tr
                  key={r.property}
                  style={decision === "rejected" ? { opacity: 0.45 } : undefined}
                >
                  <td>
                    <div
                      className="font-display text-[15px] leading-tight tracking-tight text-neutral-900 truncate"
                      style={{ maxWidth: 280 }}
                    >
                      {r.property}
                    </div>
                    {decision && (
                      <div
                        className={`text-[10.5px] tracking-eyebrow uppercase mt-1 ${
                          decision === "approved"
                            ? "text-[#2E6F2A]"
                            : "text-[#8A2B1F]"
                        }`}
                      >
                        {decision}
                      </div>
                    )}
                  </td>
                  <td className="text-neutral-700 tabular-nums">${r.current}</td>
                  <td className="text-neutral-900 font-medium tabular-nums">
                    ${r.recommended}
                  </td>
                  <td>
                    <span className={`change-pill ${changeClass(r.change)}`}>
                      <span>{dir}</span>
                      <span>
                        {r.change > 0 ? "+" : ""}
                        {r.change.toFixed(1)}%
                      </span>
                    </span>
                  </td>
                  <td>
                    <div className="reasoning">
                      <div className={expanded ? "" : "clamp"}>{r.reasoning}</div>
                      {r.reasoning.length > 80 && (
                        <button
                          type="button"
                          className="read-more"
                          onClick={() =>
                            setExpandedId(expanded ? null : r.property)
                          }
                        >
                          {expanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        title="Approve"
                        className={`icon-btn approve ${
                          decision === "approved"
                            ? "border-[#2E6F2A] text-[#2E6F2A] bg-[#F1F6F0]"
                            : ""
                        }`}
                        onClick={() =>
                          setDecision(
                            r.property,
                            decision === "approved" ? undefined : "approved"
                          )
                        }
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        title="Edit rate"
                        className="icon-btn"
                        onClick={() => console.log("override", r.property)}
                      >
                        <Pencil size={14} strokeWidth={1.6} />
                      </button>
                      <button
                        type="button"
                        title="Reject"
                        className={`icon-btn reject ${
                          decision === "rejected"
                            ? "border-[#8A2B1F] text-[#8A2B1F] bg-[#FBEFEB]"
                            : ""
                        }`}
                        onClick={() =>
                          setDecision(
                            r.property,
                            decision === "rejected" ? undefined : "rejected"
                          )
                        }
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11.5px] text-neutral-400 mt-6">
        Showing {sorted.length} of {sorted.length} properties — sorted by magnitude of change.
      </div>
    </div>
  );
}
