import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authorizePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const TYPES = new Set(["CUSTOMER_INTRODUCTION","NEEDS_DISCOVERY","MEETING","SITE_VISIT","DEMO","NEGOTIATION","PROPOSAL_SUPPORT","FOLLOW_UP","OTHER"]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const partner = await prisma.partner.findFirst({ where: { user: { is: { id: user.id } } } });
  if (!partner || partner.type !== "AGENT" || partner.accountStatus !== "ACTIVE") return NextResponse.json({ error: "Active referral agent access required." }, { status: 403 });
  const registration = await prisma.agentDealRegistration.findFirst({ where: { id: params.id, partnerId: partner.id, workspaceId: partner.workspaceId } });
  if (!registration) return NextResponse.json({ error: "Deal registration not found." }, { status: 404 });
  if (!["SUBMITTED","UNDER_REVIEW","ACCEPTED"].includes(registration.status)) return NextResponse.json({ error: "Work evidence cannot be added to this registration." }, { status: 409 });

  const body = await req.json();
  const workType = String(body.workType || "").toUpperCase();
  const description = String(body.description || "").trim();
  const occurredAt = new Date(String(body.occurredAt || ""));
  const evidenceReference = String(body.evidenceReference || "").trim().slice(0,500) || null;
  if (!TYPES.has(workType) || description.length < 20 || Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: "Valid work type, at least 20 characters of work detail, and occurredAt are required." }, { status: 400 });
  }
  if (occurredAt.getTime() > Date.now()) return NextResponse.json({ error: "Work evidence cannot be dated in the future." }, { status: 400 });
  if (occurredAt < registration.createdAt) return NextResponse.json({ error: "Work evidence must occur after the deal registration." }, { status: 400 });

  const evidence = await prisma.agentWorkEvidence.create({
    data: {
      id: randomUUID(), workspaceId: partner.workspaceId, dealRegistrationId: registration.id, partnerId: partner.id,
      workType: workType as any, description, occurredAt, evidenceReference, verificationStatus: "PENDING",
    },
  });
  if (registration.status === "SUBMITTED") {
    await prisma.agentDealRegistration.update({ where: { id: registration.id }, data: { status: "UNDER_REVIEW" } });
  }
  return NextResponse.json({ evidence }, { status: 201 });
}
