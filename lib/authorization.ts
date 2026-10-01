import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { UserRole } from "@prisma/client";
import { defaultPermissionsForRole, resolvePermissions, resolveWorkspacePermissions, type Permission } from "@/lib/permissions";

export type CurrentUser = {
  id: string; email: string; name: string; role: UserRole; active: boolean;
  permissions: Permission[]; legacyAdmin: boolean;
  workspaceId: string | null; workspaceName: string | null; workspaceRole: string | null;
};

const effectivePermissions = resolvePermissions;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.email.trim().toLowerCase() },
      select: { id:true,email:true,name:true,role:true,active:true,permissions:true,
        workspaceUsers:{ where:{ status:"ACTIVE", workspace:{ active:true } }, select:{ role:true,workspace:{ select:{ id:true,name:true } } } } },
    });
    if (user) {
      if (!user.active) return null;
      const storedWorkspaceId = (await cookies()).get("aslal_workspace_id")?.value || "";
      const membership = user.workspaceUsers.find(m => !storedWorkspaceId || m.workspace.id === storedWorkspaceId) || user.workspaceUsers[0] || null;
      const workspaceId = membership?.workspace.id || null;
      const workspaceName = membership?.workspace.name || null;
      const workspaceRole = membership?.role || null;
      const permissions = workspaceRole
        ? resolveWorkspacePermissions(user.role, user.permissions, workspaceRole)
        : effectivePermissions(user.role,user.permissions);
      return { id:user.id,email:user.email,name:user.name,role:user.role,active:user.active,permissions,legacyAdmin:false,workspaceId,workspaceName,workspaceRole };
    }
  } catch {}
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (adminEmail && session.email.trim().toLowerCase() === adminEmail) {
    return { id:"legacy-admin",email:session.email,name:"Aslal Administrator",role:UserRole.SUPER_ADMIN,active:true,
      permissions:defaultPermissionsForRole(UserRole.SUPER_ADMIN),legacyAdmin:true,workspaceId:null,workspaceName:null,workspaceRole:"ADMIN" };
  }
  return null;
}
export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user || !user.permissions.includes(permission)) redirect("/login?error=unauthorized");
  return user;
}
export async function authorizePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user || !user.permissions.includes(permission)) return null;
  return user;
}