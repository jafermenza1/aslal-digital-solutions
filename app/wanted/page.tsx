import { prisma } from "@/lib/prisma";
import { WantedRequestForm } from "@/components/WantedRequestForm";
export const dynamic="force-dynamic";
export default async function WantedPage({searchParams}:{searchParams:Promise<{workspace?:string}>}){
 const q=await searchParams, slug=q.workspace||"";
 const workspace=slug?await prisma.workspace.findFirst({where:{slug,active:true},select:{id:true,name:true}}):null;
 return <main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-3xl">{workspace?<WantedRequestForm workspaceId={workspace.id} workspaceName={workspace.name}/>:<div className="rounded-3xl border bg-white p-8"><h1 className="text-3xl font-black">Tell us what you need</h1><p className="mt-2 text-slate-600">Use a business workspace link to submit a controlled purchase, asset, service or RFP request.</p><p className="mt-4 text-sm text-slate-500">Example: /wanted?workspace=your-workspace-slug</p></div>}</div></main>
}