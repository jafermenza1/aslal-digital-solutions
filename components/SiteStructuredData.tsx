import {siteConfig} from "@/lib/config";
import {getWebsiteSettings} from "@/lib/website-settings";
import {resolvePublicWorkspaceId} from "@/lib/workspaces";
function absoluteUrl(value:string,base:string){if(/^https?:\/\//i.test(value))return value;return base+(value.startsWith("/")?value:"/"+value);}
export async function SiteStructuredData(){
 const s=await getWebsiteSettings(resolvePublicWorkspaceId()),base=siteConfig.url.replace(/\/$/,"");
 const sameAs=Array.isArray(s.footer?.socialProfiles)?s.footer.socialProfiles.filter((x:any)=>typeof x==="string"&&/^https?:\/\//i.test(x)):undefined;
 const location=s.location||{};
 const address={"@type":"PostalAddress",streetAddress:location.address||undefined,addressLocality:location.city||"Addis Ababa",addressRegion:location.region||"Addis Ababa",addressCountry:location.countryCode||"ET"};
 const organization={"@type":"Organization","@id":base+"/#organization",name:s.siteName||siteConfig.name,url:base,logo:absoluteUrl(s.logoLightUrl||"/brand-logo.svg",base),email:siteConfig.email,telephone:siteConfig.phone,address,areaServed:{"@type":"Country",name:"Ethiopia"},sameAs};
 const website={"@type":"WebSite","@id":base+"/#website",url:base,name:s.siteName||siteConfig.name,publisher:{"@id":base+"/#organization"},inLanguage:["en","am","om","ar"]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[organization,website]})}}/>;
}
