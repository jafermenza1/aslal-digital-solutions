import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

function parseMedia(value:string|null): string[] {
  return (value||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).slice(0,12);
}

export async function GET(request:Request) {
  const url=new URL(request.url);
  const requestedWorkspaceId=url.searchParams.get("workspaceId")?.trim()||"";
  const campaignId=url.searchParams.get("campaignId");
  // Direct public catalog visits use the canonical public workspace mapping.
  // Telegram links with explicit workspaceId retain that workspace context.
  const { getTelegramChannelConfig } = await import("@/lib/telegram-channel-config");
  const activeWorkspaces=await prisma.workspace.findMany({where:{active:true},select:{id:true,name:true,slug:true},orderBy:{name:"asc"}});
  const configs=await prisma.telegramChannelConfig.findMany({where:{workspaceId:{in:activeWorkspaces.map(w=>w.id)},enabled:true,publicEnabled:true,allowAnonymousUsers:true}});
  const publicWorkspaceIds=new Set(configs.map(c=>c.workspaceId));
  const selectedWorkspaceIds=requestedWorkspaceId?[requestedWorkspaceId]:activeWorkspaces.filter(w=>publicWorkspaceIds.has(w.id)).map(w=>w.id);
  if(requestedWorkspaceId&&!publicWorkspaceIds.has(requestedWorkspaceId)) return NextResponse.json({error:"Public Telegram catalog is disabled for this workspace."},{status:403});
  if(!selectedWorkspaceIds.length) return NextResponse.json({error:"No active Telegram catalog workspaces are available."},{status:403});

  const selectedConfigs=configs.filter(c=>selectedWorkspaceIds.includes(c.workspaceId));
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
  const visibleProducts=products.filter(p=>cfgByWorkspace.get(p.workspaceId)?.showProducts);
  const visibleResources=resources.filter(r=>cfgByWorkspace.get(r.workspaceId)?.showResources);
  const workspaces=activeWorkspaces.filter(w=>selectedWorkspaceIds.includes(w.id));
  return NextResponse.json({
    workspaceId:requestedWorkspaceId||null,
    campaignId:campaignId||null,
    workspaces,
    products:visibleProducts.map(p=>({...p,media:[...parseMedia(p.mediaUrls),...parseMedia(p.galleryUrls)]})),
    resources:visibleResources.map(r=>({...r,media:parseMedia(r.mediaUrls)})),
    showStock:selectedConfigs.some(c=>c.showStock),
  },{headers:{"Cache-Control":"private, max-age":30"}});
}
