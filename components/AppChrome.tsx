"use client";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
export function AppChrome({children}:{children:React.ReactNode}){
 const pathname=usePathname();const [theme,setTheme]=useState<any>(null);
 const appSurface=pathname==="/login"||pathname==="/dashboard"||pathname.startsWith("/dashboard/")||pathname==="/portal"||pathname.startsWith("/portal/")||pathname.startsWith("/telegram/catalog");
 useEffect(()=>{if(appSurface)return;fetch("/api/public/site-settings").then(r=>r.json()).then(s=>setTheme(s.theme||null)).catch(()=>undefined)},[appSurface]);
 if(appSurface)return <>{children}</>;
 const vars=theme?({"--site-font":theme.fontFamily||undefined,"--site-heading-font":theme.headingFontFamily&&theme.headingFontFamily!=="inherit"?theme.headingFontFamily:undefined,"--site-primary":theme.primaryColor||undefined,"--site-secondary":theme.secondaryColor||undefined,"--site-text":theme.textColor||undefined,"--site-bg":theme.backgroundColor||undefined,"--site-dark-text":theme.darkTextColor||undefined,"--site-dark-bg":theme.darkBackgroundColor||undefined,"--site-link":theme.linkColor||undefined,"--site-radius":theme.borderRadius||undefined} as React.CSSProperties):undefined;
 return <div className="site-shell" style={vars}><Header/><div className="site-main">{children}</div><Footer/></div>;
}
