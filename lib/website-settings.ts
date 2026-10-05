import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";
import {DEFAULT_SERVICE_PACKAGES} from "@/lib/service-packages";

export type WebsiteSettings = {
  id:string; workspaceId:string; siteName:string;
  logoLightUrl:string|null; logoDarkUrl:string|null;
  faviconLightUrl:string|null; faviconDarkUrl:string|null;
  headerEnabled:boolean; footerEnabled:boolean; header:any; footer:any; theme:any; servicePackages:any; location:any; contact:any;
};

export const DEFAULT_HEADER = { nav:[
  {href:"/services",label:"Solutions",visible:true},{href:"/portfolio",label:"Portfolio",visible:true},
  {href:"/products",label:"Products",visible:true},{href:"/automation-lab",label:"Automation Lab",visible:true},
  {href:"/about",label:"About",visible:true},{href:"/resources",label:"Resources",visible:true}
],showPortal:true,showGrowthCta:true,growthCtaLabel:"Build my growth system",growthCtaHref:"/growth-builder" };

export const DEFAULT_FOOTER = { tagline:"Your Growth Partner — connected technology, marketing and sales systems built around measurable outcomes.",
  columns:[{title:"Explore",links:[["/services","Solutions"],["/products","Products"],["/work","Work"],["/growth-builder","Build my growth system"]]},{title:"Contact",links:[["/privacy","Privacy"],["/terms","Terms"]]}] };

export const DEFAULT_LOCATION = {officeEnabled:true,name:"Aslal Digital Solutions — Addis Ababa",address:"Addis Ababa, Ethiopia",latitude:9.0192,longitude:38.7525,mapEnabled:true,branches:[]};
export const DEFAULT_CONTACT = {phone:{value:"+251 911-276682",visible:true},whatsapp:{value:"+251 911-276682",visible:true},telegram:{value:"@AslalDigital",visible:true},email:{value:"info@aslaldigital.com",visible:true}};
export const DEFAULT_THEME = {fontFamily:"Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",headingFontFamily:"inherit",
 primaryColor:"#E2B02A",secondaryColor:"#E2B02A",textColor:"#1E293B",backgroundColor:"#F8FAFC",
 darkTextColor:"#F8FAFC",darkBackgroundColor:"#0F3E8A",linkColor:"#E2B02A",borderRadius:"16px"};

function parseJson(value:string|null,fallback:any){try{return value?JSON.parse(value):fallback}catch{return fallback}}

export async function getWebsiteSettings(workspaceId=INTERNAL_WORKSPACE_ID):Promise<WebsiteSettings>{
  const [rows]=await db.query<any[]>("SELECT * FROM website_settings WHERE workspace_id=? LIMIT 1",[workspaceId]);
  const row=rows[0];
  if(!row){
    const id=randomUUID();
    await db.query("INSERT INTO website_settings (id,workspace_id,site_name,header_json,footer_json,theme_json,service_packages_json,location_json,contact_json) VALUES (?,?,?,?,?,?,?,?,?)",
      [id,workspaceId,"Aslal Digital Solutions",JSON.stringify(DEFAULT_HEADER),JSON.stringify(DEFAULT_FOOTER),JSON.stringify(DEFAULT_THEME),JSON.stringify(DEFAULT_SERVICE_PACKAGES),JSON.stringify(DEFAULT_LOCATION),JSON.stringify(DEFAULT_CONTACT)]);
    return {id,workspaceId,siteName:"Aslal Digital Solutions",logoLightUrl:null,logoDarkUrl:null,faviconLightUrl:null,faviconDarkUrl:null,headerEnabled:true,footerEnabled:true,header:DEFAULT_HEADER,footer:DEFAULT_FOOTER,theme:DEFAULT_THEME,servicePackages:DEFAULT_SERVICE_PACKAGES,location:DEFAULT_LOCATION,contact:DEFAULT_CONTACT};
  }
  return {id:row.id,workspaceId,siteName:row.site_name,logoLightUrl:row.logo_light_url,logoDarkUrl:row.logo_dark_url,
    faviconLightUrl:row.favicon_light_url,faviconDarkUrl:row.favicon_dark_url,headerEnabled:Boolean(row.header_enabled),footerEnabled:Boolean(row.footer_enabled),
    header:parseJson(row.header_json,DEFAULT_HEADER),footer:parseJson(row.footer_json,DEFAULT_FOOTER),theme:parseJson(row.theme_json,DEFAULT_THEME),servicePackages:parseJson(row.service_packages_json,DEFAULT_SERVICE_PACKAGES),location:parseJson(row.location_json,DEFAULT_LOCATION),contact:parseJson(row.contact_json,DEFAULT_CONTACT)};
}