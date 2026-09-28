"use client";
import Link from "next/link";
import {useEffect,useState,useSyncExternalStore} from "react";
import {siteConfig} from "@/lib/config";
import {getCopy,type Locale} from "@/lib/i18n";
import {BrandLogo} from "@/components/BrandLogo";
import {SocialLinks} from "@/components/SocialLinks";
function readLocale():Locale{if(typeof document==="undefined")return "en";const v=document.cookie.split("; ").find(x=>x.startsWith("aslal_locale="))?.split("=")[1];return v==="am"||v==="ar"||v==="om"?v:"en"}
function subscribeLocale(cb:()=>void){window.addEventListener("aslal-locale-change",cb);return()=>window.removeEventListener("aslal-locale-change",cb)}
export function Footer(){
 const [socialProfiles,setSocialProfiles]=useState<any[]>([]),[settings,setSettings]=useState<any>(null);
 useEffect(()=>{fetch("/api/public/social-profiles").then(r=>r.json()).then(d=>setSocialProfiles(Array.isArray(d.profiles)?d.profiles:[])).catch(()=>undefined);fetch("/api/public/site-settings").then(r=>r.json()).then(setSettings).catch(()=>undefined)},[]);
 const locale=useSyncExternalStore(subscribeLocale,readLocale,():Locale=>"en");const t=getCopy(locale);
 if(settings&&!settings.footerEnabled)return null;
 const footer=settings?.footer||{};const columns=Array.isArray(footer.columns)?footer.columns:[];
 return <footer className="site-footer"><div className="container-aslal footer-grid"><div><BrandLogo/><p className="footer-copy">{footer.tagline||"Your Growth Partner — connected technology, marketing and sales systems built around measurable outcomes."}</p><div className="mt-5"><SocialLinks profiles={socialProfiles}/></div></div>{columns.length?columns.map((c:any)=><div key={c.title}><h3>{c.title}</h3><div className="footer-links">{(Array.isArray(c.links)?c.links:[]).map((l:any)=><Link key={String(l[0])} href={String(l[0])}>{String(l[1])}</Link>)}</div></div>):<><div><h3>Explore</h3><div className="footer-links"><Link href="/services">{t.nav.solutions}</Link><Link href="/products">{t.nav.products}</Link><Link href="/work">{t.nav.work}</Link><Link href="/growth-builder">{t.actions.build}</Link></div></div><div><h3>Contact</h3><div className="footer-links"><span>{siteConfig.location}</span><span>{siteConfig.phone}</span><span>{siteConfig.email}</span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></>}</div><div className="footer-bottom"><div className="container-aslal">© {new Date().getFullYear()} Aslal Digital Solutions PLC. All rights reserved.</div></div></footer>;
}
