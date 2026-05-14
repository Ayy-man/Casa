"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CircleHelp, Search } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { EXCEPTIONS } from "@/lib/mock-data/exceptions";

const ROUTES_WITH_OWN_EXCEPTION_COUNTER = new Set<string>(["/"]);

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const showBadge =
    EXCEPTIONS.length > 0 && !ROUTES_WITH_OWN_EXCEPTION_COUNTER.has(pathname);
  const [bellOpen, setBellOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [bellOpen]);

  return (
    <header className="h-[60px] border-b border-rule bg-white flex items-center px-6 gap-6">
      <div className="flex items-center gap-3" style={{ minWidth: 240 }}>
        <Image
          src="/humanos-logo.png"
          alt="HumanOS"
          width={120}
          height={30}
          style={{ height: 30, width: "auto", display: "block" }}
          priority
        />
        <div className="h-5 w-px bg-rule" />
        <div className="font-display text-[15px] tracking-tight text-ink">Casa Properties</div>
      </div>

      <div className="flex-1 max-w-[640px] mx-auto relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          aria-hidden="true"
        >
          <Search size={14} strokeWidth={1.5} />
        </span>
        <label htmlFor="topbar-search" className="sr-only">
          Search properties, bookings, and agent actions
        </label>
        <input
          id="topbar-search"
          type="text"
          readOnly
          onFocus={(e) => {
            e.currentTarget.blur();
            onOpenPalette();
          }}
          onClick={onOpenPalette}
          className="topbar-search cursor-text"
          placeholder="Search properties, bookings, agent actions…"
          aria-label="Open search palette"
          aria-haspopup="dialog"
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-eyebrow uppercase text-neutral-600 bg-white border border-rule px-1.5 py-[2px] rounded-[2px] pointer-events-none"
          aria-hidden="true"
        >
          ⌘ K
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label="Help (coming soon)"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          title="Help — coming soon"
        >
          <CircleHelp size={16} strokeWidth={1.5} />
        </button>

        <div ref={wrap} className="relative">
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className="topbar-icon-btn relative"
            aria-label={
              showBadge
                ? `Notifications, ${EXCEPTIONS.length} open exceptions`
                : "Notifications"
            }
            aria-expanded={bellOpen}
            aria-haspopup="menu"
          >
            <Bell size={16} strokeWidth={1.5} />
            {showBadge && (
              <span className="notif-badge" aria-hidden="true">
                {EXCEPTIONS.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="border border-rule rounded-[2px] shadow-soft absolute right-0 top-10 w-[360px] bg-white z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                <span className="font-display text-[15px] tracking-tight">Exceptions</span>
                <span className="text-[11px] text-neutral-600 tracking-eyebrow uppercase">
                  {EXCEPTIONS.length} open
                </span>
              </div>
              <ul className="max-h-[380px] overflow-y-auto">
                {EXCEPTIONS.map((e, i) => (
                  <li key={e.id} className={i > 0 ? "border-t border-[#F1F1F0]" : ""}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setBellOpen(false);
                        router.push("/");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA]"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`urgency-pill pill-${e.urgency} mt-0.5`}>
                          {e.urgency}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-[14px] tracking-tight truncate">
                            {e.property}
                          </div>
                          <div className="text-[12px] text-neutral-600 truncate">
                            {e.summary}
                          </div>
                        </div>
                        <span className="text-[11px] text-neutral-600 tabular-nums">
                          {e.timeAgo}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-rule text-center">
                <button
                  type="button"
                  className="text-[12px] text-[#1E5FBF] hover:underline px-2 py-1"
                  onClick={() => {
                    setBellOpen(false);
                    router.push("/");
                  }}
                >
                  View all on Home →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-rule mx-2" />
        <span className="avatar" title={user?.name}>
          {user?.initials}
        </span>
      </div>
    </header>
  );
}
