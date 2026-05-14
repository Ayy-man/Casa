import { AgentSkeleton } from "@/components/casa/agent-skeleton";

export default function SOPAgentPage() {
  return (
    <AgentSkeleton
      name="SOP Agent"
      tagline="Keeps every property’s playbook current. Flags drift from Casa standards."
      mode="Live"
    />
  );
}
