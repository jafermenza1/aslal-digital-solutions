import { requirePermission } from "@/lib/authorization";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductCatalogManager } from "@/components/ProductCatalogManager";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const user = await requirePermission("products.manage");
  const access = await authorizeWorkspacePermission("products.manage");
  if (!access) return <main className="dashboard-page min-h-screen py-10"><div className="container-aslal"><div className="dashboard-feature-card"><h1>Workspace access unavailable</h1><p className="mt-2">Select an active business workspace where you have product management permission.</p></div></div></main>;
  const workspace=access.workspace;
  const products = await prisma.product.findMany({
    where:{workspaceId:workspace.id},
    orderBy:[{active:"desc"},{sortOrder:"asc"},{name:"asc"}],
    include:{workspace:{select:{id:true,name:true,slug:true}}},
  });
  const workspaces=[workspace];
  return <main className="dashboard-page min-h-screen py-10">
    <div className="container-aslal">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#E2B02A]">Growth OS / Catalog</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Products & services</h1>
          <p className="mt-2 max-w-3xl text-slate-500">Manage this business workspace&apos;s products and services. Catalog items are independent of individual users; public pages and contact attribution read from the same records. Contact auto-reply remains a separate conversation/email capability.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500">{workspace.name} · {user.email}</span>
          
          
          <Link href="/dashboard" className="rounded-full bg-[#E2B02A] px-5 py-3 text-sm font-black text-white">← Dashboard</Link>
        </div>
      </div>
      <div className="mt-8"><ProductCatalogManager workspaces={workspaces} initial={products.map(p=>({
        id:p.id,slug:p.slug,name:p.name,kind:p.kind,category:p.category,stockQuantity:p.stockQuantity,workspaceId:p.workspaceId,workspaceName:p.workspace?.name||"Unassigned",providerName:p.providerName,relationshipType:p.relationshipType,
        tagline:p.tagline,shortDescription:p.shortDescription,description:p.description,features:p.features,benefits:p.benefits,
        idealFor:p.idealFor,deliverables:p.deliverables,imageUrl:p.imageUrl,galleryUrls:p.galleryUrls,startingPrice:p.startingPrice,
        ctaLabel:p.ctaLabel,ctaNote:p.ctaNote,sortOrder:p.sortOrder,featured:p.featured,active:p.active
      }))}/></div>
    </div>
  </main>;
}
