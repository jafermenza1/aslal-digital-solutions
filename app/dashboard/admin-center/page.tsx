import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";

export const dynamic="force-dynamic";

type QueueItem={kind:string;title:string;detail:string;count:number;href:string;action:string};

export default async function AdminCenterPage(){
 const user=await requirePermission("dashboard.view");
 const can=(p:string)=>user.permissions.includes(p);
 const [listingPending,professionalPending,partnerPending,payoutPending,failedPayments,users,workspaces]=await Promise.all([
  can("listings.manage")?prisma.commercialListing.count({where:{status:"PENDING_REVIEW"}}):Promise.resolve(0),
  can("listings.manage")?prisma.professionalProfile.count({where:{status:"PENDING_REVIEW"}}):Promise.resolve(0),
  can("partners.manage")?prisma.partner.count({where:{verificationStatus:"REGISTERED"}}):Promise.resolve(0),
  can("commissions.manage")?prisma.partnerPayout.count({where:{status:"PENDING"}}):Promise.resolve(0),
  can("commerce.view")?prisma.payment.count({where:{status:"FAILED"}}):Promise.resolve(0),
  can("users.manage")?prisma.user.count({where:{active:true}}):Promise.resolve(0),
  can("users.manage")?prisma.workspace.count({where:{active:true}}):Promise.resolve(0),
 ]);
 const queues:QueueItem[]=[
  {kind:"Marketplace",title:"Product & service listings",detail:"Submitted by permitted business owners and professionals.",count:listingPending,href:"/dashboard/listings",action:"Review listings"},
  {kind:"People",title:"Professional profiles",detail:"Profiles waiting for Aslal review before publication.",count:professionalPending,href:"/dashboard/partners?tab=verification",action:"Review profiles"},
  {kind:"Partners",title:"Partner verification",detail:"Registrations requiring verification or activation.",count:partnerPending,href:"/dashboard/partners",action:"Review partners"},
  {kind:"Finance",title:"Payout queue",detail:"Payout batches that still need operational handling.",count:payoutPending,href:"/dashboard/finance",action:"Open finance"},
  {kind:"Payments",title:"Failed payments",detail:"Payment failures that may interrupt a customer journey.",count:failedPayments,href:"/dashboard/orders",action:"Investigate"},
 ];
 const total=queues.reduce((n,x)=>n+x.count,0);
 return <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">
   <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
    <div><span className="text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">ASLAL ADMIN CENTER</span><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">What needs attention?</h2><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-300">One operational starting point for approvals, people, commerce and finance. Existing specialist screens remain available from each work item.</p></div>
    <div className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800"><div className="text-xs font-bold text-slate-500">Open work</div><div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{total}</div></div>
   </div>
  </section>
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {queues.map(q=><article key={q.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
    <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{q.kind}</div>
    <div className="mt-3 flex items-start justify-between gap-4"><div><h3 className="font-black text-slate-950 dark:text-white">{q.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">{q.detail}</p></div><span className={`min-w-10 rounded-full px-3 py-1 text-center text-sm font-black ${q.count?"bg-[#E2B02A]/15 text-[#8a6800]":"bg-slate-100 text-slate-500"}`}>{q.count}</span></div>
    <Link href={q.href} className="mt-5 inline-flex rounded-xl bg-[#0F3E8A] px-4 py-2.5 text-xs font-black text-white hover:opacity-90">{q.action} →</Link>
   </article>)}
  </section>
  <section className="grid gap-4 lg:grid-cols-2">
   <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
    <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">MANAGE</div><h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">People & workspaces</h3>
    <div className="mt-4 grid grid-cols-2 gap-3"><Link href="/dashboard/users" className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"><strong className="block text-2xl font-black">{users}</strong><span className="text-xs text-slate-500">Active users</span></Link><Link href="/dashboard/workspaces" className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"><strong className="block text-2xl font-black">{workspaces}</strong><span className="text-xs text-slate-500">Active workspaces</span></Link></div>
   </div>
   <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
    <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">DIRECT ACTIONS</div><h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Go straight to the work</h3>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{[
      ["Marketplace","/dashboard/listings"],["Partners","/dashboard/partners"],["Orders & sales","/dashboard/orders"],["Finance","/dashboard/finance"],["Reports","/dashboard/reports"],["Audit / operations","/dashboard/operations"]
    ].map(([label,href])=><Link key={href} href={href} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-[#0F3E8A] hover:text-[#0F3E8A] dark:border-white/10 dark:text-slate-200">{label} →</Link>)}</div>
   </div>
  </section>
 </div>;
}
