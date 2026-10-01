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
  let resolvedWorkspaceId=requestedWorkspaceId;
  if(connectionId){
    const connection=await prisma.telegramBusinessConnection.findUnique({where:{id:connectionId},select:{workspaceId:true,status:true}});
    if(!connection||connection.status!=="ACTIVE") return NextResponse.json({error:"Telegram business connection is unavailable."},{status:403});
    if(requestedWorkspaceId&&requestedWorkspaceId!==connection.workspaceId) return NextResponse.json({error:"Telegram connection and workspace do not match."},{status:403});
    resolvedWorkspaceId=connection.workspaceId;
  }
  if(!resolvedWorkspaceId) resolvedWorkspaceId=await resolveTelegramDefaultWorkspaceId();
  if(!resolvedWorkspaceId) return NextResponse.json({error:"No active Telegram catalog workspace is available."},{status:403});
  const workspace=await prisma.workspace.findFirst({where:{id:resolvedWorkspaceId,active:true},select:{id:true,name:true,slug:true}});
  if(!workspace)return NextResponse.json({error:"Workspace is unavailable."},{status:403});
  const config=await prisma.telegramChannelConfig.findUnique({where:{workspaceId:workspace.id}});
  if(!config?.enabled||!config.publicEnabled||!config.allowAnonymousUsers)return NextResponse.json({error:"Public Telegram catalog is disabled for this workspace."},{status:403});
  const selectedWorkspaceIds=[workspace.id];
  const selectedConfigs=[config];
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
    workspaces:[workspace],
    products:await Promise.all(visibleProducts.map(async p=>({...p,media:[...parseMedia(p.mediaUrls),...parseMedia(p.galleryUrls)],search:await getSearchProfile(String(p.workspaceId),"PRODUCT",p.id,"en")}))),
    resources:await Promise.all(visibleResources.map(async r=>({...r,media:parseMedia(r.mediaUrls),search:await getSearchProfile(String(r.workspaceId),"RESOURCE",r.id,"en")}))),
    showStock:selectedConfigs.some(c=>c.showStock),
  },{headers:{"Cache-Control":"private, max-age=30"}});
}
