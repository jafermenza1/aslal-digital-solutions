"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

export function BrandLogo({href="/"}:{href?:string}) {
 const [logo,setLogo]=useState<{light:string;dark:string}>({light:"/brand-logo.svg",dark:"/brand-logo.svg"});
 useEffect(()=>{fetch("/api/public/site-settings").then(r=>r.json()).then(s=>setLogo({light:s.logoLightUrl||"/brand-logo.svg",dark:s.logoDarkUrl||s.logoLightUrl||"/brand-logo.svg"})).catch(()=>undefined)},[]);
 return <Link href={href} className="brand-logo" aria-label="Aslal Digital Solutions home">
  <span className="brand-logo-orbit" aria-hidden="true"/>
  <span className="brand-logo-mark"><img className="brand-logo-image brand-logo-image-light" src={logo.light} alt="" width={44} height={44}/><img className="brand-logo-image brand-logo-image-dark" src={logo.dark} alt="" width={44} height={44}/></span>
  <span className="brand-logo-copy"><b>ASLAL</b><small>DIGITAL SOLUTIONS</small></span>
 </Link>;
}
