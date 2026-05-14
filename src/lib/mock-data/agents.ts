export type AgentMode = "Shadow" | "Live";

export type AgentSummary = {
  key: "pricing" | "guest" | "ops" | "sop";
  name: string;
  tagline: string;
  mode: AgentMode;
  actionsToday: number;
  success: number;
  exceptions: number;
  costMTD: number;
  spark: number[];
};

export const AGENTS: AgentSummary[] = [
  { key: "pricing", name: "Pricing Agent", tagline: "Replaces PriceLabs. Weekly competitor analysis + rate recommendations.", mode: "Shadow", actionsToday: 26, success: 96, exceptions: 2, costMTD: 0.84, spark: [3, 6, 12, 8, 14, 11, 26] },
  { key: "guest", name: "Guest Agent", tagline: "Drafts replies to guest inquiries within minutes. Escalates anything sensitive.", mode: "Shadow", actionsToday: 47, success: 94, exceptions: 4, costMTD: 1.42, spark: [22, 31, 28, 41, 38, 44, 47] },
  { key: "ops", name: "Ops Agent", tagline: "Coordinates cleaning calendar, supply runs, and small repairs.", mode: "Live", actionsToday: 12, success: 100, exceptions: 8, costMTD: 0.31, spark: [9, 11, 8, 13, 7, 10, 12] },
  { key: "sop", name: "SOP Agent", tagline: "Keeps every property’s playbook current. Flags drift from Casa standards.", mode: "Live", actionsToday: 0, success: 100, exceptions: 0, costMTD: 0.00, spark: [1, 0, 2, 0, 0, 1, 0] },
];

export const modeClass = (m: AgentMode | string) =>
  m === "Live" ? "cs-Completed" : m === "Shadow" ? "cs-InProgress" : "cs-Assigned";
export const modeLabel = (m: AgentMode | string) => (m === "Shadow" ? "Shadow Mode" : m);

export const PROMPT_VERSIONS = [
  { v: "v1.3", when: "2 days ago", by: "Ayman", note: "Added FIFA event weighting to comp analysis.", diff: "+12 lines, -4 lines" },
  { v: "v1.2", when: "5 days ago", by: "Ayman", note: "Tightened % change guardrails to ±15% max.", diff: "+5 lines, -2 lines" },
  { v: "v1.1", when: "8 days ago", by: "Ayman", note: "Added owner-restricted property bypass.", diff: "+18 lines, -1 line" },
  { v: "v1.0", when: "Week 1 launch", by: "Ayman", note: "Initial prompt.", diff: "Initial" },
];
