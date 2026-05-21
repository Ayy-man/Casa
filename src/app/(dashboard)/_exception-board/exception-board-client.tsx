"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, CheckCircle, Check, Pencil, X } from "lucide-react";
import { URGENCY_RANK, type ExceptionItem } from "@/lib/mock-data/exceptions";
import { changeClass } from "@/lib/mock-data/pricing";
import { useAuth, useRole } from "@/lib/auth/context";
import { ExceptionCard } from "@/components/casa/exception-card";
import type { Exception } from "@/lib/data/exceptions";
import type { PricingRec } from "@/lib/data/pricing_recs";
import type { Property } from "@/lib/data/properties";

/**
 * Exception Board client island — the Casa 360 home route `/`.
 *
 * The RSC server shell (`page.tsx`) fetches real Supabase data and passes it
 * here as props; this island holds ALL interactivity — the role-aware greeting,
 * 4 status pills, 7 multi-select filter chips, the urgency-sorted exception
 * stack, the toast-with-Undo machinery, and the Pricing mega-card → 26-row
 * Approve/Edit/Reject side-sheet (D-12, the RSC server-shell + client-island
 * split). Everything in this file moved UNCHANGED from the prior `"use client"`
 * `page.tsx` body — only the data SOURCE (Supabase via Plan 02 data modules,
 * adapted below) and the server/client boundary changed.
 *
 * Phase 1 is read-only: every action button is a local-state / toast demo —
 * no persistence. Real three-state lifecycle is Phase 3 (D-13).
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
function matchesChip(
  chip: FilterChip,
  ex: { urgency: ExceptionItem["urgency"]; category: ExceptionItem["category"] },
): boolean {
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

/**
 * Per-category action verb sets — the `ExceptionCard` renders `actions[0]` as
 * the primary CTA, `[1]` secondary, `[2]` tertiary link. The Supabase
 * `exceptions` table has no `actions` column (the DB schema is intentionally
 * lean — Plan 02-01); these verb sets reproduce the mock-data action triples
 * so the card renders with visual parity. Keyed by the 8-category union.
 */
const CATEGORY_ACTIONS: Record<string, [string, string, string]> = {
  Guest: ["Approve Fix", "Call Guest", "Dismiss"],
  Cleaner: ["Call Cleaner", "Dispatch Backup", "Resolve"],
  Maintenance: ["Approve Fix", "Call Guest", "Dismiss"],
  Pricing: ["Approve Rate", "Adjust %", "Ignore"],
  Revenue: ["Review Listing", "Adjust Pricing", "Investigate"],
  Pipeline: ["Schedule Call", "View Brief", "Dismiss"],
  Compliance: ["Mark Renewed", "Snooze 7 Days", "Assign"],
  Owner: ["Send Draft", "Edit & Send", "Call Owner"],
};
const DEFAULT_ACTIONS: [string, string, string] = [
  "Review",
  "Snooze",
  "Dismiss",
];

/** Critical/Maintenance fixes that touch money or guests require a 2-step confirm. */
const CONFIRM_TYPES = new Set([
  "guest_complaint",
  "maintenance_issue",
  "claims_draft",
]);

type ActionToast = {
  id: number;
  action: string;
  property: string;
  exId: string;
};

type Decision = "approved" | "rejected" | undefined;

/**
 * Board-level exception item. Structurally the `ExceptionItem` shape the
 * `ExceptionCard` / `PricingMegaCard` consume, but with `id` as the DB uuid
 * string — the legacy mock `ExceptionItem.id` was a number; the redesigned
 * board keys on the uuid (per `@/lib/data/exceptions` `Exception`). The card
 * never reads `id`, so it is cast to `ExceptionItem` at the single render
 * boundary below.
 */
type BoardException = Omit<ExceptionItem, "id"> & { id: string };

/**
 * Adapt a Supabase `Exception` row (D-10 view shape) to the board item shape
 * `ExceptionCard` / `PricingMegaCard` consume. The DB `exceptions` table
 * carries no `actions`, `property` (display string), or `neighborhood` column —
 * `actions` is derived from `category`, and `property`/`neighborhood` are
 * resolved from the property lookup the RSC shell also fetched.
 */
function toExceptionItem(
  ex: Exception,
  propsById: Map<string, Property>,
): BoardException {
  const prop = ex.propertyId ? propsById.get(ex.propertyId) : undefined;
  const category = (ex.category ?? "Owner") as ExceptionItem["category"];
  const actions =
    (ex.category && CATEGORY_ACTIONS[ex.category]) ?? DEFAULT_ACTIONS;
  // Portfolio-wide rows (pricing_week) have no property_id — the mega-card
  // shows a portfolio label rather than a single address.
  const isPortfolio = ex.type === "pricing_week";
  return {
    id: ex.id,
    type: ex.type ?? "",
    typeLabel: ex.typeLabel ?? "Exception",
    urgency: (ex.urgency ?? "Medium") as ExceptionItem["urgency"],
    category,
    agent: ex.agent ?? "System",
    property: prop
      ? prop.name
      : isPortfolio
        ? "Portfolio-wide · 12 properties"
        : "—",
    neighborhood: prop
      ? prop.neighborhood
      : isPortfolio
        ? "Portfolio-wide"
        : "—",
    summary: ex.summary ?? "",
    suggested: ex.suggested ?? "",
    source: ex.source ?? "System",
    createdAt: ex.createdAt,
    actions: [...actions],
    requiresConfirm: ex.type ? CONFIRM_TYPES.has(ex.type) : false,
  };
}

export function ExceptionBoardClient({
  exceptions,
  pricingRecs,
  properties,
}: {
  /** Real exception rows from `getExceptions()` (Supabase, urgency-sorted). */
  exceptions: Exception[];
  /** Real pricing recommendations from `getPricingRecs()`. */
  pricingRecs: PricingRec[];
  /** The 26-home portfolio — resolves exception/pricing property-id → name. */
  properties: Property[];
}) {
  const { user } = useAuth();
  const role = useRole();

  // property-id → Property lookup, for resolving display names.
  const propsById = useMemo(() => {
    const m = new Map<string, Property>();
    for (const p of properties) m.set(p.id, p);
    return m;
  }, [properties]);

  // Adapt the Supabase rows to the ExceptionItem shape the cards consume,
  // then urgency-sort + created_at DESC tiebreaker (Pattern Map comparator).
  const sortedExceptions = useMemo(
    () =>
      exceptions
        .map((ex) => toExceptionItem(ex, propsById))
        .sort(
          (a, b) =>
            URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
            new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
        ),
    [exceptions, propsById],
  );

  // Locally-dismissed exception ids (DB uuids) — optimistically removed.
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Multi-select filter; `All` active by default.
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(
    () => new Set<FilterChip>(["All"]),
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

  const pushToast = (action: string, ex: BoardException) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, action, property: ex.property, exId: ex.id },
    ]);
    const timeoutId = window.setTimeout(() => dismissToast(id), 5000);
    timers.current.set(id, timeoutId);
  };

  // Primary / secondary action — local-state toast demo (Phase 1, mock only).
  const handleAction = (action: string, ex: BoardException) => {
    pushToast(action, ex);
  };

  // Tertiary link — Dismiss optimistically removes the card; the toast Undo
  // restores it. Resolve/Reject/Ignore also remove the card from the stack.
  const handleDismiss = (action: string, ex: BoardException) => {
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
    (ex) => !dismissedIds.has(ex.id),
  );
  const filteredExceptions = liveExceptions.filter((ex) =>
    [...activeFilters].some((chip) => matchesChip(chip, ex)),
  );

  // ── Status-pill counts (data-driven from real rows + local dismiss state) ──
  const pendingCount = liveExceptions.length;
  const criticalCount = liveExceptions.filter(
    (e) => e.urgency === "Critical",
  ).length;
  const mediumCount = liveExceptions.filter(
    (e) => e.urgency === "Medium",
  ).length;
  const resolvedTodayCount = dismissedIds.size;

  // ── Greeting ──
  const now = new Date();
  const greetingEyebrow = role === "owner" ? "OWNER VIEW" : "OPERATIONS VIEW";
  const firstName = (user?.name ?? "there").split(" ")[0];
  const greeting = `Good ${timeOfDay(now)}, ${firstName}.`;

  // ── Pricing mega-card: the pricing_week exception renders as a mega-card ──
  const pricingWeekException = sortedExceptions.find(
    (e) => e.type === "pricing_week",
  );

  // Preserved 26-row bulk-approve table — real pricing_recs adapted to the
  // table shape, sorted by absolute change magnitude (biggest moves first).
  const pricingRows = useMemo(
    () =>
      pricingRecs
        .map((r) => ({
          key: r.id,
          property: r.propertyId
            ? (propsById.get(r.propertyId)?.name ?? r.propertyId)
            : "—",
          current: r.current ?? 0,
          recommended: r.recommended ?? 0,
          change: r.change ?? 0,
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    [pricingRecs, propsById],
  );
  const setDecision = (key: string, val: Decision) =>
    setDecisions((d) => ({ ...d, [key]: val }));
  const approveAllRates = () =>
    setDecisions(
      Object.fromEntries(
        pricingRows.map((r) => [r.key, "approved" as Decision]),
      ),
    );
  const rejectAllRates = () =>
    setDecisions(
      Object.fromEntries(
        pricingRows.map((r) => [r.key, "rejected" as Decision]),
      ),
    );
  const totalApproved = Object.values(decisions).filter(
    (v) => v === "approved",
  ).length;
  const totalRejected = Object.values(decisions).filter(
    (v) => v === "rejected",
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
                // ExceptionCard's prop type is the legacy `ExceptionItem`
                // (numeric `id`); the board item carries the DB uuid string.
                // The card never reads `id`, so the cast is safe.
                <ExceptionCard
                  key={ex.id}
                  exception={ex as unknown as ExceptionItem}
                  onAction={
                    handleAction as unknown as (
                      action: string,
                      exception: ExceptionItem,
                    ) => void
                  }
                  onDismiss={
                    handleDismiss as unknown as (
                      action: string,
                      exception: ExceptionItem,
                    ) => void
                  }
                />
              ),
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
                  {pricingRows.length} properties analyzed · {totalApproved}{" "}
                  approved · {totalRejected} rejected
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
              {pricingRows.length === 0 ? (
                <div className="border border-rule rounded-[2px] py-12 text-center">
                  <div className="font-display text-[18px] tracking-tight">
                    No pricing recommendations yet.
                  </div>
                  <p className="text-[13px] text-[#737373] mt-1">
                    The Pricing Agent has not posted a rate run for this week.
                  </p>
                </div>
              ) : (
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
                        const decision = decisions[r.key];
                        const dir =
                          r.change > 0.05
                            ? "↑"
                            : r.change < -0.05
                              ? "↓"
                              : "·";
                        return (
                          <tr
                            key={r.key}
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
                                  r.change,
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
                                      r.key,
                                      decision === "approved"
                                        ? undefined
                                        : "approved",
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
                                      r.key,
                                      decision === "rejected"
                                        ? undefined
                                        : "rejected",
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
              )}
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
  exception: BoardException;
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
