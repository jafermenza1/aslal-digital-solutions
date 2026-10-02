import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { authorizePermission, type CurrentUser } from "@/lib/authorization";
import type { Permission } from "@/lib/permissions";

export const INTERNAL_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
export function resolvePublicWorkspaceId(hostname?: string | null) {
  const host = String(hostname || "").trim().toLowerCase().split(":")[0];
  const raw = process.env.ASLAL_PUBLIC_WORKSPACE_MAP;
  if (raw) {
    try {
      const map = JSON.parse(raw) as Record<string, unknown>;
      const configured = host && typeof map[host] === "string" ? String(map[host]).trim() : "";
      if (configured) return configured;
    } catch {
      // Invalid deployment configuration must fail closed to the internal workspace.
    }
  }
  return INTERNAL_WORKSPACE_ID;
}


export type WorkspaceContext = {
  id: string;
  name: string;
  slug: string;
  clientType: string | null;
};

export async function getWorkspaceForUser(user: CurrentUser, workspaceId?: string | null): Promise<WorkspaceContext | null> {
  const stored = workspaceId ? "" : (await cookies()).get("aslal_workspace_id")?.value || "";
  const requested = String(workspaceId || stored).trim() || INTERNAL_WORKSPACE_ID;
  const [rows] = await db.query<any[]>(
    `SELECT w.id,w.name,w.slug,w.client_type
       FROM workspaces w
       JOIN workspace_users wu ON wu.workspace_id=w.id
      WHERE wu.user_id=? AND w.id=? AND w.active=1 AND wu.status='ACTIVE'
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

export async function authorizeWorkspacePermission(permission: Permission, workspaceId?:string|null) {
  const user = await authorizePermission(permission);
  if (!user) return null;
  const workspace = await getWorkspaceForUser(user, workspaceId);
  if (!workspace) return null;
  return { user, workspace };
}
