import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { requirePartnerAttributionWorkspace } from "@/lib/workspace-boundary";
import { resolveAffiliateAttributionForLead } from "@/lib/affiliate-engine";
import { resolveAcceptedAgentDeal } from "@/lib/agent-engine";

function orderNumber() {
  return `SO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const access = await authorizeWorkspacePermission("leads.edit", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  try {
    const quoteId = String(body.quoteId || "");
    if (!quoteId) return NextResponse.json({ error: "quoteId is required" }, { status: 400 });

    const existing = await prisma.order.findFirst({
      where: { quoteId, workspaceId: access.workspace.id },
      include: { items: { orderBy: { sortOrder: "asc" } }, payments: { orderBy: { createdAt: "asc" } } },
    });
    if (existing) return NextResponse.json({ order: existing, alreadyExists: true });

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, workspaceId: access.workspace.id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        customer: true,
        opportunity: { include: { customer: true, lead: true } },
      },
    });
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    requireSameWorkspace(access.workspace.id, quote.workspaceId);
    if (quote.customer) requireSameWorkspace(access.workspace.id, quote.customer.workspaceId);
    if (quote.opportunity) {
      requireSameWorkspace(access.workspace.id, quote.opportunity.workspaceId);
      if (quote.opportunity.customer) requireSameWorkspace(access.workspace.id, quote.opportunity.customer.workspaceId);
      if (quote.opportunity.lead) requireSameWorkspace(access.workspace.id, quote.opportunity.lead.workspaceId);
    }
    if (quote.status !== "ACCEPTED") return NextResponse.json({ error: "Only an accepted quote can become an order." }, { status: 409 });

    const promoCode = typeof body.promoCode === "string" ? body.promoCode.trim().slice(0, 100) : null;
    const resolvedAttribution = quote.opportunity?.lead
      ? await resolveAffiliateAttributionForLead({
          workspaceId: access.workspace.id,
          leadId: quote.opportunity.lead.id,
          referralCode: quote.opportunity.referralCode || null,
          promoCode,
        })
      : null;
    const acceptedAgentDeal = quote.opportunity?.lead
      ? await resolveAcceptedAgentDeal({ workspaceId: access.workspace.id, leadId: quote.opportunity.lead.id })
      : null;
    const useAgentAttribution = Boolean(acceptedAgentDeal && (!resolvedAttribution || resolvedAttribution.policy === "DEAL_REGISTRATION"));

    let selfReferralBlocked = false;
    const order = await prisma.$transaction(async (tx) => {
      let customer = quote.customer || quote.opportunity?.customer || null;
      if (!customer && quote.opportunity?.lead) {
        const lead = quote.opportunity.lead;
        const duplicate = await tx.customer.findFirst({
          where: {
            workspaceId: access.workspace.id,
            OR: [
              ...(lead.email ? [{ email: lead.email.toLowerCase() }] : []),
              ...(lead.phone ? [{ phone: lead.phone }] : []),
            ],
          },
          orderBy: { createdAt: "asc" },
        });
        customer = duplicate || await tx.customer.create({
          data: {
            id: randomUUID(),
            workspaceId: access.workspace.id,
            personId: lead.personId || undefined,
            opportunityId: quote.opportunity.id,
            name: lead.name,
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            status: "ACTIVE",
          },
        });
      }
      if (!customer) throw new Error("An accepted quote must have a customer before it can become an order.");
      requireSameWorkspace(access.workspace.id, customer.workspaceId);

      const opportunity = quote.opportunity;
      const referralCode = useAgentAttribution ? null : (resolvedAttribution?.referralCode || opportunity?.referralCode || null);
      const referral = resolvedAttribution && !useAgentAttribution
        ? await tx.referralLink.findFirst({
            where: { id: resolvedAttribution.referralLinkId, workspaceId: access.workspace.id, partnerId: resolvedAttribution.partnerId },
            select: { id: true, partnerId: true, campaign: true, workspaceId: true, partner: { select: { workspaceId: true, email: true, phone: true } } },
          })
        : null;
      if (resolvedAttribution && !referral) throw new Error("Resolved referral link is not owned by this workspace.");
      if (referral) {
        requirePartnerAttributionWorkspace(access.workspace.id, referral.workspaceId, referral.partner.workspaceId);
        const customerEmail = customer.email?.trim().toLowerCase() || null;
        const customerPhone = customer.phone?.trim() || null;
        const partnerEmail = referral.partner.email?.trim().toLowerCase() || null;
        const partnerPhone = referral.partner.phone?.trim() || null;
        if ((customerEmail && partnerEmail && customerEmail === partnerEmail) || (customerPhone && partnerPhone && customerPhone === partnerPhone)) {
          selfReferralBlocked = true;
        }
      }

      const created = await tx.order.create({
        data: {
          id: randomUUID(), workspaceId: access.workspace.id, orderNumber: orderNumber(),
          quoteId: quote.id, customerId: customer.id, opportunityId: quote.opportunityId || undefined,
          status: "CONFIRMED", currency: quote.currency, subtotal: quote.subtotal, discount: quote.discount, total: quote.total,
          paymentState: "INITIATED", source: opportunity?.source || undefined,
          campaign: opportunity?.campaign || referral?.campaign || undefined,
          referralCode: selfReferralBlocked ? undefined : (referralCode || undefined),
          promoCode: promoCode || undefined,
          partnerId: selfReferralBlocked ? undefined : (useAgentAttribution ? acceptedAgentDeal!.partnerId : (resolvedAttribution?.partnerId || referral?.partnerId || undefined)),
          agentDealRegistrationId: selfReferralBlocked ? undefined : (useAgentAttribution ? acceptedAgentDeal!.id : undefined),
          referralLinkId: selfReferralBlocked || useAgentAttribution ? undefined : (resolvedAttribution?.referralLinkId || referral?.id || undefined),
          salesOwnerEmail: opportunity?.ownerEmail || access.user.email, confirmedAt: new Date(),
          items: { create: quote.items.map((item) => ({
            id: randomUUID(), description: item.description, quantity: item.quantity, unitPrice: item.unitPrice,
            discount: item.discount, lineTotal: item.lineTotal, sortOrder: item.sortOrder,
          })) },
        },
        include: { items: { orderBy: { sortOrder: "asc" } }, payments: true },
      });
      return created;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
