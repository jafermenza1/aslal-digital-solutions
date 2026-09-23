import { cookies } from "next/headers";
import { verifySession, isAdminEmail } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

async function admin() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  return session && isAdminEmail(session.email) ? session : null;
}
function reasonOf(value: unknown) { return String(value || "").trim().slice(0, 2000); }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await admin(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const body = await request.json().catch(() => null); const reason = reasonOf(body?.reason);
  if (!reason) return NextResponse.json({ error: "A reason is required." }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const key of ["name","email","phone","company","businessType","message","source","medium","campaign","ownerEmail","nextAction","referralCode"]) if (body?.[key] !== undefined) data[key] = String(body[key] || "").trim().slice(0, key === "message" ? 10000 : 190) || null;
  if (body?.nextActionDueAt !== undefined) { const d = body.nextActionDueAt ? new Date(body.nextActionDueAt) : null; if (d && Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid due date." }, { status: 400 }); data.nextActionDueAt=d; }
  if (body?.dealValue !== undefined) { const n=body.dealValue === null || body.dealValue === "" ? null : Number(body.dealValue); if(n!==null && (!Number.isFinite(n)||n<0)) return NextResponse.json({error:"Invalid deal value."},{status:400}); data.dealValue=n; }
  if (body?.isTest !== undefined) data.isTest=Boolean(body.isTest);
  const lead=await prisma.lead.findUnique({where:{id}}); if(!lead) return NextResponse.json({error:"Lead not found."},{status:404});
  const updated=await prisma.$transaction(async tx=>{ const u=await tx.lead.update({where:{id},data: data as Prisma.LeadUpdateInput}); await tx.leadAdminAudit.create({data:{id:crypto.randomUUID(),leadId:id,actor:session.email,action:"EDIT",reason,details:{fields:Object.keys(data)}}}); return u; });
  return NextResponse.json({ ok:true, lead:updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session=await admin(); if(!session) return NextResponse.json({error:"Unauthorized"},{status:401}); const {id}=await params; const body=await request.json().catch(()=>null); const reason=reasonOf(body?.reason); if(!reason) return NextResponse.json({error:"A reason is required."},{status:400});
  const lead=await prisma.lead.findUnique({where:{id},include:{opportunities:{select:{id:true}}}}); if(!lead) return NextResponse.json({error:"Lead not found."},{status:404});
  await prisma.$transaction(async tx=>{ const opportunityIds=lead.opportunities.map(o=>o.id); if(opportunityIds.length) await tx.customer.deleteMany({where:{opportunityId:{in:opportunityIds}}}); await tx.opportunity.deleteMany({where:{leadId:id}}); await tx.leadAdminAudit.create({data:{id:crypto.randomUUID(),leadId:id,actor:session.email,action:"DELETE",reason,details:{name:lead.name,email:lead.email,isTest:lead.isTest}}}); await tx.lead.delete({where:{id}}); });
  return NextResponse.json({ok:true});
}
