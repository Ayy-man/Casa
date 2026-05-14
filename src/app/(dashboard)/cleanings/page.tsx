"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Phone,
  Send,
  TriangleAlert,
  UserPlus,
  X,
} from "lucide-react";
import {
  CLEANINGS_TODAY,
  CLEANING_THREAD,
  cleanStatusLabel,
  type Cleaning,
} from "@/lib/mock-data/cleanings";
import { getProperty } from "@/lib/mock-data/properties";

export default function CleaningsPage() {
  const [tab, setTab] = useState<"Today" | "Tomorrow" | "This Week">("Today");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = CLEANINGS_TODAY.find((c) => c.id === openId) ?? null;
  const tabs: { name: typeof tab; count: number }[] = [
    { name: "Today", count: CLEANINGS_TODAY.length },
    { name: "Tomorrow", count: 5 },
    { name: "This Week", count: 23 },
  ];

  return (
    <div className="route-fade page-pad">
      <header className="mb-7">
        <div className="section-eyebrow">Daily</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Cleanings
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          Today, May 1 · 7 cleanings scheduled.
        </p>
      </header>

      <div className="tabs-bar mb-6">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.name}
            onClick={() => setTab(t.name)}
            className={`tab-trigger ${tab === t.name ? "active" : ""}`}
          >
            {t.name}
            <span className="tab-count">({t.count})</span>
          </button>
        ))}
      </div>

      {tab === "Today" ? (
        <div className="flex flex-col gap-3">
          {CLEANINGS_TODAY.map((c) => {
            const p = getProperty(c.propertyId);
            return (
              <article key={c.id} className="ex-card flex items-center gap-5">
                <div className="w-10 h-10 rounded-full bg-[#F2F1EF] border border-rule flex items-center justify-center text-[11px] font-medium text-neutral-700 shrink-0">
                  {c.cleanerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[19px] leading-tight tracking-tight">
                    {p?.name}
                  </h3>
                  <div className="text-[12px] text-neutral-500 mt-0.5">
                    {p?.neighborhood} · {p?.type}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400">
                    Window
                  </div>
                  <div className="text-[13px] text-neutral-800 mt-0.5">{c.time}</div>
                </div>
                <div className="text-right shrink-0 w-[110px]">
                  <div className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400">
                    Cleaner
                  </div>
                  <div className="text-[13px] text-neutral-800 mt-0.5">{c.cleaner}</div>
                </div>
                <span className={`clean-status cs-${c.status}`}>
                  {cleanStatusLabel(c.status)}
                </span>
                <button
                  type="button"
                  className="btn-sm btn-sm-outline"
                  onClick={() => setOpenId(c.id)}
                >
                  View Details
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-rule border-dashed rounded-[2px]">
          <h2 className="font-display text-[26px] tracking-tight">{tab} schedule</h2>
          <p className="text-[13px] text-neutral-500 mt-3 max-w-[420px] mx-auto">
            Demo focuses on today’s board. Tomorrow & week views ship next iteration.
          </p>
        </div>
      )}

      {open && <CleaningSheet cleaning={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function CleaningSheet({
  cleaning,
  onClose,
}: {
  cleaning: Cleaning;
  onClose: () => void;
}) {
  const p = getProperty(cleaning.propertyId);
  const thread = CLEANING_THREAD[cleaning.id] ?? [];
  const checklist = [
    { item: "Linens & towels swapped", done: cleaning.status === "Completed" || cleaning.status === "InProgress" },
    { item: "Bathroom deep clean", done: cleaning.status === "Completed" },
    { item: "Kitchen wipe + dishwasher run", done: cleaning.status === "Completed" },
    { item: "Trash + recycling out", done: cleaning.status === "Completed" },
    { item: "Floor vacuum + mop", done: cleaning.status === "Completed" },
    { item: "Welcome card + restock", done: cleaning.status === "Completed" },
    { item: "Photo handoff", done: cleaning.status === "Completed" },
  ];

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <aside className="sheet">
        <div className="sheet-header">
          <div className="flex-1">
            <div className="section-eyebrow">Cleaning · {cleaning.id.toUpperCase()}</div>
            <h2 className="font-display text-[26px] tracking-tight leading-tight mt-1">
              {p?.name}
            </h2>
            <div className="text-[12.5px] text-neutral-500 mt-1">
              {cleaning.cleaner} · {cleaning.time}
            </div>
            <div className="mt-3">
              <span className={`clean-status cs-${cleaning.status}`}>
                {cleanStatusLabel(cleaning.status)}
              </span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>

        <div className="sheet-body">
          {cleaning.status === "NoResponse" && (
            <div
              className="shadow-banner mb-5"
              style={{ background: "#FBEFEB", borderColor: "#F0CFC9", color: "#8A2B1F" }}
            >
              <span className="mt-0.5">
                <TriangleAlert size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="font-medium">No response 2hr after dispatch.</div>
                <div className="text-[12px] mt-0.5 opacity-90">
                  Same-day check-in at 4:00 PM. Backup cleaner on standby.
                </div>
              </div>
              <span className="flex-1" />
              <button
                type="button"
                className="btn-sm btn-sm-primary"
                style={{ background: "#8A2B1F" }}
                onClick={() => console.log("dispatch backup", cleaning.id)}
              >
                Dispatch Backup
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-[18px] tracking-tight">WhatsApp thread</h3>
            <span className="text-[10.5px] tracking-eyebrow uppercase text-neutral-400">
              {thread.length} messages
            </span>
          </div>
          <div
            className="border border-rule rounded-[2px] p-4"
            style={{ background: "#FCFBF9" }}
          >
            {thread.length === 0 ? (
              <div className="text-[12.5px] text-neutral-500 text-center py-6">
                No messages yet.
              </div>
            ) : (
              thread.map((m, i) => (
                <div key={i} className={`chat-row ${m.who}`}>
                  <div>
                    <div className={`bubble ${m.who}`}>
                      {m.photo && (
                        <div
                          className="mb-2 photo-tile"
                          style={{
                            width: 160,
                            height: 110,
                            backgroundImage: `url(https://picsum.photos/seed/${cleaning.id}-${i}/300/200)`,
                          }}
                        />
                      )}
                      {m.text}
                    </div>
                    <div
                      className="bubble-meta"
                      style={{ textAlign: m.who === "them" ? "left" : "right" }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {[
              "Are you en route?",
              "ETA update?",
              "Send photos when done",
              "Backup cleaner sent",
            ].map((t) => (
              <button
                type="button"
                key={t}
                className="btn-sm btn-sm-outline"
                style={{ height: 28, fontSize: 11.5 }}
                onClick={() => console.log("quick reply:", t)}
              >
                <MessageSquare size={11} strokeWidth={1.5} />
                <span className="ml-1.5">{t}</span>
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-2 mb-7 border border-rule rounded-[2px] p-2"
            style={{ background: "#FFFFFF" }}
          >
            <button type="button" className="icon-btn" title="Attach photo">
              <Paperclip size={14} strokeWidth={1.5} />
            </button>
            <input
              className="flex-1 text-[13px] bg-transparent outline-none px-1"
              placeholder="Type a WhatsApp message…"
            />
            <button
              type="button"
              className="btn-sm btn-sm-primary"
              onClick={() => console.log("send")}
            >
              <Send size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Send</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-7 pb-7 border-b border-rule">
            <button type="button" className="btn-sm btn-sm-outline">
              <Phone size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Call cleaner</span>
            </button>
            <button type="button" className="btn-sm btn-sm-outline">
              <UserPlus size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Dispatch backup</span>
            </button>
            <button type="button" className="btn-sm btn-sm-outline">
              <Calendar size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Reschedule</span>
            </button>
            <button type="button" className="btn-sm btn-sm-outline">
              <FileText size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Open SOP</span>
            </button>
            <button type="button" className="btn-sm btn-sm-outline">
              <CheckCircle size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Mark complete</span>
            </button>
            <button
              type="button"
              className="btn-sm btn-sm-outline"
              style={{ color: "#8A2B1F", borderColor: "#F0CFC9" }}
            >
              <TriangleAlert size={12} strokeWidth={1.5} />
              <span className="ml-1.5">Escalate</span>
            </button>
          </div>

          <h3 className="font-display text-[18px] tracking-tight mb-3">Checklist</h3>
          <div className="border border-rule rounded-[2px] mb-7">
            {checklist.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#F1F1F0] last:border-b-0"
              >
                <span
                  className={`w-5 h-5 rounded-[2px] border flex items-center justify-center ${
                    c.done
                      ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                      : "border-rule"
                  }`}
                >
                  {c.done && <CheckCircle size={11} strokeWidth={2.5} />}
                </span>
                <span
                  className={`text-[13px] ${
                    c.done ? "text-neutral-800" : "text-neutral-500"
                  }`}
                >
                  {c.item}
                </span>
              </div>
            ))}
          </div>

          {cleaning.score && (
            <>
              <h3 className="font-display text-[18px] tracking-tight mb-3">
                Quality score
              </h3>
              <div className="flex items-center gap-2 mb-7">
                {Array.from({ length: 5 }).map((_, k) => (
                  <span
                    key={k}
                    className={`star text-[22px] ${
                      cleaning.score && k < cleaning.score ? "" : "dim"
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-[12.5px] text-neutral-500 ml-2">
                  Photos verified by Ops Agent
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
