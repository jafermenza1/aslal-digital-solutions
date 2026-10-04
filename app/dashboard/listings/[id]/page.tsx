import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { UnifiedListingActions } from "@/components/UnifiedListingActions";

export const dynamic="force-dynamic";

export default async function ListingRecordPage({params}:{params:Promise<{id:string}>}){
  const access=await authorizeWorkspacePermission("dashboard.view");
  if(!access)return <div className="p-8">No active workspace is available.</div>;
  const {id}=await params;
  const listing=await prisma.commercialListing.findFirst({
    where:{id,workspaceId:access.workspace.id},
    select:{id:true,title:true,slug:true,listingType:true,status:true,description:true,category:true,condition:true,location:true,serviceArea:true,askingPrice:true,currency:true,priceLabel:true,inspectionRequired:true,requestQuote:true,publicVisible:true,featured:true,expiresAt:true,createdAt:true,updatedAt:true,publishedAt:true,productId:true,ownerPartyId:true,supplierPartyId:true,professionalProfileId:true}
  });
  if(!listing)notFound();
  const canReview=access.user.role==="ADMIN"||access.user.role==="SUPER_ADMIN";
  return <main className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link href="/dashboard/approvals" className="text-xs font-black text-[#0F3E8A]">← Approvals</Link>
        <div className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-[#0F3E8A]">MARKETPLACE RECORD</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{listing.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">{listing.listingType}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{listing.status}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{listing.publicVisible?"Public":"Private"}</span>
        </div>
      </div>
      <Link href="/dashboard/listings" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black dark:border-white/10 dark:text-white">Open marketplace manager</Link>
    </div>

    <UnifiedListingActions id={listing.id} status={listing.status}/>

    <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Overview</div>
        <h2 className="mt-2 text-xl font-black dark:text-white">What is being offered?</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{listing.description||"No description provided."}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info label="Category" value={listing.category||"—"}/>
          <Info label="Location" value={listing.location||"—"}/>
          <Info label="Service area" value={listing.serviceArea||"—"}/>
          <Info label="Price" value={listing.priceLabel||((listing.askingPrice!=null?listing.currency+" "+String(listing.askingPrice):"Quote"))}/>
          <Info label="Condition" value={listing.condition||"—"}/>
          <Info label="Expires" value={listing.expiresAt?new Date(listing.expiresAt).toLocaleDateString("en-ET"):"No expiry"}/>
        </div>
      </article>
      <aside className="space-y-4">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Workflow</div>
          <h2 className="mt-2 text-xl font-black dark:text-white">Publication state</h2>
          <div className="mt-4 space-y-3 text-sm">
            <State label="Created" value={new Date(listing.createdAt).toLocaleString("en-ET")}/>
            <State label="Updated" value={new Date(listing.updatedAt).toLocaleString("en-ET")}/>
            <State label="Published" value={listing.publishedAt?new Date(listing.publishedAt).toLocaleString("en-ET"):"Not published"}/>
            <State label="Request quote" value={listing.requestQuote?"Enabled":"Disabled"}/>
            <State label="Inspection" value={listing.inspectionRequired?"Required":"Not required"}/>
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Relationships</div>
          <h2 className="mt-2 text-xl font-black dark:text-white">Commercial context</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <State label="Product" value={listing.productId||"Standalone listing"}/>
            <State label="Owner party" value={listing.ownerPartyId||"Not identified"}/>
            <State label="Supplier party" value={listing.supplierPartyId||"Not identified"}/>
            <State label="Professional profile" value={listing.professionalProfileId||"None"}/>
          </div>
        </section>
      </aside>
    </section>

    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Next work</div>
      <h2 className="mt-2 text-xl font-black dark:text-white">Use the existing specialist surfaces when the workflow continues</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link href="/dashboard/partners" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10 dark:text-white">Partner relationships →</Link>
        <Link href="/dashboard/orders" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10 dark:text-white">Orders & sales →</Link>
        <Link href="/dashboard/operations" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10 dark:text-white">Operations & issues →</Link>
      </div>
      {!canReview&&<p className="mt-4 text-xs text-slate-500">Your role can view this record, but publication decisions remain restricted to Aslal administrators.</p>}
    </section>
  </main>;
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 break-words text-sm font-bold text-slate-800 dark:text-slate-200">{value}</div></div>}
function State({label,value}:{label:string;value:string}){return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0 dark:border-white/5"><span className="text-xs text-slate-400">{label}</span><span className="max-w-[65%] break-words text-right text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span></div>}
