import Link from "next/link";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { EmailQueueManager } from "@/components/EmailQueueManager";

export const dynamic="force-dynamic";

export default async function EmailQueuePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 const workspaceId=typeof params.workspaceId==="string"?params.workspaceId:"";
 const access=await authorizeWorkspacePermission("email.view",workspaceId);
 if(!access)return <main className="theme-panel-page min-h-screen py-8"><div className="mx-auto max-w-3xl px-4 sm:px-7"><div className="dashboard-feature-card"><span className="dashboard-kicker">EMAIL OPERATIONS</span><h1 className="mt-2 text-2xl font-black">Email operations unavailable</h1><p className="mt-2 text-sm opacity-70">Your current account does not have the email.view permission for this workspace. Ask a workspace administrator to grant Email Operations access.</p><Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-[#0F3E8A] px-4 py-3 text-sm font-black text-white">Return to dashboard</Link></div></div></main>;
 const emails=await prisma.emailOutbox.findMany({where:{workspaceId:access.workspace.id},orderBy:{createdAt:"desc"},take:200,select:{id:true,status:true,messageType:true,recipientAddress:true,subject:true,templateKey:true,failureReason:true,attemptCount:true,maxAttempts:true,nextAttemptAt:true,createdAt:true,updatedAt:true,leadId:true}});
 return <main className="theme-panel-page min-h-screen py-8"><div className="mx-auto max-w-[1400px] px-4 sm:px-7">
  <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="dashboard-kicker">Conversations / Email</div><h1 className="mt-2 text-3xl font-black sm:text-4xl">Email operations</h1><p className="mt-2 max-w-3xl text-sm leading-6 opacity-65">Durable outbox, provider failures, manual review, retries, templates, and delivery history — scoped to {access.workspace.name}.</p></div><div className="flex flex-wrap gap-2"><Link href="/dashboard/email-templates" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">Templates</Link><Link href="/dashboard/conversations" className="rounded-xl bg-[#0F3E8A] px-4 py-3 text-sm font-black text-white">Conversations</Link></div></header>
  <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-black uppercase tracking-wider text-slate-400">Total stored</div><div className="mt-2 text-3xl font-black">{emails.length}</div></div><div className="rounded-2xl border border-red-100 bg-red-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-red-500">Needs attention</div><div className="mt-2 text-3xl font-black text-red-700">{emails.filter(e=>e.status==="FAILED"||e.status==="DRAFT").length}</div></div><div className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-blue-600">Queued</div><div className="mt-2 text-3xl font-black text-[#0F3E8A]">{emails.filter(e=>e.status==="QUEUED").length}</div></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="text-xs font-black uppercase tracking-wider text-emerald-600">Sent</div><div className="mt-2 text-3xl font-black text-emerald-700">{emails.filter(e=>e.status==="SENT").length}</div></div></div>
  <div className="mt-7"><EmailQueueManager initial={emails.map(e=>({...e,createdAt:e.createdAt.toISOString(),updatedAt:e.updatedAt.toISOString(),nextAttemptAt:e.nextAttemptAt?.toISOString()||null}))}/></div>
 </div></main>;
}
