import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = body.action === "release" ? "release" : "handoff";
  const updated = await prisma.conversation.update({
    where: { id },
    data: action === "handoff"
      ? { status: "HUMAN_HANDOFF", assignedTo: session.email, humanHandoffAt: new Date() }
      : { status: "OPEN", assignedTo: null },
  });

  return NextResponse.json({ ok: true, conversation: updated });
}
