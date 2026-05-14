"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  House,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { EXCEPTIONS } from "@/lib/mock-data/exceptions";

type NavItem = {
  to: string;
  name: string;
  icon?: LucideIcon;
  indent?: boolean;
  end?: boolean;
  /** Function returning a numeric badge count, or undefined to hide. */
  badge?: () => number | undefined;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Daily",
    items: [
      {
        to: "/",
        name: "Today",
        icon: House,
        end: true,
        badge: () => (EXCEPTIONS.length > 0 ? EXCEPTIONS.length : undefined),
      },
      { to: "/pricing", name: "Pricing", icon: Tag },
      { to: "/cleanings", name: "Cleanings", icon: Sparkles },
      { to: "/claims", name: "Claims", icon: FileText },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { to: "/properties", name: "Properties", icon: Building2 },
      { to: "/bookings", name: "Bookings", icon: CalendarDays },
    ],
  },
  {
    label: "Agents",
    items: [
      { to: "/agents", name: "Overview", icon: LayoutGrid },
      { to: "/agents/pricing", name: "Pricing Agent", indent: true },
      { to: "/agents/guest", name: "Guest Agent", indent: true },
      { to: "/agents/ops", name: "Ops Agent", indent: true },
      { to: "/agents/sop", name: "SOP Agent", indent: true },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/reports", name: "Validation Reports", icon: ShieldCheck },
      { to: "/settings", name: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <aside
      className="w-[240px] shrink-0 border-r border-rule bg-white flex flex-col"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <div className="px-[22px] pt-7 pb-5">
        <div className="text-[11px] tracking-eyebrow uppercase text-neutral-600">Workspace</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="font-display text-[18px] tracking-tight">Casa Properties</div>
        </div>
        <div className="text-[11.5px] text-neutral-600 mt-0.5">Vancouver, BC · 26 homes</div>
      </div>

      <div className="hr-soft mx-[22px]" />

      <nav className="flex-1 overflow-y-auto py-5">
        {NAV_GROUPS.map((g, gi) => (
          <div key={g.label} className={gi === 0 ? "" : "mt-6"}>
            <div className="group-label mb-2">{g.label}</div>
            <ul>
              {g.items.map((it) => {
                const active = isActive(pathname, it.to, it.end);
                const Icon = it.icon;
                const badgeValue = it.badge?.();
                return (
                  <li key={it.to}>
                    <Link
                      href={it.to}
                      className={`nav-item ${it.indent ? "indent" : ""} ${active ? "active" : ""}`}
                      aria-label={
                        badgeValue !== undefined
                          ? `${it.name}, ${badgeValue} open`
                          : undefined
                      }
                    >
                      {it.indent ? (
                        <span className="nav-dot" />
                      ) : Icon ? (
                        <Icon size={14} strokeWidth={1.5} />
                      ) : null}
                      <span className="flex-1">{it.name}</span>
                      {badgeValue !== undefined && (
                        <span className="nav-count tabular-nums" aria-hidden="true">
                          {badgeValue}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div ref={wrapRef} className="relative border-t border-rule px-3 py-3">
        {menuOpen && (
          <div className="menu-pop">
            <button
              type="button"
              className="menu-item"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <LogOut size={14} strokeWidth={1.5} />
              <span>Sign out</span>
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-[#FAFAFA] rounded-[2px] text-left"
        >
          <span className="avatar avatar-sm">{user?.initials ?? "··"}</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] text-neutral-900 truncate">{user?.name}</span>
            <span className="block text-[11.5px] text-neutral-600 truncate">{user?.role}</span>
          </span>
          <ChevronDown size={14} strokeWidth={1.5} className="text-neutral-600" />
        </button>
      </div>
    </aside>
  );
}
