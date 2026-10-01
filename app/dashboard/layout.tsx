import { cookies } from "next/headers";
import { requirePermission } from "@/lib/authorization";
import { localeCookie, normalizeLocale } from "@/lib/i18n";
import { DashboardShell } from "@/components/DashboardShell";
import { getWorkspaceForUser, getWorkspacesForUser } from "@/lib/workspaces";
import { resolveWorkspacePermissions } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("dashboard.view");
  const store = await cookies();
  const locale = normalizeLocale(store.get(localeCookie)?.value);
  const currentWorkspace = await getWorkspaceForUser(user);
  const workspaces = await getWorkspacesForUser(user);
  const workspacePermissions = currentWorkspace
    ? resolveWorkspacePermissions(user.role, user.permissions, currentWorkspace.role)
    : [];
  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, role: user.role, permissions: user.permissions }}
      workspace={currentWorkspace}
      workspaces={workspaces}
      workspacePermissions={workspacePermissions}
      locale={locale}
    >
      {children}
    </DashboardShell>
  );
}
