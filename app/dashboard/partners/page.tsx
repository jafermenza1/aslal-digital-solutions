import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export default async function PartnersDashboard() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  const [rows] = await db.query(`SELECT p.id, p.name, p.type, p.status, COUNT(DISTINCT rl.id) links, COUNT(DISTINCT rc.id) clicks, COUNT(DISTINCT c.id) commissions FROM partners p LEFT JOIN referral_links rl ON rl.partner_id=p.id LEFT JOIN referral_clicks rc ON rc.referral_link_id=rl.id LEFT JOIN commissions c ON c.partner_id=p.id GROUP BY p.id, p.name, p.type, p.status ORDER BY p.created_at DESC`);
  const partners = rows as RowDataPacket[];
  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Partners</div><h1 className="mt-2 text-4xl font-black tracking-tight">Partner network</h1><p className="mt-2 text-slate-500">Monitor agents, influencers, affiliates and resellers.</p></div><a href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</a></div><section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#0F3E8A] text-white"><tr><th className="px-5 py-4">Partner</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Links</th><th className="px-5 py-4">Clicks</th><th className="px-5 py-4">Commissions</th></tr></thead><tbody>{partners.map(p=><tr key={p.id} className="border-t border-slate-100"><td className="px-5 py-4 font-black">{p.name}</td><td className="px-5 py-4">{p.type}</td><td className="px-5 py-4"><span className="rounded-full bg-[#0F3E8A]/8 px-3 py-1 text-xs font-black text-[#0F3E8A]">{p.status}</span></td><td className="px-5 py-4 font-bold">{p.links}</td><td className="px-5 py-4 font-bold">{p.clicks}</td><td className="px-5 py-4 font-bold">{p.commissions}</td></tr>)}{!partners.length&&<tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500">No partners have been added yet.</td></tr>}</tbody></table></div></section></div></main>;
}
