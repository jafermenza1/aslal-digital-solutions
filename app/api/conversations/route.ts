import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma, CommunicationChannel } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export async function POST(request: NextRequest) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const channel = String(body.channel || "") as CommunicationChannel;
  if (!Object.values(CommunicationChannel).includes(channel)) {
    return NextResponse.json({ error: "Unsupported channel" }, { status: 400 });
  }

  const personId = typeof body.personId === "string" ? body.personId : null;
  const leadId = typeof body.leadId === "string" ? body.leadId : null;
  const customerId = typeof body.customerId === "string" ? body.customerId : null;
  const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId : null;
  const externalThreadId = typeof body.externalThreadId === "string" ? body.externalThreadId.slice(0, 190) : null;

  const existing = await prisma.conversation.findFirst({
    where: {
      channel,
      ...(externalThreadId ? { externalThreadId } : {}),
      ...(personId ? { personId } : {}),
      ...(leadId ? { leadId } : {}),
      status: { not: "CLOSED" },
    },
  });
  if (existing) return NextResponse.json({ ok: true, conversationId: existing.id, existing: true });

  const conversation = await prisma.conversation.create({
    data: {
      id: randomUUID(),
      channel,
      personId,
      leadId,
      customerId,
      opportunityId,
      externalThreadId,
      status: "OPEN",
      assignedTo: session.email,
    },
  });

  return NextResponse.json({ ok: true, conversationId: conversation.id, existing: false });
}
