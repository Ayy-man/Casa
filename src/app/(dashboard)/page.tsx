"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  ChevronsLeft,
  ChevronsRight,
  Leaf,
  MoreHorizontal,
  TriangleAlert,
} from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  EXCEPTIONS,
  URGENCY_RANK,
  AGENT_ACTIVITY,
  type ExceptionItem,
} from "@/lib/mock-data/exceptions";
import {
  TODAY_CLEANINGS_SUMMARY,
} from "@/lib/mock-data/cleanings";
import {
  TODAY_CHECKINS,
  TODAY_CHECKOUTS,
} from "@/lib/mock-data/bookings";
import { PublishButton } from "@/components/ui/publish-button";

const LEAD_KPI = {
  label: "Resolved today",
  value: 12,
  trend: "vs 9 yesterday",
  go: "/reports",
};
const SECONDARY_KPIS = [
  { label: "Cleanings Today", value: 7, trend: "3 in progress", go: "/cleanings" },
  { label: "Pricing Recs Pending", value: 26, trend: "8 above 5% threshold", go: "/pricing" },
  { label: "Claims Pending Review", value: 2, trend: "Same as yesterday", go: "/claims" },
];

const agentSlug = (agent: string) =>
  agent.toLowerCase().replace(/\s+agent$/i, "").trim();

const CRITICAL_ANCHOR_ID = "exception-critical-anchor";

/**
 * Naive past-tense for action labels. Works for the verbs we actually ship:
 * Approve → Approved, Call → Called, Snooze → Snoozed, Dispatch → Dispatched,
 * Resolve → Resolved, Edit → Edited, Reject → Rejected, Review → Reviewed.
 * The first whitespace-separated word is the verb; the rest is the object.
 */
const pastTense = (action: string) => {
  const [verb, ...rest] = action.split(" ");
  if (!verb) return action;
  const past = verb.endsWith("e") ? verb + "d" : verb + "ed";
  return [past, ...rest].join(" ");
};

function ExceptionCard({
  ex,
  onAction,
  isFirstCritical,
}: {
  ex: ExceptionItem;
  onAction: (action: string, ex: ExceptionItem) => void;
  isFirstCritical?: boolean;
}) {
  const router = useRouter();
  const [primary, ...rest] = ex.actions;
  const requiresConfirm = ex.requiresConfirm === true;

  return (
    <article
      className="ex-card scroll-mt-6"
      id={isFirstCritical ? CRITICAL_ANCHOR_ID : undefined}
    >
      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`urgency-dot urg-${ex.urgency}`} />
          <span className={`urgency-pill pill-${ex.urgency}`}>{ex.urgency}</span>
          <span className="agent-eyebrow">{ex.agent}</span>
        </div>
        <span className="text-[12px] text-neutral-600 shrink-0 tabular-nums">
          {ex.timeAgo}
        </span>
      </header>

      <h3 className="font-display text-[20px] leading-tight tracking-tight">
        {ex.typeLabel}
      </h3>
      <div className="text-[12.5px] text-neutral-600 mt-1">{ex.property}</div>

      <p className="reasoning mt-3" style={{ maxWidth: "60ch" }}>
        {ex.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-5">
        {requiresConfirm ? (
          <PublishButton
            onPublish={() => onAction(primary, ex)}
            holdDuration={1800}
            label={`Hold to ${primary.toLowerCase()}`}
            publishingLabel={`${primary}…`}
            publishedLabel={pastTense(primary)}
          />
        ) : (
          <button
            type="button"
            className="btn-sm btn-sm-primary"
            onClick={() => onAction(primary, ex)}
          >
            {primary}
          </button>
        )}
        {rest.length > 0 && (
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="btn-sm btn-sm-overflow"
                aria-label={`More actions for ${ex.typeLabel}`}
              >
                <MoreHorizontal size={14} strokeWidth={1.5} />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                align="start"
                sideOffset={6}
                className="menu-pop-floating"
              >
                {rest.map((a) => (
                  <Dropdown.Item
                    key={a}
                    onSelect={() => onAction(a, ex)}
                    className="menu-pop-item"
                  >
                    {a}
                  </Dropdown.Item>
                ))}
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        )}
        <span className="flex-1" />
        <button
          type="button"
          className="text-[12px] text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-[2px]"
          onClick={() => router.push(`/agents/${agentSlug(ex.agent)}`)}
        >
          Open in {ex.agent.replace(" Agent", "")} →
        </button>
      </div>
    </article>
  );
}

function Panel({
  title,
  count,
  cta,
  children,
}: {
  title: string;
  count?: number;
  cta?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel-title">
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {typeof count === "number" && (
            <span className="text-[11px] text-neutral-600 font-sans tabular-nums">
              ({count})
            </span>
          )}
        </span>
        {cta && (
          <button
            type="button"
            onClick={cta}
            className="text-[12px] text-[#1E5FBF] hover:underline px-2 py-1 rounded-[2px]"
          >
            View all
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

type ActionToast = {
  id: number;
  action: string;
  property: string;
  exId: number;
  timeoutId?: number;
};

export default function HomePage() {
  const router = useRouter();
  const exceptions = useMemo(
    () =>
      [...EXCEPTIONS].sort(
        (a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
      ),
    []
  );
  const exceptionCount = exceptions.length;
  const [railOpen, setRailOpen] = useState(true);
  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current.clear();
    };
  }, []);

  const dismissToast = (id: number) => {
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const handleAction = (action: string, ex: ExceptionItem) => {
    const id = Date.now() + Math.random();
    const toast: ActionToast = { id, action, property: ex.property, exId: ex.id };
    setToasts((prev) => [...prev, toast]);
    const timeoutId = window.setTimeout(() => dismissToast(id), 5000);
    timers.current.set(id, timeoutId);
  };

  const firstCriticalAgent = exceptions.find((e) => e.urgency === "Critical")?.agent ?? null;
  const firstCriticalTimeAgo =
    exceptions.find((e) => e.urgency === "Critical")?.timeAgo ?? null;

  const scrollToCritical = () => {
    const el = document.getElementById(CRITICAL_ANCHOR_ID);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("ex-card--flash");
    window.setTimeout(() => el.classList.remove("ex-card--flash"), 1800);
  };

  const banner =
    exceptionCount > 0 ? (
      <div className="status-banner status-amber">
        <span className="status-icon-wrap" style={{ color: "#6B4A12" }}>
          <TriangleAlert size={18} strokeWidth={1.5} />
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[22px] leading-tight tracking-tight font-normal">
            {exceptionCount} items need your attention
          </h1>
          <div className="text-[13px] mt-0.5 opacity-80">
            Sorted by urgency.
            {firstCriticalAgent && firstCriticalTimeAgo && (
              <>
                {" "}
                The {firstCriticalAgent} flagged one critical item {firstCriticalTimeAgo}.
                {" "}
                <button
                  type="button"
                  onClick={scrollToCritical}
                  className="underline underline-offset-2 hover:opacity-100 opacity-90"
                  aria-controls={CRITICAL_ANCHOR_ID}
                >
                  Jump to it ↓
                </button>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn-sm btn-sm-outline shrink-0 whitespace-nowrap"
          style={{ borderColor: "#EFE3C7", background: "rgba(255,255,255,0.6)" }}
          onClick={() => console.log("mute")}
        >
          Mute
        </button>
      </div>
    ) : (
      <div className="status-banner status-green">
        <span className="status-icon-wrap" style={{ color: "#2E4A2A" }}>
          <Leaf size={18} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-[22px] leading-tight tracking-tight font-normal">
            All clear
          </h1>
          <div className="text-[13px] mt-0.5 opacity-80">
            Nothing requires your attention right now.
          </div>
        </div>
      </div>
    );

  return (
    <div className="route-fade">
      {banner}

        <div className="page-pad">
          <div className="section-eyebrow mb-5">Today · Friday, May 1</div>

          <div className="grid gap-4 mb-10 home-kpi-row">
            <button
              type="button"
              onClick={() => router.push(LEAD_KPI.go)}
              className="kpi-card kpi-card--lead"
              aria-label={`${LEAD_KPI.value} ${LEAD_KPI.label}, ${LEAD_KPI.trend}`}
            >
              <span className="kpi-rule" />
              <div className="section-eyebrow">{LEAD_KPI.label}</div>
              <div>
                <div className="font-display text-[72px] leading-none tracking-tight tabular-nums">
                  {LEAD_KPI.value}
                </div>
                <div className="text-[13px] text-neutral-600 mt-4">
                  {LEAD_KPI.trend}
                </div>
              </div>
            </button>

            <div className="grid grid-cols-1 gap-3 home-kpi-stack">
              {SECONDARY_KPIS.map((k) => (
                <button
                  type="button"
                  key={k.label}
                  onClick={() => router.push(k.go)}
                  className="kpi-card kpi-card--sm"
                  aria-label={`${k.value} ${k.label}, ${k.trend}`}
                >
                  <span className="kpi-rule" />
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="section-eyebrow truncate">{k.label}</div>
                    <div className="font-display text-[26px] leading-none tracking-tight tabular-nums">
                      {k.value}
                    </div>
                  </div>
                  <div className="text-[12px] text-neutral-600 mt-2">{k.trend}</div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="grid gap-6 home-twocol"
            style={{ gridTemplateColumns: railOpen ? "1fr 320px" : "1fr 36px" }}
          >
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="section-eyebrow">Exceptions</div>
                  <h2 className="font-display text-[24px] tracking-tight mt-0.5">
                    Open queue
                  </h2>
                </div>
                <div className="text-[12px] text-neutral-600">
                  Sorted by urgency
                </div>
              </div>

              {toasts.length > 0 && (
                <div
                  role="status"
                  aria-live="polite"
                  className="toast-stack-inline mb-3"
                >
                  {toasts.map((toast) => {
                    const past = pastTense(toast.action);
                    return (
                      <div
                        key={toast.id}
                        className="toast-row"
                        aria-label={`${past} at ${toast.property}. Undo available.`}
                      >
                        <CheckCircle size={14} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
                        <span className="truncate flex-1 min-w-0">
                          {past} · {toast.property}
                        </span>
                        <button
                          type="button"
                          onClick={() => dismissToast(toast.id)}
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

              <div className="flex flex-col gap-3">
                {(() => {
                  let firstCriticalSeen = false;
                  return exceptions.map((e) => {
                    const isFirstCritical = !firstCriticalSeen && e.urgency === "Critical";
                    if (isFirstCritical) firstCriticalSeen = true;
                    return (
                      <ExceptionCard
                        key={e.id}
                        ex={e}
                        onAction={handleAction}
                        isFirstCritical={isFirstCritical}
                      />
                    );
                  });
                })()}
              </div>
            </section>

            <aside className="home-rail">
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={() => setRailOpen((v) => !v)}
                  className="icon-btn"
                  aria-label={railOpen ? "Collapse side panel" : "Expand side panel"}
                  aria-expanded={railOpen}
                >
                  {railOpen ? (
                    <ChevronsRight size={14} strokeWidth={1.5} />
                  ) : (
                    <ChevronsLeft size={14} strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {railOpen && (
                <div className="flex flex-col gap-4">
                  <Panel
                    title="Today’s Cleanings"
                    count={TODAY_CLEANINGS_SUMMARY.length}
                    cta={() => router.push("/cleanings")}
                  >
                    {TODAY_CLEANINGS_SUMMARY.map((c) => (
                      <div key={c.property} className="panel-row">
                        <span
                          className="urgency-dot"
                          style={{
                            background:
                              c.status === "In progress" ? "#1E5FBF" : "#C9C9C9",
                          }}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-neutral-900 truncate">
                            {c.property}
                          </span>
                          <span className="block text-[11.5px] text-neutral-600 truncate">
                            {c.window} · {c.cleaner}
                          </span>
                        </span>
                      </div>
                    ))}
                  </Panel>

                  <Panel title="Today’s Check-ins / Outs" cta={() => router.push("/bookings")}>
                    <div className="rail-eyebrow mb-1">Arriving</div>
                    {TODAY_CHECKINS.map((b) => (
                      <div key={b.property} className="panel-row">
                        <ArrowDownToLine size={12} strokeWidth={1.5} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-neutral-900 truncate">
                            {b.property}
                          </span>
                          <span className="block text-[11.5px] text-neutral-600 truncate">
                            {b.who} · {b.time}
                          </span>
                        </span>
                      </div>
                    ))}
                    <div className="rail-eyebrow mt-3 mb-1">Departing</div>
                    {TODAY_CHECKOUTS.map((b) => (
                      <div key={b.property} className="panel-row">
                        <ArrowUpFromLine size={12} strokeWidth={1.5} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-neutral-900 truncate">
                            {b.property}
                          </span>
                          <span className="block text-[11.5px] text-neutral-600 truncate">
                            {b.who} · {b.time}
                          </span>
                        </span>
                      </div>
                    ))}
                  </Panel>

                  <Panel title="Latest Agent Activity" cta={() => router.push("/agents")}>
                    {AGENT_ACTIVITY.map((a) => (
                      <div key={a.text} className="panel-row">
                        <span className="rail-eyebrow w-[52px] shrink-0">
                          {a.agent}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-neutral-800 truncate">
                            {a.text}
                          </span>
                          <span className="block text-[11.5px] text-neutral-600">
                            {a.time}
                          </span>
                        </span>
                      </div>
                    ))}
                  </Panel>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
  );
}
