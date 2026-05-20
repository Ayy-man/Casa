"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { PROPERTIES } from "@/lib/mock-data/properties";
import { BOOKINGS } from "@/lib/mock-data/bookings";
import { CLEANINGS_TODAY } from "@/lib/mock-data/cleanings";
import { AGENT_ACTIVITY } from "@/lib/mock-data/exceptions";

type Item = {
  kind: string;
  label: string;
  sub: string;
  go: string;
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const matches = (s: string) => !ql || s.toLowerCase().includes(ql);
    const props: Item[] = PROPERTIES.filter(
      (p) => matches(p.name) || matches(p.neighborhood)
    )
      .slice(0, 5)
      .map((p) => ({
        kind: "Property",
        label: p.name,
        sub: p.neighborhood,
        go: "/vault/properties/" + p.id,
      }));

    const bookings: Item[] = BOOKINGS.filter(
      (b) => matches(b.guest) || matches(b.propertyId)
    )
      .slice(0, 4)
      .map((b) => ({
        kind: "Booking",
        label: b.guest,
        sub: b.id,
        go: "/vault/bookings/" + b.id,
      }));

    const cleanings: Item[] = CLEANINGS_TODAY.filter((c) =>
      matches(c.cleaner)
    )
      .slice(0, 4)
      .map((c) => ({
        kind: "Cleaning",
        label: c.cleaner,
        sub: c.time,
        go: "/vault/cleanings",
      }));

    const actions: Item[] = AGENT_ACTIVITY.filter((a) => matches(a.text))
      .slice(0, 4)
      .map((a) => ({
        kind: "Agent action",
        label: a.text,
        sub: `${a.agent} · ${a.time}`,
        go: "/vault/agent-logs",
      }));

    const flat: Item[] = [];
    const groups: { label: string; start: number; items: Item[] }[] = [];
    const push = (label: string, items: Item[]) => {
      if (!items.length) return;
      groups.push({ label, start: flat.length, items });
      flat.push(...items);
    };
    push("Properties", props);
    push("Bookings", bookings);
    push("Cleanings", cleanings);
    push("Agent actions", actions);
    return { flat, groups };
  }, [q]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  if (!open) return null;

  const go = (item: Item) => {
    onClose();
    setTimeout(() => router.push(item.go), 30);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = results.flat[active];
      if (it) go(it);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="cmdk-shell" onKeyDown={onKey}>
        <div className="cmdk-input-row">
          <Search size={16} strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search properties, bookings, cleanings, agent actions…"
            className="cmdk-input"
          />
          <span className="cmdk-kbd">ESC</span>
        </div>
        <div className="cmdk-results">
          {results.flat.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="font-display text-[18px] tracking-tight">No matches.</div>
              <p className="text-[12px] text-neutral-500 mt-1">
                Try a property, guest name, or cleaner.
              </p>
            </div>
          ) : (
            results.groups.map((g) => (
              <div key={g.label}>
                <div className="cmdk-group-label">{g.label}</div>
                {g.items.map((it, i) => {
                  const idx = g.start + i;
                  const isActive = idx === active;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(it)}
                      className={`cmdk-item ${isActive ? "is-active" : ""}`}
                    >
                      <span className="cmdk-kind">{it.kind}</span>
                      <span className="cmdk-label">{it.label}</span>
                      <span className="cmdk-sub">{it.sub}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="cmdk-foot">
          <span>
            <kbd>↑↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </>
  );
}
