import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ProductKind, ProductRelationship } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission, INTERNAL_WORKSPACE_ID } from "@/lib/workspaces";

const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,160);
function payload(body:any){
 const name=clean(body.name,190);
 const workspaceId=clean(body.workspaceId,36)||INTERNAL_WORKSPACE_ID;
 const category=clean(body.category,100)||"General";
 const stockQuantity=body.stockQuantity===null||body.stockQuantity===""?null:Math.max(0,Math.floor(Number(body.stockQuantity)||0));
 const slug=slugify(clean(body.slug,160)||clean(body.name,190)) || `solution-${randomUUID().slice(0,8)}`;
 const kind=String(body.kind||"SERVICE") as ProductKind;
 const relationshipType=String(body.relationshipType||"OWNED") as ProductRelationship;
 const providerName=clean(body.providerName,190)||null;
 const shortDescription=clean(body.shortDescription,500);
 const description=clean(body.description,20000)||null;
 const tagline=clean(body.tagline,250)||null;
 const features=clean(body.features,12000)||null;
 const benefits=clean(body.benefits,12000)||null;
 const idealFor=clean(body.idealFor,12000)||null;
 const deliverables=clean(body.deliverables,12000)||null;
 const imageUrl=clean(body.imageUrl,1000)||null;
 const galleryUrls=clean(body.galleryUrls,12000)||null;
 const mediaUrls=clean(body.mediaUrls,12000)||null;
 const specifications=body.specifications && typeof body.specifications==="object" ? body.specifications : null;
 const startingPrice=clean(body.startingPrice,100)||null;
 const ctaLabel=clean(body.ctaLabel,80)||null;
 const ctaNote=clean(body.ctaNote,250)||null;
 const sortOrder=Math.max(0,Math.min(9999,Number(body.sortOrder)||0));
 const featured=Boolean(body.featured);
 const active=body.active!==false;
 return {workspaceId,category,stockQuantity,name,slug,kind,providerName,relationshipType,shortDescription,description,tagline,features,benefits,idealFor,deliverables,imageUrl,galleryUrls,mediaUrls,specifications,startingPrice,ctaLabel,ctaNote,sortOrder,featured,active};
}
function valid(p:any){return p.name&&p.slug&&p.shortDescription&&Object.values(ProductKind).includes(p.kind)&&Object.values(ProductRelationship).includes(p.relationshipType)&&p.workspaceId&&((p.kind===ProductKind.PRODUCT&&p.stockQuantity!==null&&Number.isInteger(p.stockQuantity))||p.kind===ProductKind.SERVICE);}
export async function GET(request:Request){
 const workspaceId=new URL(request.url).searchParams.get("workspaceId")?.trim()||"";
 const actor=await authorizeWorkspacePermission("products.manage",workspaceId||null);
 if(!actor)return NextResponse.json({error:"Catalog administration is not permitted for this workspace."},{status:403});
 const products=await prisma.product.findMany({where:workspaceId?{workspaceId}:undefined,orderBy:[{active:"desc"},{sortOrder:"asc"},{name:"asc"}],include:{workspace:{select:{id:true,name:true,slug:true}}}});
 const workspaces=await prisma.workspace.findMany({where:{active:true},select:{id:true,name:true,slug:true},orderBy:{name:"asc"}});
 return NextResponse.json({products,workspaces});
}
export async function POST(request:Request){
 const actor=await authorizePermission("products.manage");
 if(!actor)return NextResponse.json({error:"Catalog administration is not permitted."},{status:403});
 const body=await request.json().catch(()=>({})); const p=payload(body);
 const access=await authorizeWorkspacePermission("products.manage",p.workspaceId);
 if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
 if(!valid(p))return NextResponse.json({error:p.kind===ProductKind.PRODUCT&&p.stockQuantity===null?"A product requires a stock number. Use 0 when it is currently out of stock.": "Name, slug, short description, workspace, valid type and relationship are required."},{status:400});
 let finalSlug=p.slug;
 let suffix=2;
 while(await prisma.product.findUnique({where:{slug:finalSlug},select:{id:true}})){finalSlug=`${p.slug}-${suffix++}`.slice(0,160);}
 const product=await prisma.product.create({data:{id:randomUUID(),...p,slug:finalSlug},include:{workspace:{select:{id:true,name:true,slug:true}}}});
 revalidatePath("/products"); revalidatePath("/contact"); revalidatePath("/products/"+product.slug);
 return NextResponse.json({ok:true,product});
}
