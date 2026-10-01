import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeWorkspacePermission("partners.manage", new URL(req.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  const body = await req.json();
  const action = String(body.action || "").toUpperCase();
  const registration = await prisma.agentDealRegistration.findFirst({
    where: { id: params.id, workspaceId: access.workspace.id },
    include: { workEvidence: true, partner: true, lead: true },
  });
  if (!registration) return NextResponse.json({ error: "Deal registration not found." }, { status: 404 });

  if (action === "ACCEPT") {
    const verified = registration.workEvidence.filter(w => w.verificationStatus === "VERIFIED");
    if (!verified.length) return NextResponse.json({ error: "An agent claim cannot be accepted until at least one piece of work evidence is verified." }, { status: 409 });
    const updated = await prisma.agentDealRegistration.update({
      where: { id: registration.id },
      data: { status: "ACCEPTED", acceptedAt: new Date(), acceptedBy: access.user.email },
    });
    return NextResponse.json({ registration: updated });
  }

  if (action === "REJECT") {
    const reason = String(body.reason || "").trim();
    if (reason.length < 10) return NextResponse.json({ error: "A rejection reason of at least 10 characters is required." }, { status: 400 });
    const updated = await prisma.agentDealRegistration.update({
      where: { id: registration.id },
      data: { status: "REJECTED", rejectedAt: new Date(), rejectionReason: reason },
    });
    return NextResponse.json({ registration: updated });
  }

  return NextResponse.json({ error: "Action must be ACCEPT or REJECT." }, { status: 400 });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeWorkspacePermission("partners.manage", new URL(req.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });
  const registration = await prisma.agentDealRegistration.findFirst({
    where: { id: params.id, workspaceId: access.workspace.id },
    include: { workEvidence: { orderBy: { occurredAt: "asc" } }, lead: true, partner: true },
  });
  if (!registration) return NextResponse.json({ error: "Deal registration not found." }, { status: 404 });
  return NextResponse.json({ registration });
}
