"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { TopNav } from "@/components/casa/top-nav";
import { CommandPalette } from "@/components/casa/command-palette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <TopNav />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
