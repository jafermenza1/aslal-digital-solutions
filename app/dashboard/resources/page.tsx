import { requirePermission } from "@/lib/authorization";
import ResourceManager from "@/components/ResourceManager";
export const dynamic="force-dynamic";
export default async function ResourcesAdminPage(){await requirePermission("content.manage");return <ResourceManager/>;}
