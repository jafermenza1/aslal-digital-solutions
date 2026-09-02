import Link from "next/link";
import { cookies } from "next/headers";
import { siteConfig } from "@/lib/config";
import { getCopy, type Locale } from "@/lib/i18n";

export async function Footer() {
  const locale: Locale = (await cookies()).get("aslal_locale")?.value === "am" ? "am" : "en";
  const t = getCopy(locale);
  return (
    <footer className="bg-[#0F3E8A] text-white">
      <div className="container-aslal grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><div className="mb-5 text-xl font-black tracking-tight">ASLAL <span className="text-[#E2B02A]">DIGITAL SOLUTIONS</span></div><p className="max-w-md text-sm leading-7 text-white/70">{locale === "am" ? "ለኢትዮጵያ ንግዶች የተሰራ የእድገት፣ የቴክኖሎጂ እና የሚለካ ROI ስርዓት።" : "Engineered growth, local context, technical precision and measurable ROI for businesses in Ethiopia."}</p></div>
        <div><h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#E2B02A]">{locale === "am" ? "ይመልከቱ" : "Explore"}</h3><div className="space-y-3 text-sm text-white/75"><Link className="block hover:text-white" href="/services">{t.nav.solutions}</Link><Link className="block hover:text-white" href="/products">{t.nav.products}</Link><Link className="block hover:text-white" href="/work">{t.nav.work}</Link><Link className="block hover:text-white" href="/demo">{t.nav.lab}</Link><Link className="block hover:text-white" href="/about">{t.nav.about}</Link></div></div>
        <div><h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#E2B02A]">{t.nav.contact}</h3><div className="space-y-3 text-sm text-white/75"><p>{siteConfig.location}</p><p>{siteConfig.phone}</p><p>{siteConfig.email}</p></div></div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© {new Date().getFullYear()} Aslal Digital Solutions PLC. All rights reserved.</div>
    </footer>
  );
}
