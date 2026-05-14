"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Pencil } from "lucide-react";
import {
  getProperty,
  propertyImg,
  type Property,
} from "@/lib/mock-data/properties";
import { REVIEWS_BY_PROP, ACTIVITY_BY_PROP } from "@/lib/mock-data/reviews";
import { channelClass, channelLabel } from "@/lib/mock-data/bookings";

const TABS = [
  "Profile",
  "House Rules",
  "Cleaning",
  "Reviews",
  "Pricing History",
  "Activity",
] as const;
type Tab = (typeof TABS)[number];

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const p = getProperty(id);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Profile");
  const [flagOpen, setFlagOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!p) {
    return (
      <div className="page-pad">
        <h1 className="font-display text-[28px]">Property not found.</h1>
        <button
          type="button"
          className="btn-sm btn-sm-outline mt-4"
          onClick={() => router.push("/properties")}
        >
          Back to properties
        </button>
      </div>
    );
  }

  const reviews = REVIEWS_BY_PROP[p.id] ?? REVIEWS_BY_PROP.default;
  const activity = ACTIVITY_BY_PROP[p.id] ?? ACTIVITY_BY_PROP.default;
  const fieldDefaults = {
    lockCode: `${5500 + parseInt(p.id.slice(1))} #`,
    keypadNotes: "Press # after code. Auto-locks after 30s.",
    wifiSSID: `Casa-${p.id.toUpperCase()}`,
    wifiPass: `salish-rain-${p.id.slice(-2)}`,
    parking: `P2 · stall ${parseInt(p.id.slice(1)) + 12}. Buzz from gate intercom.`,
    intercom: `${4000 + parseInt(p.id.slice(1)) * 13} · 9 to enter`,
  };

  return (
    <div className="route-fade">
      <div className="border-b border-rule" style={{ background: "#FAFAFA" }}>
        <div className="page-pad" style={{ paddingTop: 24, paddingBottom: 32 }}>
          <Link
            href="/properties"
            className="text-[11.5px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 mb-5 w-fit"
          >
            <ChevronLeft size={12} strokeWidth={1.5} />
            <span>All properties</span>
          </Link>
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: "420px 1fr" }}
          >
            <div
              className="prop-hero"
              style={{
                backgroundImage: `url(${propertyImg(p)})`,
                aspectRatio: "4/3",
                borderRadius: 2,
              }}
            >
              <span
                className="status-chip-overlay"
                style={{ left: "auto", right: 12 }}
              >
                {p.status}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="section-eyebrow">{p.neighborhood}, Vancouver</div>
              <h1 className="font-display text-[44px] leading-[1.05] tracking-tight mt-1">
                {p.name}
              </h1>
              <div className="text-[14px] text-neutral-500 mt-1">
                {p.type} · {p.beds} {p.beds === 1 ? "bed" : "beds"} · {p.baths}{" "}
                bath · sleeps {p.maxGuests}
              </div>
              <div className="mt-6 accent-rule" />
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <div className="section-eyebrow">Owner</div>
                  <div className="font-display text-[18px] mt-1 tracking-tight">
                    {p.owner}
                  </div>
                  <div className="text-[12px] text-neutral-500 mt-1">
                    {p.commPref} preferred
                  </div>
                </div>
                <div>
                  <div className="section-eyebrow">Current Rate</div>
                  <div className="font-display text-[34px] tracking-tight mt-1">
                    ${p.rate}
                    <span className="text-[14px] text-neutral-400 font-sans ml-1">
                      /night
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-6">
                {editing ? (
                  <>
                    <button
                      type="button"
                      className="btn-sm btn-sm-primary"
                      onClick={() => setEditing(false)}
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-sm btn-sm-primary"
                      onClick={() => console.log("open calendar", p.id)}
                    >
                      Open Calendar
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => console.log("message owner", p.id)}
                    >
                      Message Owner
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm-outline"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil size={12} strokeWidth={1.5} />
                      <span className="ml-1.5">Edit property</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-pad">
        <div className="tabs-bar mb-8">
          {TABS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className={`tab-trigger ${tab === t ? "active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Profile" && (
          <ProfileBody p={p} defaults={fieldDefaults} />
        )}

        {tab === "Reviews" && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {reviews.map((r, i) => (
              <article key={i} className="ex-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span
                        key={k}
                        className={`star ${k < r.rating ? "" : "dim"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={`ch-pill ${channelClass(r.channel)}`}>
                    {channelLabel(r.channel)}
                  </span>
                </div>
                <div className="font-display text-[16px] tracking-tight">
                  {r.guest}
                </div>
                <div className="text-[11.5px] text-neutral-400">{r.date}</div>
                <p className="reasoning mt-3">{r.text}</p>
              </article>
            ))}
          </div>
        )}

        {tab === "Activity" && (
          <div className="border border-rule rounded-[2px]">
            {activity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F1F0] last:border-b-0"
              >
                <span className="text-[11.5px] text-neutral-400 w-[120px] shrink-0">
                  {a.time}
                </span>
                <span className="agent-pill">{a.agent}</span>
                <span className="flex-1 text-[13px] text-neutral-800">{a.text}</span>
                <span
                  className={`urgency-pill ${
                    a.status === "exception"
                      ? "pill-Critical"
                      : a.status === "shadow"
                      ? "pill-Medium"
                      : "pill-Low"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {(tab === "House Rules" || tab === "Cleaning" || tab === "Pricing History") && (
          <div className="text-center py-20">
            <h2 className="font-display text-[28px] tracking-tight">{tab}</h2>
            <p className="text-[13px] text-neutral-500 mt-3 max-w-[420px] mx-auto">
              Detailed view coming in a later iteration. Today this surface holds quick
              context for the demo.
            </p>
          </div>
        )}

        <div className="mt-12 flex justify-end">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2"
            onClick={() => setFlagOpen(true)}
          >
            <Flag size={14} strokeWidth={1.5} />
            <span>Flag for Correction</span>
          </button>
        </div>
      </div>

      {flagOpen && <FlagDialog property={p} onClose={() => setFlagOpen(false)} />}
    </div>
  );
}

function ProfileBody({
  p,
  defaults,
}: {
  p: Property;
  defaults: Record<string, string>;
}) {
  return (
    <div className="grid gap-10" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <section>
        <h2 className="font-display text-[22px] tracking-tight mb-4">Specs</h2>
        <div className="def-row">
          <span className="def-key">Bedrooms</span>
          <span>{p.beds}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Bathrooms</span>
          <span>{p.baths}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Square feet</span>
          <span>{p.sqft}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Max guests</span>
          <span>{p.maxGuests}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Type</span>
          <span>{p.type}</span>
        </div>

        <h2 className="font-display text-[22px] tracking-tight mb-4 mt-10">
          Owner contact
        </h2>
        <div className="def-row">
          <span className="def-key">Name</span>
          <span>{p.owner}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Phone</span>
          <span>{p.ownerPhone}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Email</span>
          <span>{p.ownerEmail}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Comm. preference</span>
          <span>{p.commPref}</span>
        </div>
      </section>
      <section>
        <h2 className="font-display text-[22px] tracking-tight mb-4">
          Access & utilities
        </h2>
        <div className="def-row">
          <span className="def-key">Smart lock</span>
          <span>Schlage Encode · keypad</span>
        </div>
        <div className="def-row">
          <span className="def-key">Lock code</span>
          <span className="mono">{defaults.lockCode}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Keypad notes</span>
          <span>{defaults.keypadNotes}</span>
        </div>
        <div className="def-row">
          <span className="def-key">WiFi SSID</span>
          <span className="mono">{defaults.wifiSSID}</span>
        </div>
        <div className="def-row">
          <span className="def-key">WiFi password</span>
          <span className="mono">{defaults.wifiPass}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Parking</span>
          <span>{defaults.parking}</span>
        </div>
        <div className="def-row">
          <span className="def-key">Building intercom</span>
          <span className="mono">{defaults.intercom}</span>
        </div>

        <h2 className="font-display text-[22px] tracking-tight mb-4 mt-10">
          Channel listings
        </h2>
        <div className="def-row">
          <span className="def-key">Airbnb</span>
          <span className="mono">aibnb_{p.id}_22411</span>
        </div>
        <div className="def-row">
          <span className="def-key">Vrbo</span>
          <span className="mono">vrbo_{p.id}_88102</span>
        </div>
        <div className="def-row">
          <span className="def-key">Booking.com</span>
          <span className="mono">bdc_{p.id}_44719</span>
        </div>

        <h2 className="font-display text-[22px] tracking-tight mb-4 mt-10">
          Nightly rate
        </h2>
        <div className="def-row">
          <span className="def-key">Base rate</span>
          <span>${p.rate}</span>
        </div>
      </section>
    </div>
  );
}

function FlagDialog({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [field, setField] = useState("Lock code");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="bg-white border border-rule rounded-[2px] w-[480px] max-w-[92vw] p-7"
          style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.25)" }}
        >
          {sent ? (
            <div className="text-center py-4">
              <div className="font-display text-[24px] tracking-tight">
                Thanks, noted.
              </div>
              <p className="text-[13px] text-neutral-500 mt-2">
                SOP Agent will pick this up in the next pass.
              </p>
              <button
                type="button"
                className="btn-sm btn-sm-primary mt-5"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="section-eyebrow mb-1">Knowledge base</div>
              <h2 className="font-display text-[24px] tracking-tight">
                Flag for correction
              </h2>
              <p className="text-[12.5px] text-neutral-500 mt-2">
                {property.name}. The SOP Agent will review and update.
              </p>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mt-5 mb-2">
                Field
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="field"
              >
                <option>Lock code</option>
                <option>WiFi password</option>
                <option>Parking instructions</option>
                <option>Building intercom</option>
                <option>Owner contact</option>
                <option>Other</option>
              </select>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mt-4 mb-2">
                What’s wrong
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="field"
                style={{ height: "auto", padding: "10px 14px", fontFamily: "inherit" }}
                placeholder="The intercom code is now 9 instead of #..."
              />
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  className="btn-sm btn-sm-outline"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-sm btn-sm-primary"
                  disabled={!note}
                  onClick={() => setSent(true)}
                >
                  Send to SOP Agent
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
