import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{const base=process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com";return {rules:[{userAgent:"*",allow:"/",disallow:["/dashboard/","/api/","/login","/portal/"]}],sitemap:base+"/sitemap.xml",host:base};}
