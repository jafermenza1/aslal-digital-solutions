import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

type EvalInput={workspaceId:string;listingId:string;partnerId:string;authorizationId?:string|null;channel?:string|null;territory?:string|null;actorId?:string|null};

const csv=(value:string|null|undefined)=>String(value||"").split(/[,\n|]/).map(x=>x.trim().toUpperCase()).filter(Boolean);
const contains=(value:string|null|undefined,needle:string)=>csv(value).includes(needle.toUpperCase())||String(value||"").toLowerCase().includes(needle.toLowerCase());

export async function evaluateCommercialPartnerEligibility(input:EvalInput){
 const listing=await prisma.commercialListing.findFirst({where:{id:input.listingId,workspaceId:input.workspaceId},select:{id:true,title:true,status:true,publicVisible:true,expiresAt:true,workspaceId:true}});
 if(!listing) throw new Error("LISTING_NOT_FOUND");
 const partner=await prisma.partner.findFirst({where:{id:input.partnerId,workspaceId:input.workspaceId},select:{id:true,name:true,type:true,status:true,accountStatus:true,verificationStatus:true,verificationLevel:true,onboardingStatus:true,serviceAreas:true}});
 if(!partner) throw new Error("PARTNER_NOT_FOUND");
 const authorization=await prisma.commercialListingAuthorization.findFirst({
  where:{id:input.authorizationId||undefined,listingId:input.listingId,workspaceId:input.workspaceId,partnerId:input.partnerId},
  include:{program:{select:{id:true,name:true,status:true,admissionMode:true,allowedPartnerTypes:true}},party:{select:{id:true,name:true,status:true}}}
 });
 const reasons:string[]=[];
 if(partner.status!=="ACTIVE") reasons.push("PARTNER_INACTIVE");
 if(["RESTRICTED","SUSPENDED","CLOSED"].includes(partner.accountStatus)) reasons.push("ACCOUNT_RESTRICTED");
 if(partner.verificationStatus==="SUSPENDED") reasons.push("VERIFICATION_REQUIRED");
 if(partner.onboardingStatus!=="COMPLETE") reasons.push("ONBOARDING_INCOMPLETE");
 if(!authorization) reasons.push("AUTHORIZATION_MISSING");
 else if(authorization.status!=="ACTIVE") reasons.push("AUTHORIZATION_NOT_ACTIVE");
 if(!["PUBLISHED"].includes(listing.status)||!listing.publicVisible) reasons.push("LISTING_NOT_PUBLISHED");
 if(listing.expiresAt && listing.expiresAt<=new Date()) reasons.push("LISTING_NOT_AVAILABLE");

 let contract:any=null;
 if(authorization?.program){
  if(authorization.program.status!=="PUBLISHED") reasons.push("PROGRAM_NOT_PUBLISHED");
  const allowed=csv(authorization.program.allowedPartnerTypes);
  if(allowed.length&&!allowed.includes(partner.type)) reasons.push("PARTNER_TYPE_NOT_ALLOWED");
  contract=await prisma.commissionContract.findFirst({where:{workspaceId:input.workspaceId,programId:authorization.program.id,partnerId:partner.id},select:{id:true,status:true,acceptedAt:true,termsId:true}});
  if(!contract) reasons.push("CONTRACT_MISSING");
  else if(contract.status!=="ACTIVE") reasons.push("CONTRACT_NOT_ACTIVE");
  if(contract){
   const accepted=await prisma.partnerTermsAcceptance.findFirst({where:{workspaceId:input.workspaceId,partnerId:partner.id,programId:authorization.program.id,termsId:contract.termsId},select:{id:true}});
   if(!accepted) reasons.push("TERMS_NOT_ACCEPTED");
  }
 } else if(authorization?.partnerId && ["AFFILIATE_PROMOTION","RESELLER_AUTHORIZED","IMPLEMENTATION_PARTNER"].includes(authorization.authorizationType)){
  reasons.push("CONTRACT_MISSING");
 }
 const effectiveChannel=input.channel||authorization?.channel||null;
 const effectiveTerritory=input.territory||authorization?.territory||null;
 if(authorization?.partnerTypes && !csv(authorization.partnerTypes).includes(partner.type)) reasons.push("PARTNER_TYPE_NOT_ALLOWED");
 if(authorization?.channel && effectiveChannel && !contains(authorization.channel,effectiveChannel)) reasons.push("CHANNEL_RESTRICTED");
 if(authorization?.territory && effectiveTerritory && !contains(partner.serviceAreas,effectiveTerritory)) reasons.push("TERRITORY_RESTRICTED");

 const hardReasons=new Set(["PARTNER_INACTIVE","ACCOUNT_RESTRICTED","VERIFICATION_REQUIRED","ONBOARDING_INCOMPLETE","PARTNER_TYPE_NOT_ALLOWED","AUTHORIZATION_MISSING","AUTHORIZATION_NOT_ACTIVE","PROGRAM_NOT_PUBLISHED","CONTRACT_MISSING","CONTRACT_NOT_ACTIVE","TERMS_NOT_ACCEPTED","TERRITORY_RESTRICTED","CHANNEL_RESTRICTED","LISTING_NOT_PUBLISHED","LISTING_NOT_AVAILABLE"]);
 const decision=reasons.length===0?"ELIGIBLE":reasons.some(x=>hardReasons.has(x))?"INELIGIBLE":"REVIEW_REQUIRED";
 const criteriaSnapshot={partner:{status:partner.status,accountStatus:partner.accountStatus,verificationStatus:partner.verificationStatus,verificationLevel:partner.verificationLevel,onboardingStatus:partner.onboardingStatus,type:partner.type},listing:{status:listing.status,publicVisible:listing.publicVisible,expiresAt:listing.expiresAt},authorization:authorization?{id:authorization.id,status:authorization.status,type:authorization.authorizationType,programId:authorization.programId,territory:authorization.territory,channel:authorization.channel}:null,program:authorization?.program||null,contract:contract?{id:contract.id,status:contract.status,acceptedAt:contract.acceptedAt}:null,requestedChannel:effectiveChannel,requestedTerritory:effectiveTerritory};
 const record=await prisma.commercialEligibilityDecisionRecord.create({data:{id:randomUUID(),workspaceId:input.workspaceId,listingId:listing.id,partnerId:partner.id,authorizationId:authorization?.id||null,decision,reasons,criteriaSnapshot,evaluatedAt:new Date(),evaluatedBy:input.actorId||null,expiresAt:new Date(Date.now()+24*60*60*1000)}});
 return {decision,reasons,record,criteriaSnapshot,partner,listing,authorization};
}
