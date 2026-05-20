"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, CheckCircle, Check, Pencil, X } from "lucide-react";
import {
  EXCEPTIONS,
  URGENCY_RANK,
  type ExceptionItem,
} from "@/lib/mock-data/exceptions";
import { PRICING_BASE, changeClass } from "@/lib/mock-data/pricing";
import { useAuth, useRole } from "@/lib/auth/context";
import { ExceptionCard } from "@/components/casa/exception-card";

/**
 * Exception Board — the Casa 360 home route `/`.
 *
 * The operator's first surface every morning: a role-aware greeting, 4
 * data-driven status pills, 7 multi-select filter chips, and an urgency-sorted
 * stack of narrative exception cards. The standalone Pricing Approval Queue
 * folds in as a "Pricing Week of [date]" mega-card opening the preserved
 * 26-row Approve/Edit/Reject side-sheet.
 *
 * Phase 1 is mock-data-only (CONTEXT L1): every action button is a local-state
 * / toast demo — no persistence. Real three-state lifecycle is Phase 3.
 */

const PRICING_WEEK_LABEL = "Week of May 18, 2026";

/**
 * Naive past-tense for action labels — see exception-card.tsx for the verb set.
 */
function pastTense(action: string): string {
  const [verb, ...rest] = action.split(" ");
  if (!verb) return action;
  const past = verb.endsWith("e") ? verb + "d" : verb + "ed";
  return [past, ...rest].join(" ");
}

/** morning <12:00 · afternoon 12:00–17:59 · evening 18:00+ */
function timeOfDay(now: Date): "morning" | "afternoon" | "evening" {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

/**
 * Filter chips. `All` is mutually exclusive with the rest; the others
 * multi-select. Each non-`All` chip maps to the exception categories it covers.
 */
const FILTER_CHIPS = [
  "All",
  "Critical",
  "Guest",
  "Operations",
  "Pricing",
  "Pipeline",
  "Compliance",
] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];

/** Which exceptions a given chip admits. `All` and `Critical` are special. */
function matchesChip(chip: FilterChip, ex: ExceptionItem): boolean {
  switch (chip) {
    case "All":
      return true;
    case "Critical":
      return ex.urgency === "Critical";
    case "Guest":
      return ex.category === "Guest";
    case "Operations":
      return ex.category === "Cleaner" || ex.category === "Maintenance";
    case "Pricing":
      return ex.category === "Pricing" || ex.category === "Revenue";
    case "Pipeline":
      return ex.category === "Pipeline";
    case "Compliance":
      return ex.category === "Compliance";
  }
}

type ActionToast = {
  id: number;
  action: string;
  property: string;
  exId: number;
};

type Decision = "approved" | "rejected" | undefined;

export default function ExceptionBoardPage() {
  const { user } = useAuth();
  const role = useRole();

  // Urgency sort + created_at DESC tiebreaker (Pattern Map comparator).
  const sortedExceptions = useMemo(
    () =>
      [...EXCEPTIONS].sort(
        (a, b) =>
          URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    []
  );

  // Locally-dismissed exception ids — optimistically removed from the stack.
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  // Multi-select filter; `All` active by default.
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(
    () => new Set<FilterChip>(["All"])
  );
  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  // Pricing mega-card side-sheet + the preserved 26-row bulk-approve state.
  const [pricingSheetOpen, setPricingSheetOpen] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!pricingSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPricingSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pricingSheetOpen]);

  const dismissToast = (id: number) => {
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const pushToast = (action: string, ex: ExceptionItem) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, action, property: ex.property, exId: ex.id },
    ]);
    const timeoutId = window.setTimeout(() => dismissToast(id), 5000);
    timers.current.set(id, timeoutId);
  };

  // Primary / secondary action — local-state toast demo (Phase 1, mock only).
  const handleAction = (action: string, ex: ExceptionItem) => {
    pushToast(action, ex);
  };

  // Tertiary link — Dismiss optimistically removes the card; the toast Undo
  // restores it. Resolve/Reject/Ignore also remove the card from the stack.
  const handleDismiss = (action: string, ex: ExceptionItem) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(ex.id);
      return next;
    });
    pushToast(action, ex);
  };

  const undoToast = (toast: ActionToast) => {
    setDismissedIds((prev) => {
      if (!prev.has(toast.exId)) return prev;
      const next = new Set(prev);
      next.delete(toast.exId);
      return next;
    });
    dismissToast(toast.id);
  };

  const toggleFilter = (chip: FilterChip) => {
    setActiveFilters((prev) => {
      if (chip === "All") return new Set<FilterChip>(["All"]);
      const next = new Set(prev);
      next.delete("All");
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      // Deselecting the last chip falls back to `All`.
      if (next.size === 0) return new Set<FilterChip>(["All"]);
      return next;
    });
  };

  // Live (non-dismissed) exceptions, then the active filter set applied.
  const liveExceptions = sortedExceptions.filter(
    (ex) => !dismissedIds.has(ex.id)
  );
  const filteredExceptions = liveExceptions.filter((ex) =>
    [...activeFilters].some((chip) => matchesChip(chip, ex))
  );

  // ── Status-pill counts (data-driven from EXCEPTIONS + local dismiss state) ──
  const pendingCount = liveExceptions.length;
  const criticalCount = liveExceptions.filter(
    (e) => e.urgency === "Critical"
  ).length;
  const mediumCount = liveExceptions.filter(
    (e) => e.urgency === "Medium"
  ).length;
  const resolvedTodayCount = dismissedIds.size;

  // ── Greeting ──
  const now = new Date();
  const greetingEyebrow = role === "owner" ? "OWNER VIEW" : "OPERATIONS VIEW";
  const firstName = (user?.name ?? "there").split(" ")[0];
  const greeting = `Good ${timeOfDay(now)}, ${firstName}.`;

  // ── Pricing mega-card: the pricing_week exception renders as a mega-card ──
  const pricingWeekException = sortedExceptions.find(
    (e) => e.type === "pricing_week"
  );

  // Preserved 26-row bulk-approve table state (from the old /pricing page).
  const pricingRows = useMemo(
    () =>
      [...PRICING_BASE].sort(
        (a, b) => Math.abs(b.change) - Math.abs(a.change)
      ),
    []
  );
  const setDecision = (key: string, val: Decision) =>
    setDecisions((d) => ({ ...d, [key]: val }));
  const approveAllRates = () =>
    setDecisions(
      Object.fromEntries(
        pricingRows.map((r) => [r.property, "approved" as Decision])
      )
    );
  const rejectAllRates = () =>
    setDecisions(
      Object.fromEntries(
        pricingRows.map((r) => [r.property, "rejected" as Decision])
      )
    );
  const totalApproved = Object.values(decisions).filter(
    (v) => v === "approved"
  ).length;
  const totalRejected = Object.values(decisions).filter(
    (v) => v === "rejected"
  ).length;

  const stackIsEmpty = filteredExceptions.length === 0;

  return (
    <div className="route-fade page-pad">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* ── Greeting block — the one Playfair 40px headline for this route ── */}
        <header className="mb-12">
          <div className="section-eyebrow">{greetingEyebrow}</div>
          <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
            {greeting}
          </h1>
          <p className="text-[15px] leading-[1.55] text-[#737373] mt-2">
            Here&rsquo;s what&rsquo;s waiting on you right now.
          </p>
        </header>

        {/* ── 4 data-driven status pills ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="status-count-pill status-pending">
            <span className="status-count tabular-nums">{pendingCount}</span>{" "}
            pending
          </span>
          <span className="status-count-pill status-critical">
            <span className="status-count tabular-nums">{criticalCount}</span>{" "}
            critical
          </span>
          <span className="status-count-pill status-medium">
            <span className="status-count tabular-nums">{mediumCount}</span>{" "}
            medium
          </span>
          <span className="status-count-pill status-resolved">
            <span className="status-count tabular-nums">
              {resolvedTodayCount}
            </span>{" "}
            resolved today
          </span>
        </div>

        {/* ── 7 multi-select filter chips ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilters.has(chip);
            return (
              <button
                key={chip}
                type="button"
                className={`filter-chip ${active ? "filter-chip--accent" : ""}`}
                aria-pressed={active}
                onClick={() => toggleFilter(chip)}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* ── Action receipts (toast-with-Undo) ── */}
        {toasts.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-2 mb-4"
          >
            {toasts.map((toast) => {
              const past = pastTense(toast.action);
              return (
                <div
                  key={toast.id}
                  className="toast-row"
                  aria-label={`${past} at ${toast.property}. Undo available.`}
                >
                  <CheckCircle
                    size={14}
                    strokeWidth={1.6}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate flex-1 min-w-0">
                    {past} · {toast.property}
                  </span>
                  <button
                    type="button"
                    onClick={() => undoToast(toast)}
                    className="toast-undo"
                    aria-label={`Undo ${past} at ${toast.property}`}
                  >
                    Undo
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Card stack / empty state ── */}
        {stackIsEmpty ? (
          <div className="py-20 text-center">
            <h2 className="font-display text-[40px] leading-[1.1] tracking-tight">
              All clear.
            </h2>
            <p className="text-[15px] leading-[1.55] text-[#737373] mt-2">
              Nothing in this category needs your attention right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredExceptions.map((ex) =>
              ex.type === "pricing_week" ? (
                <PricingMegaCard
                  key={ex.id}
                  exception={ex}
                  onOpenSheet={() => setPricingSheetOpen(true)}
                />
              ) : (
                <ExceptionCard
                  key={ex.id}
                  exception={ex}
                  onAction={handleAction}
                  onDismiss={handleDismiss}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ── Pricing mega-card side-sheet — preserved 26-row bulk-approve table ── */}
      {pricingSheetOpen && pricingWeekException && (
        <>
          <div
            className="sheet-overlay"
            onClick={() => setPricingSheetOpen(false)}
          />
          <aside className="sheet">
            <div className="sheet-header">
              <div className="flex-1">
                <div className="section-eyebrow">Pricing · Bulk approval</div>
                <h2 className="font-display text-[26px] tracking-tight leading-tight mt-1">
                  Pricing {PRICING_WEEK_LABEL}
                </h2>
                <div className="text-[13px] text-[#737373] mt-1">
                  26 properties analyzed · {totalApproved} approved ·{" "}
                  {totalRejected} rejected
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                title="Close"
                aria-label="Close pricing sheet"
                onClick={() => setPricingSheetOpen(false)}
              >
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>
            <div className="sheet-body">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <button
                  type="button"
                  className="btn-sm btn-sm-accent"
                  onClick={approveAllRates}
                >
                  Approve all
                </button>
                <button
                  type="button"
                  className="btn-sm btn-sm-outline"
                  onClick={rejectAllRates}
                >
                  Reject all
                </button>
              </div>
              <div className="border border-rule rounded-[2px] overflow-hidden">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th style={{ width: "34%" }}>Property</th>
                      <th style={{ width: "16%" }}>Current</th>
                      <th style={{ width: "16%" }}>Recommended</th>
                      <th style={{ width: "14%" }}>Change</th>
                      <th style={{ width: "120px", textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((r) => {
                      const decision = decisions[r.property];
                      const dir =
                        r.change > 0.05 ? "↑" : r.change < -0.05 ? "↓" : "·";
                      return (
                        <tr
                          key={r.property}
                          style={
                            decision === "rejected"
                              ? { opacity: 0.45 }
                              : undefined
                          }
                        >
                          <td>
                            <div className="font-display text-[15px] leading-tight tracking-tight text-neutral-900 truncate">
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
                          <td className="text-neutral-700 tabular-nums">
                            ${r.current}
                          </td>
                          <td className="text-neutral-900 font-medium tabular-nums">
                            ${r.recommended}
                          </td>
                          <td>
                            <span
                              className={`change-pill ${changeClass(
                                r.change
                              )}`}
                            >
                              <span>{dir}</span>
                              <span>
                                {r.change > 0 ? "+" : ""}
                                {r.change.toFixed(1)}%
                              </span>
                            </span>
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
                                    decision === "approved"
                                      ? undefined
                                      : "approved"
                                  )
                                }
                              >
                                <Check size={14} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                title="Edit rate"
                                className="icon-btn"
                                onClick={() =>
                                  console.log("override", r.property)
                                }
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
                                    decision === "rejected"
                                      ? undefined
                                      : "rejected"
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
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

/**
 * Pricing "Week of [date]" mega-card. Visually a sibling of the exception
 * cards (reuses `.ex-card`) but its primary action opens the bulk-approve
 * side-sheet rather than firing a toast.
 */
function PricingMegaCard({
  exception,
  onOpenSheet,
}: {
  exception: ExceptionItem;
  onOpenSheet: () => void;
}) {
  return (
    <article
      className="ex-card scroll-mt-6"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <span
        className={`cat-rule cat-${exception.category}`}
        aria-hidden="true"
      />
      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`cat-pill cat-${exception.category}`}>
            {exception.category}
          </span>
          <span className={`urgency-pill pill-${exception.urgency}`}>
            {exception.urgency}
          </span>
        </div>
        <span className="text-[12px] text-neutral-600 shrink-0">
          {exception.property}
        </span>
      </header>

      <h3 className="font-display text-[18px] leading-tight tracking-tight">
        Pricing {PRICING_WEEK_LABEL}
      </h3>
      <div className="text-[13px] text-[#737373] mt-1">
        {exception.typeLabel}
      </div>

      <p
        className="text-[15px] leading-[1.55] text-ink mt-3"
        style={{ maxWidth: "60ch" }}
      >
        {exception.summary}
      </p>

      <div
        className="mt-4 rounded-[2px] px-4 py-3"
        style={{ background: "#F7F7F6", maxWidth: "60ch" }}
      >
        <span className="text-[13px] font-medium text-ink">Suggested: </span>
        <span className="text-[15px] leading-[1.55] italic text-[#525252]">
          {exception.suggested}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5">
        <button
          type="button"
          className="btn-sm btn-sm-accent inline-flex items-center gap-2"
          onClick={onOpenSheet}
        >
          <Calendar size={14} strokeWidth={1.5} />
          Review 26 rates
        </button>
      </div>

      <footer className="mt-4 pt-3 border-t border-rule text-[12px] text-[#737373]">
        Flagged by <span className="mono">{exception.source}</span>
      </footer>
    </article>
  );
}
