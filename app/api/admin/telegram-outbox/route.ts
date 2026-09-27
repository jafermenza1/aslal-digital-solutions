import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const access = await authorizeWorkspacePermission("telegram.view", workspaceId);
  if (!access) return NextResponse.json({ error: "Telegram access is not permitted." }, { status: 403 });
  const messages = await prisma.telegramOutbox.findMany({
    where: { workspaceId: access.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, status: true, messageType: true, sendMode: true, chatId: true, content: true, mediaType: true, mediaUrl: true, replyMarkup: true, templateKey: true, failureReason: true, attemptCount: true, maxAttempts: true, nextAttemptAt: true, telegramMessageId: true, createdAt: true, updatedAt: true, leadId: true }
  });
  return NextResponse.json({ messages });
}