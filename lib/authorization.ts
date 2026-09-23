import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { UserRole } from "@prisma/client";
import { defaultPermissionsForRole, type Permission } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  permissions: Permission[];
  legacyAdmin: boolean;
};

function effectivePermissions(role: UserRole, raw: unknown) {
  const base = new Set(defaultPermissionsForRole(role));
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const data = raw as { grant?: unknown; revoke?: unknown };
    if (Array.isArray(data.grant)) for (const item of data.grant) if (typeof item === "string") base.add(item as Permission);
    if (Array.isArray(data.revoke)) for (const item of data.revoke) if (typeof item === "string") base.delete(item as Permission);
  }
  return [...base];
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.email.trim().toLowerCase() },
      select: { id:true,email:true,name:true,role:true,active:true,permissions:true },
    });
    if (user) {
      if (!user.active) return null;
      return { ...user, permissions: effectivePermissions(user.role,user.permissions), legacyAdmin:false };
    }
  } catch {
    // Before the user migration is installed, retain the existing env-admin login path.
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (adminEmail && session.email.trim().toLowerCase() === adminEmail) {
    return {
      id: "legacy-admin",
      email: session.email,
      name: "Aslal Administrator",
      role: UserRole.SUPER_ADMIN,
      active: true,
      permissions: defaultPermissionsForRole(UserRole.SUPER_ADMIN),
      legacyAdmin: true,
    };
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