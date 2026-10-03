import type {MetadataRoute} from "next";
import {getWebsiteSettings} from "@/lib/website-settings";
import {resolvePublicWorkspaceId} from "@/lib/workspaces";
export const dynamic="force-dynamic";
export default async function manifest():Promise<MetadataRoute.Manifest>{const s=await getWebsiteSettings(resolvePublicWorkspaceId());const icon=s.faviconLightUrl||"/favicon.svg";return {name:s.siteName||"Aslal Digital Solutions",short_name:"Aslal",description:"Engineered digital growth for businesses in Ethiopia",start_url:"/",display:"standalone",background_color:s.theme?.backgroundColor||"#F8FAFC",theme_color:s.theme?.primaryColor||"#E2B02A",icons:[{src:icon,sizes:"any",type:"image/svg+xml"}]};}
