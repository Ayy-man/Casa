"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

const TABS = ["Profile", "Notifications", "Agents", "API Status", "Branding"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Profile");
  return (
    <div className="route-fade page-pad">
      <header className="mb-8">
        <div className="section-eyebrow">System</div>
        <h1 className="font-display text-[40px] leading-[1.1] tracking-tight mt-1">
          Settings
        </h1>
        <p className="text-[13.5px] text-neutral-500 mt-2">
          Workspace preferences, channel integrations, agent guardrails, and team
          permissions.
        </p>
      </header>

      <div className="grid gap-10" style={{ gridTemplateColumns: "200px 1fr" }}>
        <nav className="flex flex-col gap-1 sticky top-2 self-start">
          {TABS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className="text-left px-3 h-[34px] text-[13px] rounded-[2px]"
              style={{
                background: tab === t ? "#F5F5F4" : "transparent",
                color: tab === t ? "#1A1A1A" : "#525252",
                borderLeft:
                  tab === t ? "2px solid #1A1A1A" : "2px solid transparent",
                fontWeight: tab === t ? 500 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </nav>
        <div>
          {tab === "Profile" && <Profile />}
          {tab === "Notifications" && <Notifications />}
          {tab === "Agents" && <Agents />}
          {tab === "API Status" && <APIStatus />}
          {tab === "Branding" && <Branding />}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="section-eyebrow block mb-1.5">{label}</span>
      <input className="field w-full" defaultValue={defaultValue} />
    </label>
  );
}

function Profile() {
  const { user } = useAuth();
  return (
    <div className="max-w-[640px]">
      <h2 className="font-display text-[24px] tracking-tight mb-1">Profile</h2>
      <p className="text-[12.5px] text-neutral-500 mb-6">
        How you appear in audit logs and approval emails.
      </p>

      <div className="flex items-center gap-5 mb-8 pb-8 border-b border-rule">
        <span
          className="avatar"
          style={{ width: 64, height: 64, fontSize: 18 }}
        >
          {user?.initials ?? "CR"}
        </span>
        <div>
          <button type="button" className="btn-sm btn-sm-outline">
            Upload photo
          </button>
          <p className="text-[11.5px] text-neutral-500 mt-2">JPG or PNG • 1MB max</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Field label="Name" defaultValue={user?.name ?? "Carlos Robles"} />
        <Field label="Email" defaultValue={user?.email ?? "carlos@casa.com"} />
        <Field label="Phone" defaultValue="+1 (604) 555-0182" />
        <Field label="Time zone" defaultValue="America/Vancouver" />
      </div>

      <div className="flex justify-end mt-8">
        <button type="button" className="btn-sm btn-sm-primary">
          Save changes
        </button>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex items-center"
      style={{
        width: 32,
        height: 18,
        borderRadius: 999,
        background: on ? "#1A1A1A" : "#E5E5E5",
        padding: 2,
        transition: "background 160ms ease",
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: "#FFFFFF",
          transform: `translateX(${on ? 14 : 0}px)`,
          transition: "transform 160ms ease",
        }}
      />
    </button>
  );
}

function Notifications() {
  const types = [
    { key: "guest_complaint", label: "Guest Complaint" },
    { key: "cleaner_no_response", label: "Cleaner No Response" },
    { key: "claims_draft", label: "Claims Draft" },
    { key: "pricing_alert", label: "Pricing Alert" },
  ];
  const channels = ["Email", "SMS", "Push"];
  const [matrix, setMatrix] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    types.forEach((t) =>
      channels.forEach((c) => {
        m[`${t.key}_${c}`] =
          t.key === "guest_complaint" ||
          (t.key === "cleaner_no_response" && c !== "Email");
      })
    );
    return m;
  });
  const toggle = (k: string) =>
    setMatrix((m) => ({ ...m, [k]: !m[k] }));

  return (
    <div className="max-w-[760px]">
      <h2 className="font-display text-[24px] tracking-tight mb-1">Notifications</h2>
      <p className="text-[12.5px] text-neutral-500 mb-6">
        Pick exactly which exception types reach you, and on which channel.
      </p>

      <div className="border border-rule rounded-[2px] overflow-hidden mb-10">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Exception type</th>
              {channels.map((c) => (
                <th key={c} className="text-center" style={{ width: 110 }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.key}>
                <td>
                  <span className="text-[13.5px]">{t.label}</span>
                </td>
                {channels.map((c) => {
                  const k = `${t.key}_${c}`;
                  return (
                    <td key={c} className="text-center">
                      <Toggle on={matrix[k]} onChange={() => toggle(k)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="section-eyebrow mb-2">Quiet hours</div>
        <p className="text-[12px] text-neutral-500 mb-3">
          Suppress non-critical alerts during this window. Critical exceptions always
          come through.
        </p>
        <div className="flex items-center gap-3">
          <input className="field" defaultValue="22:00" style={{ width: 100 }} />
          <span className="text-neutral-400">to</span>
          <input className="field" defaultValue="07:00" style={{ width: 100 }} />
          <span className="text-[12px] text-neutral-500 ml-3">America/Vancouver</span>
        </div>
      </div>
    </div>
  );
}

function Agents() {
  const [agents, setAgents] = useState([
    { key: "pricing", name: "Pricing Agent", mode: "Shadow", active: true },
    { key: "guest", name: "Guest Agent", mode: "Shadow", active: true },
    { key: "ops", name: "Ops Agent", mode: "Live", active: true },
    { key: "sop", name: "SOP Agent", mode: "Live", active: true },
  ]);
  const setAgent = (i: number, patch: Partial<(typeof agents)[number]>) =>
    setAgents((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="max-w-[760px]">
      <h2 className="font-display text-[24px] tracking-tight mb-1">Agents</h2>
      <p className="text-[12.5px] text-neutral-500 mb-6">
        Quick controls. For full configuration, open each agent’s detail page.
      </p>

      <div className="border border-rule rounded-[2px] overflow-hidden">
        {agents.map((a, i) => (
          <div
            key={a.key}
            className="flex items-center gap-6 px-5 py-4"
            style={{ borderTop: i > 0 ? "1px solid #F1F1F0" : "none" }}
          >
            <div className="flex-1">
              <div className="font-display text-[19px] tracking-tight">{a.name}</div>
              <div className="text-[11.5px] text-neutral-500 mt-0.5">
                Mode: {a.mode} · {a.active ? "Running" : "Paused"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {["Shadow", "Live"].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setAgent(i, { mode: m })}
                  className={`btn-sm ${
                    a.mode === m ? "btn-sm-primary" : "btn-sm-outline"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <Toggle
              on={a.active}
              onChange={() => setAgent(i, { active: !a.active })}
            />

            <Link
              href={`/agents/${a.key}`}
              className="text-[12px] text-[#1E5FBF] hover:underline"
            >
              Configure
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function APIStatus() {
  const integrations = [
    { name: "Hostaway", status: "Connected", meta: "Last sync 2 min ago" },
    { name: "Breezeway", status: "Connected", meta: "Last sync 4 min ago" },
    {
      name: "WhatsApp Business API",
      status: "Connected",
      meta: "Last message sent 12 min ago",
    },
    {
      name: "PriceLabs",
      status: "Connected",
      meta: "Read-only — validation only",
    },
    { name: "OpenPhone", status: "Connected", meta: "Webhook healthy" },
    { name: "QuickBooks", status: "Not connected", meta: "Phase 2" },
    { name: "Apify", status: "Connected", meta: "Comp scraping queue: 0" },
    { name: "Claude API", status: "Connected", meta: "142K tokens used MTD" },
  ];
  return (
    <div className="max-w-[860px]">
      <h2 className="font-display text-[24px] tracking-tight mb-1">API status</h2>
      <p className="text-[12.5px] text-neutral-500 mb-6">
        Health of every service the agents depend on.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {integrations.map((i) => (
          <div
            key={i.name}
            className="border border-rule rounded-[2px] p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-display text-[17px] tracking-tight">{i.name}</div>
              <div className="text-[11.5px] text-neutral-500 mt-1">{i.meta}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: i.status === "Connected" ? "#2E6F2A" : "#A6A6A6",
                }}
              />
              <span className="text-[12px] text-neutral-700">{i.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Branding() {
  return (
    <div className="max-w-[640px]">
      <h2 className="font-display text-[24px] tracking-tight mb-1">Branding</h2>
      <p className="text-[12.5px] text-neutral-500 mb-6">
        This is a HumanOS workspace configured for Casa Properties. Read-only in the
        demo.
      </p>

      <div className="mb-8 pb-8 border-b border-rule">
        <div className="section-eyebrow mb-3">Current brand state</div>
        <div
          className="border border-rule rounded-[2px] p-5 flex items-center gap-5"
          style={{ background: "#FAFAF8" }}
        >
          <Image src="/humanos-logo.png" alt="HumanOS" width={120} height={64} style={{ height: 64, width: "auto" }} />
          <div className="flex-1">
            <div className="font-display text-[20px] tracking-tight">
              Powered by HumanOS
            </div>
            <div className="text-[12.5px] text-neutral-500 mt-1">
              Casa Properties instance · configured May 2026
            </div>
          </div>
          <span
            className="urgency-pill pill-Low"
            style={{
              color: "#2E6F2A",
              background: "#F1F6F0",
              borderColor: "#DDE7DA",
            }}
          >
            Active
          </span>
        </div>
      </div>

      <div className="mb-8 pb-8 border-b border-rule">
        <div className="section-eyebrow mb-2">Workspace name</div>
        <input
          className="field w-full"
          defaultValue="Casa Properties"
          readOnly
          style={{ background: "#FAFAFA", color: "#525252" }}
        />
        <p className="text-[11.5px] text-neutral-500 mt-2">
          Shown in the top-bar next to the HumanOS mark.
        </p>
      </div>

      <div className="mb-8 pb-8 border-b border-rule">
        <div className="section-eyebrow mb-2">Color palette</div>
        <p className="text-[12px] text-neutral-500 mb-3">
          Locked to the Casa palette in the demo.
        </p>
        <div className="flex gap-2">
          {[
            { l: "Ink", c: "#1A1A1A" },
            { l: "Paper", c: "#FAF9F6" },
            { l: "Accent", c: "#1E5FBF" },
            { l: "Critical", c: "#8A2B1F" },
            { l: "Approved", c: "#2E6F2A" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: s.c,
                  border: "1px solid #E5E5E5",
                }}
              />
              <div className="text-[11px] text-neutral-500 mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-eyebrow mb-2">Subdomain</div>
        <input
          className="field w-full"
          defaultValue="casa.humanos.app"
          readOnly
          style={{ background: "#FAFAFA", color: "#525252" }}
        />
        <p className="text-[11.5px] text-neutral-500 mt-2">
          Read-only — contact us to change.
        </p>
      </div>
    </div>
  );
}
