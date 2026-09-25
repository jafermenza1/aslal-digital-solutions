import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

function quoteNumber() {
  return `QT-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${randomUUID().slice(0,8).toUpperCase()}`;
}
function money(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error("Invalid monetary value");
  return n;
}
function calculate(items: Array<{quantity?: unknown; unitPrice?: unknown; discount?: unknown}>, discount: unknown) {
  const normalized = items.map((item, i) => {
    const quantity = Number(item.quantity ?? 1);
    const unitPrice = money(item.unitPrice);
    const lineDiscount = money(item.discount ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error(`Invalid quantity at item ${i + 1}`);
    const lineTotal = Math.max(0, quantity * unitPrice - lineDiscount);
    return { quantity, unitPrice, discount: lineDiscount, lineTotal };
  });
  const subtotal = normalized.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const quoteDiscount = money(discount ?? 0);
  const total = Math.max(0, subtotal - normalized.reduce((s, i) => s + i.discount, 0) - quoteDiscount);
  return { normalized, subtotal, quoteDiscount, total };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const access = await authorizeWorkspacePermission("leads.view", searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId") || undefined;
  const customerId = searchParams.get("customerId") || undefined;
  const quotes = await prisma.quote.findMany({
    where: { workspaceId: access.workspace.id, ...(opportunityId ? { opportunityId } : {}), ...(customerId ? { customerId } : {}) },
    include: { items: { orderBy: { sortOrder: "asc" } }, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const body = await request.json();
  const access = await authorizeWorkspacePermission("leads.edit", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  try {

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ error: "At least one quote item is required" }, { status: 400 });
    if (!body.opportunityId && !body.customerId) return NextResponse.json({ error: "Opportunity or customer is required" }, { status: 400 });
    const calc = calculate(items, body.discount);
    const quote = await prisma.$transaction(async (tx) => {
      if (body.opportunityId) { const opportunity = await tx.opportunity.findFirst({ where: { id: String(body.opportunityId), workspaceId: access.workspace.id }, select: { id: true } }); if (!opportunity) throw new Error("Opportunity not found in this workspace."); }
      if (body.customerId) { const customer = await tx.customer.findFirst({ where: { id: String(body.customerId), workspaceId: access.workspace.id }, select: { id: true } }); if (!customer) throw new Error("Customer not found in this workspace."); }
      const created = await tx.quote.create({
        data: {
          id: randomUUID(),
          workspaceId: access.workspace.id,
          quoteNumber: quoteNumber(),
          customerId: body.customerId || undefined,
          opportunityId: body.opportunityId || undefined,
          currency: String(body.currency || "ETB").toUpperCase(),
          subtotal: calc.subtotal,
          discount: calc.quoteDiscount,
          total: calc.total,
          terms: body.terms ? String(body.terms) : undefined,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          createdBy: access.user.email,
          items: { create: calc.normalized.map((item, i) => ({ id: randomUUID(), description: String(items[i].description || ""), quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount, lineTotal: item.lineTotal, sortOrder: i })) },
        },
        include: { items: true },
      });
      await tx.negotiationEvent.create({ data: { id: randomUUID(), quoteId: created.id, type: "CREATED", actor: access.user.email, snapshot: { id: created.id, quoteNumber: created.quoteNumber, status: created.status, currency: created.currency, subtotal: String(created.subtotal), discount: String(created.discount), total: String(created.total), version: created.version } } });
      return created;
    });
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create quote";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
