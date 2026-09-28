import { RichContent } from "@/components/RichContent";
import { ContactForm } from "@/components/ContactForm";
import { prisma } from "@/lib/prisma";
import { getReferralCode } from "@/lib/tracking";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";

type SearchParams = { business?: string; goal?: string; channels?: string; product?: string; productId?: string; referral?: string; team?: string };

export default async function ContactPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const content = await getPageContent("/contact");
  const products = await prisma.product.findMany({ where:{active:true}, select:{id:true,slug:true,name:true}, orderBy:[{sortOrder:"asc"},{name:"asc"}] });
  let referralName = "";
  const referralCode = params.referral || await getReferralCode() || "";
  if (referralCode) {
    const referral = await prisma.referralLink.findUnique({ where:{code:referralCode}, include:{partner:{select:{name:true}}} });
    referralName = referral?.partner.name || "";
  }
  const initialProductId = params.productId || "";
  return <main>
    <section className="bg-[#071F47] py-20 text-white"><div className="container-aslal"><div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">{contentValue(content,"hero.eyebrow","Start a project")}</div><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl" style={contentStyle(content,"hero.title",56)}>{contentValue(content,"hero.title","Tell us what you want to grow.")}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/70" style={contentStyle(content,"hero.body",18)}><RichContent content={content} keyName="hero.body" fallback="Your request enters the Aslal lead system so our team can qualify it and follow up." /></p></div></section>
    <section className="bg-[#F8FAFC] py-20 text-[#1E293B]"><div className="container-aslal grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="text-3xl font-black" style={contentStyle(content,"intro.title",32)}>{contentValue(content,"intro.title","A practical first conversation.")}</h2><p className="mt-5 leading-8 text-slate-600" style={contentStyle(content,"intro.body",16)}><RichContent content={content} keyName="intro.body" fallback="Website, software, digital marketing, CRM, automation, SEO or a combination — we&apos;ll map the right starting point." /></p><div className="mt-8 space-y-3 text-sm text-slate-600"><div><strong className="text-[#0F3E8A]">Location:</strong> Addis Ababa, Ethiopia</div><div><strong className="text-[#0F3E8A]">Phone:</strong> +251 911-276682</div><div><strong className="text-[#0F3E8A]">Email:</strong> info@aslaldigital.com</div></div></div><div className="rounded-[2rem] border border-[#0F3E8A]/10 bg-white p-7 shadow-xl shadow-blue-950/5"><ContactForm initialBusiness={params.business} initialGoal={params.goal} initialChannels={params.channels} initialProduct={params.product || ""}
        initialProductId={initialProductId} initialReferralCode={referralCode} initialReferralName={referralName} initialTeam={params.team || ""} products={products} /></div></div></section>
  </main>;
}
