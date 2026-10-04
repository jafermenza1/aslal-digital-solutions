import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
import { MarketplaceExchange } from "@/components/MarketplaceExchange";

export const dynamic="force-dynamic";

export default async function MarketplacePage(){
 const workspaceId=resolvePublicWorkspaceId();
 const listings=await prisma.commercialListing.findMany({
  where:{workspaceId,status:"PUBLISHED",publicVisible:true,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},
  orderBy:[{featured:"desc"},{publishedAt:"desc"}],
  include:{product:{select:{name:true,kind:true,shortDescription:true,imageUrl:true,startingPrice:true}}},
 });
 return <MarketplaceExchange listings={listings.map(x=>({
  id:x.id,slug:x.slug,title:x.title,listingType:x.listingType,category:x.category,
  description:x.description,location:x.location,askingPrice:x.askingPrice?.toString()||null,
  currency:x.currency,priceLabel:x.priceLabel,inspectionRequired:x.inspectionRequired,
  featured:x.featured,product:x.product?{...x.product,startingPrice:x.product.startingPrice?.toString()||null}:null
 }))}/>;
}

export const metadata:Metadata={
 title:"Marketplace | Aslal Digital Solutions",
 description:"Discover products, services, equipment, property and commercial assets through the Aslal exchange.",
 alternates:{canonical:"https://aslaldigital.com/marketplace"},
 openGraph:{title:"Marketplace | Aslal Digital Solutions",description:"Discover products, services, equipment, property and commercial assets through the Aslal exchange.",url:"https://aslaldigital.com/marketplace",type:"website"}
};
