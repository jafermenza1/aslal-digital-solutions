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
  const workspaceId=requestedWorkspaceId||resolvePublicWorkspaceId(url.hostname);
  if(!workspaceId) return NextResponse.json({error:"workspaceId is required."},{status:400});
  const { getTelegramChannelConfig } = await import("@/lib/telegram-channel-config");
  const config=await getTelegramChannelConfig(workspaceId);
  if(!config?.enabled||!config.publicEnabled||!config.allowAnonymousUsers) return NextResponse.json({error:"Public Telegram catalog is disabled."},{status:403});

  const [products,resources]=await Promise.all([
    prisma.product.findMany({
      where:{active:true,workspaceId,...(config.showProducts?{}:{id:"__hidden__"}),...(campaignId?{campaigns:{some:{id:campaignId,status:{in:["OPEN","ACTIVE"]}}}}:{})},
      orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}],
      select:{id: true,slug:true,name:true,kind:true,tagline:true,shortDescription:true,description:true,features:true,benefits:true,deliverables:true,imageUrl:true,galleryUrls:true,mediaUrls:true,specifications:true,startingPrice:true,ctaLabel:true,ctaNote:true,relationshipType:true,providerName:true}
    }),
    prisma.resource.findMany({
      where:{active:true,workspaceId,...(config.showResources?{}:{id:"__hidden__"}),...(campaignId?{campaignId}:{})},
      orderBy:[{publishedAt:"desc"},{title:"asc"}],
      select:{id:true,slug:true,title:true,category:true,description:true,preview:true,cta:true,intent:true,downloadUrl:true,mediaUrls:true,specifications:true,relationshipType:true,providerName:true}
    })
  ]);

  return NextResponse.json({
    workspaceId,
    campaignId:campaignId||null,
    products:products.map(p=>({...p,media:[...parseMedia(p.mediaUrls),...parseMedia(p.galleryUrls)]})),
    resources:resources.map(r=>({...r,media:parseMedia(r.mediaUrls)})),
  },{headers:{"Cache-Control":"private, max-age=30"}});
}
