"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AGENTS, modeClass, modeLabel } from "@/lib/mock-data/agents";
import { PROPERTIES } from "@/lib/mock-data/properties";
import { Sparkline } from "@/components/casa/sparkline";

/**
 * Agent Logs index (ROADMAP SC3) — relocated under Vault from the old
 * /agents route. A 4-agent 2-col grid (status pill + sparkline + 4 stat
 * tiles) descending from agents/page.tsx, plus a 50-row recent-activity
 * feed table using the .pricing-table base. Each agent card links to
 * /vault/agent-logs/[key].
 *
 * All feed strings render as plain React text children — no
 * dangerouslySetInnerHTML (threat T-01-13 disposition: mitigate).
 */

type FeedRow = {
  time: string;
  agent: string;
  property: string;
  action: string;
  status: "Logged" | "Sent" | "Flagged";
  cost: string;
};

// Per-agent action verbs — sourced from each agent's role (mock-data/agents.ts).
const ACTION_BY_AGENT: Record<string, string[]> = {
  Pricing: [
    "Generated rate recommendation",
    "Repriced weekend availability",
    "Flagged below-market rate",
    "Logged competitor comp scan",
  ],
  Guest: [
    "Drafted reply to guest inquiry",
    "Escalated sensitive message",
    "Sent check-in instructions",
    "Logged guest sentiment scan",
  ],
  Ops: [
    "Confirmed cleaner turnover",
    "Dispatched backup cleaner",
    "Scheduled supply run",
    "Logged maintenance follow-up",
  ],
  SOP: [
    "Updated property playbook",
    "Flagged drift from Casa standard",
    "Refreshed lockbox code",
    "Logged listing-detail audit",
  ],
};

// 50 most-recent agent actions, derived deterministically from the 4 agents
// and the property roster so the feed is stable across renders.
const FEED: FeedRow[] = Array.from({ length: 50 }).map((_, i) => {
  const agent = AGENTS[i % AGENTS.length];
  const agentLabel = agent.name.replace(" Agent", "");
  const verbs = ACTION_BY_AGENT[agentLabel] ?? ACTION_BY_AGENT.Pricing;
  const property = PROPERTIES[(i * 3) % PROPERTIES.length];
  const totalMin = 10 * 60 - i * 11;
  const day = totalMin >= 0 ? "Today" : "Yesterday";
  const norm = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(norm / 60)).padStart(2, "0");
  const mm = String(norm % 60).padStart(2, "0");
  const status: FeedRow["status"] =
    i % 13 === 5 ? "Flagged" : i % 7 === 3 ? "Sent" : "Logged";
  return {
    time: `${day}, ${hh}:${mm}`,
    agent: agentLabel,
    property: property.name,
    action: verbs[i % verbs.length],
    status,
    cost: (0.012 + (i % 9) * 0.004).toFixed(3),
  };
});

export default function AgentLogsPage() {
  return (
    <div className="route-fade page-pad">
      <header className="mb-8">
        <Link
          href="/vault"
          className="text-[11.5px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 mb-3 w-fit"
        >
          <ChevronLeft size={12} strokeWidth={1.5} />
          <span>Vault</span>
        </Link>
        <div className="section-eyebrow">Agent Logs</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Agent Logs
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          All agent activity across the system.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {AGENTS.map((a) => (
          <Link
            key={a.key}
            href={`/vault/agent-logs/${a.key}`}
            className="prop-card text-left"
            style={{ aspectRatio: "auto" }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-display text-[26px] tracking-tight">{a.name}</h3>
                  <p className="text-[12.5px] text-neutral-500 mt-1 max-w-[440px]">
                    {a.tagline}
                  </p>
                </div>
                <span className={`clean-status ${modeClass(a.mode)}`}>
                  {modeLabel(a.mode)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                  { l: "Actions Today", v: a.actionsToday },
                  { l: "Success", v: a.success + "%" },
                  { l: "Exceptions", v: a.exceptions + "%" },
                  { l: "Cost MTD", v: "$" + a.costMTD.toFixed(2) },
                ].map((s) => (
                  <div key={s.l} className="border-l border-rule pl-3">
                    <div className="section-eyebrow">{s.l}</div>
                    <div className="font-display text-[22px] tracking-tight mt-1">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400">
                  Last 7 days
                </span>
                <Sparkline values={a.spark} color="#1E5FBF" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-display text-[26px] tracking-tight mb-4">
          Recent Activity
        </h2>
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="pricing-table">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Timestamp</th>
                <th style={{ width: 100 }}>Agent</th>
                <th>Property</th>
                <th>Action</th>
                <th style={{ width: 150 }}>Status</th>
                <th style={{ width: 90 }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {FEED.map((r, i) => (
                <tr key={i}>
                  <td className="mono text-neutral-600">{r.time}</td>
                  <td className="text-neutral-700">{r.agent}</td>
                  <td>
                    <span className="font-display text-[14px] tracking-tight">
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
    </div>
  );
}
