import { db } from "@/lib/db";
import { authorizePermission, type CurrentUser } from "@/lib/authorization";

export const INTERNAL_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export type WorkspaceContext = {
  id: string;
  name: string;
  slug: string;
  clientType: string | null;
};

export async function getWorkspaceForUser(user: CurrentUser, workspaceId?: string | null): Promise<WorkspaceContext | null> {
  const requested = String(workspaceId || "").trim() || INTERNAL_WORKSPACE_ID;
  const [rows] = await db.query<any[]>(
    `SELECT w.id,w.name,w.slug,w.client_type
       FROM workspaces w
       JOIN workspace_users wu ON wu.workspace_id=w.id
      WHERE wu.user_id=? AND w.id=? AND w.active=1
      LIMIT 1`,
    [user.id === "legacy-admin" ? null : user.id, requested]
  );
  if (rows[0]) return rows[0] as WorkspaceContext;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    const [admins] = await db.query<any[]>(
      `SELECT id,name,slug,client_type FROM workspaces WHERE id=? AND active=1 LIMIT 1`,
      [requested]
    );
    return admins[0] || null;
  }
  return null;
}

export async function authorizeWorkspacePermission(permission:"dashboard.view"|"customers.view"|"leads.view"|"leads.create"|"leads.edit"|"customers.view"|"commerce.view"|"commerce.manage"|"partners.manage"|"operations.view"|"insights.view", workspaceId?:string|null) {
  const user = await authorizePermission(permission);
  if (!user) return null;
  const workspace = await getWorkspaceForUser(user, workspaceId);
  if (!workspace) return null;
  return { user, workspace };
}
