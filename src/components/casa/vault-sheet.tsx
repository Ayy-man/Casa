"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Vault drill-down side-sheet. The shell descends from CleaningSheet
 * (cleanings/page.tsx) and the `.sheet` family in globals.css; the
 * `.sheet--vault` modifier (plan 01-01) makes it ~500px on desktop and the
 * existing mobile `.sheet` rule covers 100vw.
 *
 * The same component backs both surfaces — a table row click and a
 * deep-linked /vault/{name}/[id] route — so the detail view never diverges.
 *
 * Threat T-01-10: all record strings render as plain React text children;
 * no dangerouslySetInnerHTML anywhere. Esc-to-close is wired for keyboard
 * reachability (full ARIA dialog roles are deferred to v2 per UI-SPEC).
 */
export type StatTile = { label: string; value: string };
export type DetailRow = { key: string; value: React.ReactNode };
export type SheetAction = { label: string; kind: "accent" | "outline" | "tertiary" };

export type VaultDetail = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: StatTile[];
  rows: DetailRow[];
  actions: SheetAction[];
};

export function VaultSheet({
  detail,
  onClose,
}: {
  detail: VaultDetail;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <aside className="sheet sheet--vault">
        <div className="sheet-header">
          <div className="flex-1 min-w-0">
            <div className="section-eyebrow">{detail.eyebrow}</div>
            <h2 className="font-display text-[26px] tracking-tight leading-tight mt-1">
              {detail.title}
            </h2>
            <div className="text-[12.5px] text-neutral-500 mt-1">
              {detail.subtitle}
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close detail"
            title="Close"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>

        <div className="sheet-body">
          {/* 4-tile stat grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {detail.stats.map((s) => (
              <div
                key={s.label}
                className="border border-rule rounded-[2px] p-3"
              >
                <div className="section-eyebrow">{s.label}</div>
                <div className="font-display text-[22px] tracking-tight mt-1 tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* key/value detail rows */}
          <div className="mb-6">
            {detail.rows.map((r) => (
              <div className="def-row" key={r.key}>
                <span className="def-key">{r.key}</span>
                <span className="text-[13px] text-neutral-800">{r.value}</span>
              </div>
            ))}
          </div>

          {/* entity action row — local-state/toast demos only (Phase 1, L1) */}
          {detail.actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rule">
              {detail.actions.map((a) =>
                a.kind === "tertiary" ? (
                  <button
                    key={a.label}
                    type="button"
                    className="text-[13px] text-neutral-500 hover:text-neutral-900"
                    onClick={() => console.log("vault action", a.label)}
                  >
                    {a.label}
                  </button>
                ) : (
                  <button
                    key={a.label}
                    type="button"
                    className={`btn-sm ${
                      a.kind === "accent" ? "btn-sm-accent" : "btn-sm-outline"
                    }`}
                    onClick={() => console.log("vault action", a.label)}
                  >
                    {a.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/** Graceful not-found block for deep-linked /vault/{name}/[id] routes. */
export function VaultNotFound({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="route-fade page-pad">
      <div className="text-center py-24 border border-rule border-dashed rounded-[2px]">
        <h1 className="font-display text-[28px] tracking-tight">Not found.</h1>
        <p className="text-[13px] text-neutral-500 mt-3 max-w-[380px] mx-auto">
          That record doesn&rsquo;t exist or has been removed.
        </p>
        <a
          href={backHref}
          className="btn-sm btn-sm-outline mt-5 inline-flex"
        >
          {backLabel}
        </a>
      </div>
    </div>
  );
}
