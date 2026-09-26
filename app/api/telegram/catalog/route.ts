import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseMedia(value:string|null): string[] {
  return (value||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).slice(0,12);
}

export async function GET(request:Request) {
  const url=new URL(request.url);
  const workspaceId=url.searchParams.get("workspaceId");
  const campaignId=url.searchParams.get("campaignId");
  if(!workspaceId) return NextResponse.json({error:"workspaceId is required."},{status:400});

  const [products,resources]=await Promise.all([
    prisma.product.findMany({
      where:{active:true,workspaceId,...(campaignId?{campaigns:{some:{id:campaignId,status:{in:["OPEN","ACTIVE"]}}}}:{})},
      orderBy:[{featured:"desc"},{sortOrder:"asc"},{name:"asc"}],
      select:{id: true,slug:true,name:true,kind:true,tagline:true,shortDescription:true,description:true,features:true,benefits:true,deliverables:true,imageUrl:true,galleryUrls:true,mediaUrls:true,specifications:true,startingPrice:true,ctaLabel:true,ctaNote:true,relationshipType:true,providerName:true}
    }),
    prisma.resource.findMany({
      where:{active:true,workspaceId,...(campaignId?{campaignId}:{})},
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
