import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, verifySession } from "@/lib/security";
import ConversationCenter from "@/components/ConversationCenter";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session || !isAdminEmail(session.email)) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
    select: {
      id: true, channel: true, status: true, assignedTo: true, personId: true,
      leadId: true, customerId: true, opportunityId: true, externalThreadId: true,
      lastMessageAt: true, updatedAt: true,
      person: { select: { id: true, name: true, email: true, phone: true } },
      lead: { select: { id: true, name: true, email: true, phone: true, company: true, businessType: true, status: true, score: true, ownerEmail: true, nextAction: true, nextActionDueAt: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, direction: true, status: true, body: true, createdAt: true, senderAddress: true, recipientAddress: true },
      },
    },
  });

  return (
    <main className="portal-shell min-h-screen">
      <div className="mx-auto max-w-[1480px] p-4 sm:p-7">
        <ConversationCenter initialConversations={conversations} viewer={session.email} />
      </div>
    </main>
  );
}
