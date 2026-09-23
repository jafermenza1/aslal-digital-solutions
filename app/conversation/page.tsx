import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import ConversationCenter from "@/components/ConversationCenter";
import EmailProviderTest from "@/components/EmailProviderTest";

export const dynamic = "force-dynamic";

export default async function ConversationPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
    select: {
      id: true, channel: true, status: true, assignedTo: true, personId: true, leadId: true, customerId: true, opportunityId: true, externalThreadId: true, lastMessageAt: true, updatedAt: true,
      person: { select: { id: true, name: true, email: true, phone: true } },
      lead: { select: { id: true, name: true, email: true, phone: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, direction: true, status: true, body: true, createdAt: true, senderAddress: true, recipientAddress: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="container-aslal">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Conversation</div><h1 className="mt-2 text-4xl font-black">Real customer communication</h1><p className="mt-2 max-w-4xl text-slate-500">Operational inbox for real conversations. Email provider tests use the production SMTP path and persist the result.</p></div>
          <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link>
        </div>
        <div className="mt-6"><EmailProviderTest /></div>
        <ConversationCenter initialConversations={conversations} viewer={session.email} />
      </div>
    </main>
  );
}
