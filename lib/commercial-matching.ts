import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { evaluateCommercialPartnerEligibility } from "@/lib/commercial-eligibility";

const tokens=(v:unknown)=>String(v??"").toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>=2);
const overlap=(a:unknown,b:unknown)=>{const A=new Set(tokens(a)),B=new Set(tokens(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return Math.min(1,n/Math.max(1,Math.min(A.size,B.size)))};
const number=(v:unknown)=>v==null?null:Number(v);
const typeFit=(requestType:string,listingType:string)=>{
 if(requestType==="SERVICE_REQUEST"||requestType==="RFP")return listingType==="SERVICE"?1:0;
 if(requestType==="ASSET_REQUEST")return ["ASSET","PROPERTY"].includes(listingType)?1:listingType==="PRODUCT"?.5:0;
 return ["PRODUCT","ASSET","PROPERTY","SERVICE"].includes(listingType)?1:0;
};
export async function evaluateCommercialMatches(input:{workspaceId:string;requestId:string;actorId?:string|null;limit?:number}){
 const request=await prisma.commercialRequest.findFirst({where:{id:input.requestId,workspaceId:input.workspaceId},select:{id:true,workspaceId:true,requestType:true,status:true,title:true,category:true,requestedItem:true,description:true,quantity:true,conditionPreference:true,budgetMin:true,budgetMax:true,currency:true,location:true,serviceArea:true,deadline:true,specifications:true,partnerId:true}});
 if(!request)throw new Error("REQUEST_NOT_FOUND");
 if(!["PUBLISHED","MATCHING","RESPONSES_OPEN"].includes(request.status))throw new Error("REQUEST_NOT_OPEN_FOR_MATCHING");
 const listings=await prisma.commercialListing.findMany({where:{workspaceId:input.workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},include:{professionalProfile:{select:{id:true,status:true,verificationLevel:true,profession:true,specialties:true,serviceCategories:true,serviceAreas:true,availability:true}}},take:Math.min(input.limit||100,250),orderBy:{createdAt:"desc"}});
 const existing=await prisma.commercialMatch.findMany({where:{requestId:request.id,workspaceId:input.workspaceId},select:{listingId:true}});
 const seen=new Set(existing.map(x=>x.listingId));
 const matches=[];
 for(const listing of listings){
  if(seen.has(listing.id))continue;
  const category=overlap(request.category,listing.category);
  const profileText=listing.professionalProfile?JSON.stringify({profession:listing.professionalProfile.profession,specialties:listing.professionalProfile.specialties,serviceCategories:listing.professionalProfile.serviceCategories}):"";
  const item=overlap(request.requestedItem,listing.title+" "+listing.description+" "+profileText);
  const location=overlap(request.location,listing.location);
  const profileAreas=listing.professionalProfile?.serviceAreas?JSON.stringify(listing.professionalProfile.serviceAreas):"";
  const serviceArea=overlap(request.serviceArea,listing.location+" "+profileAreas);
  const type=typeFit(request.requestType,listing.listingType);
  const condition=request.conditionPreference?overlap(request.conditionPreference,listing.condition||""):0;
  const price=number(listing.askingPrice),min=number(request.budgetMin),max=number(request.budgetMax);
  let budget=0;
  if(price==null)budget=(min==null&&max==null)?.5:0;
  else if((min==null||price>=min)&&(max==null||price<=max))budget=1;
  else if(max!=null&&price<=max*1.15)budget=.5;
  const deadline=listing.expiresAt&&request.deadline?(listing.expiresAt.getTime()>=request.deadline.getTime()?1:0):1;
  const professionalFit=request.requestType==="SERVICE_REQUEST"||request.requestType==="RFP" ? (listing.professionalProfile?.status==="PUBLISHED" ? (listing.professionalProfile.verificationLevel==="AUTHORIZED_PROVIDER"?1:.5) : 0) : 0;
  const score=Math.round(type*18+category*17+item*24+location*11+serviceArea*9+condition*5+budget*10+deadline*2+professionalFit*4);
  if(score<30)continue;
  let eligibility:string|null=null,eligibilityReasons:string[]=[];
  if(request.partnerId){
   try{const e=await evaluateCommercialPartnerEligibility({workspaceId:input.workspaceId,listingId:listing.id,partnerId:request.partnerId,actorId:input.actorId});eligibility=e.decision;eligibilityReasons=e.reasons}catch{eligibility="INELIGIBLE";eligibilityReasons=["PARTNER_NOT_FOUND"];}
  }
  const reasons=[type?"request/listing type fit "+Math.round(type*100)+"%": "request/listing type mismatch",category?"category match "+Math.round(category*100)+"%":null,item?"requested item match "+Math.round(item*100)+"%":null,location?"location match "+Math.round(location*100)+"%":null,serviceArea?"service-area match "+Math.round(serviceArea*100)+"%":null,budget?"budget fit "+Math.round(budget*100)+"%":null,professionalFit?"professional profile fit "+Math.round(professionalFit*100)+"%":null].filter(Boolean);
  const row=await prisma.commercialMatch.create({data:{id:randomUUID(),workspaceId:input.workspaceId,requestId:request.id,listingId:listing.id,partnerId:request.partnerId||null,supplierPartyId:listing.supplierPartyId||listing.ownerPartyId||null,status:"SUGGESTED",score,scoreBreakdown:{type:Math.round(type*100),category:Math.round(category*100),item:Math.round(item*100),location:Math.round(location*100),serviceArea:Math.round(serviceArea*100),condition:Math.round(condition*100),budget:Math.round(budget*100),deadline:Math.round(deadline*100),professional:Math.round(professionalFit*100)},reasons,eligibility,eligibilityReasons:eligibilityReasons.length?eligibilityReasons:undefined,evaluatedAt:new Date(),expiresAt:new Date(Date.now()+7*24*60*60*1000)}});
  matches.push(row);
 }
 await prisma.commercialRequest.update({where:{id:request.id},data:{status:"MATCHING"}});
 return {request,matches};
}
