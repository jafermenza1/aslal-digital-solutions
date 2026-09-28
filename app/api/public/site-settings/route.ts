import { NextResponse } from "next/server";
import { getWebsiteSettings } from "@/lib/website-settings";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
export const dynamic="force-dynamic";
export async function GET(){const s=await getWebsiteSettings(resolvePublicWorkspaceId());return NextResponse.json({siteName:s.siteName,logoLightUrl:s.logoLightUrl,logoDarkUrl:s.logoDarkUrl,faviconLightUrl:s.faviconLightUrl,faviconDarkUrl:s.faviconDarkUrl,headerEnabled:s.headerEnabled,footerEnabled:s.footerEnabled,header:s.header,footer:s.footer,theme:s.theme});}
