import { redirect } from "next/navigation";

// Legacy detail route — superseded by /vault/bookings/[id] (Phase 1 IA
// collapse). The id segment is interpolated into a fixed /vault/... prefix;
// it is a single Next.js dynamic segment and cannot escape to an external
// host (threat T-01-12: same-origin redirect, not an open redirect).
export default function LegacyBookingDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/vault/bookings/${params.id}`);
}
