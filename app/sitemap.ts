import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";
import {getResources} from "@/lib/resources-server";
export const dynamic="force-dynamic";
const siteUrl=()=> (process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"");
const staticPaths=["/","/platform","/marketplace","/wanted","/partner","/partner-network","/partner/register","/growth-builder","/services","/products","/automation-lab","/resources","/portfolio","/about","/contact","/privacy","/terms"];
function alternates(base:string,path:string){const local=(code:string)=>code==="en"?base+path:base+"/"+code+(path==="/"?"":path);return {languages:{en:local("en"),am:local("am"),om:local("om"),ar:local("ar"),"x-default":local("en")}};}
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=siteUrl(),now=new Date();
 let resources:Awaited<ReturnType<typeof getResources>>=[];
 let products:{slug:string;updatedAt:Date|null}[]=[];
 let listings:{slug:string;updatedAt:Date|null}[]=[];
 try{[resources,products,listings]=await Promise.all([getResources({days:3650}),prisma.product.findMany({where:{active:true},select:{slug:true,updatedAt:true}}),prisma.commercialListing.findMany({where:{workspaceId:(await import("@/lib/workspaces")).resolvePublicWorkspaceId(),status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},select:{slug:true,updatedAt:true}})]);}catch{}
 const urls=staticPaths.map(path=>({url:base+path,lastModified:now,...alternates(base,path)}));
 const resourceUrls=resources.map(resource=>{const path="/resources/"+encodeURIComponent(resource.slug);return {url:base+path,lastModified:resource.updated_at,...alternates(base,path)};});
 const productUrls=products.map(product=>{const path="/products/"+encodeURIComponent(product.slug);return {url:base+path,lastModified:product.updatedAt||now,...alternates(base,path)};});
 const listingUrls=listings.map(listing=>{const path="/marketplace/listings/"+encodeURIComponent(listing.slug);return {url:base+path,lastModified:listing.updatedAt||now,...alternates(base,path)};});
 return [...urls,...resourceUrls,...productUrls,...listingUrls];
}
