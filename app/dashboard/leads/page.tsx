import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/security";

const stages = ["NEW", "CONTACTED", "QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

type Lead = { id: string; name: string; company: string | null; email: string | null; phone: string | null; status: string; score: number; source: string | null; referral_code: string | null; created_at: string };

export default async function LeadsDashboard() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const [rows] = await db.query("SELECT id, name, company, email, phone, status, score, source, referral_code, created_at FROM leads ORDER BY created_at DESC LIMIT 50");
  const leads = rows as Lead[];

  return <main className="min-h-screen bg-[#F8FAFC] py-10"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Leads</div><h1 className="mt-2 text-4xl font-black tracking-tight">Sales pipeline</h1><p className="mt-2 text-slate-500">Recent demand captured by the Aslal growth system.</p></div><a href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F3E8A]">← Dashboard</a></div>
    <div className="mt-8 grid gap-3 md:grid-cols-4">{stages.slice(0, 4).map(stage => <StageCount key={stage} label={stage} count={leads.filter(l => l.status === stage).length} />)}</div>
    <div className="mt-4 grid gap-3 md:grid-cols-4">{stages.slice(4).map(stage => <StageCount key={stage} label={stage} count={leads.filter(l => l.status === stage).length} />)}</div>
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#0F3E8A] text-white"><tr><th className="px-5 py-4">Lead</th><th className="px-5 py-4">Stage</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Source</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Captured</th></tr></thead><tbody>{leads.map(lead => <tr key={lead.id} className="border-t border-slate-100"><td className="px-5 py-4"><div className="font-black text-[#1E293B]">{lead.name}</div><div className="text-slate-500">{lead.company || "Independent / unspecified"}</div></td><td className="px-5 py-4"><span className="rounded-full bg-[#0F3E8A]/8 px-3 py-1 text-xs font-black text-[#0F3E8A]">{lead.status}</span></td><td className="px-5 py-4"><span className={`font-black ${lead.score >= 60 ? "text-[#E2B02A]" : "text-slate-700"}`}>{lead.score}</span></td><td className="px-5 py-4"><div className="font-semibold">{lead.source || "website"}</div>{lead.referral_code && <div className="text-xs text-slate-400">ref: {lead.referral_code}</div>}</td><td className="px-5 py-4"><div>{lead.email || "—"}</div><div className="text-slate-500">{lead.phone || "—"}</div></td><td className="px-5 py-4 text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</td></tr>)}{leads.length === 0 && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500">No leads yet. New qualified demand will appear here.</td></tr>}</tbody></table></div></section>
  </div></main>;
}

function StageCount({ label, count }: { label: string; count: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-[10px] font-black tracking-[.16em] text-slate-400">{label}</div><div className="mt-2 text-3xl font-black text-[#0F3E8A]">{count}</div></div>; }
