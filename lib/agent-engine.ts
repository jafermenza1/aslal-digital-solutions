import { prisma } from "@/lib/prisma";

export async function resolveAcceptedAgentDeal(input: { workspaceId: string; leadId: string; at?: Date }) {
  const at = input.at || new Date();
  const registration = await prisma.agentDealRegistration.findFirst({
    where: {
      workspaceId: input.workspaceId,
      leadId: input.leadId,
      status: "ACCEPTED",
      acceptedAt: { lte: at },
      partner: { type: "AGENT", accountStatus: "ACTIVE" },
    },
    include: {
      partner: true,
      workEvidence: { where: { verificationStatus: "VERIFIED", occurredAt: { lte: at } }, orderBy: { occurredAt: "asc" } },
    },
    orderBy: { acceptedAt: "asc" },
  });
  if (!registration || registration.workEvidence.length === 0) return null;
  return registration;
}

export function agentClaimIsEligible(registration: { status: string; workEvidence: { verificationStatus: string }[] }) {
  return registration.status === "ACCEPTED" && registration.workEvidence.some(w => w.verificationStatus === "VERIFIED");
}
