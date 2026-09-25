import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const access = await authorizeWorkspacePermission("leads.view", searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const status = searchParams.get("status") || undefined;
  const orders = await prisma.order.findMany({
    where: { workspaceId: access.workspace.id, ...(status ? { status: status as never } : {}) },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      opportunity: { select: { id: true, name: true, ownerEmail: true, referralCode: true } },
      partner: { select: { id: true, partnerNumber: true, name: true } },
      referralLink: { select: { id: true, code: true, campaign: true, productSlug: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { createdAt: "asc" }, include: { revenue: true, commission: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
