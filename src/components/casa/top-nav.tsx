"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu, Settings, LogOut, X } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useAuth, useRole } from "@/lib/auth/context";
import { EXCEPTIONS } from "@/lib/mock-data/exceptions";

type Tab = { to: string; name: string; end: boolean };

const TABS: Tab[] = [
  { to: "/", name: "Exception Board", end: true },
  { to: "/vault", name: "Vault", end: false },
  { to: "/assistant", name: "Assistant", end: true },
];

// Ported from sidebar.tsx isActive(): "/" is an exact end-match, "/vault"
// is a prefix-match so /vault/* highlights the Vault tab.
function isActive(pathname: string, to: string, end: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function TopNav() {
  const { user, signOut } = useAuth();
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const [bellOpen, setBellOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bellWrap = useRef<HTMLDivElement | null>(null);

  const exceptionCount = EXCEPTIONS.length;
  const roleLabel = role === "owner" ? "OWNER" : "OPERATIONS";

  // Outside-click closes the notification dropdown (topbar.tsx pattern).
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (bellWrap.current && !bellWrap.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [bellOpen]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Esc closes the open drawer (keyboard reachability).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <header className="h-[70px] shrink-0 border-b border-rule bg-white flex items-center px-6 sm:px-8 gap-6 sticky top-0 z-40">
      {/* Left — logo + wordmark (PNG per L5, never SVG) */}
      <div className="flex items-center gap-3">
        <Image
          src="/humanos-logo.png"
          alt="HumanOS"
          width={120}
          height={30}
          style={{ height: 30, width: "auto", display: "block" }}
          priority
        />
        <div className="h-5 w-px bg-rule" />
        <div className="font-display text-[15px] tracking-tight text-ink">
          Casa Properties
        </div>
      </div>

      {/* Center — 3 tabs (hidden on mobile, replaced by the drawer) */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
        {TABS.map((t) => (
          <Link
            key={t.to}
            href={t.to}
            className={`tab-trigger ${isActive(pathname, t.to, t.end) ? "active" : ""}`}
            aria-current={isActive(pathname, t.to, t.end) ? "page" : undefined}
          >
            {t.name}
          </Link>
        ))}
      </nav>

      {/* Right — notification bell + user dropdown (desktop) / hamburger (mobile) */}
      <div className="flex items-center gap-2 md:ml-0 ml-auto">
        <div ref={bellWrap} className="relative">
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className="topbar-icon-btn relative"
            aria-label="Notifications"
            title="Notifications"
            aria-expanded={bellOpen}
            aria-haspopup="menu"
          >
            <Bell size={16} strokeWidth={1.5} />
            {exceptionCount > 0 && (
              <span className="notif-badge" aria-hidden="true">
                {exceptionCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="border border-rule rounded-[2px] shadow-soft absolute right-0 top-12 w-[360px] bg-white z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                <span className="font-display text-[15px] tracking-tight">
                  Exceptions
                </span>
                <span className="text-[11px] text-neutral-600 tracking-eyebrow uppercase">
                  {exceptionCount} open
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
                  View all on the Exception Board →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown — desktop only (Radix, .menu-pop-floating) */}
        <div className="hidden md:block">
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#FAFAFA] rounded-[2px] text-left"
                aria-label="Account menu"
              >
                <span className="avatar avatar-sm">{user?.initials ?? "··"}</span>
                <span className="hidden lg:flex flex-col min-w-0">
                  <span className="text-[13px] text-neutral-900 truncate leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10.5px] tracking-eyebrow uppercase text-neutral-500 truncate">
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className="text-neutral-600"
                />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={8}
                className="menu-pop-floating"
              >
                <div className="px-3.5 py-3 border-b border-rule">
                  <div className="text-[13px] text-neutral-900">
                    {user?.name}
                  </div>
                  <div className="text-[11.5px] text-neutral-500 truncate">
                    {user?.email}
                  </div>
                  <span
                    className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10.5px] tracking-eyebrow uppercase font-medium"
                    style={{
                      background: "#EAF1FB",
                      color: "#1E5FBF",
                      border: "1px solid #C9D9F0",
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <Dropdown.Item
                  className="menu-pop-item flex items-center gap-2.5"
                  onSelect={() => router.push("/settings")}
                >
                  <Settings size={14} strokeWidth={1.5} />
                  <span>Settings</span>
                </Dropdown.Item>
                <Dropdown.Item
                  className="menu-pop-item flex items-center gap-2.5"
                  onSelect={handleSignOut}
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  <span>Sign out</span>
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="topbar-icon-btn md:hidden"
          aria-label="Open navigation menu"
          title="Menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile slide-in drawer (L4) — full panel with tabs + user/role section */}
      {drawerOpen && (
        <>
          <div
            className="sheet-overlay md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="nav-drawer md:hidden"
            aria-label="Navigation"
          >
            <div className="flex items-center justify-between px-5 h-[70px] border-b border-rule">
              <div className="font-display text-[15px] tracking-tight text-ink">
                Casa Properties
              </div>
              <button
                type="button"
                className="close-btn"
                aria-label="Close navigation menu"
                title="Close"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>

            <nav className="flex flex-col py-4">
              {TABS.map((t) => (
                <Link
                  key={t.to}
                  href={t.to}
                  className={`nav-drawer-item ${
                    isActive(pathname, t.to, t.end) ? "active" : ""
                  }`}
                  aria-current={
                    isActive(pathname, t.to, t.end) ? "page" : undefined
                  }
                  onClick={() => setDrawerOpen(false)}
                >
                  {t.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-rule px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="avatar avatar-sm">
                  {user?.initials ?? "··"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-neutral-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11.5px] text-neutral-500 truncate">
                    {user?.email}
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10.5px] tracking-eyebrow uppercase font-medium"
                  style={{
                    background: "#EAF1FB",
                    color: "#1E5FBF",
                    border: "1px solid #C9D9F0",
                  }}
                >
                  {roleLabel}
                </span>
              </div>
              <div className="flex flex-col mt-3 gap-1">
                <button
                  type="button"
                  className="nav-drawer-item flex items-center gap-2.5"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push("/settings");
                  }}
                >
                  <Settings size={14} strokeWidth={1.5} />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="nav-drawer-item flex items-center gap-2.5"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
