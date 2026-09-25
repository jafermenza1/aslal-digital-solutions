import { requirePermission } from "@\/lib\/authorization";
import { prisma } from "@\/lib\/prisma";
import OrdersWorkspace from "./OrdersWorkspace";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const access = await authorizeWorkspacePermission("commerce.view", (await searchParams).workspaceId);
  if (!access) redirect("/dashboard");
  const orders = await prisma.order.findMany({
    where: { workspaceId: access.workspace.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      opportunity: { select: { id: true, name: true, ownerEmail: true, referralCode: true } },
      partner: { select: { id: true, partnerNumber: true, name: true } },
      referralLink: { select: { id: true, code: true, campaign: true, productSlug: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: {
        orderBy: { createdAt: "asc" },
        include: {
          revenue: true,
          commission: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const safe = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    total: Number(o.total),
    items: o.items.map((i) => ({
      ...i,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      discount: Number(i.discount),
      lineTotal: Number(i.lineTotal),
    })),
    payments: o.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      revenue: p.revenue
        ? {
            ...p.revenue,
            collectedAmount: Number(p.revenue.collectedAmount),
            recognizedAmount: Number(p.revenue.recognizedAmount),
            commissionableAmount: Number(p.revenue.commissionableAmount),
          }
        : null,
      commission: p.commission
        ? {
            ...p.commission,
            amount: Number(p.commission.amount),
          }
        : null,
    })),
  }));
  return <OrdersWorkspace initialOrders={safe} />;
}
