import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.legacyAdmin) {
    const workspaces = await prisma.workspace.findMany({ where: { active: true }, select: { id:true,name:true,slug:true }, orderBy: { name:"asc" } });
    return NextResponse.json({ workspaces, activeWorkspaceId: workspaces.some(w => w.id === INTERNAL_WORKSPACE_ID) ? INTERNAL_WORKSPACE_ID : (workspaces[0]?.id || null) });
  }
  const memberships = await prisma.workspaceUser.findMany({
    where: { userId: user.id, workspace: { active: true } },
    select: { role:true, workspace:{ select:{ id:true,name:true,slug:true } } },
    orderBy: { workspace:{ name:"asc" } },
  });
  const workspaceRows = memberships.map(m => ({ ...m.workspace, role:m.role }));
  const activeWorkspaceId = user.workspaceId || (workspaceRows.some(w => w.id === INTERNAL_WORKSPACE_ID) ? INTERNAL_WORKSPACE_ID : (workspaceRows[0]?.id || null));
  return NextResponse.json({ workspaces: workspaceRows, activeWorkspaceId });
}