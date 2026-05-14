"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export default function LoginPage() {
  const { user, signIn, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setTimeout(() => {
      const r = signIn(email, password);
      if (!r.ok) {
        setError(r.error);
        setBusy(false);
      }
    }, 320);
  };

  const fill = (em: string) => {
    setEmail(em);
    setPassword("demo");
    setError("");
  };

  return (
    <div className="login-bg min-h-screen w-full flex flex-col">
      <header className="px-10 pt-10">
        <div className="font-display text-[20px] tracking-wordmark">CASA</div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-10">
            <div className="font-display text-[64px] leading-none tracking-tight">Casa</div>
            <div className="mt-2 text-[11px] tracking-eyebrow uppercase text-neutral-500">
              Command Center
            </div>
            <div className="mt-6 flex justify-center">
              <span className="accent-rule" />
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mb-2">
                Email
              </label>
              <input
                className="field"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@casa.com"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-eyebrow uppercase text-neutral-500 mb-2">
                Password
              </label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-[12px] text-[#A33] flex items-center gap-2 pt-1">
                <span className="w-1 h-1 rounded-full bg-[#A33]" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !email || !password}
              className="btn-primary w-full mt-2"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-10">
            <div className="hr-soft mb-5" />
            <div className="text-[11px] tracking-eyebrow uppercase text-neutral-500 mb-3">
              Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fill("carlos@casa.com")}
                className="btn-ghost text-left"
              >
                <div>
                  <div className="text-[12px] text-neutral-900">Carlos Robles</div>
                  <div className="text-[11px] text-neutral-500">carlos@casa.com</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => fill("denika@casa.com")}
                className="btn-ghost text-left"
              >
                <div>
                  <div className="text-[12px] text-neutral-900">Denika Patel</div>
                  <div className="text-[11px] text-neutral-500">denika@casa.com</div>
                </div>
              </button>
            </div>
            <div className="text-[11px] text-neutral-400 mt-3">
              Password for both: <span className="text-neutral-600">demo</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 pb-8 pt-6 text-[11px] text-neutral-400">
        <div className="flex items-center justify-between">
          <div>© 2026 Casa Properties — Vancouver</div>
          <div className="tracking-eyebrow uppercase">26 Properties Under Care</div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-neutral-400">
          <span>Powered by</span>
          <Image
            src="/humanos-logo.png"
            alt="HumanOS"
            width={48}
            height={14}
            style={{ height: 14, width: "auto", opacity: 0.7 }}
          />
        </div>
      </footer>
    </div>
  );
}
