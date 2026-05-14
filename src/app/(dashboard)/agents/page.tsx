"use client";

import Link from "next/link";
import { AGENTS, modeClass, modeLabel } from "@/lib/mock-data/agents";
import { Sparkline } from "@/components/casa/sparkline";

export default function AgentsOverviewPage() {
  return (
    <div className="route-fade page-pad">
      <header className="mb-8">
        <div className="section-eyebrow">Agents</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Agents
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          4 agents active in Phase 1. 2 in shadow mode, 2 live.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5">
        {AGENTS.map((a) => (
          <Link
            key={a.key}
            href={`/agents/${a.key}`}
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
    </div>
  );
}
