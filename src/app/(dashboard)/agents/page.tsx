import { redirect } from "next/navigation";

// Legacy route — relocated under Vault as /vault/agent-logs (Phase 1 IA
// collapse). Redirect-stub keeps external deep links alive without a 404.
export default function LegacyAgentsRedirect() {
  redirect("/vault/agent-logs");
}
