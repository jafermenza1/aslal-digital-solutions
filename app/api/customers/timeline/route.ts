import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export async function GET(request: Request) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      person: true,
      opportunity: { include: { lead: { include: {
        visitor: true,
        stageHistory: { orderBy: { createdAt: "asc" }, take: 100 },
        notes: { orderBy: { createdAt: "asc" }, take: 100 },
        tasks: { orderBy: { createdAt: "asc" }, take: 100 },
      } } } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const [activities, events] = await Promise.all([
    prisma.activity.findMany({ where: { OR: [
      { customerId }, ...(customer.personId ? [{ personId: customer.personId }] : []),
      ...(customer.opportunityId ? [{ opportunityId: customer.opportunityId }] : []),
    ] }, orderBy: { createdAt: "asc" }, take: 200 }),
    customer.opportunity?.lead.visitorId
      ? prisma.event.findMany({ where: { visitorId: customer.opportunity.lead.visitorId }, orderBy: { createdAt: "asc" }, take: 200 })
      : Promise.resolve([]),
  ]);
  const lead = customer.opportunity?.lead;
  const timeline = [
    ...activities.map(item => ({ id: `activity-${item.id.toString()}`, type: "ACTIVITY", timestamp: item.createdAt, subject: item.subject, details: item.details, actor: item.type })),
    ...events.map(item => ({ id: `event-${item.id.toString()}`, type: "EVENT", timestamp: item.createdAt, subject: item.eventName, details: { pagePath: item.pagePath, productSlug: item.productSlug, metadata: item.metadata }, actor: "visitor" })),
    ...(lead?.stageHistory || []).map(item => ({ id: `stage-${item.id.toString()}`, type: "STAGE_CHANGE", timestamp: item.createdAt, subject: `${item.fromStage || "START"} → ${item.toStage}`, details: { note: item.note }, actor: item.changedBy || "system" })),
    ...(lead?.notes || []).map(item => ({ id: `note-${item.id}`, type: "NOTE", timestamp: item.createdAt, subject: "Sales note", details: { body: item.body }, actor: item.author || "team" })),
    ...(lead?.tasks || []).map(item => ({ id: `task-${item.id}`, type: "TASK", timestamp: item.createdAt, subject: item.title, details: { status: item.status, priority: item.priority, dueAt: item.dueAt }, actor: item.assignedTo || "team" })),
  ].sort((a, z) => a.timestamp.getTime() - z.timestamp.getTime()).slice(-300);

  return NextResponse.json({ customer, timeline, generatedFor: session.email });
}
