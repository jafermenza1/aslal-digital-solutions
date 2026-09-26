import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { getWorkspaceForUser } from "@/lib/workspaces";

export async function POST(request: Request) {
  const actor = await authorizePermission("dashboard.view");
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const workspaceId = String(body.workspaceId || "").trim();
  const workspace = await getWorkspaceForUser(actor, workspaceId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found or not authorized." }, { status: 403 });
  const response = NextResponse.json({ ok: true, workspace });
  response.cookies.set("aslal_workspace_id", workspace.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
