import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{
 const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
 return {rules:[{userAgent:"*",allow:"/",disallow:["/dashboard/","/api/","/login","/portal/","/admin/","/auth/"]}],sitemap:base+"/sitemap.xml",host:base};
}
