import { NextResponse } from "next/server";
import { getSearchProfile, split } from "@/lib/search-profiles";
import { prisma } from "@/lib/prisma";
import { resolveTelegramDefaultWorkspaceId } from "@/lib/telegram-channel-config";

export const dynamic = "force-dynamic";

function parseMedia(value:string|null): string[] {
  return (value||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).slice(0,12);
}

export async function GET(request:Request) {
  const url=new URL(request.url);
  const requestedWorkspaceId=url.searchParams.get("workspaceId")?.trim()||"";
  const connectionId=url.searchParams.get("connectionId")?.trim()||"";
  const campaignId=url.searchParams.get("campaignId");
  const requestedReferralCode=url.searchParams.get("ref")?.trim()||"";
  let resolvedWorkspaceId=requestedWorkspaceId;
  if(connectionId){
    const connection=await prisma.telegramBusinessConnection.findUnique({where:{id:connectionId},select:{workspaceId:true,status:true}});
    if(!connection||connection.status!=="ACTIVE") return NextResponse.json({error:"Telegram business connection is unavailable."},{status:403});
    if(requestedWorkspaceId&&requestedWorkspaceId!==connection.workspaceId) return NextResponse.json({error:"Telegram connection and workspace do not match."},{status:403});
    resolvedWorkspaceId=connection.workspaceId;
  }
  if(!resolvedWorkspaceId) resolvedWorkspaceId=await resolveTelegramDefaultWorkspaceId();
  if(!resolvedWorkspaceId) return NextResponse.json({error:"No active Telegram catalog workspace is available."},{status:403});
  let referralCode:string|null=null;
  if(requestedReferralCode){
    const referral=await prisma.referralLink.findFirst({where:{workspaceId:resolvedWorkspaceId,code:requestedReferralCode,partner:{accountStatus:"ACTIVE"}},select:{code:true,partnerId:true,campaignId:true}});
    if(!referral) return NextResponse.json({error:"Referral attribution link is invalid or inactive."},{status:400});
    referralCode=referral.code;
  }
  const workspace=await prisma.workspace.findFirst({where:{id:resolvedWorkspaceId,active:true},select:{id:true,name:true,slug:true}});
  if(!workspace)return NextResponse.json({error:"Workspace is unavailable."},{status:403});
  const config=await prisma.telegramChannelConfig.findUnique({where:{workspaceId:workspace.id}});
  if(!config?.enabled||!config.publicEnabled||!config.allowAnonymousUsers)return NextResponse.json({error:"Public Telegram catalog is disabled for this workspace."},{status:403});
  const selectedWorkspaceIds=[workspace.id];
  const selectedConfigs=[config];
  const offers=await prisma.catalogOffer.findMany({
    where:{workspaceId:workspace.id,status:"PUBLISHED",channels:{some:{channel:"TELEGRAM",enabled:true}}},
    include:{product:{select:{id:true,slug:true,name:true,category:true,imageUrl:true,galleryUrls:true,startingPrice:true,active:true}},resource:{select:{id:true,slug:true,title:true,category:true,preview:true,downloadUrl:true,active:true}},channels:{where:{channel:"TELEGRAM",enabled:true},take:1}},
    orderBy:[{featured:"desc"},{displayOrder:"asc"},{title:"asc"}]
  });
  const products=await prisma.product.findMany({
    where:{active:true,workspaceId:{in:selectedWorkspaceIds},...(campaignId?{campaigns:{some:{id:campaignId,status:{in:["OPEN","ACTIVE"]}}}}:{})},
    orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}],
    select:{id:true,workspaceId:true,slug:true,name:true,category:true,stockQuantity:true,kind:true,tagline:true,shortDescription:true,description:true,features:true,benefits:true,deliverables:true,imageUrl:true,galleryUrls:true,mediaUrls:true,specifications:true,startingPrice:true,ctaLabel:true,ctaNote:true,relationshipType:true,providerName:true}
  });
  const resources=await prisma.resource.findMany({
    where:{active:true,workspaceId:{in:selectedWorkspaceIds},...(campaignId?{campaignId}:{})},
    orderBy:[{publishedAt:"desc"},{title:"asc"}],
    select:{id:true,workspaceId:true,slug:true,title:true,category:true,description:true,preview:true,cta:true,intent:true,downloadUrl:true,mediaUrls:true,specifications:true,relationshipType:true,providerName:true}
  });
  const cfgByWorkspace=new Map(selectedConfigs.map(c=>[c.workspaceId,c]));
  const visibleProducts=products.filter(p=>p.workspaceId!==null&&cfgByWorkspace.get(p.workspaceId)?.showProducts);
  const visibleResources=resources.filter(r=>r.workspaceId!==null&&cfgByWorkspace.get(r.workspaceId)?.showResources);
  const workspaces=activeWorkspaces.filter(w=>publicWorkspaceIds.has(w.id));
  return NextResponse.json({
    workspaceId:workspace.id,
    connectionId:connectionId||null,
    campaignId:campaignId||null,
    referralCode,
    workspaces:[workspace],
    products:await Promise.all(visibleProducts.map(async p=>({...p,media:[...parseMedia(p.mediaUrls),...parseMedia(p.galleryUrls)],search:await getSearchProfile(String(p.workspaceId),"PRODUCT",p.id,"en")}))),
    resources:await Promise.all(visibleResources.map(async r=>({...r,media:parseMedia(r.mediaUrls),search:await getSearchProfile(String(r.workspaceId),"RESOURCE",r.id,"en")}))),
    showStock:selectedConfigs.some(c=>c.showStock),
    offers,
  },{headers:{"Cache-Control":"private, max-age=30"}});
}
