import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/security";

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  if (!leadId) return NextResponse.json({ error: "leadId is required" }, { status: 400 });

  const lead = await prisma.lead.findFirst({ where: { id: leadId, workspaceId: access.workspace.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.status !== "WON") return NextResponse.json({ error: "Only a verified WON lead can become a customer." }, { status: 409 });
  if (!lead.dealValue || Number(lead.dealValue) <= 0) return NextResponse.json({ error: "A positive deal value is required." }, { status: 409 });

  const result = await prisma.$transaction(async (tx) => {
    const person = lead.personId
      ? await tx.person.update({ where: { id: lead.personId }, data: { name: lead.name, email: lead.email, phone: lead.phone } })
      : await tx.person.create({ data: { id: randomUUID(), name: lead.name, email: lead.email, phone: lead.phone } });
    if (!lead.personId) await tx.lead.update({ where: { id: lead.id }, data: { personId: person.id } });

    let opportunity = await tx.opportunity.findFirst({ where: { leadId: lead.id, stage: "WON" }, orderBy: { createdAt: "desc" } });
    if (!opportunity) {
      opportunity = await tx.opportunity.create({
        data: {
          id: randomUUID(), leadId: lead.id, name: lead.name + " — " + (lead.company || "Opportunity"),
          expectedValue: lead.dealValue, currency: "ETB", probability: 100, stage: "WON",
          ownerEmail: lead.ownerEmail, source: lead.source, medium: lead.medium, campaign: lead.campaign, referralCode: lead.referralCode,
        },
      });
    }
    const existing = await tx.customer.findUnique({ where: { opportunityId: opportunity.id } });
    if (existing) return { customer: existing, created: false };
    const customer = await tx.customer.create({
      data: { id: randomUUID(), workspaceId: access.workspace.id, personId: person.id, opportunityId: opportunity.id, name: lead.name, email: lead.email, phone: lead.phone, status: "ACTIVE" },
    });
    await tx.activity.create({
      data: {
        type: "CUSTOMER_CREATED", subject: "Customer created from verified won opportunity",
        details: { leadId: lead.id, actor: access.user.email }, personId: person.id, customerId: customer.id, opportunityId: opportunity.id,
      },
    });
    return { customer, created: true };
  });
  return NextResponse.json({ ok: true, customerId: result.customer.id, created: result.created });
}
