import { AgentDetailPage } from "@/components/casa/agent-detail-page";
import { AGENT_DETAILS } from "@/lib/mock-data/agent-detail";

export default function OpsAgentLogPage() {
  return <AgentDetailPage detail={AGENT_DETAILS.ops} />;
}
