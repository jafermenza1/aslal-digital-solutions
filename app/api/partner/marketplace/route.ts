import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { partnerCapabilities } from "@/lib/partner-access";

async function partnerContext(){
 const user=await authorizePermission("partner.portal.view");
 if(!user)return null;
 const partner=await prisma.partner.findFirst({where:{user:{is:{id:user.id}}}});
 if(!partner)return null;
 return {user,partner};
}

export async function GET(){
 const ctx=await partnerContext();
 if(!ctx)return NextResponse.json({error:"Unauthorized or partner account not linked."},{status:401});
 const {partner}=ctx;
 const capabilities=partnerCapabilities(partner);
 if(!capabilities.includes("partner.promote"))return NextResponse.json({error:"Your partner account is not currently enabled for promotion."},{status:403});
 const workspaceId=partner.workspaceId;
 const [listings,authorizations,contracts]=await Promise.all([
  prisma.commercialListing.findMany({
   where:{workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},
   orderBy:[{featured:"desc"},{publishedAt:"desc"}],
   take:100,
   include:{product:{select:{name:true,imageUrl:true,kind:true,shortDescription:true,startingPrice:true}}}
  }),
  prisma.commercialListingAuthorization.findMany({where:{workspaceId,partnerId:partner.id},orderBy:{createdAt:"desc"},include:{program:{select:{id:true,name:true,status:true}}}}),
  prisma.commissionContract.findMany({where:{workspaceId,partnerId:partner.id,status:"ACTIVE"},select:{id:true,programId:true,program:{select:{id:true,name:true,status:true}}}})
 ]);
 const activePrograms=contracts.filter(x=>x.program.status==="PUBLISHED");
 return NextResponse.json({listings:listings.map(l=>{const a=authorizations.find(x=>x.listingId===l.id);return {
  id:l.id,title:l.title,slug:l.slug,listingType:l.listingType,category:l.category,description:l.description,location:l.location,askingPrice:l.askingPrice?.toString()||null,currency:l.currency,priceLabel:l.priceLabel,featured:l.featured,product:l.product?{name:l.product.name,imageUrl:l.product.imageUrl,kind:l.product.kind,shortDescription:l.product.shortDescription,startingPrice:l.product.startingPrice?.toString()||null}:null,
  applicationStatus:a?.status||null,authorizationId:a?.id||null,authorizationType:a?.authorizationType||null,programName:a?.program?.name||null
 };}),programs:activePrograms.map(x=>({id:x.program.id,name:x.program.name})),partnerType:partner.type});
}

export async function POST(request:Request){
 const ctx=await partnerContext();
 if(!ctx)return NextResponse.json({error:"Unauthorized or partner account not linked."},{status:401});
 const {partner}=ctx;
 if(!partnerCapabilities(partner).includes("partner.promote"))return NextResponse.json({error:"Your partner account is not currently enabled for promotion."},{status:403});
 const body=await request.json().catch(()=>({}));
 const listingId=String(body.listingId||"").trim();
 if(!listingId)return NextResponse.json({error:"listingId is required."},{status:400});
 const listing=await prisma.commercialListing.findFirst({where:{id:listingId,workspaceId:partner.workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},select:{id:true,title:true,slug:true}});
 if(!listing)return NextResponse.json({error:"Marketplace listing is not available."},{status:404});
 const programId=String(body.programId||"").trim();
 if(!programId)return NextResponse.json({error:"Select an active partner program before applying for promotion."},{status:422});
 const contract=await prisma.commissionContract.findFirst({where:{workspaceId:partner.workspaceId,partnerId:partner.id,programId,status:"ACTIVE"},include:{program:{select:{id:true,name:true,status:true,allowedPartnerTypes:true}}}});
 if(!contract||contract.program.status!=="PUBLISHED")return NextResponse.json({error:"You need an active contract for a published partner program before promoting this offer."},{status:422});
 if(contract.program.allowedPartnerTypes && !String(contract.program.allowedPartnerTypes).split(/[,|\n]/).map(x=>x.trim().toUpperCase()).filter(Boolean).includes(partner.type))return NextResponse.json({error:"Your partner type is not allowed by this program."},{status:422});
 const existing=await prisma.commercialListingAuthorization.findFirst({where:{workspaceId:partner.workspaceId,listingId,partnerId:partner.id,programId},orderBy:{createdAt:"desc"}});
 if(existing&&["REQUESTED","APPROVED","ACTIVE"].includes(existing.status))return NextResponse.json({ok:true,alreadyApplied:true,authorization:existing});
 const authorization=await prisma.commercialListingAuthorization.create({data:{
  id:crypto.randomUUID(),workspaceId:partner.workspaceId,listingId,partnerId,programId,authorizationType:"AFFILIATE_PROMOTION",status:"REQUESTED",
  effectiveAt:new Date(),channel:"SOCIAL",partnerTypes:partner.type,commissionRule:null,approvedBy:null,approvedAt:null,
  exclusions:null,protectionDays:null
 }});
 return NextResponse.json({ok:true,authorization},{status:201});
}
