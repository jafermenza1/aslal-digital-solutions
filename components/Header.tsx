"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getCopy, type Locale } from "@/lib/i18n";

function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const stored = document.cookie.split("; ").find((item) => item.startsWith("aslal_locale="))?.split("=")[1];
  return stored === "am" || stored === "om" ? stored : "en";
}

export function Header() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(readLocale());
  }, []);

  const t = getCopy(locale);
  const nav = [["/services", t.nav.solutions], ["/work", t.nav.work], ["/products", t.nav.products], ["/demo", t.nav.lab], ["/about", t.nav.about], ["/resources", t.nav.resources]];

  return <header className="site-header"><div className="container-aslal flex min-h-[76px] items-center justify-between gap-4">
    <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg font-black text-[#07111f]">A<span className="text-[#B7FF4A]">↗</span></span><span className="hidden sm:block"><span className="block text-sm font-black tracking-[.18em] text-white">ASLAL</span><span className="block text-[9px] font-bold tracking-[.12em] text-white/45">DIGITAL SOLUTIONS</span></span></Link>
    <nav className="hidden items-center gap-7 lg:flex">{nav.map(([href, label]) => <Link key={href} href={href} className="site-nav-link">{label}</Link>)}</nav>
    <div className="flex items-center gap-2 sm:gap-3"><LanguageToggle locale={locale}/><Link href="/login" className="hidden rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/75 transition hover:border-white/30 hover:text-white md:inline-flex">Portal</Link><Link href="/growth-builder" className="site-cta">{t.actions.build} <span>↗</span></Link></div>
  </div></header>;
}
