import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const personId = typeof body.personId === "string" ? body.personId : "";
  if (!personId) return NextResponse.json({ error: "personId is required" }, { status: 400 });

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) return NextResponse.json({ error: "Person not found" }, { status: 404 });

  const data = {
    emailAllowed: body.emailAllowed === true,
    smsAllowed: body.smsAllowed === true,
    telegramAllowed: body.telegramAllowed === true,
    whatsappAllowed: body.whatsappAllowed === true,
    messengerAllowed: body.messengerAllowed === true,
    globalOptOut: body.globalOptOut === true,
  };

  const preference = await prisma.communicationPreference.upsert({
    where: { personId },
    create: { id: randomUUID(), personId, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true, preference, actor: session.email });
}
