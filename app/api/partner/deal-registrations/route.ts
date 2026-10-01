import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authorizePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const leadId = String(body.leadId || "").trim();
  const claimReason = String(body.claimReason || "").trim();
  const programId = String(body.programId || "").trim() || null;
  const campaignId = String(body.campaignId || "").trim() || null;
  if (!leadId || claimReason.length < 20) {
    return NextResponse.json({ error: "leadId and a specific claim reason of at least 20 characters are required." }, { status: 400 });
  }

  const partner = await prisma.partner.findFirst({ where: { user: { is: { id: user.id } } } });
  if (!partner || partner.type !== "AGENT") {
    return NextResponse.json({ error: "Only active referral agents can register deals." }, { status: 403 });
  }
  if (partner.accountStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Your agent account is not active." }, { status: 403 });
  }

  const lead = await prisma.lead.findFirst({ where: { id: leadId, workspaceId: partner.workspaceId } });
  if (!lead) return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  if (["WON", "LOST"].includes(lead.status)) {
    return NextResponse.json({ error: "A closed lead cannot be newly claimed as an agent deal." }, { status: 409 });
  }

  const existing = await prisma.agentDealRegistration.findFirst({
    where: { workspaceId: partner.workspaceId, leadId, status: { in: ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "COMPLETED"] } },
  });
  if (existing && existing.partnerId !== partner.id) {
    return NextResponse.json({ error: "This lead already has an active agent claim. Submit evidence through the dispute/review process instead." }, { status: 409 });
  }
  if (existing) return NextResponse.json({ error: "You already have an active registration for this lead." }, { status: 409 });

  if (programId) {
    const program = await prisma.partnerProgram.findFirst({ where: { id: programId, workspaceId: partner.workspaceId, status: "PUBLISHED" } });
    if (!program) return NextResponse.json({ error: "Published partner program not found." }, { status: 400 });
  }
  if (campaignId) {
    const campaign = await prisma.partnerCampaign.findFirst({ where: { id: campaignId, workspaceId: partner.workspaceId, status: { in: ["OPEN", "ACTIVE"] } } });
    if (!campaign) return NextResponse.json({ error: "Active agent campaign not found." }, { status: 400 });
    const allowed = (campaign.requiredPartnerTypes || "").split(",").map(v => v.trim().toUpperCase()).filter(Boolean);
    if (allowed.length && !allowed.includes("AGENT")) return NextResponse.json({ error: "This campaign does not accept referral agents." }, { status: 403 });
  }

  const registration = await prisma.agentDealRegistration.create({
    data: {
      id: randomUUID(), workspaceId: partner.workspaceId, partnerId: partner.id, leadId,
      programId, campaignId, claimReason, status: "SUBMITTED",
    },
    include: { lead: true, workEvidence: true },
  });
  return NextResponse.json({ registration }, { status: 201 });
}

export async function GET(req: Request) {
  const user = await authorizePermission("partner.portal.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const partner = await prisma.partner.findFirst({ where: { user: { is: { id: user.id } } } });
  if (!partner) return NextResponse.json({ error: "Partner account is not linked." }, { status: 404 });
  const registrations = await prisma.agentDealRegistration.findMany({
    where: { workspaceId: partner.workspaceId, partnerId: partner.id },
    include: { lead: { select: { id: true, name: true, status: true, createdAt: true } }, workEvidence: { orderBy: { occurredAt: "desc" } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return NextResponse.json({ registrations });
}
