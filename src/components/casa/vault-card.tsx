"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * Vault landing card. Descends from the `.prop-card` `<Link>` block
 * (properties/page.tsx) and the `.prop-card` CSS — reuses the 2px radius,
 * 1px #E5E5E5 border, and hover-lift shadow. A non-image card, so it sets
 * aspectRatio:auto the way agents/page.tsx does.
 *
 * Pinned state is role-relevance, NOT a success state (UI-SPEC Resolved
 * Tension 3): the badge + border use the Signal Blue Soft quartet
 * (#EAF1FB / #1E5FBF / #C9D9F0), never green.
 */
export type VaultCardDescriptor = {
  slug: string;
  title: string;
  icon: LucideIcon;
  subtitle: string;
};

export function VaultCard({
  card,
  pinned,
  pinnedRole,
}: {
  card: VaultCardDescriptor;
  pinned: boolean;
  pinnedRole: "owner" | "operations";
}) {
  const Icon = card.icon;
  return (
    <Link
      href={`/vault/${card.slug}`}
      className="prop-card"
      style={{
        aspectRatio: "auto",
        borderColor: pinned ? "#C9D9F0" : undefined,
      }}
    >
      <div className="p-6 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between gap-3">
          {/* icon in a soft colored square (top-left) */}
          <span
            className="inline-flex items-center justify-center rounded-[2px]"
            style={{
              width: 40,
              height: 40,
              background: "#F7F7F6",
              color: "#1A1A1A",
            }}
          >
            <Icon size={18} strokeWidth={1.5} />
          </span>
          {pinned && (
            <span
              className="inline-flex items-center rounded-full uppercase"
              style={{
                background: "#EAF1FB",
                color: "#1E5FBF",
                border: "1px solid #C9D9F0",
                fontSize: "10.5px",
                letterSpacing: "0.12em",
                fontWeight: 500,
                padding: "3px 8px",
              }}
            >
              {pinnedRole === "owner"
                ? "PINNED FOR OWNER"
                : "PINNED FOR OPERATIONS"}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <h3 className="font-display text-[18px] tracking-tight leading-tight">
            {card.title}
          </h3>
          <div className="text-[13px] text-neutral-500 mt-1">
            {card.subtitle}
          </div>
        </div>
      </div>
    </Link>
  );
}
