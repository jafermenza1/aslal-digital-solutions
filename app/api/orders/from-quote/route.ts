import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

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

    const existing = await prisma.order.findUnique({
      where: { quoteId, workspaceId: access.workspace.id },
      include: { items: { orderBy: { sortOrder: "asc" } }, payments: { orderBy: { createdAt: "asc" } } },
    });
    if (existing) return NextResponse.json({ order: existing, alreadyExists: true });

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId, workspaceId: access.workspace.id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        customer: true,
        opportunity: { include: { customer: true, lead: true } },
      },
    });
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (quote.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Only an accepted quote can become an order." }, { status: 409 });
    }

    const order = await prisma.$transaction(async (tx) => {
      let customer = quote.customer || quote.opportunity?.customer || null;
      if (!customer && quote.opportunity?.lead) {
        const lead = quote.opportunity.lead;
        customer = await tx.customer.create({
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
      if (!customer) {
        throw new Error("An accepted quote must have a customer before it can become an order.");
      }

      const opportunity = quote.opportunity;
      const referralCode = opportunity?.referralCode || null;
      const referral = referralCode
        ? await tx.referralLink.findUnique({ where: { code: referralCode }, select: { id: true, partnerId: true, campaign: true, workspaceId: true } })
        : null;

      const created = await tx.order.create({
        data: {
          id: randomUUID(),
          workspaceId: access.workspace.id,
          orderNumber: orderNumber(),
          quoteId: quote.id,
          customerId: customer.id,
          opportunityId: quote.opportunityId || undefined,
          status: "CONFIRMED",
          currency: quote.currency,
          subtotal: quote.subtotal,
          discount: quote.discount,
          total: quote.total,
          paymentState: "INITIATED",
          source: opportunity?.source || undefined,
          campaign: opportunity?.campaign || referral?.campaign || undefined,
          referralCode: referralCode || undefined,
          partnerId: referral?.partnerId || undefined,
          referralLinkId: referral?.id || undefined,
          salesOwnerEmail: opportunity?.ownerEmail || access.user.email,
          confirmedAt: new Date(),
          items: {
            create: quote.items.map((item) => ({
              id: randomUUID(),
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              lineTotal: item.lineTotal,
              sortOrder: item.sortOrder,
            })),
          },
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
