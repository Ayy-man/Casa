"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PROPERTIES } from "@/lib/mock-data/properties";
import { modeClass, modeLabel } from "@/lib/mock-data/agents";
import { Sparkline } from "@/components/casa/sparkline";
import type { AgentDetail, AgentDetailRow } from "@/lib/mock-data/agent-detail";

/**
 * Shared 9-section agent-detail renderer for the Guest / Ops / SOP pages
 * (`/vault/agent-logs/{guest,ops,sop}`). Mirrors the section STRUCTURE of
 * the relocated Pricing Agent detail page (At a Glance, Live Activity,
 * Configuration, Performance, Decisions, Properties, Validation, Prompt
 * History, Controls) — Phase 1 mirrors the structure; full functional
 * parity is a later phase.
 *
 * All data strings render as plain React text children — no
 * dangerouslySetInnerHTML (threat T-01-13: mitigate).
 */

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

function statusPill(status: AgentDetailRow["status"]) {
  if (status === "Flagged") {
    return <span className="urgency-pill pill-Critical">Flagged for Review</span>;
  }
  if (status === "Sent") {
    return <span className="urgency-pill pill-Low">Sent</span>;
  }
  return <span className="urgency-pill pill-Medium">Logged</span>;
}

export function AgentDetailPage({ detail }: { detail: AgentDetail }) {
  const [agentActive, setAgentActive] = useState(true);
  const [mode, setMode] = useState<"Shadow" | "Live">(detail.mode);

  const jump = (id: string) => {
    const el = document.getElementById("sec-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="route-fade">
      <div style={{ background: "#1A1F2A", color: "#FFFFFF" }}>
        <div className="page-pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
          <Link
            href="/vault/agent-logs"
            className="text-[11.5px] text-[#9AA3B2] hover:text-white flex items-center gap-1.5 mb-4 w-fit"
          >
            <ChevronLeft size={12} strokeWidth={1.5} />
            <span>All agents</span>
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="section-eyebrow" style={{ color: "#9AA3B2" }}>
                {detail.eyebrow}
              </div>
              <h1 className="font-display text-[36px] leading-tight tracking-tight mt-1">
                {detail.name}
              </h1>
              <p className="text-[13.5px] text-[#C9CFD9] mt-2 max-w-[640px]">
                {detail.tagline}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 justify-end">
                <span className="text-[11px] tracking-eyebrow uppercase text-[#9AA3B2]">
                  Last action
                </span>
                <span className="text-[12.5px]">{detail.lastAction}</span>
                <span
                  className={`clean-status ${modeClass(mode)}`}
                  style={
                    mode === "Shadow"
                      ? {
                          color: "#6F5A14",
                          borderColor: "#ECDFA8",
                          background: "#FAF4DD",
                        }
                      : undefined
                  }
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
        {/* 1 — At a Glance */}
        <section id="sec-glance" className="mb-12">
          <div className="grid grid-cols-6 gap-4">
            {detail.kpis.map((s) => (
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

        {/* 2 — Live Activity */}
        <section id="sec-activity" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Live Activity</h2>
          <div className="border border-rule rounded-[2px] overflow-x-auto">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Time</th>
                  <th>Property</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th style={{ width: 90 }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {detail.activity.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.time}</td>
                    <td>
                      <span className="font-display text-[14.5px] tracking-tight">
                        {r.property}
                      </span>
                    </td>
                    <td className="text-neutral-700">{r.action}</td>
                    <td>{statusPill(r.status)}</td>
                    <td className="mono tabular-nums">${r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 — Configuration */}
        <section id="sec-config" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
            <div>
              {detail.config.left.map((c) => (
                <div key={c.key} className="def-row">
                  <span className="def-key">{c.key}</span>
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
            <div>
              {detail.config.right.map((c) => (
                <div key={c.key} className="def-row">
                  <span className="def-key">{c.key}</span>
                  <span
                    className={
                      c.key === "Tools" ? "mono text-[11.5px]" : undefined
                    }
                  >
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Performance */}
        <section id="sec-performance" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="border border-rule rounded-[2px] p-5">
              <div className="section-eyebrow mb-3">Success Rate · 14 days</div>
              <SuccessChart data={detail.performance.successSeries} />
            </div>
            <div className="border border-rule rounded-[2px] p-5">
              <div className="section-eyebrow mb-3">
                Exceptions per Property · Top 10
              </div>
              <ExceptionsChart />
            </div>
          </div>
          <div className="border border-rule rounded-[2px] overflow-x-auto">
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
                  <td className="tabular-nums">{detail.performance.p50}</td>
                  <td className="tabular-nums">{detail.performance.p95}</td>
                  <td className="tabular-nums">{detail.performance.p99}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5 — Recent Decisions */}
        <section id="sec-decisions" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">
            Recent Decisions
          </h2>
          <div className="border border-rule rounded-[2px] overflow-x-auto">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>When</th>
                  <th>Property</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th style={{ width: 80 }}>$</th>
                </tr>
              </thead>
              <tbody>
                {detail.decisions.map((d, i) => (
                  <tr key={i}>
                    <td className="mono text-neutral-600">{d.time}</td>
                    <td>
                      <span className="font-display text-[14px]">{d.property}</span>
                    </td>
                    <td>
                      <div className="reasoning">
                        <div className="clamp">{d.action}</div>
                      </div>
                    </td>
                    <td>{statusPill(d.status)}</td>
                    <td className="mono tabular-nums">${d.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 — Property Breakdown */}
        <section id="sec-breakdown" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">
            Property Breakdown
          </h2>
          <div className="border border-rule rounded-[2px] overflow-x-auto">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Actions / Week</th>
                  <th>Last Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROPERTIES.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-display text-[14.5px]">{p.name}</span>
                      <div className="text-[11px] text-neutral-400">
                        {p.neighborhood}
                      </div>
                    </td>
                    <td className="tabular-nums">{1 + (i % 4)}</td>
                    <td className="text-neutral-600">
                      Today, {(8 + (i % 5))}:0{i % 6}
                    </td>
                    <td>
                      <span className="urgency-pill pill-Medium">Logged</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7 — Validation */}
        <section id="sec-validation" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight">Validation</h2>
          <p className="text-[12px] text-neutral-500 mt-1 mb-5">
            {detail.validationNote}
          </p>
          <div className="grid gap-4">
            {PROPERTIES.slice(0, 4).map((p, i) => {
              const align = 96 - (i % 3) * 3;
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
                  <p className="reasoning text-[13px] border-t border-[#F1F1F0] pt-4">
                    Operator review confirmed the {detail.name}&apos;s decision matched
                    the action they would have taken. Logged to the audit trail.
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* 8 — Prompt History */}
        <section id="sec-prompts" className="mb-12">
          <h2 className="font-display text-[26px] tracking-tight mb-4">
            Prompt History
          </h2>
          <ol className="border-l border-rule pl-6">
            {detail.prompts.map((v, i) => (
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

        {/* 9 — Controls */}
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
                    ? "Active · Click to disable"
                    : "Disabled · Click to enable"}
                </button>
              </div>
            </div>
            <div className="ex-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-[18px] tracking-tight">Mode</div>
                  <p className="text-[12.5px] text-neutral-500 mt-1">
                    Shadow logs decisions for audit; Live pushes them through.
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
          {detail.configFooter}
        </div>
      </div>
    </div>
  );
}

function SuccessChart({ data }: { data: number[] }) {
  const w = 360,
    h = 140;
  const max = 100,
    min = 88;
  const step = w / (data.length - 1);
  const y = (v: number) => h - ((v - min) / (max - min)) * (h - 20) - 10;
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      {[88, 92, 96, 100].map((gy, i) => (
        <g key={i}>
          <line x1="0" x2={w} y1={y(gy)} y2={y(gy)} stroke="#F1F1F0" />
          <text x="0" y={y(gy) - 4} fontSize="9" fill="#8C8C8C">
            {gy}%
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="#1E5FBF" strokeWidth="1.6" points={pts} />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i * step).toFixed(1)}
          cy={y(v).toFixed(1)}
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
