import { redirect } from "next/navigation";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { UnifiedOfferStudio } from "@/components/UnifiedOfferStudio";
export const dynamic="force-dynamic";
export default async function CatalogOffersPage({searchParams}:{searchParams:Promise<{workspaceId?:string}>}){
 const {workspaceId}=await searchParams;
 const access=await authorizeWorkspacePermission("catalog.view",workspaceId);
 if(!access)return <div className="dashboard-empty"><div className="dashboard-feature-card"><span className="dashboard-kicker">UNIFIED CATALOG</span><h2>Workspace access unavailable</h2><p>Select a business you are authorized to operate.</p></div></div>;
 return <UnifiedOfferStudio workspaceId={access.workspace.id} workspaceName={access.workspace.name}/>;
}
