import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { partnerCapabilities } from "@/lib/partner-access";

export async function POST(request:Request){
 const user=await authorizePermission("partner.portal.view");
 if(!user)return NextResponse.json({error:"Unauthorized."},{status:401});
 const partner=await prisma.partner.findFirst({where:{user:{is:{id:user.id}}});
 if(!partner||!partnerCapabilities(partner).includes("partner.promote"))return NextResponse.json({error:"Partner promotion access is not available."},{status:403});
 const body=await request.json().catch(()=>({}));
 const listingId=String(body.listingId||"").trim();
 const listing=await prisma.commercialListing.findFirst({where:{id:listingId,workspaceId:partner.workspaceId,status:"PUBLISHED",publicVisible:true},select:{id:true,slug:true,title:true}});
 if(!listing)return NextResponse.json({error:"Marketplace listing is not available."},{status:404});
 const authorization=await prisma.commercialListingAuthorization.findFirst({where:{workspaceId:partner.workspaceId,listingId,partnerId:partner.id,status:"ACTIVE"},orderBy:{createdAt:"desc"},select:{id:true,programId:true}});
 if(!authorization)return NextResponse.json({error:"The offer must be approved for your promotion before a share link is issued."},{status:422});
 const marker="marketplace:"+listing.id;
 const existing=await prisma.referralLink.findFirst({where:{workspaceId:partner.workspaceId,partnerId:partner.id,campaign:marker,destinationPath:"/marketplace/listings/"+listing.slug}});
 if(existing){
  return NextResponse.json({ok:true,code:existing.code,url:(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"")+"/go/"+existing.code,attribution:"PARTNER",authorizationId:authorization.id});
 }
 const code="mkt-"+partner.partnerNumber.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+randomUUID().slice(0,8);
 const link=await prisma.referralLink.create({data:{id:randomUUID(),workspaceId:partner.workspaceId,partnerId:partner.id,code,campaign:marker,productSlug:null,destinationPath:"/marketplace/listings/"+listing.slug,campaignId:null}});
 return NextResponse.json({ok:true,code:link.code,url:(process.env.NEXT_PUBLIC_SITE_URL||"https://aslaldigital.com").replace(/\/$/,"")+"/go/"+link.code,attribution:"PARTNER",authorizationId:authorization.id});
}
