import { requirePermission } from "@/lib/authorization";
import { CommercialAnalyticsDashboard } from "@/components/CommercialAnalyticsDashboard";
export const dynamic="force-dynamic";
export default async function CommercialAnalyticsPage(){
 const user=await requirePermission("commerce.view");
 return <main className="dashboard-page min-h-screen py-10"><div className="container-aslal"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#D97706]">Growth OS / Commercial Engine / CE-13</div><h1 className="mt-2 text-4xl font-black tracking-tight">Commercial Analytics</h1><p className="mt-2 max-w-3xl text-slate-500">Workspace-scoped supply, demand, conversion, attribution, revenue and commission reporting. Analytics never writes commercial outcomes.</p><span className="mt-3 inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">{user.workspaceName||"Workspace"}</span></div><CommercialAnalyticsDashboard/></div></main>;
}