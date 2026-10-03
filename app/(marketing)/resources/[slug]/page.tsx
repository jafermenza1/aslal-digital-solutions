import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventTracker } from "@/components/EventTracker";
import { ResourceTool } from "@/components/ResourceTools";
import { RESOURCES } from "@/lib/resources";
import { getResourceBySlug } from "@/lib/resources-server";
import { ResourceCapture } from "@/components/ResourceCapture";
import { SearchStructuredData, SearchAnswerBlock } from "@/components/SearchStructuredData";
import { getSearchProfile,effectiveSearchProfile } from "@/lib/search-profiles";

export const revalidate = 3600;

export function generateStaticParams(){ return RESOURCES.map(resource=>({slug:resource.slug})); }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const resource=await getResourceBySlug(slug);
  if(!resource) return {};
  const profile=await getSearchProfile(String((resource as any).workspace_id||(resource as any).workspaceId||"internal"),"RESOURCE",String(resource.id),"en").catch(()=>null);
  const title=`${resource.title} | Aslal Resources`;
  const description=`${resource.description} Get a practical preview, use the tool or template, and take the next step with Aslal Digital Solutions.`;
  const url=`https://aslaldigital.com/resources/${resource.slug}`;
  const image="https://aslaldigital.com/og/resources.png";
  return {title,description,alternates:{canonical:url},openGraph:{title,description,url,type:"article",siteName:"Aslal Digital Solutions",images:[{url,width:1200,height:630,alt:resource.title}],locale:"en_US"},twitter:{card:"summary_large_image",title,description,images:[image]},robots:profile?.noindex?{index:false,follow:false}:undefined};
}

export default async function ResourceDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const resource=await getResourceBySlug(slug);
  if(!resource) notFound();
  const isTool=resource.category==="tool";
  const profile=await getSearchProfile(String((resource as any).workspace_id||(resource as any).workspaceId||"internal"),"RESOURCE",String(resource.id),"en").catch(()=>null);
  const whatsapp=`https://wa.me/251911276682?text=${encodeURIComponent(`Hi Aslal, I am interested in: ${resource.title}`)}`;
  const telegram=`https://t.me/share/url?url=${encodeURIComponent(`https://aslaldigital.com/resources/${resource.slug}`)}&text=${encodeURIComponent(`Hi Aslal, I am interested in: ${resource.title}`)}`;
  return <main>
    <EventTracker eventName="CONTENT_VIEW" productSlug={resource.slug}/>
    <section className="bg-[#0F3E8A] py-20 text-white">
      <div className="container-aslal">
        <div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">{resource.category} • Aslal Resources</div>
        <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-[-.04em] sm:text-6xl">{resource.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">{resource.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/contact?goal=${encodeURIComponent(resource.intent)}`} className="rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B]">{resource.cta} →</Link>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-500 px-6 py-4 font-black text-white transition hover:bg-[#E2B02A] hover:text-[#0F3E8A]">Send to WhatsApp</a>
          <a href={telegram} target="_blank" rel="noreferrer" className="rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-[#E2B02A] hover:text-[#0F3E8A]">Open in Telegram</a>
        </div>
      </div>
    </section>
    <section className="py-20">
      <div className="container-aslal grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">30–40% preview</div>
          <h2 className="mt-3 text-3xl font-black">Start with the part that matters most.</h2>
          <p className="mt-5 leading-8 text-slate-600">{resource.preview}</p>
          {isTool ? <div className="mt-8"><ResourceTool slug={resource.slug}/></div> : <div className="mt-8 space-y-5 text-slate-700">
            <div><h3 className="font-black">1. Define the commercial outcome</h3><p className="mt-2 leading-7">Start from the customer action you need: qualified enquiry, completed payment, booked consultation or sales follow-up. Then work backwards into the digital journey.</p></div>
            <div><h3 className="font-black">2. Reduce the handoff gap</h3><p className="mt-2 leading-7">Capture source, intent and requested outcome at the moment of engagement so a salesperson receives context instead of a disconnected form submission.</p></div>
            <div><h3 className="font-black">3. Measure what happens after the click</h3><p className="mt-2 leading-7">A resource interaction is useful only when it can be connected to qualification, opportunity, order and revenue outcomes.</p></div>
          </div>}
        </article>
        <aside className="h-fit lg:sticky lg:top-24 rounded-[2rem] bg-[#F8FAFC] p-7 sm:p-9"><ResourceCapture resourceId={resource.id} resourceSlug={resource.slug} downloadUrl={resource.download_url} cta={resource.cta}/>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Next action</div>
          <h2 className="mt-3 text-2xl font-black">{resource.cta}</h2>
          <p className="mt-4 leading-7 text-slate-600">Keep the resource useful without forcing a long form. If you already know the problem, send the topic directly to Aslal and the request can enter the existing lead workflow.</p>
          
          <Link href={`/contact?goal=${encodeURIComponent(resource.intent)}`} className="mt-3 block rounded-2xl bg-[#0F3E8A] px-5 py-4 text-center font-black text-white">Request implementation help</Link>
          <p className="mt-5 text-xs leading-5 text-slate-500">No purchase is implied by using a resource or calculator. Estimates are illustrative.</p>
        </aside>
      </div>
    </section>
    <div className="container-aslal pb-16"><SearchAnswerBlock profile={profile}/></div><section className="bg-[#0F3E8A] py-16 text-white"><div className="container-aslal flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#E2B02A]">Build the next step</div><h2 className="mt-2 text-3xl font-black">Turn the insight into an implementation plan.</h2></div><Link href="/growth-builder" className="rounded-full bg-[#E2B02A] px-6 py-4 font-black text-[#1E293B] transition hover:bg-[#0F3E8A] hover:text-white">Build my growth system →</Link></div></section>
  </main>;
}
