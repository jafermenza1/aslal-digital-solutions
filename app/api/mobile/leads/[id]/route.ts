import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("leads.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });

  const lead = await prisma.lead.findFirst({
    where: { id, workspaceId: access.workspace.id },
    select: {
      id: true, workspaceId: true, visitorId: true, personId: true,
      name: true, email: true, phone: true, telegramUsername: true,
      company: true, businessType: true, message: true, status: true,
      score: true, source: true, medium: true, campaign: true,
      ownerEmail: true, nextAction: true, nextActionDueAt: true,
      referralCode: true, dealValue: true, captureMode: true,
      leadCategory: true, wonAt: true, createdAt: true, updatedAt: true,
      tasks: {
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        take: 50,
        select: { id: true, title: true, description: true, status: true, priority: true, dueAt: true, completedAt: true, assignedTo: true, createdAt: true },
      },
      stageHistory: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, fromStage: true, toStage: true, changedBy: true, note: true, createdAt: true },
      },
      productInterests: {
        orderBy: { interestScore: "desc" },
        take: 10,
        select: { id: true, interestScore: true, product: { select: { id: true, slug: true, name: true, kind: true } } },
      },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 10,
        select: { id: true, channel: true, status: true, assignedTo: true, lastMessageAt: true, updatedAt: true },
      },
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  return NextResponse.json({ lead });
}
