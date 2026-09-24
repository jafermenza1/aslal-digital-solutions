import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import OrdersWorkspace from "./OrdersWorkspace";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requirePermission("leads.view");
  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      opportunity: { select: { id: true, name: true, ownerEmail: true, referralCode: true } },
      partner: { select: { id: true, partnerNumber: true, name: true } },
      referralLink: { select: { id: true, code: true, campaign: true, productSlug: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const safe = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    total: Number(o.total),
    items: o.items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), discount: Number(i.discount), lineTotal: Number(i.lineTotal) })),
    payments: o.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  }));
  return <OrdersWorkspace initialOrders={safe} />;
}
