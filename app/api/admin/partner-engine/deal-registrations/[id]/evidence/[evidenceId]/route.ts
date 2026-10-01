import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string; evidenceId: string } }) {
  const access = await authorizeWorkspacePermission("partners.manage", new URL(req.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  const body = await req.json();
  const action = String(body.action || "").toUpperCase();
  const evidence = await prisma.agentWorkEvidence.findFirst({
    where: { id: params.evidenceId, dealRegistrationId: params.id, workspaceId: access.workspace.id },
  });
  if (!evidence) return NextResponse.json({ error: "Work evidence not found." }, { status: 404 });

  if (action === "VERIFY") {
    const updated = await prisma.agentWorkEvidence.update({
      where: { id: evidence.id },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: access.user.email, rejectionReason: null },
    });
    return NextResponse.json({ evidence: updated });
  }
  if (action === "REJECT") {
    const reason = String(body.reason || "").trim();
    if (reason.length < 10) return NextResponse.json({ error: "A rejection reason of at least 10 characters is required." }, { status: 400 });
    const updated = await prisma.agentWorkEvidence.update({
      where: { id: evidence.id },
      data: { verificationStatus: "REJECTED", verifiedAt: new Date(), verifiedBy: access.user.email, rejectionReason: reason },
    });
    return NextResponse.json({ evidence: updated });
  }
  return NextResponse.json({ error: "Action must be VERIFY or REJECT." }, { status: 400 });
}
