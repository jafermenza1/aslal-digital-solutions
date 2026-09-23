import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import { cancelLeadAutomation } from "@/lib/automation";

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
  let cancelled = 0;
  if (data.globalOptOut) {
    const leads = await prisma.lead.findMany({ where: { personId }, select: { id: true } });
    for (const lead of leads) cancelled += (await cancelLeadAutomation(lead.id, "Global communication opt-out recorded; outbound follow-up automation cancelled.")).cancelled;
  }
  return NextResponse.json({ ok: true, preference, cancelled, actor: session.email });
}
