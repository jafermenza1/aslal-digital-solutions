import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function GET(request:Request){
 const actor=await authorizePermission("dashboard.view");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const access=await authorizeWorkspacePermission("dashboard.view");
 if(!access)return NextResponse.json({error:"No active workspace is available."},{status:403});
 const q=new URL(request.url).searchParams.get("q")?.trim().slice(0,100)||"";
 if(q.length<2)return NextResponse.json({results:[]});
 const like={contains:q,mode:"insensitive" as const};
 const [users,products,partners,listings]=await Promise.all([
  actor.permissions.includes("users.manage")?prisma.user.findMany({where:{workspaceUsers:{some:{workspaceId:access.workspace.id}} ,OR:[{name:like},{email:like}]},select:{id:true,name:true,email:true,role:true,active:true},take:5}):Promise.resolve([]),
  actor.permissions.includes("products.manage")?prisma.product.findMany({where:{workspaceId:access.workspace.id,OR:[{name:like},{category:like},{slug:like}]},select:{id:true,name:true,kind:true,slug:true},take:5}):Promise.resolve([]),
  actor.permissions.includes("partners.manage")?prisma.partner.findMany({where:{workspaceId:access.workspace.id,OR:[{name:like},{email:like},{partnerNumber:like},{username:like}]},select:{id:true,name:true,email:true,partnerNumber:true,status:true},take:5}):Promise.resolve([]),
  actor.permissions.includes("listings.manage")?prisma.commercialListing.findMany({where:{workspaceId:access.workspace.id,OR:[{title:like},{category:like},{slug:like},{location:like}]},select:{id:true,title:true,listingType:true,status:true,location:true},take:5}):Promise.resolve([]),
 ]);
 return NextResponse.json({results:[
  ...users.map(x=>({kind:"Person",title:x.name,detail:`${x.email} · ${x.role}${x.active?"":" · inactive"}`,href:`/dashboard/users?user=${encodeURIComponent(x.id)}`})),
  ...products.map(x=>({kind:"Product",title:x.name,detail:`${x.kind} · ${x.slug}`,href:`/dashboard/products?product=${encodeURIComponent(x.id)}`})),
  ...partners.map(x=>({kind:"Partner",title:x.name,detail:`${x.partnerNumber} · ${x.status}`,href:`/dashboard/partners?partner=${encodeURIComponent(x.id)}`})),
  ...listings.map(x=>({kind:"Listing",title:x.title,detail:`${x.listingType} · ${x.status}${x.location?" · "+x.location:""}`,href:`/dashboard/listings?listing=${encodeURIComponent(x.id)}`})),
 ].slice(0,20)});
}
