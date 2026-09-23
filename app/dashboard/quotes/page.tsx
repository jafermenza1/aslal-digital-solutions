import { requirePermission } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import QuotesWorkspace from "./QuotesWorkspace";

export const dynamic="force-dynamic";

export default async function QuotesPage(){
  await requirePermission("leads.view");
  const quotes=await prisma.quote.findMany({include:{items:true,customer:true,opportunity:true,events:{orderBy:{createdAt:"asc"}}},orderBy:{createdAt:"desc"},take:100});
  const safe=quotes.map(q=>({...q,subtotal:Number(q.subtotal),discount:Number(q.discount),total:Number(q.total),items:q.items.map(i=>({...i,quantity:Number(i.quantity),unitPrice:Number(i.unitPrice),discount:Number(i.discount),lineTotal:Number(i.lineTotal)}))}));
  return <QuotesWorkspace initialQuotes={safe}/>;
}
