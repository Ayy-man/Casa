"use client";

import { useState } from "react";
import { Check, CheckCircle, Copy, Download, X } from "lucide-react";
import { CLAIMS, photoSeed, type PendingClaim } from "@/lib/mock-data/claims";
import { getProperty } from "@/lib/mock-data/properties";

export default function ClaimsPage() {
  const [tab, setTab] = useState<"Pending" | "Submitted" | "Resolved">("Pending");
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filedIds, setFiledIds] = useState<Record<string, boolean>>({});
  const editing = CLAIMS.pending.find((c) => c.id === editId) ?? null;
  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: "Pending", label: "Pending Review", count: CLAIMS.pending.length },
    { key: "Submitted", label: "Submitted", count: CLAIMS.submitted.length },
    { key: "Resolved", label: "Resolved", count: CLAIMS.resolved.length },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const copyClaim = async (c: PendingClaim) => {
    try {
      await navigator.clipboard.writeText(c.draft);
    } catch {
      // ignore
    }
    showToast("Claim text copied to clipboard");
  };
  const downloadEvidence = (c: PendingClaim) =>
    showToast("Evidence zip downloaded · " + c.id + ".zip");
  const markFiled = (c: PendingClaim) => {
    setFiledIds((f) => ({ ...f, [c.id]: true }));
    showToast("Marked filed in Airbnb · " + c.id);
  };

  return (
    <div className="route-fade page-pad">
      <header className="mb-7">
        <div className="section-eyebrow">Daily</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Claims
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          {CLAIMS.pending.length} drafts pending review, {CLAIMS.submitted.length}{" "}
          historical.
        </p>
      </header>

      <div className="tabs-bar mb-7">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-trigger ${tab === t.key ? "active" : ""}`}
          >
            {t.label}
            <span className="tab-count">({t.count})</span>
          </button>
        ))}
      </div>

      {tab === "Pending" && (
        <div className="grid gap-5">
          {CLAIMS.pending.map((c) => {
            const p = getProperty(c.propertyId);
            return (
              <article key={c.id} className="ex-card">
                <div className="flex items-start gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="agent-pill">{c.raisedBy}</span>
                      <span className="text-[11.5px] text-neutral-400">{c.timeAgo}</span>
                      <span className="mono text-[11px] text-neutral-400">{c.id}</span>
                    </div>
                    <h3 className="font-display text-[24px] tracking-tight leading-tight">
                      {p?.name}
                    </h3>
                    <div className="text-[12.5px] text-neutral-500 mt-1">
                      {c.guestName} · {c.bookingDates} · {c.bookingId}
                    </div>
                    <p className="reasoning mt-3" style={{ maxWidth: "60ch" }}>
                      {c.damage}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="section-eyebrow">Estimated cost</div>
                    <div className="font-display text-[34px] tracking-tight mt-1">
                      ${c.cost}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div>
                    <div className="section-eyebrow mb-2">Before stay</div>
                    <div className="photo-strip">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="photo-tile"
                          style={{ backgroundImage: `url(${photoSeed(c.id, "before", i)})` }}
                        >
                          <span className="photo-tile-label">Before</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="section-eyebrow mb-2">After stay</div>
                    <div className="photo-strip">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="photo-tile"
                          style={{ backgroundImage: `url(${photoSeed(c.id, "after", i)})` }}
                        >
                          <span
                            className="photo-tile-label"
                            style={{ background: "rgba(251,239,235,0.95)", color: "#8A2B1F" }}
                          >
                            After
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-rule">
                  <div className="text-[11.5px] text-neutral-500 mb-3">
                    <strong className="text-neutral-700 font-medium">Phase 1:</strong> paste
                    the copied text into Airbnb Resolution Center, attach the evidence zip,
                    then mark filed. Autonomous submission enabled in Phase 2.
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => copyClaim(c)}
                    >
                      <Copy size={12} strokeWidth={1.5} />
                      <span className="ml-1.5">Copy Claim Text</span>
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => downloadEvidence(c)}
                    >
                      <Download size={12} strokeWidth={1.5} />
                      <span className="ml-1.5">Download Evidence Zip</span>
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-primary"
                      onClick={() => markFiled(c)}
                      disabled={filedIds[c.id]}
                    >
                      {filedIds[c.id] ? (
                        <CheckCircle size={12} strokeWidth={1.5} />
                      ) : (
                        <Check size={12} strokeWidth={1.5} />
                      )}
                      <span className="ml-1.5">
                        {filedIds[c.id] ? "Filed in Airbnb" : "Mark Filed in Airbnb"}
                      </span>
                    </button>
                    <span className="flex-1" />
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => setEditId(c.id)}
                    >
                      Edit Draft
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      style={{ color: "#8A2B1F", borderColor: "#F0CFC9" }}
                      onClick={() => console.log("reject claim", c.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "Submitted" && (
        <div className="border border-rule rounded-[2px] overflow-hidden">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Property</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS.submitted.map((c) => {
                const p = getProperty(c.propertyId);
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="mono">{c.id}</span>
                    </td>
                    <td>
                      <span className="font-display text-[14.5px] tracking-tight">
                        {p?.name}
                      </span>
                    </td>
                    <td>{c.guestName}</td>
                    <td className="text-neutral-700">{c.bookingDates}</td>
                    <td className="tabular-nums">${c.cost}</td>
                    <td>
                      <span className="urgency-pill pill-Medium">{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Resolved" && (
        <div className="border border-rule rounded-[2px] overflow-hidden">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Property</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS.resolved.map((c) => {
                const p = getProperty(c.propertyId);
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="mono">{c.id}</span>
                    </td>
                    <td>
                      <span className="font-display text-[14.5px] tracking-tight">
                        {p?.name}
                      </span>
                    </td>
                    <td>{c.guestName}</td>
                    <td className="text-neutral-700">{c.bookingDates}</td>
                    <td className="tabular-nums">${c.cost}</td>
                    <td>
                      <span
                        className="urgency-pill pill-Low"
                        style={{
                          color: "#2E6F2A",
                          background: "#F1F6F0",
                          borderColor: "#DDE7DA",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ClaimEditSheet claim={editing} onClose={() => setEditId(null)} />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A1A",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: 2,
            boxShadow: "0 12px 32px -8px rgba(26,26,26,0.4)",
            fontSize: 13,
            letterSpacing: "0.01em",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle size={14} strokeWidth={1.6} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

function ClaimEditSheet({
  claim,
  onClose,
}: {
  claim: PendingClaim;
  onClose: () => void;
}) {
  const p = getProperty(claim.propertyId);
  const [text, setText] = useState(claim.draft);
  const [cost, setCost] = useState(String(claim.cost));

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <aside className="sheet" style={{ width: 720 }}>
        <div className="sheet-header">
          <div className="flex-1">
            <div className="section-eyebrow">{claim.id} · Draft</div>
            <h2 className="font-display text-[26px] tracking-tight leading-tight mt-1">
              {p?.name}
            </h2>
            <div className="text-[12.5px] text-neutral-500 mt-1">
              {claim.guestName} · {claim.bookingDates}
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>

        <div className="sheet-body">
          <h3 className="font-display text-[18px] tracking-tight mb-3">
            Photo evidence
          </h3>
          <div className="grid grid-cols-6 gap-2 mb-7">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="photo-tile"
                style={{
                  backgroundImage: `url(${photoSeed(
                    claim.id,
                    i > 3 ? "after" : "before",
                    ((i - 1) % 3) + 1
                  )})`,
                  aspectRatio: "1",
                }}
              >
                <span
                  className="photo-tile-label"
                  style={
                    i > 3
                      ? { background: "rgba(251,239,235,0.95)", color: "#8A2B1F" }
                      : undefined
                  }
                >
                  {i > 3 ? "After" : "Before"}
                </span>
              </div>
            ))}
          </div>

          <h3 className="font-display text-[18px] tracking-tight mb-3">
            Draft claim text
          </h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="field"
            style={{
              height: "auto",
              padding: "14px",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#1A1A1A",
            }}
          />

          <div className="grid grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mb-2">
                Estimated cost (CAD)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mb-2">
                Submit to
              </label>
              <select className="field" defaultValue="Airbnb Resolution Center">
                <option>Airbnb Resolution Center</option>
                <option>Vrbo Damage Protection</option>
                <option>Booking.com Partner Hub</option>
                <option>Direct · invoice owner</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-7">
            <button type="button" className="btn-sm btn-sm-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-sm btn-sm-outline"
              onClick={() => console.log("save draft")}
            >
              Save draft
            </button>
            <button
              type="button"
              className="btn-sm btn-sm-primary"
              onClick={onClose}
            >
              Save & Approve
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
