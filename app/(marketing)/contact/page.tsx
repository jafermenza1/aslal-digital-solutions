import type { Metadata } from "next";
import { RichContent } from "@/components/RichContent";
import { ContactForm } from "@/components/ContactForm";
import { prisma } from "@/lib/prisma";
import { getReferralCode } from "@/lib/tracking";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";
import { getWebsiteSettings } from "@/lib/website-settings";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

type SearchParams = { business?: string; goal?: string; channels?: string; product?: string; productId?: string; referral?: string; team?: string };

export default async function ContactPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [content,settings] = await Promise.all([getPageContent("/contact"),getWebsiteSettings(resolvePublicWorkspaceId())]);
  const products = await prisma.product.findMany({ where:{active:true}, select:{id:true,slug:true,name:true}, orderBy:[{sortOrder:"asc"},{name:"asc"}] });
  let referralName = "";
  const referralCode = params.referral || await getReferralCode() || "";
  if (referralCode) {
    const referral = await prisma.referralLink.findUnique({ where:{code:referralCode}, include:{partner:{select:{name:true}}} });
    referralName = referral?.partner.name || "";
  }
  const initialProductId = params.productId || "";\n  const contextTitle = params.team ? "Book a consultation" : params.product ? "Request a solution" : params.goal ? "Let’s plan your next step" : params.referral ? "Continue with your referral" : contentValue(content,"hero.title","Tell us what you want to grow.");\n  const contextBody = params.team ? "Tell us what you would like to discuss and we’ll help arrange the next step." : params.product ? "Tell us what you need from this solution and our team will guide you." : params.goal ? "Your selected goal is already attached. Add the details that will help us understand your situation." : params.referral ? "Your request is connected to a partner. Tell us what you need and we’ll route it correctly." : contentValue(content,"hero.body","Your request enters the Aslal lead system so our team can qualify it and follow up.");
  return <main>
    <section className="bg-[#0F3E8A] py-20 text-white"><div className="container-aslal"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">{contentValue(content,"hero.eyebrow","Start a project")}</div><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contextTitle}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}>{contextBody}</p></div></section>
    <section className="bg-[#F8FAFC] py-20 text-[#1E293B]"><div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="text-3xl font-black" style={contentStyle(content,"intro.title",32)}>{contentValue(content,"intro.title","A practical first conversation.")}</h2><p className="mt-5 leading-8 text-slate-600" style={contentStyle(content,"intro.body",16)}><RichContent content={content} keyName="intro.body" fallback="Website, software, digital marketing, CRM, automation, SEO or a combination — we&apos;ll map the right starting point." /></p><div className="mt-8 space-y-3 text-sm text-slate-600"><div><strong className="text-[#0F3E8A]">Location:</strong> {settings.location?.address||"Addis Ababa, Ethiopia"}</div>{["phone","whatsapp","telegram","email"].map((k:string)=>settings.contact?.[k]?.visible!==false&&<div key={k}><strong className="text-[#0F3E8A]">{k[0].toUpperCase()+k.slice(1)}:</strong> {settings.contact?.[k]?.value}</div>)}</div>{settings.location?.mapEnabled!==false&&<div className="mt-7 overflow-hidden rounded-2xl border border-slate-200"><iframe title="Aslal office map" className="h-64 w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(settings.location?.longitude||38.7525)-0.01}%2C${Number(settings.location?.latitude||9.0192)-0.01}%2C${Number(settings.location?.longitude||38.7525)+0.01}%2C${Number(settings.location?.latitude||9.0192)+0.01}&layer=mapnik&marker=${settings.location?.latitude||9.0192}%2C${settings.location?.longitude||38.7525}`}/></div>}</div><div className="rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-7 shadow-xl shadow-blue-950/5"><ContactForm initialBusiness={params.business} initialGoal={params.goal} initialChannels={params.channels} initialProduct={params.product || ""}
        initialProductId={initialProductId} initialReferralCode={referralCode} initialReferralName={referralName} initialTeam={params.team || ""} products={products} /></div></div></section>
  </main>;
}

export const metadata: Metadata = { title: "Contact Aslal Digital Solutions", description: "Tell Aslal what you want to improve across digital marketing, websites, CRM, commerce, automation or SEO.", alternates: { canonical: "https://aslaldigital.com/contact" } };
