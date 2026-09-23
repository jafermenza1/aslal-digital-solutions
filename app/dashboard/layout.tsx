import { cookies } from "next/headers";
import { requirePermission } from "@/lib/authorization";
import { localeCookie, normalizeLocale } from "@/lib/i18n";
import { DashboardShell } from "@/components/DashboardShell";

export const dynamic="force-dynamic";

export default async function DashboardLayout({children}:{children:React.ReactNode}){const user=await requirePermission("dashboard.view");const store=await cookies();const locale=normalizeLocale(store.get(localeCookie)?.value);return <DashboardShell user={{name:user.name,email:user.email,role:user.role,permissions:user.permissions}} locale={locale}>{children}</DashboardShell>;}
