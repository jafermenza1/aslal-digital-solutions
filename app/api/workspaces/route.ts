import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.legacyAdmin) {
    const workspaces = await prisma.workspace.findMany({ where: { active: true }, select: { id:true,name:true,slug:true }, orderBy: { name:"asc" } });
    return NextResponse.json({ workspaces, activeWorkspaceId: null });
  }
  const memberships = await prisma.workspaceUser.findMany({
    where: { userId: user.id, workspace: { active: true } },
    select: { role:true, workspace:{ select:{ id:true,name:true,slug:true } } },
    orderBy: { workspace:{ name:"asc" } },
  });
  return NextResponse.json({ workspaces: memberships.map(m => ({ ...m.workspace, role:m.role })), activeWorkspaceId:user.workspaceId });
}