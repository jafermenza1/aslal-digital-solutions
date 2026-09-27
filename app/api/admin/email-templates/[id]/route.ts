import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";

export async function PATCH(request: Request, { params }: { params: Promise<{ id:string }> }) {
  const actor = await authorizePermission("email_templates.manage");
  if (!actor) return NextResponse.json({ error: "Email template administration is not permitted." }, { status: 403 });
  const { id } = await params;
  const current = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Template not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? current.name).trim().slice(0, 190);
  const subjectTemplate = String(body.subjectTemplate ?? current.subjectTemplate).trim().slice(0, 250);
  const htmlTemplate = String(body.htmlTemplate ?? current.htmlTemplate).slice(0, 60000);
  const textTemplate = String(body.textTemplate ?? current.textTemplate).slice(0, 20000);
  const active = body.active === undefined ? current.active : Boolean(body.active);\n  const transactional = body.transactional === undefined ? current.transactional : Boolean(body.transactional);
  const reason = String(body.reason || "").trim().slice(0, 2000);
  if (!name || !subjectTemplate || !htmlTemplate || !textTemplate || !reason) return NextResponse.json({ error: "Name, subject, templates and reason are required." }, { status: 400 });
  if (/[\r\n]/.test(subjectTemplate)) return NextResponse.json({ error: "Email subject cannot contain line breaks." }, { status: 400 });
  const updated = await prisma.emailTemplate.update({
    where: { id },
    data: { name, subjectTemplate, htmlTemplate, textTemplate, active, transactional, updatedBy: actor.email },
  });
  await prisma.userAudit.create({
    data: {
      id: crypto.randomUUID(),
      actor: actor.email,
      action: "EMAIL_TEMPLATE_UPDATE",
      reason,
      details: { templateId: id, templateKey: current.templateKey, active },
    },
  });
  return NextResponse.json({ ok:true, template:updated });
}
