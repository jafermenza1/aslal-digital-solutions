import Link from "next/link";
import { cookies } from "next/headers";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getCopy, type Locale } from "@/lib/i18n";

export async function Header() {
  const stored = (await cookies()).get("aslal_locale")?.value;
  const locale: Locale = stored === "am" ? "am" : "en";
  const t = getCopy(locale);
  const nav = [["/services", t.nav.solutions],["/products", t.nav.products],["/work", t.nav.work],["/demo", t.nav.lab],["/about", t.nav.about],["/resources", t.nav.resources],["/contact", t.nav.contact]];

  return <header className="metal-header sticky top-0 z-50"><div className="container-aslal flex h-20 items-center justify-between gap-4">
    <Link href="/" className="metal-shimmer flex items-center gap-3 rounded-2xl px-1 py-1" aria-label="Aslal Digital Solutions home"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F3E8A] text-lg font-black text-white shadow-lg shadow-blue-900/20 ring-1 ring-white/50">A<span className="text-[#E2B02A]">↗</span></span><span className="hidden sm:block"><span className="block text-sm font-black tracking-[.16em] text-[#0F3E8A]">ASLAL</span><span className="block text-[10px] font-semibold tracking-[.08em] text-[#1E293B]/70">DIGITAL SOLUTIONS</span></span></Link>
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">{nav.map(([href,label])=><Link key={href} href={href} className="metal-nav-link text-sm font-semibold">{label}</Link>)}</nav>
    <div className="flex items-center gap-2 sm:gap-3"><LanguageToggle locale={locale}/><Link href="/login" className="hidden rounded-full border border-[#0F3E8A]/20 bg-white/50 px-4 py-2 text-sm font-bold text-[#0F3E8A] shadow-inner transition hover:bg-[#0F3E8A] hover:text-white md:inline-block" aria-label="Admin login">Admin</Link><Link href="/contact" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#0F3E8A] transition hover:-translate-y-0.5 2xl:inline-block">{t.actions.expert}</Link><Link href="/contact" className="glow-button rounded-full bg-[#E2B02A] px-4 py-3 text-sm font-extrabold text-[#1E293B] sm:px-5">{t.actions.start} →</Link></div>
  </div></header>;
}
