import { redirect } from "next/navigation";

// Legacy route — the standalone Reports page is retired. Its alignment
// content folds into each agent detail page's Validation section (L2 —
// Phase 1 IA collapse). Redirect-stub keeps external deep links alive
// without a 404.
export default function LegacyReportsRedirect() {
  redirect("/vault/agent-logs");
}
