import type { Metadata } from "next";
import { ArrowRight, CircleHelp, Crosshair, Radar, ShieldCheck, Store, Target, Zap } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WantedRequestForm } from "@/components/WantedRequestForm";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

export const dynamic="force-dynamic";

export default async function WantedPage({searchParams}:{searchParams:Promise<{workspace?:string}>}){
 const q=await searchParams, slug=q.workspace||"";
 const publicWorkspaceId=resolvePublicWorkspaceId();
 const workspace=slug
   ? await prisma.workspace.findFirst({where:{slug,active:true},select:{id:true,name:true}})
   : await prisma.workspace.findFirst({where:{id:publicWorkspaceId,active:true},select:{id:true,name:true}});
 return <main className="min-h-screen overflow-hidden bg-[#070C18] text-white">
  <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_65%_10%,rgba(226,176,42,.12),transparent_30%),radial-gradient(circle_at_15%_50%,rgba(15,62,138,.45),transparent_36%)] py-16 sm:py-20">
   <div className="container-aslal">
    <div className="max-w-4xl"><div className="flex items-center gap-3 font-mono text-[10px] font-black tracking-[.25em] text-[#E2B02A]"><Radar size={16}/> ASLAL WANTED NETWORK <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E2B02A]"/></div><h1 className="mt-5 text-5xl font-black tracking-[-.05em] sm:text-6xl">Need something? <span className="text-[#E2B02A]">Broadcast the demand.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">Tell the network what you need. Aslal can structure the requirement, route it through the commercial workflow and connect suitable supply without making you search through endless listings.</p></div>
    <div className="mt-10 grid gap-3 sm:grid-cols-3">
      {[[Target,"01","Describe","Tell us the outcome, item or service."],[Crosshair,"02","Match","Suitable supply can be evaluated against the requirement."],[ShieldCheck,"03","Connect","Continue with controlled commercial follow-up."]].map(([I,n,t,d])=>{const Icon=I as typeof Target;return <div key={String(n)} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center gap-3"><Icon className="text-[#E2B02A]" size={19}/><span className="font-mono text-[9px] font-black tracking-widest text-white/30">{String(n)}</span></div><h2 className="mt-4 font-black">{String(t)}</h2><p className="mt-2 text-sm leading-6 text-white/45">{String(d)}</p></div>})}
    </div>
   </div>
  </section>
  <section className="bg-[#0F172A] py-10"><div className="container-aslal">
   {workspace?<WantedRequestForm workspaceId={workspace.id} workspaceName={workspace.name}/>:<div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[.035] p-8 text-center shadow-[0_25px_80px_rgba(30,41,59,.25)] sm:p-12"><CircleHelp className="mx-auto text-[#E2B02A]" size={30}/><h2 className="mt-5 text-3xl font-black">Choose a business workspace to publish your request.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">Wanted requests are scoped to a business workspace so the commercial workflow knows who should receive, evaluate and act on the demand.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#E2B02A] px-5 py-3 text-sm font-black text-[#070C18]">Talk to Aslal <ArrowRight size={15}/></Link></div>}
  </div></section>
  <section className="border-t border-white/10 bg-[#070C18] py-10"><div className="container-aslal flex flex-wrap items-center justify-center gap-4 text-[10px] font-black tracking-[.18em] text-white/25"><span className="inline-flex items-center gap-2"><Store size={13}/> SUPPLY</span><ArrowRight size={12}/><span className="inline-flex items-center gap-2"><Radar size={13}/> DEMAND</span><ArrowRight size={12}/><span className="inline-flex items-center gap-2"><Zap size={13}/> MATCH</span><ArrowRight size={12}/><span className="inline-flex items-center gap-2"><ShieldCheck size={13}/> CONTROLLED COMMERCE</span></div></section>
 </main>;
}
export const metadata: Metadata={title:"Wanted | Aslal Digital Solutions",description:"Publish what you need and connect structured demand with suitable supply through Aslal's commercial network.",alternates:{canonical:"https://aslaldigital.com/wanted"}};
