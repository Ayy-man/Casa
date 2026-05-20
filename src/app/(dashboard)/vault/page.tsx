"use client";

import {
  Building2,
  Users,
  CalendarDays,
  Target,
  SprayCan,
  DollarSign,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { VaultCard, type VaultCardDescriptor } from "@/components/casa/vault-card";
import { useRole } from "@/lib/auth/context";
import { PROPERTIES } from "@/lib/mock-data/properties";
import { OWNERS } from "@/lib/mock-data/owners";
import { BOOKINGS } from "@/lib/mock-data/bookings";
import { PIPELINE } from "@/lib/mock-data/pipeline";
import { CLEANINGS_TODAY } from "@/lib/mock-data/cleanings";
import { COMPLIANCE } from "@/lib/mock-data/compliance";
import { AGENTS } from "@/lib/mock-data/agents";

/**
 * Vault landing — the data-discovery surface (ROADMAP SC3). A 4x2 grid of
 * 8 role-pinned cards, each drilling into a /vault/{slug} sub-page. Card-grid
 * structure descends from agents/page.tsx; cards are casa/vault-card.tsx.
 *
 * Pinning is highlight-only (threat T-01-11 disposition: accept) — every card
 * is reachable by both roles. Pin set comes from useRole():
 *   owner       → Properties, Owners, Financials
 *   operations  → Bookings, Turnovers
 */
const AGENT_ACTIONS = AGENTS.reduce((sum, a) => sum + a.actionsToday, 0);

const CARDS: VaultCardDescriptor[] = [
  { slug: "properties", title: "Properties", icon: Building2, subtitle: `${PROPERTIES.length} properties` },
  { slug: "owners", title: "Owners", icon: Users, subtitle: `${OWNERS.length} owners` },
  { slug: "bookings", title: "Bookings", icon: CalendarDays, subtitle: `${BOOKINGS.length} bookings` },
  { slug: "pipeline", title: "Pipeline", icon: Target, subtitle: `${PIPELINE.length} prospects` },
  { slug: "cleanings", title: "Turnovers", icon: SprayCan, subtitle: `${CLEANINGS_TODAY.length} turnovers today` },
  { slug: "financials", title: "Financials", icon: DollarSign, subtitle: "P&L Summary" },
  { slug: "compliance", title: "Compliance", icon: ShieldCheck, subtitle: `${COMPLIANCE.length} certificates` },
  { slug: "agent-logs", title: "Agent Logs", icon: Bot, subtitle: `${AGENT_ACTIONS} actions today` },
];

const OWNER_PINS = new Set(["properties", "owners", "financials"]);
const OPERATIONS_PINS = new Set(["bookings", "cleanings"]);

export default function VaultPage() {
  const role = useRole();
  const pinSet = role === "owner" ? OWNER_PINS : OPERATIONS_PINS;

  return (
    <div className="route-fade page-pad">
      <header className="mb-8">
        <div className="section-eyebrow">Vault</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Admin Vault
        </h1>
        <p className="text-[13px] text-neutral-500 mt-2">
          Central repository for all operational data and AI agent records.
        </p>
      </header>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <VaultCard
            key={card.slug}
            card={card}
            pinned={pinSet.has(card.slug)}
            pinnedRole={role}
          />
        ))}
      </div>
    </div>
  );
}
