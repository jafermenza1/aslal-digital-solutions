import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { AdminTelegramSales } from "@/components/AdminTelegramSales";
import { TelegramMiniAppSettings } from "@/components/TelegramMiniAppSettings";
export const dynamic="force-dynamic";
export default async function TelegramSalesPage({searchParams}:{searchParams:Promise<{workspaceId?:string}>}){
 const {workspaceId}=await searchParams; const access=await authorizeWorkspacePermission("leads.view",workspaceId);
 if(!access)return <div className="dashboard-empty"><div className="dashboard-feature-card"><span className="dashboard-kicker">TELEGRAM SALES</span><h2>Workspace access unavailable</h2><p>Select a workspace you are authorized to operate.</p></div></div>;
 return <div className="space-y-6"><AdminTelegramSales workspaceId={access.workspace.id} workspaceName={access.workspace.name}/><TelegramMiniAppSettings workspaceId={access.workspace.id}/></div>;
}