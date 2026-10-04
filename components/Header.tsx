"use client";
import Link from "next/link";
import {useEffect,useState,useSyncExternalStore} from "react";
import {BrandLogo} from "@/components/BrandLogo";
import {MobileNav} from "@/components/MobileNav";
import {LanguageToggle} from "@/components/LanguageToggle";
import {ThemeToggle} from "@/components/ThemeToggle";
import {getCopy,normalizeLocale,type Locale} from "@/lib/i18n";
import {SolutionsMenu} from "@/components/SolutionsMenu";

function readLocale():Locale{if(typeof document==="undefined")return "en";const v=document.cookie.split("; ").find(x=>x.startsWith("aslal_locale="))?.split("=")[1];return normalizeLocale(v)}
function subscribeLocale(cb:()=>void){window.addEventListener("aslal-locale-change",cb);return()=>window.removeEventListener("aslal-locale-change",cb)}
export function Header(){
 const locale=useSyncExternalStore(subscribeLocale,readLocale,():Locale=>"en");const t=getCopy(locale);
 const [settings,setSettings]=useState<any>(null);
 useEffect(()=>{fetch("/api/public/site-settings").then(r=>r.json()).then(setSettings).catch(()=>undefined)},[]);
 if(settings&&!settings.headerEnabled)return null;
 const labels={...t.nav,portal:"Portal",build:settings?.header?.growthCtaLabel||t.actions.build};
 return <header className="site-header"><div className="container-aslal site-header-inner"><BrandLogo/><nav className="desktop-nav"><Link href="/platform">Growth-OS</Link><SolutionsMenu/><Link href="/marketplace">Marketplace</Link><Link href="/resources">{t.nav.resources}</Link></nav><div className="desktop-actions"><ThemeToggle compact/><LanguageToggle locale={locale}/>{settings?.header?.showPortal!==false&&<Link className="header-portal" href="/login">Portal</Link>}{settings?.header?.showGrowthCta!==false&&<Link className="site-cta" href={settings?.header?.growthCtaHref||"/growth-builder"}>{labels.build} <span>↗</span></Link>}</div><MobileNav locale={locale} labels={labels}/></div></header>;
}
