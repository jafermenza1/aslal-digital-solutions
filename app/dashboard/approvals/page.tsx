import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

export const dynamic="force-dynamic";

type Approval={id:string;kind:string;title:string;detail:string;status:string;href:string;submittedAt:Date|null};

export default async function ApprovalsPage(){
 const access=await authorizeWorkspacePermission("dashboard.view");
 if(!access)return <div className="p-8">No active workspace is available.</div>;
 const wid=access.workspace.id;
 const canListings=access.user.permissions.includes("listings.manage");
 const canPartners=access.user.permissions.includes("partners.manage");
 const [listings,profiles]=await Promise.all([
  canListings?prisma.commercialListing.findMany({where:{workspaceId:wid,status:"PENDING_REVIEW"},select:{id:true,title:true,listingType:true,category:true,createdAt:true},orderBy:{createdAt:"asc"},take:100}):Promise.resolve([]),
  canListings?prisma.professionalProfile.findMany({where:{workspaceId:wid,status:"PENDING_REVIEW"},select:{id:true,displayName:true,profession:true,createdAt:true},orderBy:{createdAt:"asc"},take:100}):Promise.resolve([])
 ]);
 const items:Approval[]=[
  ...listings.map(x=>({id:x.id,kind:"Marketplace",title:x.title,detail:`${x.listingType} · ${x.category}`,status:"Pending review",href:`/dashboard/listings/${encodeURIComponent(x.id)}`,submittedAt:x.createdAt})),
  ...profiles.map(x=>({id:x.id,kind:"Professional",title:x.displayName,detail:x.profession,status:"Pending review",href:`/dashboard/partners?tab=professionals&profile=${encodeURIComponent(x.id)}`,submittedAt:x.createdAt}))
 ].sort((a,b)=>(a.submittedAt?.getTime()||0)-(b.submittedAt?.getTime()||0));
 return <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
  <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">WORK QUEUE</div><h1 className="mt-2 text-3xl font-black tracking-tight dark:text-white">Approvals</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-300">One review queue for work that must be checked before it becomes publicly available. Specialist records remain the source of truth.</p></div><Link href="/dashboard/admin-center" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black dark:border-white/10 dark:text-white">← Admin Center</Link></header>
  <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-bold text-slate-500">Waiting</div><div className="mt-1 text-3xl font-black dark:text-white">{items.length}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-bold text-slate-500">Marketplace</div><div className="mt-1 text-3xl font-black dark:text-white">{listings.length}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"><div className="text-xs font-bold text-slate-500">Professionals</div><div className="mt-1 text-3xl font-black dark:text-white">{profiles.length}</div></div></section>
  <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
   <div className="border-b border-slate-200 p-5 dark:border-white/10"><h2 className="font-black dark:text-white">Needs your decision</h2><p className="mt-1 text-xs text-slate-500">Open each item in its existing review surface; approval rights remain enforced by the underlying workflow.</p></div>
   <div className="divide-y divide-slate-100 dark:divide-white/5">
    {items.map(item=><div key={item.kind+item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.15em] text-[#0F3E8A]">{item.kind}</div><div className="mt-1 truncate font-black dark:text-white">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.detail} · {item.status}</div></div><Link href={item.href} className="shrink-0 rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-center text-xs font-black text-white">Review →</Link></div>)}
    {!items.length&&<div className="p-12 text-center text-sm text-slate-500">Nothing is waiting for review in this workspace.</div>}
   </div>
  </section>
 </main>;
}
