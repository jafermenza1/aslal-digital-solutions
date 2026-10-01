import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const channelMap={WEBSITE:"WEBSITE",PARTNER_MARKETPLACE:"PARTNER_MARKETPLACE",TELEGRAM:"TELEGRAM"} as const;
export async function GET(request:Request){
 const url=new URL(request.url),workspaceId=url.searchParams.get("workspaceId")?.trim(),channel=(url.searchParams.get("channel")||"WEBSITE") as keyof typeof channelMap;
 if(!workspaceId||!channelMap[channel])return NextResponse.json({error:"workspaceId and a valid channel are required."},{status:400});
 const workspace=await prisma.workspace.findFirst({where:{id:workspaceId,active:true},select:{id:true,name:true,slug:true}});
 if(!workspace)return NextResponse.json({error:"Business workspace is unavailable."},{status:404});
 const offers=await prisma.catalogOffer.findMany({
  where:{workspaceId,status:"PUBLISHED",channels:{some:{channel:channelMap[channel],enabled:true}}},
  include:{product:{select:{id:true,slug:true,name:true,kind:true,category:true,imageUrl:true,galleryUrls:true,mediaUrls:true,specifications:true,startingPrice:true,active:true}},resource:{select:{id:true,slug:true,title:true,category:true,preview:true,mediaUrls:true,specifications:true,downloadUrl:true,active:true}},channels:{where:{channel:channelMap[channel],enabled:true},take:1}},
  orderBy:[{featured:"desc"},{displayOrder:"asc"},{title:"asc"}]
 });
 return NextResponse.json({workspace,channel,offers},{headers:{"Cache-Control":"public, max-age=30"}});
}
