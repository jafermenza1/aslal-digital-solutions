import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

function quoteNumber() { return `QT-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${randomUUID().slice(0,8).toUpperCase()}`; }

const transitions: Record<string, string[]> = {
  SENT: ["DRAFT"],
  VIEWED: ["SENT"],
  NEGOTIATING: ["SENT","VIEWED","NEGOTIATING"],
  ACCEPTED: ["SENT","VIEWED","NEGOTIATING"],
  REJECTED: ["SENT","VIEWED","NEGOTIATING"],
  CANCELLED: ["DRAFT","SENT","VIEWED","NEGOTIATING"],
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await authorizeWorkspacePermission("leads.view", new URL(_.url).searchParams.get("workspaceId"));
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const quote = await prisma.quote.findUnique({
    where: { id, workspaceId: access.workspace.id },
    include: { items: { orderBy: { sortOrder: "asc" } }, events: { orderBy: { createdAt: "asc" } }, revisions: { orderBy: { version: "asc" } } },
  });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  return NextResponse.json({ quote });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const access = await authorizeWorkspacePermission("leads.edit", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied" }, { status: 403 });
  const action = String(body.action || "").toUpperCase();
  const current = await prisma.quote.findUnique({ where: { id, workspaceId: access.workspace.id }, include: { items: true } });
  if (!current) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  try {
    if (action === "REVISE") {
      if (!["DRAFT","SENT","VIEWED","NEGOTIATING"].includes(current.status)) return NextResponse.json({ error: "Only an active quote can be revised" }, { status: 409 });
      const items = Array.isArray(body.items) ? body.items : current.items;
      const normalized: Array<{description:string;quantity:number;unitPrice:number;discount:number;lineTotal:number;sortOrder:number}> = items.map((item: {description:string;quantity?:number;unitPrice:number;discount?:number}, i:number) => {
        const quantity=Number(item.quantity ?? 1), unitPrice=Number(item.unitPrice), discount=Number(item.discount ?? 0);
        if (!item.description || quantity <= 0 || unitPrice < 0 || discount < 0) throw new Error(`Invalid item ${i+1}`);
        return { description:item.description, quantity, unitPrice, discount, lineTotal:Math.max(0,quantity*unitPrice-discount), sortOrder:i };
      });
      const subtotal=normalized.reduce((s:number,i:{quantity:number;unitPrice:number})=>s+i.quantity*i.unitPrice,0);
      const quoteDiscount=Number(body.discount ?? current.discount);
      const total=Math.max(0,subtotal-normalized.reduce((s:number,i:{discount:number})=>s+i.discount,0)-quoteDiscount);
      const revised=await prisma.$transaction(async tx=>{
        const next=await tx.quote.create({
          data:{ id:randomUUID(), workspaceId:access.workspace.id, quoteNumber:quoteNumber(), customerId:current.customerId||undefined, opportunityId:current.opportunityId||undefined, parentQuoteId:current.id, version:current.version+1, status:"DRAFT", currency:current.currency, subtotal, discount:quoteDiscount, total, terms:body.terms!==undefined?String(body.terms):current.terms, expiresAt:body.expiresAt?new Date(body.expiresAt):current.expiresAt, createdBy:access.user.email, items:{create:normalized.map(i=>({id:randomUUID(),...i}))} },
          include:{items:true},
        });
        await tx.quote.update({where:{id:current.id,workspaceId:access.workspace.id},data:{status:"SUPERSEDED",supersededAt:new Date()}});
        await tx.negotiationEvent.create({data:{id:randomUUID(),quoteId:current.id,type:"SUPERSEDED",actor:access.user.email,snapshot:{replacedBy:next.id,version:next.version}}});
        await tx.negotiationEvent.create({data:{id:randomUUID(),quoteId:next.id,type:"REVISED",actor:access.user.email,note:body.note?String(body.note):undefined,snapshot:{previousQuoteId:current.id,previousVersion:current.version}}});
        return next;
      });
      return NextResponse.json({ quote: revised });
    }

    if (!(action in transitions)) return NextResponse.json({ error: "Unsupported quote action" }, { status: 400 });
    if (!transitions[action].includes(current.status)) return NextResponse.json({ error: `Cannot move ${current.status} to ${action}` }, { status: 409 });
    if (current.expiresAt && current.expiresAt.getTime() < Date.now() && !["CANCELLED"].includes(action)) {
      await prisma.quote.update({ where:{id,workspaceId:access.workspace.id}, data:{status:"EXPIRED"} });
      await prisma.negotiationEvent.create({data:{id:randomUUID(),quoteId:id,type:"EXPIRED",actor:"system"}});
      return NextResponse.json({ error:"Quote has expired" }, { status:409 });
    }
    const now = new Date();
    const data: Record<string, unknown> = { status: action };
    if (action==="SENT") data.sentAt=now;
    if (action==="VIEWED") data.viewedAt=now;
    if (action==="ACCEPTED") data.acceptedAt=now;
    if (action==="REJECTED") data.rejectedAt=now;
    if (action==="CANCELLED") data.cancelledAt=now;
    const quote=await prisma.$transaction(async tx=>{
      const updated=await tx.quote.update({where:{id,workspaceId:access.workspace.id},data});
      await tx.negotiationEvent.create({data:{id:randomUUID(),quoteId:id,type:action as any,actor:access.user.email,note:body.note?String(body.note):undefined,snapshot:{statusFrom:current.status,statusTo:action}}});
      return updated;
    });
    return NextResponse.json({quote});
  } catch(error) {
    const message=error instanceof Error?error.message:"Unable to update quote";
    return NextResponse.json({error:message},{status:400});
  }
}
