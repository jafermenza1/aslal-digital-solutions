"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { siteConfig } from "@/lib/config";
import { getCopy, type Locale } from "@/lib/i18n";

function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const stored = document.cookie.split("; ").find((item) => item.startsWith("aslal_locale="))?.split("=")[1];
  return stored === "am" || stored === "om" ? stored : "en";
}

function subscribeLocale(callback: () => void) {
  window.addEventListener("aslal-locale-change", callback);
  return () => window.removeEventListener("aslal-locale-change", callback);
}

export function Footer() {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "en");
  const t = getCopy(locale);

  return <footer className="site-footer"><div className="container-aslal grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
    <div><div className="text-xl font-black tracking-tight text-white">ASLAL<span className="text-[#B7FF4A]">.</span></div><p className="mt-4 max-w-md text-sm leading-7 text-white/55">Engineered growth, local context, technical precision and measurable ROI for businesses in Ethiopia.</p></div>
    <div><h3 className="text-xs font-black uppercase tracking-[.18em] text-[#B7FF4A]">Explore</h3><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/services">{t.nav.solutions}</Link><Link className="block hover:text-white" href="/products">{t.nav.products}</Link><Link className="block hover:text-white" href="/work">{t.nav.work}</Link><Link className="block hover:text-white" href="/demo">{t.nav.lab}</Link><Link className="block hover:text-white" href="/about">{t.nav.about}</Link></div></div>
    <div><h3 className="text-xs font-black uppercase tracking-[.18em] text-[#B7FF4A]">Contact</h3><div className="mt-5 space-y-3 text-sm text-white/55"><p>{siteConfig.location}</p><p>{siteConfig.phone}</p><p>{siteConfig.email}</p></div></div>
  </div><div className="border-t border-white/10 py-5 text-center text-xs text-white/35">© {new Date().getFullYear()} Aslal Digital Solutions PLC. All rights reserved.</div></footer>;
}
