import { redirect } from "next/navigation";

// Legacy route — relocated to /vault/agent-logs/sop (Phase 1 IA collapse).
// Redirect-stub keeps external deep links alive without a 404.
export default function LegacySOPAgentRedirect() {
  redirect("/vault/agent-logs/sop");
}
