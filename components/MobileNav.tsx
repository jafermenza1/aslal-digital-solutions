"use client";

import Link from "next/link";
import { useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ChevronDown, Package, Store, Wrench } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Locale } from "@/lib/i18n";

export function MobileNav({locale,labels}:{locale:Locale;labels:{solutions:string;products:string;work:string;lab:string;about:string;resources:string;portal:string;build:string}}){
 const [open,setOpen]=useState(false);
 const nav=[["/platform","Growth-OS"],["/marketplace","Marketplace"],["/resources",labels.resources]];
 return <div className="mobile-nav-wrap">
  <button type="button" className="mobile-menu-button" aria-expanded={open} aria-label={open?"Close menu":"Open menu"} onClick={()=>setOpen(v=>!v)}><span/><span/><span/></button>
  {open&&<div className="mobile-nav-panel">
   <nav>{nav.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<details className="mobile-solutions-group"><summary><span>Solutions</span><ChevronDown size={15}/></summary><div><Link href="/marketplace" onClick={()=>setOpen(false)}><Store size={15}/> Marketplace</Link><Link href="/products" onClick={()=>setOpen(false)}><Package size={15}/> Products</Link><Link href="/services" onClick={()=>setOpen(false)}><Wrench size={15}/> Services</Link></div></details></nav>
   <div className="mobile-nav-actions"><ThemeToggle/><LanguageToggle locale={locale}/><Link href="/login" onClick={()=>setOpen(false)}>{labels.portal}</Link><Link className="mobile-nav-cta" href="/growth-builder" onClick={()=>setOpen(false)}>{labels.build} ↗</Link></div>
  </div>}
 </div>;
}
