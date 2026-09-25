import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma, CommunicationChannel } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function POST(request: NextRequest) {
  const session = verifySession((await (await import("next/headers")).cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Workspace access denied." }, { status: 403 });

  const channel = String(body.channel || "") as CommunicationChannel;
  if (!Object.values(CommunicationChannel).includes(channel)) return NextResponse.json({ error: "Unsupported channel" }, { status: 400 });

  const personId = typeof body.personId === "string" ? body.personId : null;
  const leadId = typeof body.leadId === "string" ? body.leadId : null;
  const customerId = typeof body.customerId === "string" ? body.customerId : null;
  const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId : null;
  const externalThreadId = typeof body.externalThreadId === "string" ? body.externalThreadId.slice(0, 190) : null;

  if (leadId) { const lead=await prisma.lead.findUnique({where:{id:leadId},select:{workspaceId:true}}); if(!lead||lead.workspaceId!==access.workspace.id)return NextResponse.json({error:"Lead is outside the active workspace."},{status:403}); }
  if (customerId) { const row=await prisma.customer.findUnique({where:{id:customerId},select:{workspaceId:true}}); if(!row||row.workspaceId!==access.workspace.id)return NextResponse.json({error:"Customer is outside the active workspace."},{status:403}); }
  if (opportunityId) { const row=await prisma.opportunity.findUnique({where:{id:opportunityId},select:{workspaceId:true}}); if(!row||row.workspaceId!==access.workspace.id)return NextResponse.json({error:"Opportunity is outside the active workspace."},{status:403}); }

  const existing = await prisma.conversation.findFirst({
    where: { workspaceId:access.workspace.id, channel, ...(externalThreadId ? { externalThreadId } : {}), ...(personId ? { personId } : {}), ...(leadId ? { leadId } : {}), status: { not: "CLOSED" } },
  });
  if (existing) return NextResponse.json({ ok: true, conversationId: existing.id, existing: true });

  const conversation = await prisma.conversation.create({
    data: { id: randomUUID(), workspaceId:access.workspace.id, channel, personId, leadId, customerId, opportunityId, externalThreadId, status: "OPEN", assignedTo: session.email },
  });
  return NextResponse.json({ ok: true, conversationId: conversation.id, existing: false });
}
