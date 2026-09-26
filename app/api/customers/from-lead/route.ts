import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { requireSameWorkspace } from "@/lib/workspace-boundary";

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const access = await authorizeWorkspacePermission("leads.edit", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  if (!leadId) return NextResponse.json({ error: "leadId is required" }, { status: 400 });

  const lead = await prisma.lead.findFirst({ where: { id: leadId, workspaceId: access.workspace.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.status !== "WON") return NextResponse.json({ error: "Only a verified WON lead can become a customer." }, { status: 409 });
  if (!lead.dealValue || Number(lead.dealValue) <= 0) return NextResponse.json({ error: "A positive deal value is required." }, { status: 409 });

  const duplicateCustomer = await prisma.customer.findFirst({
    where: {
      workspaceId: access.workspace.id,
      OR: [
        ...(lead.email ? [{ email: lead.email }] : []),
        ...(lead.phone ? [{ phone: lead.phone }] : []),
      ],
    },
    select: { id: true },
  });
  if (duplicateCustomer) {
    return NextResponse.json({ ok: true, customerId: duplicateCustomer.id, created: false, duplicate: true });
  }

  const result = await prisma.$transaction(async (tx) => {
    let person = lead.personId ? await tx.person.findUnique({ where: { id: lead.personId } }) : null;

    // Person is a shared identity record. It may be linked to multiple workspaces,
    // but this workflow must never mutate an identity already owned by another
    // workspace's lead/customer.
    if (person) {
      const [foreignLead, foreignCustomer] = await Promise.all([
        tx.lead.findFirst({ where: { personId: person.id, workspaceId: { not: access.workspace.id } }, select: { id: true, workspaceId: true } }),
        tx.customer.findFirst({ where: { personId: person.id, workspaceId: { not: access.workspace.id } }, select: { id: true, workspaceId: true } }),
      ]);
      if (foreignLead?.workspaceId || foreignCustomer?.workspaceId) {
        return { conflict: true as const };
      }
      person = await tx.person.update({
        where: { id: person.id },
        data: { name: lead.name, email: lead.email, phone: lead.phone },
      });
    } else {
      person = await tx.person.create({ data: { id: randomUUID(), name: lead.name, email: lead.email, phone: lead.phone } });
    }

    requireSameWorkspace(access.workspace.id, lead.workspaceId);

    if (!lead.personId) await tx.lead.update({ where: { id: lead.id }, data: { personId: person.id } });

    let opportunity = await tx.opportunity.findFirst({
      where: { leadId: lead.id, workspaceId: access.workspace.id, stage: "WON" },
      orderBy: { createdAt: "desc" },
    });
    if (opportunity) requireSameWorkspace(access.workspace.id, opportunity.workspaceId);

    if (!opportunity) {
      opportunity = await tx.opportunity.create({
        data: {
          id: randomUUID(), workspaceId: access.workspace.id, leadId: lead.id, name: lead.name + " — " + (lead.company || "Opportunity"),
          expectedValue: lead.dealValue, currency: "ETB", probability: 100, stage: "WON",
          ownerEmail: lead.ownerEmail, source: lead.source, medium: lead.medium, campaign: lead.campaign, referralCode: lead.referralCode,
        },
      });
    }

    const existing = await tx.customer.findFirst({ where: { opportunityId: opportunity.id, workspaceId: access.workspace.id } });
    if (existing) return { customer: existing, created: false };

    const customer = await tx.customer.create({
      data: { id: randomUUID(), workspaceId: access.workspace.id, personId: person.id, opportunityId: opportunity.id, name: lead.name, email: lead.email, phone: lead.phone, status: "ACTIVE" },
    });
    await tx.activity.create({
      data: {
        type: "CUSTOMER_CREATED", subject: "Customer created from verified won opportunity",
        details: { leadId: lead.id, actor: access.user.email, workspaceId: access.workspace.id },
        personId: person.id, customerId: customer.id, opportunityId: opportunity.id,
      },
    });
    return { customer, created: true };
  });

  if ("conflict" in result && result.conflict) {
    return NextResponse.json({ error: "The linked person identity is already owned by another workspace and cannot be mutated here." }, { status: 409 });
  }
  return NextResponse.json({ ok: true, customerId: result.customer.id, created: result.created });
}
