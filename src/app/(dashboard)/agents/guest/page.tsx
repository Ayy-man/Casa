import { AgentSkeleton } from "@/components/casa/agent-skeleton";

export default function GuestAgentPage() {
  return (
    <AgentSkeleton
      name="Guest Agent"
      tagline="Drafts replies to guest inquiries within minutes. Escalates anything sensitive."
      mode="Shadow"
    />
  );
}
