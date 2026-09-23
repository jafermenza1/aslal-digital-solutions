import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import QuotesWorkspace from "./QuotesWorkspace";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  await requirePermission("leads.view");
  const [quotes, opportunities, customers] = await Promise.all([
    prisma.quote.findMany({
      include: { items: true, customer: true, opportunity: true, events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.opportunity.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: { id: true, name: true, expectedValue: true, currency: true, stage: true, ownerEmail: true, lead: { select: { name: true, company: true } } },
    }),
    prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true },
    }),
  ]);
  const safe = quotes.map(q => ({
    ...q,
    subtotal: Number(q.subtotal),
    discount: Number(q.discount),
    total: Number(q.total),
    items: q.items.map(i => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      discount: Number(i.discount),
      lineTotal: Number(i.lineTotal),
    })),
  }));
  return (
    <QuotesWorkspace
      initialQuotes={safe}
      opportunities={opportunities.map(o => ({
        id: o.id,
        name: o.name,
        expectedValue: Number(o.expectedValue ?? 0),
        currency: o.currency,
        stage: o.stage,
        ownerEmail: o.ownerEmail,
        leadName: o.lead.name,
        company: o.lead.company,
      }))}
      customers={customers}
    />
  );
}
