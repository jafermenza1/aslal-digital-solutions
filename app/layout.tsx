import type {Metadata} from "next";
import {cookies} from "next/headers";
import "./globals.css";
import {AnalyticsTracker} from "@/components/AnalyticsTracker";
import {AppChrome} from "@/components/AppChrome";
import {localeCookie,normalizeLocale} from "@/lib/i18n";
import {getWebsiteSettings} from "@/lib/website-settings";
import {resolvePublicWorkspaceId} from "@/lib/workspaces";
import {SiteStructuredData} from "@/components/SiteStructuredData";

export const dynamic="force-dynamic";
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com";

export async function generateMetadata():Promise<Metadata>{
 const s=await getWebsiteSettings(resolvePublicWorkspaceId());
 const name=s.siteName||"Aslal Digital Solutions";
 const description="Aslal Digital Solutions builds digital marketing, websites, commerce systems, automation and growth solutions for businesses in Ethiopia.";
 const light=s.faviconLightUrl||"/favicon.svg";
 const dark=s.faviconDarkUrl||light;
 return {metadataBase:new URL(siteUrl),title:{default:name+" | Digital Growth & Commerce Solutions in Ethiopia",template:"%s | "+name},description,applicationName:name,keywords:["Aslal Digital Solutions","digital marketing Ethiopia","digital solutions Ethiopia","website development Ethiopia","ecommerce Ethiopia","marketing automation Ethiopia","business growth Ethiopia"],alternates:{canonical:"/"},robots:{index:true,follow:true,maxSnippet:-1,maxImagePreview:"large",maxVideoPreview:-1},icons:{icon:[{url:light,media:"(prefers-color-scheme: light)"},{url:dark,media:"(prefers-color-scheme: dark)"}],apple:light},openGraph:{type:"website",siteName:name,title:name+" | Digital Growth & Commerce Solutions in Ethiopia",description,url:siteUrl,locale:"en_ET"},twitter:{card:"summary_large_image",title:name+" | Digital Growth & Commerce Solutions in Ethiopia",description}};
}
export default async function RootLayout({children}:{children:React.ReactNode}){const cookieStore=await cookies();const locale=normalizeLocale(cookieStore.get(localeCookie)?.value);return <html lang={locale} dir={locale==="ar"?"rtl":"ltr"} suppressHydrationWarning><body><AppChrome>{children}</AppChrome><SiteStructuredData/><AnalyticsTracker/></body></html>;}
