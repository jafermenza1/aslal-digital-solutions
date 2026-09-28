import type {Metadata} from "next";
import {cookies} from "next/headers";
import "./globals.css";
import {AnalyticsTracker} from "@/components/AnalyticsTracker";
import {AppChrome} from "@/components/AppChrome";
import {localeCookie,normalizeLocale} from "@/lib/i18n";
import {getWebsiteSettings} from "@/lib/website-settings";
import {resolvePublicWorkspaceId} from "@/lib/workspaces";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const s=await getWebsiteSettings(resolvePublicWorkspaceId());const light=s.faviconLightUrl||"/favicon.svg";const dark=s.faviconDarkUrl||light;return {title:s.siteName||"Aslal Digital Solutions | Your Growth Partner",description:"Technology and marketing connected around outcomes.",icons:{icon:[{url:light,media:"(prefers-color-scheme: light)"},{url:dark,media:"(prefers-color-scheme: dark)"}],apple:light}};}
export default async function RootLayout({children}:{children:React.ReactNode}){const cookieStore=await cookies();const locale=normalizeLocale(cookieStore.get(localeCookie)?.value);return <html lang={locale} dir={locale==="ar"?"rtl":"ltr"} suppressHydrationWarning><body><AppChrome>{children}</AppChrome><AnalyticsTracker/></body></html>;}
