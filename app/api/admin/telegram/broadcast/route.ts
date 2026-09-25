import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";
import { sendThroughAdapter } from "@/lib/messaging";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
  const access = await authorizeWorkspacePermission("leads.edit", workspaceId);
  if (!access) return NextResponse.json({ error: "Unauthorized or workspace access denied." }, { status: 403 });

  const ids = Array.isArray(body.destinationIds) ? body.destinationIds.filter((v: unknown): v is string => typeof v === "string").slice(0, 200) : [];
  const productId = typeof body.productId === "string" ? body.productId : null;
  let text = typeof body.text === "string" ? body.text.trim().slice(0, 4000) : "";

  if (!ids.length) return NextResponse.json({ error: "destinationIds is required." }, { status: 400 });
  if (productId) {
    const [products] = await db.query("SELECT id,name,kind,short_description,starting_price,cta_label FROM products WHERE id=? AND active=1 LIMIT 1", [productId]);
    const product = (products as Array<{id:string;name:string;kind:string;short_description:string;starting_price:string|null;cta_label:string|null}>)[0];
    if (!product) return NextResponse.json({ error: "Product/service not found or inactive." }, { status: 404 });
    text = [product.name, product.short_description, product.starting_price ? "Starting price: " + product.starting_price : "", product.cta_label || "Reply to this message to learn more."].filter(Boolean).join("\n\n");
  }
  if (!text) return NextResponse.json({ error: "text or productId is required." }, { status: 400 });

  const [destinations] = await db.query(
    "SELECT id,chat_id,type,lead_id,person_id FROM telegram_destinations WHERE workspace_id=? AND id IN (" + ids.map(() => "?").join(",") + ") AND active=1 AND opt_in=1",
    [access.workspace.id, ...ids],
  );
  const rows = destinations as Array<{id:string;chat_id:string;type:string;lead_id:string|null;person_id:string|null}>;
  const results = [];
  for (const destination of rows) {
    let conversationId: string | null = null;
    const existing = await prisma.conversation.findFirst({where:{workspaceId:access.workspace.id,channel:"TELEGRAM",externalThreadId:destination.chat_id,status:{not:"CLOSED"}},select:{id:true}});
    if (existing) conversationId=existing.id;
    else {
      const conversation = await prisma.conversation.create({data:{id:randomUUID(),workspaceId:access.workspace.id,channel:"TELEGRAM",externalThreadId:destination.chat_id,status:"OPEN",assignedTo:access.user.email,leadId:destination.lead_id,personId:destination.person_id}});
      conversationId=conversation.id;
    }
    const message = await prisma.message.create({data:{id:randomUUID(),conversationId,direction:"OUTBOUND",status:"QUEUED",recipientAddress:destination.chat_id,body:text,metadata:{actor:access.user.email,productId}}});
    try {
      const provider = await sendThroughAdapter({channel:"TELEGRAM",recipient:destination.chat_id,externalThreadId:destination.chat_id,body:text});
      await prisma.$transaction([
        prisma.message.update({where:{id:message.id},data:{status:"SENT",sentAt:new Date(),metadata:{actor:access.user.email,provider,productId}}}),
        prisma.conversation.update({where:{id:conversationId},data:{lastMessageAt:new Date()}}),
      ]);
      results.push({destinationId:destination.id,status:"SENT"});
    } catch (error) {
      await prisma.message.update({where:{id:message.id},data:{status:"FAILED",metadata:{actor:access.user.email,error:error instanceof Error?error.message:"Telegram provider failed"}}});
      results.push({destinationId:destination.id,status:"FAILED"});
    }
  }
  return NextResponse.json({ok:true,sent:results.filter(r=>r.status==="SENT").length,failed:results.filter(r=>r.status==="FAILED").length,results});
}
