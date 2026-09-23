import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, verifySession } from "@/lib/security";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const nextStatus = body.status === "CLOSED" ? "CLOSED" : body.status === "OPEN" ? "OPEN" : null;
  if (!nextStatus) return NextResponse.json({ error: "status must be OPEN or CLOSED" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const updated = await prisma.conversation.update({
    where: { id },
    data: nextStatus === "CLOSED"
      ? { status: "CLOSED", assignedTo: null }
      : { status: "OPEN" },
  });

  await prisma.activity.create({
    data: {
      type: nextStatus === "CLOSED" ? "CONVERSATION_CLOSED" : "CONVERSATION_REOPENED",
      subject: nextStatus === "CLOSED" ? "Conversation closed" : "Conversation reopened",
      details: { conversationId: id, actor: session.email },
      personId: conversation.personId,
      customerId: conversation.customerId,
      opportunityId: conversation.opportunityId,
    },
  });

  return NextResponse.json({ ok: true, conversation: updated });
}
