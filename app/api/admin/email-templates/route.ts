import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { ensureContactTemplate } from "@/lib/email-templates";

export async function GET() {
  const actor = await authorizePermission("email_templates.manage");
  if (!actor) return NextResponse.json({ error: "Email template administration is not permitted." }, { status: 403 });
  return NextResponse.json({ templates: [await ensureContactTemplate()] });
}
