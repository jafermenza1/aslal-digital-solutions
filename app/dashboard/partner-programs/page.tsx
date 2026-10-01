import { requirePermission } from "@/lib/authorization";
import PartnerProgramBuilder from "@/components/PartnerProgramBuilder";

export const dynamic="force-dynamic";

export default async function PartnerProgramsPage(){
  await requirePermission("partners.manage");
  return <main className="min-h-screen bg-slate-50 py-8"><div className="container-aslal max-w-6xl"><header className="mb-6"><div className="text-xs font-black uppercase tracking-[.18em] text-amber-600">Partner Commerce · P2</div><h1 className="mt-2 text-3xl font-black text-slate-950">Partner Programs</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Define the commercial relationship once, publish transparent terms, then attach campaigns and admit compatible partners.</p></header><PartnerProgramBuilder/></div></main>;
}