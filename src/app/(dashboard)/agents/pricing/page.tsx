"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { PROPERTIES } from "@/lib/mock-data/properties";
import { modeClass, modeLabel, PROMPT_VERSIONS } from "@/lib/mock-data/agents";
import { changeClass } from "@/lib/mock-data/pricing";
import { Sparkline } from "@/components/casa/sparkline";

const SECTIONS = [
  { id: "glance", label: "At a Glance" },
  { id: "activity", label: "Activity" },
  { id: "config", label: "Configuration" },
  { id: "performance", label: "Performance" },
  { id: "decisions", label: "Decisions" },
  { id: "breakdown", label: "Properties" },
  { id: "validation", label: "Validation" },
  { id: "prompts", label: "Prompt History" },
  { id: "controls", label: "Controls" },
];

const ACTIVITY = PROPERTIES.slice(0, 12).map((p, i) => {
  const totalMin = 10 * 60 - i * 26;
  const hour = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  const status = i === 5 ? "Flagged" : i === 8 ? "Sent" : "Logged";
  return {
    time: `${hour}:${mm}`,
    property: p.name,
    action: "Generated rate recommendation",
    status,
    cost: (0.02 + i * 0.003).toFixed(3),
  };
});

const DECISIONS = Array.from({ length: 30 }).map((_, i) => {
  const p = PROPERTIES[i % PROPERTIES.length];
  const change = +(Math.sin(i * 1.7) * 14 + (i % 5) * 2).toFixed(1);
  const day = i < 7 ? "Today" : i < 14 ? "Yesterday" : `Apr ${30 - Math.floor(i / 3)}`;
  const time = `${(8 + (i % 10)).toString().padStart(2, "0")}:${((i * 7) % 60)
    .toString()
    .padStart(2, "0")}`;
  return {
    time: `${day}, ${time}`,
    property: p.name,
    change,
    reasoning:
      change > 5
        ? "FIFA fan-zone proximity detected — major demand spike inbound."
        : change < -5
        ? "Comp set softened — two near-comps cut by 10%+. Reducing to stay competitive."
        : "Modest movement — within normal weekly noise. Rate held near baseline.",
    status: i % 7 === 3 ? "Flagged" : "Logged",
    cost: (0.02 + (i % 5) * 0.005).toFixed(3),
  };
});

const KPIS = [
  { l: "Actions Today", v: "26", trend: "+6 vs avg", spark: [3, 6, 12, 8, 14, 11, 26] },
  { l: "Actions This Week", v: "26", trend: "1 weekly run", spark: null },
  { l: "Success Rate", v: "96%", trend: "+2%", spark: [92, 93, 94, 93, 95, 94, 96] },
  { l: "Exception Rate", v: "2%", trend: "-1%", spark: [4, 3, 3, 2, 3, 2, 2] },
  { l: "Tokens MTD", v: "142.4k", trend: "on plan", spark: [15, 28, 41, 55, 80, 110, 142] },
  { l: "Cost MTD", v: "$0.84", trend: "on plan", spark: [0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.84] },
] as const;

export default function PricingAgentPage() {
  const [agentActive, setAgentActive] = useState(true);
  const [mode, setMode] = useState<"Shadow" | "Live">("Shadow");
  const [filterProp, setFilterProp] = useState<string>("All");

  const decisions = useMemo(
    () =>
      filterProp === "All"
        ? DECISIONS
        : DECISIONS.filter((d) => d.property === filterProp),
    [filterProp]
  );

  const jump = (id: string) => {
    const el = document.getElementById("sec-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="route-fade">
      <div style={{ background: "#1A1F2A", color: "#FFFFFF" }}>
        <div className="page-pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
          <Link
            href="/agents"
            className="text-[11.5px] text-[#9AA3B2] hover:text-white flex items-center gap-1.5 mb-4 w-fit"
          >
            <ChevronLeft size={12} strokeWidth={1.5} />
            <span>All agents</span>
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="section-eyebrow" style={{ color: "#9AA3B2" }}>
                Agents
              </div>
              <h1 className="font-display text-[36px] leading-tight tracking-tight mt-1">
                Pricing Agent
              </h1>
              <p className="text-[13.5px] text-[#C9CFD9] mt-2 max-w-[640px]">
                Weekly competitor analysis + per-property rate recommendations.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 justify-end">
                <span className="text-[11px] tracking-eyebrow uppercase text-[#9AA3B2]">
                  Last action
                </span>
                <span className="text-[12.5px]">4 min ago</span>
                <span
                  className={`clean-status ${modeClass(mode)}`}
                  style={{
                    color: "#6F5A14",
                    borderColor: "#ECDFA8",
                    background: "#FAF4DD",
                  }}
                >
                  {modeLabel(mode)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAgentActive((v) => !v)}
                className="mt-4 px-4 h-[36px] text-[12px] font-medium tracking-wider uppercase rounded-[2px]"
                style={{
                  background: agentActive ? "#8A2B1F" : "#2E6F2A",
                  color: "#FFFFFF",
                }}
              >
                {agentActive ? "Disable Agent" : "Enable Agent"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="sticky top-0 z-10 border-b border-rule"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="page-pad flex items-center gap-1 overflow-x-auto"
          style={{ paddingTop: 8, paddingBottom: 8 }}
        >
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => jump(s.id)}
              className="px-3 h-[30px] text-[12px] text-neutral-700 hover:text-neutral-900 hover:bg-[#FAFAFA] rounded-[2px] whitespace-nowrap"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-pad" style={{ paddingTop: 28 }}>
        <section id="sec-glance" className="mb-12">
          <div className="grid grid-cols-6 gap-4">
            {KPIS.map((s) => (
              <div key={s.l} className="kpi-card" style={{ cursor: "default" }}>
                <span className="kpi-rule" />
                <div className="section-eyebrow">{s.l}</div>
                <div>
                  <div className="font-display text-[34px] leading-none tracking-tight">
                    {s.v}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between gap-2">
                    <span>{s.trend}</span>
                    {s.spark && (
                      <Sparkline values={[...s.spark]} w={60} h={20} color="#1E5FBF" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="sec-activity" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Live Activity</h2>
          <div className="border border-rule rounded-[2px] overflow-hidden">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Time</th>
                  <th>Property</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th style={{ width: 90 }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.time}</td>
                    <td>
                      <span className="font-display text-[14.5px] tracking-tight">
                        {r.property}
                      </span>
                    </td>
                    <td className="text-neutral-700">{r.action}</td>
                    <td>
                      <span
                        className={`urgency-pill ${
                          r.status === "Flagged"
                            ? "pill-Critical"
                            : r.status === "Sent"
                            ? "pill-Low"
                            : "pill-Medium"
                        }`}
                      >
                        {r.status === "Logged"
                          ? "Logged (Shadow)"
                          : r.status === "Flagged"
                          ? "Flagged for Review"
                          : "Sent"}
                      </span>
                    </td>
                    <td className="mono tabular-nums">${r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="sec-config" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Configuration</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-0">
            <div>
              <div className="def-row">
                <span className="def-key">Model</span>
                <span>Claude Sonnet 4.6</span>
              </div>
              <div className="def-row">
                <span className="def-key">Prompt version</span>
                <span>
                  v1.3 · <span className="text-neutral-500">2 days ago</span>
                </span>
              </div>
              <div className="def-row">
                <span className="def-key">Triggers</span>
                <span>Mon 6:00 AM PT (weekly) + Daily event scan 7:00 AM PT</span>
              </div>
            </div>
            <div>
              <div className="def-row">
                <span className="def-key">Tools</span>
                <span className="mono text-[11.5px]">
                  get_rates, get_occupancy, search_competitors, get_events,
                  update_rate, generate_digest, create_exception
                </span>
              </div>
              <div className="def-row">
                <span className="def-key">Comp set</span>
                <span>Apify scraping + PriceLabs API (parallel validation)</span>
              </div>
              <div className="def-row">
                <span className="def-key">Owner</span>
                <span>Ayman · Engineering</span>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-performance" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Performance</h2>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="border border-rule rounded-[2px] p-5">
              <div className="section-eyebrow mb-3">Success Rate · 14 days</div>
              <SuccessChart />
            </div>
            <div className="border border-rule rounded-[2px] p-5">
              <div className="section-eyebrow mb-3">
                Exceptions per Property · Top 10
              </div>
              <ExceptionsChart />
            </div>
          </div>
          <div className="border border-rule rounded-[2px] overflow-hidden">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Response Time Distribution</th>
                  <th>p50</th>
                  <th>p95</th>
                  <th>p99</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>All actions, last 7 days</td>
                  <td className="tabular-nums">4.2 s</td>
                  <td className="tabular-nums">11.8 s</td>
                  <td className="tabular-nums">18.4 s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="sec-decisions" className="mb-12">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-[26px] tracking-tight">Recent Decisions</h2>
            <div className="flex items-center gap-2">
              <select
                className="field"
                style={{ height: 32, fontSize: 12, width: 200 }}
                value={filterProp}
                onChange={(e) => setFilterProp(e.target.value)}
              >
                <option value="All">All properties</option>
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className="field"
                style={{ height: 32, fontSize: 12, width: 120 }}
                defaultValue="All actions"
              >
                <option>All actions</option>
              </select>
              <select
                className="field"
                style={{ height: 32, fontSize: 12, width: 120 }}
                defaultValue="All status"
              >
                <option>All status</option>
              </select>
              <select
                className="field"
                style={{ height: 32, fontSize: 12, width: 120 }}
                defaultValue="Last 7 days"
              >
                <option>Last 7 days</option>
              </select>
            </div>
          </div>
          <div className="border border-rule rounded-[2px] overflow-hidden">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>When</th>
                  <th>Property</th>
                  <th>Change</th>
                  <th>Reasoning</th>
                  <th>Status</th>
                  <th style={{ width: 80 }}>$</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d, i) => (
                  <tr key={i}>
                    <td className="mono text-neutral-600">{d.time}</td>
                    <td>
                      <span className="font-display text-[14px]">{d.property}</span>
                    </td>
                    <td>
                      <span className={`change-pill ${changeClass(d.change)}`}>
                        {d.change > 0 ? "+" : ""}
                        {d.change}%
                      </span>
                    </td>
                    <td>
                      <div className="reasoning">
                        <div className="clamp">{d.reasoning}</div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`urgency-pill ${
                          d.status === "Flagged" ? "pill-Critical" : "pill-Medium"
                        }`}
                      >
                        {d.status === "Logged" ? "Logged (Shadow)" : d.status}
                      </span>
                    </td>
                    <td className="mono tabular-nums">${d.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="sec-breakdown" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">
            Property Breakdown
          </h2>
          <div className="border border-rule rounded-[2px] overflow-hidden">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Actions / Week</th>
                  <th>Avg % Change</th>
                  <th>Last Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROPERTIES.map((p, i) => {
                  const avg = +((Math.cos(i * 1.3) * 8) + ((i % 4) - 1)).toFixed(1);
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="font-display text-[14.5px]">{p.name}</span>
                        <div className="text-[11px] text-neutral-400">
                          {p.neighborhood}
                        </div>
                      </td>
                      <td className="tabular-nums">{1 + (i % 3)}</td>
                      <td>
                        <span className={`change-pill ${changeClass(avg)}`}>
                          {avg > 0 ? "+" : ""}
                          {avg}%
                        </span>
                      </td>
                      <td className="text-neutral-600">
                        Today, {(8 + (i % 5))}:0{i % 6}
                      </td>
                      <td>
                        <span className="urgency-pill pill-Medium">
                          Logged (Shadow)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="sec-validation" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight">
            Shadow Mode Validation
          </h2>
          <p className="text-[12px] text-neutral-500 mt-1 mb-5">
            Visible during Weeks 2–4 only.
          </p>
          <div className="grid gap-4">
            {PROPERTIES.slice(0, 5).map((p, i) => {
              const ourChange = [19.3, 14.3, 8.5, -8.1, -4.2][i];
              const plChange = [17.8, 13.0, 9.4, -7.0, -3.2][i];
              const align = 100 - Math.round(Math.abs(ourChange - plChange) * 4);
              return (
                <article key={p.id} className="ex-card">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-display text-[19px] tracking-tight">
                      {p.name}
                    </h3>
                    <div className="text-[11.5px] text-neutral-500">
                      Alignment:{" "}
                      <span className="text-neutral-900 font-medium">{align}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 border-t border-[#F1F1F0] pt-4">
                    <div>
                      <div className="section-eyebrow mb-2">
                        Pricing Agent (Claude)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`change-pill ${changeClass(ourChange)}`}>
                          {ourChange > 0 ? "+" : ""}
                          {ourChange}%
                        </span>
                        <span className="text-[12.5px] text-neutral-500">
                          ${p.rate} → ${Math.round(p.rate * (1 + ourChange / 100))}
                        </span>
                      </div>
                      <p className="reasoning mt-2 text-[13px]">
                        FIFA week + comp avg uplifted. Demand signal +47%.
                      </p>
                    </div>
                    <div>
                      <div className="section-eyebrow mb-2">PriceLabs</div>
                      <div className="flex items-center gap-2">
                        <span className={`change-pill ${changeClass(plChange)}`}>
                          {plChange > 0 ? "+" : ""}
                          {plChange}%
                        </span>
                        <span className="text-[12.5px] text-neutral-500">
                          ${p.rate} → ${Math.round(p.rate * (1 + plChange / 100))}
                        </span>
                      </div>
                      <p className="reasoning mt-2 text-[13px]">
                        Aggregate demand index +0.6. Standard weekend lift.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      className="field"
                      style={{ height: 32, fontSize: 12 }}
                      placeholder="Comment for the audit log…"
                    />
                    <button type="button" className="icon-btn approve" title="Aligned">
                      <ThumbsUp size={14} strokeWidth={1.5} />
                    </button>
                    <button type="button" className="icon-btn reject" title="Diverged">
                      <ThumbsDown size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="sec-prompts" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Prompt History</h2>
          <ol className="border-l border-rule pl-6">
            {PROMPT_VERSIONS.map((v, i) => (
              <li key={v.v} className="relative pb-7">
                <span
                  className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: i === 0 ? "#1E5FBF" : "#C9C9C9" }}
                />
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[20px] tracking-tight">{v.v}</span>
                  <span className="text-[11.5px] text-neutral-400">
                    {v.when} · by {v.by}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-700 mt-1">{v.note}</p>
                <details className="mt-2 text-[11.5px] text-neutral-500">
                  <summary className="cursor-pointer text-[#1E5FBF]">View diff</summary>
                  <div className="mono mt-2 p-3 border border-rule rounded-[2px] bg-[#FAFAFA]">
                    {v.diff}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section id="sec-controls" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Controls</h2>
          <div className="grid gap-4">
            <div className="ex-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-[18px] tracking-tight">
                    Kill switch
                  </div>
                  <p className="text-[12.5px] text-neutral-500 mt-1">
                    Disabling immediately stops the next scheduled run and pauses
                    retries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAgentActive((v) => !v)}
                  className="btn-sm btn-sm-primary"
                  style={{ background: agentActive ? "#8A2B1F" : "#1A1A1A" }}
                >
                  {agentActive
                    ? "Active — Click to disable"
                    : "Disabled — Click to enable"}
                </button>
              </div>
            </div>
            <div className="ex-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-[18px] tracking-tight">Mode</div>
                  <p className="text-[12.5px] text-neutral-500 mt-1">
                    Shadow logs decisions for audit; Live pushes them to Hostaway.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["Shadow", "Live"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMode(m)}
                      className={`btn-sm ${
                        mode === m ? "btn-sm-primary" : "btn-sm-outline"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-[11.5px] text-neutral-400 pb-6">
          Configuration last modified 2 days ago by Ayman · Next scheduled run: Monday
          6:00 AM PT.
        </div>
      </div>
    </div>
  );
}

function SuccessChart() {
  const data = [92, 93, 94, 93, 92, 94, 95, 93, 95, 94, 96, 95, 96, 96];
  const w = 360,
    h = 140;
  const max = 100,
    min = 88;
  const step = w / (data.length - 1);
  const pts = data
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(
          h -
          ((v - min) / (max - min)) * (h - 20) -
          10
        ).toFixed(1)}`
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      {[88, 92, 96, 100].map((y, i) => {
        const yy = h - ((y - min) / (max - min)) * (h - 20) - 10;
        return (
          <g key={i}>
            <line x1="0" x2={w} y1={yy} y2={yy} stroke="#F1F1F0" />
            <text x="0" y={yy - 4} fontSize="9" fill="#8C8C8C">
              {y}%
            </text>
          </g>
        );
      })}
      <polyline fill="none" stroke="#1E5FBF" strokeWidth="1.6" points={pts} />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i * step).toFixed(1)}
          cy={(h - ((v - min) / (max - min)) * (h - 20) - 10).toFixed(1)}
          r="2.4"
          fill="#1E5FBF"
        />
      ))}
    </svg>
  );
}

function ExceptionsChart() {
  const bars = PROPERTIES.slice(0, 10).map((p, i) => ({
    name: p.name.split(" ").slice(0, 2).join(" "),
    v: 5 - (i % 4),
  }));
  const max = 6;
  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.name} className="flex items-center gap-3">
          <span className="w-[140px] text-[11.5px] text-neutral-600 truncate">
            {b.name}
          </span>
          <div className="flex-1 h-[8px] bg-[#F1F1F0] rounded-full overflow-hidden">
            <div
              style={{
                width: `${(b.v / max) * 100}%`,
                height: "100%",
                background: "#1E5FBF",
              }}
            />
          </div>
          <span className="w-6 text-right text-[11.5px] tabular-nums text-neutral-700">
            {b.v}
          </span>
        </div>
      ))}
    </div>
  );
}
