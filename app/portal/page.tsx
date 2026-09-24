import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function ClientPortal() {
  await requirePermission("partner.portal.view");
  redirect("/dashboard/partner");
}
