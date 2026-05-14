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
  TriangleAlert,
} from "lucide-react";
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

const LEAD_KPI = {
  label: "Open Exceptions",
  value: 4,
  trend: "+1 from yesterday",
  go: "/",
};
const SECONDARY_KPIS = [
  { label: "Cleanings Today", value: 7, trend: "3 in progress", go: "/cleanings" },
  { label: "Pricing Recs Pending", value: 26, trend: "8 above 5% threshold", go: "/pricing" },
  { label: "Claims Pending Review", value: 2, trend: "Same as yesterday", go: "/claims" },
];

function ExceptionCard({
  ex,
  onAction,
}: {
  ex: ExceptionItem;
  onAction: (action: string, ex: ExceptionItem) => void;
}) {
  const [primary, ...rest] = ex.actions;
  return (
    <article className="ex-card">
      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`urgency-dot urg-${ex.urgency}`} />
          <span className={`urgency-pill pill-${ex.urgency}`}>{ex.urgency}</span>
          <span className="text-[10.5px] tracking-eyebrow uppercase text-neutral-600">
            {ex.agent}
          </span>
        </div>
        <span className="text-[11.5px] text-neutral-600 shrink-0">{ex.timeAgo}</span>
      </header>

      <h3 className="font-display text-[20px] leading-tight tracking-tight">
        {ex.typeLabel}
      </h3>
      <div className="text-[12.5px] text-neutral-500 mt-1">{ex.property}</div>

      <p className="reasoning mt-3" style={{ maxWidth: "60ch" }}>
        {ex.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-5">
        <button
          type="button"
          className="btn-sm btn-sm-primary"
          onClick={() => onAction(primary, ex)}
        >
          {primary}
        </button>
        {rest.map((a) => (
          <button
            type="button"
            key={a}
            className="btn-sm btn-sm-outline"
            onClick={() => onAction(a, ex)}
          >
            {a}
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          className="text-[11.5px] text-neutral-500 hover:text-neutral-900 px-2 py-1"
          onClick={() => console.log("open agent:", ex.agent)}
        >
          Open in {ex.agent.replace(" Agent", "")} →
        </button>
      </div>
    </article>
  );
}

type ActionToast = {
  id: number;
  action: string;
  property: string;
  exId: number;
};

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
            <span className="text-[11px] text-neutral-400 font-sans">({count})</span>
          )}
        </span>
        {cta && (
          <button
            type="button"
            onClick={cta}
            className="text-[11px] text-[#1E5FBF] hover:underline"
          >
            View all
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

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
  const [toast, setToast] = useState<ActionToast | null>(null);
  const dismissRef = useRef<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (dismissRef.current) window.clearTimeout(dismissRef.current);
    dismissRef.current = window.setTimeout(() => setToast(null), 5000);
    return () => {
      if (dismissRef.current) window.clearTimeout(dismissRef.current);
    };
  }, [toast]);

  const handleAction = (action: string, ex: ExceptionItem) => {
    setToast({ id: Date.now(), action, property: ex.property, exId: ex.id });
  };
  const undoAction = () => {
    if (dismissRef.current) window.clearTimeout(dismissRef.current);
    setToast(null);
  };

  return (
    <>
    <div className="route-fade">
      {exceptionCount > 0 ? (
        <div className="status-banner status-amber">
          <span className="status-icon-wrap" style={{ color: "#6B4A12" }}>
            <TriangleAlert size={18} strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[22px] leading-tight">
              {exceptionCount} items need your attention
            </div>
            <div className="text-[12.5px] mt-0.5 opacity-80">
              Sorted by urgency. The Guest Agent flagged one critical item 8 minutes ago.
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
            <div className="font-display text-[22px] leading-tight">All clear</div>
            <div className="text-[12.5px] mt-0.5 opacity-80">
              Nothing requires your attention right now.
            </div>
          </div>
        </div>
      )}

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
              <div className="font-display text-[72px] leading-none tracking-tight">
                {LEAD_KPI.value}
              </div>
              <div className="text-[12.5px] text-neutral-600 mt-4">{LEAD_KPI.trend}</div>
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
                <div className="text-[11.5px] text-neutral-600 mt-2">{k.trend}</div>
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
                  Needs your attention
                </h2>
              </div>
              <div className="text-[11.5px] text-neutral-500">Sorted by urgency</div>
            </div>
            <div className="flex flex-col gap-3">
              {exceptions.map((e) => (
                <ExceptionCard key={e.id} ex={e} onAction={handleAction} />
              ))}
            </div>
          </section>

          <aside className="home-rail">
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setRailOpen((v) => !v)}
                className="icon-btn"
                title={railOpen ? "Collapse panels" : "Expand panels"}
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
                        <span className="block text-[12.5px] text-neutral-900 truncate">
                          {c.property}
                        </span>
                        <span className="block text-[11px] text-neutral-500 truncate">
                          {c.window} · {c.cleaner}
                        </span>
                      </span>
                    </div>
                  ))}
                </Panel>

                <Panel title="Today’s Check-ins / Outs" cta={() => router.push("/bookings")}>
                  <div className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400 mb-1">
                    Arriving
                  </div>
                  {TODAY_CHECKINS.map((b) => (
                    <div key={b.property} className="panel-row">
                      <ArrowDownToLine size={12} strokeWidth={1.5} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] text-neutral-900 truncate">
                          {b.property}
                        </span>
                        <span className="block text-[11px] text-neutral-500 truncate">
                          {b.who} · {b.time}
                        </span>
                      </span>
                    </div>
                  ))}
                  <div className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400 mt-3 mb-1">
                    Departing
                  </div>
                  {TODAY_CHECKOUTS.map((b) => (
                    <div key={b.property} className="panel-row">
                      <ArrowUpFromLine size={12} strokeWidth={1.5} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] text-neutral-900 truncate">
                          {b.property}
                        </span>
                        <span className="block text-[11px] text-neutral-500 truncate">
                          {b.who} · {b.time}
                        </span>
                      </span>
                    </div>
                  ))}
                </Panel>

                <Panel title="Latest Agent Activity" cta={() => router.push("/agents")}>
                  {AGENT_ACTIVITY.map((a) => (
                    <div key={a.text} className="panel-row">
                      <span className="text-[10px] tracking-eyebrow uppercase text-neutral-600 w-[52px] shrink-0">
                        {a.agent}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12.5px] text-neutral-800 truncate">
                          {a.text}
                        </span>
                        <span className="block text-[10.5px] text-neutral-600">
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

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A1A",
            color: "#FFFFFF",
            padding: "10px 14px 10px 18px",
            borderRadius: 2,
            boxShadow: "0 12px 32px -8px rgba(26,26,26,0.4)",
            fontSize: 13,
            letterSpacing: "0.01em",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 14,
            maxWidth: 480,
          }}
        >
          <CheckCircle size={14} strokeWidth={1.6} />
          <span className="truncate">
            {toast.action} · {toast.property}
          </span>
          <button
            type="button"
            onClick={undoAction}
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              opacity: 0.85,
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "4px 10px",
              borderRadius: 2,
              background: "transparent",
            }}
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
}
