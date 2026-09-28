import { NextResponse } from "next/server";
import { prisma, LeadStatus } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const PAGE_SIZE = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const where = {
    workspaceId: access.workspace.id,
    ...(status && Object.values(LeadStatus).includes(status as LeadStatus) ? { status: status as LeadStatus } : {}),
    ...(q ? { OR: [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { company: { contains: q } },
    ] } : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, email: true, phone: true, company: true,
        businessType: true, status: true, score: true, source: true,
        campaign: true, referralCode: true, ownerEmail: true,
        nextAction: true, nextActionDueAt: true, dealValue: true,
        captureMode: true, createdAt: true, updatedAt: true,
        tasks: {
          where: { status: { not: "DONE" } },
          orderBy: { dueAt: "asc" },
          take: 3,
          select: { id: true, title: true, status: true, priority: true, dueAt: true, assignedTo: true },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    workspaceId: access.workspace.id,
    page,
    pageSize: PAGE_SIZE,
    total,
    leads,
  });
}
