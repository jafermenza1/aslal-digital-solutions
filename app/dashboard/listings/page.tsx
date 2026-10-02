import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { CommercialListingManager } from "@/components/CommercialListingManager";
import { CommercialAuthorizationManager } from "@/components/CommercialAuthorizationManager";
import { CommercialDealRegistrationManager } from "@/components/CommercialDealRegistrationManager";
import { CommercialInspectionManager } from "@/components/CommercialInspectionManager";
import { CommercialDemandWorkbench } from "@/components/CommercialDemandWorkbench";
import { ProfessionalProfileManager } from "@/components/ProfessionalProfileManager";

export const dynamic="force-dynamic";

export default async function CommercialListingsPage(){
 const user=await requirePermission("products.manage");
 const workspaceId=user.workspaceId;
 const [listings,products,parties,workspaceUsers,partners,programs,leads,dealRegistrations,commercialRequests,commercialMatches,professionalProfiles]=await Promise.all([
  prisma.commercialListing.findMany({where:workspaceId?{workspaceId}:undefined,orderBy:{updatedAt:"desc"},include:{product:{select:{id:true,name:true,slug:true,kind:true}},ownerParty:{select:{id:true,name:true,type:true,status:true}},supplierParty:{select:{id:true,name:true,type:true,status:true}},workspace:{select:{id:true,name:true,slug:true}}}}),
  prisma.product.findMany({where:workspaceId?{workspaceId,active:true}:{active:true},select:{id:true,name:true,slug:true,kind:true},orderBy:{name:"asc"}}),
  prisma.commercialParty.findMany({where:workspaceId?{workspaceId}:{},orderBy:{name:"asc"},select:{id:true,name:true,type:true,status:true}}),
  prisma.workspaceUser.findMany({where:workspaceId?{workspaceId,status:"ACTIVE"}:{},include:{user:{select:{id:true,name:true,email:true,active:true}}},orderBy:{createdAt:"asc"}}),
  prisma.partner.findMany({where:workspaceId?{workspaceId,status:"ACTIVE"}:{},select:{id:true,name:true,partnerNumber:true,type:true,status:true,verificationStatus:true},orderBy:{name:"asc"}}),
  prisma.partnerProgram.findMany({where:workspaceId?{workspaceId}:{},select:{id:true,name:true,status:true,admissionMode:true},orderBy:{name:"asc"}}),
  prisma.lead.findMany({where:workspaceId?{workspaceId}:{},select:{id:true,name:true,email:true,phone:true,status:true},orderBy:{createdAt:"desc"},take:200}),
  prisma.commercialDealRegistration.findMany({where:workspaceId?{workspaceId,status:{in:["PROTECTED","CONVERTED"]}}:{status:{in:["PROTECTED","CONVERTED"]}},orderBy:{createdAt:"desc"},take:200,select:{id:true,status:true,buyerName:true,partner:{select:{id:true,name:true,partnerNumber:true}},lead:{select:{id:true,name:true}}}}),
  prisma.commercialRequest.findMany({where:workspaceId?{workspaceId}:{},orderBy:{createdAt:"desc"},take:200,include:{lead:{select:{id:true,name:true,status:true,score:true}},opportunity:{select:{id:true,name:true,stage:true,expectedValue:true}},responses:{orderBy:{createdAt:"desc"},include:{responderParty:{select:{id:true,name:true,type:true}},partner:{select:{id:true,name:true,partnerNumber:true}},listing:{select:{id:true,title:true,status:true}},quote:{select:{id:true,quoteNumber:true,status:true,total:true}},order:{select:{id:true,orderNumber:true,status:true,total:true}}}}}}),
  prisma.commercialMatch.findMany({where:workspaceId?{workspaceId}:{},orderBy:[{score:"desc"},{createdAt:"desc"}],take:250,include:{listing:{select:{id:true,title:true,listingType:true,category:true,location:true,askingPrice:true,currency:true}},request:{select:{id:true}},response:{select:{id:true,status:true,quotedAmount:true,currency:true}}}}),
  prisma.professionalProfile.findMany({where:workspaceId?{workspaceId}:{},orderBy:{updatedAt:"desc"},include:{party:{select:{id:true,name:true}},partner:{select:{id:true,name:true,partnerNumber:true}},credentials:{orderBy:{createdAt:"desc"}}}})
 ]);
 return <main className="dashboard-page min-h-screen py-10"><div className="container-aslal">
  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
   <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#D97706]">Growth OS / Commercial Engine / CE-1</div><h1 className="mt-2 text-4xl font-black tracking-tight">Commercial Listings</h1><p className="mt-2 max-w-3xl text-slate-500">Publish a controlled commercial representation of an existing product/service, asset or property without replacing the canonical catalog. Authorization, partner eligibility, deal registration and matching are later commercial-engine gates.</p></div>
   <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500">{user.workspaceName||"Workspace"}</span>
  </div>
  <div className="mt-8"><CommercialListingManager initial={listings.map(x=>({id:x.id,workspaceId:x.workspaceId,workspaceName:x.workspace.name,productId:x.productId,productName:x.product?.name||null,ownerPartyId:x.ownerPartyId,ownerPartyName:x.ownerParty?.name||null,supplierPartyId:x.supplierPartyId,supplierPartyName:x.supplierParty?.name||null,title:x.title,slug:x.slug,listingType:x.listingType,status:x.status,description:x.description,category:x.category,condition:x.condition,location:x.location,askingPrice:x.askingPrice?String(x.askingPrice):null,currency:x.currency,priceLabel:x.priceLabel,inspectionRequired:x.inspectionRequired,requestQuote:x.requestQuote,publicVisible:x.publicVisible,featured:x.featured,expiresAt:x.expiresAt?.toISOString()||null}))} products={products} parties={parties} workspaceId={workspaceId||""}/></div>
  {workspaceId&&<CommercialAuthorizationManager workspaceId={workspaceId} initialParties={parties} listings={listings.map(x=>({id:x.id,title:x.title}))} users={workspaceUsers.map(x=>({id:x.user.id,name:x.user.name,email:x.user.email}))} partners={partners}/>}\n  {workspaceId&&<CommercialDealRegistrationManager workspaceId={workspaceId} listings={listings.map(x=>({id:x.id,title:x.title}))} partners={partners} leads={leads}/>}\n  {workspaceId&&<CommercialInspectionManager workspaceId={workspaceId} listings={listings.map(x=>({id:x.id,title:x.title}))} registrations={dealRegistrations}/>} 
  {workspaceId&&<ProfessionalProfileManager workspaceId={workspaceId} parties={parties} initial={professionalProfiles.map(x=>({id:x.id,displayName:x.displayName,profession:x.profession,status:x.status,verificationLevel:x.verificationLevel,party:x.party,partner:x.partner,credentials:x.credentials}))}/>}\n  {workspaceId&&<CommercialDemandWorkbench workspaceId={workspaceId} initial={commercialRequests.map(x=>({id:x.id,requestType:x.requestType,status:x.status,title:x.title,requestedItem:x.requestedItem,contactName:x.contactName,lead:x.lead,opportunity:x.opportunity,responses:x.responses}))} initialMatches={commercialMatches.map(x=>({id:x.id,requestId:x.requestId,listingId:x.listingId,status:x.status,score:x.score,reasons:x.reasons,eligibility:x.eligibility,listing:x.listing}))} parties={parties} partners={partners} listings={listings.map(x=>({id:x.id,title:x.title}))}/>}
 </div></main>;
}