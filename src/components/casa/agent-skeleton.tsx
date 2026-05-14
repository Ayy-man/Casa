"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { modeClass, modeLabel, type AgentMode } from "@/lib/mock-data/agents";

export function AgentSkeleton({
  name,
  tagline,
  mode,
}: {
  name: string;
  tagline: string;
  mode: AgentMode;
}) {
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
                {name}
              </h1>
              <p className="text-[13.5px] text-[#C9CFD9] mt-2 max-w-[640px]">
                {tagline}
              </p>
            </div>
            <span className={`clean-status ${modeClass(mode)}`}>
              {modeLabel(mode)}
            </span>
          </div>
        </div>
      </div>
      <div className="page-pad" style={{ paddingTop: 28 }}>
        <div className="border border-dashed border-rule rounded-[2px] p-12 text-center">
          <div className="font-display text-[22px] tracking-tight">
            Same structure, different mock data.
          </div>
          <p className="text-[13px] text-neutral-500 mt-2 max-w-[480px] mx-auto">
            All sections from the Pricing Agent (At a Glance, Live Activity,
            Configuration, Performance, Decisions, Property Breakdown, Validation,
            Prompt History, Controls) reused here, populated with this agent’s action
            types in a later iteration.
          </p>
          <Link href="/agents/pricing" className="btn-sm btn-sm-outline mt-5 inline-flex">
            See Pricing Agent fully built
          </Link>
        </div>
      </div>
    </div>
  );
}
