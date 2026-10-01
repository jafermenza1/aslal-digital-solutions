import Link from "next/link";
import { authorizePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { getWorkspaceForUser } from "@/lib/workspaces";
import { redirect } from "next/navigation";

export default async function PartnerNetworkPage(){
 const actor=await authorizePermission("partners.manage"); if(!actor)redirect("/dashboard");
 const current=await getWorkspaceForUser(actor); if(!current)redirect("/dashboard");
 const admin=actor.role==="ADMIN"||actor.role==="SUPER_ADMIN";
 const sql=admin
  ? "SELECT pi.id identity_id,pi.name,pi.email,pi.phone,COUNT(DISTINCT p.id) relationship_count,GROUP_CONCAT(DISTINCT CONCAT(w.name,'::',p.id,'::',p.partner_number,'::',p.type,'::',p.status) ORDER BY w.name SEPARATOR '||') relationships FROM partner_identities pi JOIN partners p ON p.identity_id=pi.id JOIN workspaces w ON w.id=p.workspace_id AND w.active=1 GROUP BY pi.id,pi.name,pi.email,pi.phone ORDER BY pi.name"
  : "SELECT pi.id identity_id,pi.name,pi.email,pi.phone,COUNT(DISTINCT p.id) relationship_count,GROUP_CONCAT(DISTINCT CONCAT(w.name,'::',p.id,'::',p.partner_number,'::',p.type,'::',p.status) ORDER BY w.name SEPARATOR '||') relationships FROM partner_identities pi JOIN partners p ON p.identity_id=pi.id JOIN workspaces w ON w.id=p.workspace_id AND w.active=1 JOIN workspace_users wu ON wu.workspace_id=w.id AND wu.user_id=? AND wu.status='ACTIVE' GROUP BY pi.id,pi.name,pi.email,pi.phone ORDER BY pi.name";
 const [rows]=await db.query<any[]>(sql,admin?[]:[actor.id]);
 return <main className="min-h-screen bg-[var(--ui-canvas)] py-10"><div className="container-aslal">
  <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#D97706]">Partner Network</div><h1 className="mt-2 text-4xl font-black">Network identities & business relationships</h1><p className="mt-2 max-w-3xl text-slate-500">One partner identity can participate in multiple businesses; each business relationship remains a separate commercial record.</p></div><Link href="/dashboard/partners" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#D97706]">← Partner workspace</Link></header>
  <div className="mt-8 space-y-4">{rows.map((r:any)=><section key={r.identity_id} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="text-xl font-black">{r.name}</h2><div className="mt-1 text-sm text-slate-500">{r.email||"No email"} {r.phone?"· "+r.phone:""} · {r.relationship_count} business relationship(s)</div></div><span className="rounded-full bg-[#0F3E8A]/10 px-3 py-1 text-xs font-black text-[#0F3E8A]">NETWORK ID {String(r.identity_id).slice(0,8)}</span></div><div className="mt-5 grid gap-3">{String(r.relationships||"").split("||").filter(Boolean).map((item:string)=>{const [business,id,num,type,status]=item.split("::");return <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm"><div className="grid gap-1 sm:grid-cols-5"><strong>{business}</strong><span>{num}</span><span>{type}</span><span>{status}</span><Link className="font-black text-[#0F3E8A]" href="/dashboard/partners?tab=partners">Open relationship →</Link></div></div>})}</div></section>)}{!rows.length&&<div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">No partner identities are visible in your authorized businesses.</div>}</div>
 </div></main>;
}