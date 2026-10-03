import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";
import {getResources} from "@/lib/resources-server";
export const dynamic="force-dynamic";
const siteUrl=()=> (process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
const staticPaths=["/","/platform","/marketplace","/wanted","/partner/register","/growth-builder","/services","/services/packages","/products","/automation-lab","/resources","/portfolio","/about","/contact","/privacy","/terms"];
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=siteUrl();const now=new Date();let resources:Awaited<ReturnType<typeof getResources>>=[];let products:{slug:string;updatedAt:Date|null}[]=[];try{[resources,products]=await Promise.all([getResources({days:3650}),prisma.product.findMany({where:{active:true},select:{slug:true,updatedAt:true}})]);}catch{}return [...staticPaths.map(path=>({url:base+path,lastModified:now})),...resources.map(resource=>({url:base+"/resources/"+encodeURIComponent(resource.slug),lastModified:resource.updated_at})),...products.map(product=>({url:base+"/products/"+encodeURIComponent(product.slug),lastModified:product.updatedAt||now}))];}
