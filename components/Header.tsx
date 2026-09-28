"use client";
import Link from "next/link";
import {useEffect,useState,useSyncExternalStore} from "react";
import {BrandLogo} from "@/components/BrandLogo";
import {MobileNav} from "@/components/MobileNav";
import {LanguageToggle} from "@/components/LanguageToggle";
import {ThemeToggle} from "@/components/ThemeToggle";
import {getCopy,normalizeLocale,type Locale} from "@/lib/i18n";

function readLocale():Locale{if(typeof document==="undefined")return "en";const v=document.cookie.split("; ").find(x=>x.startsWith("aslal_locale="))?.split("=")[1];return normalizeLocale(v)}
function subscribeLocale(cb:()=>void){window.addEventListener("aslal-locale-change",cb);return()=>window.removeEventListener("aslal-locale-change",cb)}
export function Header(){
 const locale=useSyncExternalStore(subscribeLocale,readLocale,():Locale=>"en");const t=getCopy(locale);
 const [settings,setSettings]=useState<any>(null);
 useEffect(()=>{fetch("/api/public/site-settings").then(r=>r.json()).then(setSettings).catch(()=>undefined)},[]);
 if(settings&&!settings.headerEnabled)return null;
 const configured=Array.isArray(settings?.header?.nav)?settings.header.nav.filter((x:any)=>x&&x.visible!==false&&x.href):null;
 const nav=(configured?.length?configured:[["/services",t.nav.solutions],["/portfolio","Portfolio"],["/products",t.nav.products],["/automation-lab","Automation Lab"],["/about",t.nav.about],["/resources",t.nav.resources]].map((x:any)=>({href:x[0],label:x[1]})));
 const labels={...t.nav,portal:"Portal",build:settings?.header?.growthCtaLabel||t.actions.build};
 return <header className="site-header"><div className="container-aslal site-header-inner"><BrandLogo/><nav className="desktop-nav">{nav.map((x:any)=><Link key={x.href} href={x.href}>{x.label}</Link>)}</nav><div className="desktop-actions"><ThemeToggle compact/><LanguageToggle locale={locale}/>{settings?.header?.showPortal!==false&&<Link className="header-portal" href="/login">Portal</Link>}{settings?.header?.showGrowthCta!==false&&<Link className="site-cta" href={settings?.header?.growthCtaHref||"/growth-builder"}>{labels.build} <span>↗</span></Link>}</div><MobileNav locale={locale} labels={labels}/></div></header>;
}
