"use client";

import { useRouter } from "next/navigation";
import {
  BOOKINGS,
  channelClass,
  channelLabel,
  formatDate,
  statusClass,
  statusLabel,
} from "@/lib/mock-data/bookings";
import { getProperty } from "@/lib/mock-data/properties";

export default function BookingsPage() {
  const router = useRouter();
  return (
    <div className="route-fade page-pad">
      <header className="mb-8">
        <div className="section-eyebrow">Portfolio</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Bookings
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          Last 30 days · 47 bookings.
        </p>
      </header>

      <div className="border border-rule rounded-[2px] overflow-hidden">
        <table className="pricing-table">
          <thead>
            <tr>
              <th style={{ width: 130 }}>Booking</th>
              <th>Property</th>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Last message</th>
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map((b) => {
              const p = getProperty(b.propertyId);
              return (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/bookings/${b.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <span className="mono text-neutral-700">{b.id}</span>
                  </td>
                  <td>
                    <div
                      className="font-display text-[14.5px] tracking-tight truncate"
                      style={{ maxWidth: 240 }}
                    >
                      {p?.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">{p?.neighborhood}</div>
                  </td>
                  <td className="text-neutral-800">{b.guest}</td>
                  <td className="text-neutral-700 tabular-nums">
                    {formatDate(b.checkIn)}
                  </td>
                  <td className="text-neutral-700 tabular-nums">
                    {formatDate(b.checkOut)}
                  </td>
                  <td>
                    <span className={`ch-pill ${channelClass(b.channel)}`}>
                      {channelLabel(b.channel)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-[12.5px] italic text-neutral-500 truncate block"
                      style={{ maxWidth: 280 }}
                    >
                      &ldquo;{b.lastMsg}&rdquo;
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
