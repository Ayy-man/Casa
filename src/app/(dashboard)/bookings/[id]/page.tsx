"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import {
  channelClass,
  channelLabel,
  formatDate,
  getBooking,
  statusClass,
  statusLabel,
} from "@/lib/mock-data/bookings";
import { getProperty } from "@/lib/mock-data/properties";

export default function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const booking = getBooking(params.id);

  if (!booking) {
    return (
      <div className="page-pad">
        <h1 className="font-display text-[28px]">Booking not found.</h1>
        <button
          type="button"
          className="btn-sm btn-sm-outline mt-4"
          onClick={() => router.push("/bookings")}
        >
          Back to bookings
        </button>
      </div>
    );
  }

  const p = getProperty(booking.propertyId);
  const total = booking.rate * 3 + booking.fees + booking.taxes;
  const firstNameOfGuest = booking.guest.split(",")[0].split(" ")[0];
  const thread = [
    {
      who: "them",
      text: "Hi! Just booked your place — looking forward to it.",
      time: "Apr 28, 14:02",
    },
    {
      who: "us",
      text: "Welcome! Check-in instructions go out 24h before arrival. Let me know if you need anything in the meantime.",
      time: "Apr 28, 14:14",
    },
    { who: "them", text: booking.lastMsg, time: "Today, 09:21" },
    {
      who: "draft",
      text: `Hi ${firstNameOfGuest} — great question. There’s one assigned spot in P2; happy to ask the building if a second is available for the dates. Will confirm by 5pm.`,
      time: "Today, 09:24",
      agent: "Guest Agent",
    },
  ];

  return (
    <div className="route-fade page-pad">
      <Link
        href="/bookings"
        className="text-[11.5px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 mb-5 w-fit"
      >
        <ChevronLeft size={12} strokeWidth={1.5} />
        <span>All bookings</span>
      </Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="flex-1">
          <div className="section-eyebrow">{booking.id}</div>
          <h1 className="font-display text-[36px] tracking-tight leading-tight mt-1">
            {booking.guest}
          </h1>
          <div className="text-[13px] text-neutral-500 mt-1">
            {p?.name} · {formatDate(booking.checkIn)} —{" "}
            {formatDate(booking.checkOut)}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={`ch-pill ${channelClass(booking.channel)}`}>
              {channelLabel(booking.channel)}
            </span>
            <span className={`status-pill ${statusClass(booking.status)}`}>
              {statusLabel(booking.status)}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="close-btn"
          onClick={() => router.push("/bookings")}
          title="Close"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </div>

      <div className="grid gap-10" style={{ gridTemplateColumns: "1fr 380px" }}>
        <section>
          <h3 className="font-display text-[18px] tracking-tight mb-3">
            Conversation
          </h3>
          <div
            className="border border-rule rounded-[2px] p-4 mb-7"
            style={{ background: "#FCFBF9" }}
          >
            {thread.map((m, i) => (
              <div key={i} className={`chat-row ${m.who}`}>
                <div>
                  <div className={`bubble ${m.who}`}>{m.text}</div>
                  <div
                    className="bubble-meta"
                    style={{ textAlign: m.who === "them" ? "left" : "right" }}
                  >
                    {m.time}
                    {m.who === "draft" && (
                      <span className="draft-pill">Draft — {m.agent}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-display text-[18px] tracking-tight mb-3 mt-8">
            Agent decisions
          </h3>
          <div className="border border-rule rounded-[2px]">
            {[
              {
                time: "Today, 09:24",
                agent: "Guest",
                text: "Drafted reply re: parking. Awaiting Carlos’s approval.",
                status: "shadow" as const,
              },
              {
                time: "Today, 08:50",
                agent: "Ops",
                text: "Confirmed cleaning slot 11:00 — 14:00 with Maria L.",
                status: "sent" as const,
              },
              {
                time: "Apr 28, 14:14",
                agent: "Guest",
                text: "Sent welcome message + 24h reminder schedule.",
                status: "sent" as const,
              },
              {
                time: "Apr 28, 14:02",
                agent: "Pricing",
                text: "Booking accepted at recommended rate. No override.",
                status: "sent" as const,
              },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#F1F1F0] last:border-b-0"
              >
                <span className="text-[11px] text-neutral-400 w-[110px] shrink-0">
                  {a.time}
                </span>
                <span className="agent-pill">{a.agent}</span>
                <span className="flex-1 text-[12.5px] text-neutral-800">{a.text}</span>
                <span
                  className={`urgency-pill ${
                    a.status === "shadow" ? "pill-Medium" : "pill-Low"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <h3 className="font-display text-[18px] tracking-tight mb-3">
            Booking details
          </h3>
          <div className="border border-rule rounded-[2px] px-5 py-2">
            <div className="def-row">
              <span className="def-key">Nightly rate</span>
              <span className="tabular-nums">${booking.rate}</span>
            </div>
            <div className="def-row">
              <span className="def-key">Nights</span>
              <span className="tabular-nums">3</span>
            </div>
            <div className="def-row">
              <span className="def-key">Fees</span>
              <span className="tabular-nums">${booking.fees}</span>
            </div>
            <div className="def-row">
              <span className="def-key">Taxes</span>
              <span className="tabular-nums">${booking.taxes}</span>
            </div>
            <div className="def-row">
              <span className="def-key">Total</span>
              <span className="font-display text-[18px] tabular-nums">${total}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
