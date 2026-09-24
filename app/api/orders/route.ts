import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function GET(request: Request) {
  const user = await authorizePermission("leads.view");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      opportunity: { select: { id: true, name: true, ownerEmail: true, referralCode: true } },
      partner: { select: { id: true, partnerNumber: true, name: true } },
      referralLink: { select: { id: true, code: true, campaign: true, productSlug: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
