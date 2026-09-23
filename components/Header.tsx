"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileNav } from "@/components/MobileNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCopy, type Locale } from "@/lib/i18n";

function readLocale(): Locale { if(typeof document==="undefined") return "en"; const v=document.cookie.split("; ").find(x=>x.startsWith("aslal_locale="))?.split("=")[1]; return v==="am"||v==="om"?v:"en"; }
function subscribeLocale(cb:()=>void){ window.addEventListener("aslal-locale-change",cb); return()=>window.removeEventListener("aslal-locale-change",cb); }

export function Header(){
 const locale=useSyncExternalStore(subscribeLocale,readLocale,():Locale=>"en"); const t=getCopy(locale);
 const nav=[["/services",t.nav.solutions],["/work",t.nav.work],["/products",t.nav.products],["/demo",t.nav.lab],["/about",t.nav.about],["/resources",t.nav.resources]] as const;
 return <header className="site-header"><div className="container-aslal site-header-inner">
  <BrandLogo/>
  <nav className="desktop-nav">{nav.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav>
  <div className="desktop-actions"><ThemeToggle compact/><LanguageToggle locale={locale}/><Link className="header-portal" href="/login">Portal</Link><Link className="site-cta" href="/growth-builder">{t.actions.build} <span>↗</span></Link></div>
  <MobileNav locale={locale} labels={{...t.nav,portal:"Portal",build:t.actions.build}}/>
 </div></header>;
}
