import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/security";
import EmailConversationWorkspace from "@/components/EmailConversationWorkspace";

export const dynamic = "force-dynamic";

export default async function EmailConversationPage() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  return <main className="min-h-screen bg-[#F8FAFC] py-8">
    <div className="container-aslal">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Conversation / Email</div>
          <h1 className="mt-2 text-4xl font-black">Email operations</h1>
          <p className="mt-2 max-w-3xl text-slate-500">Dedicated Email testing and provider evidence for the Phase 4 Email workflow.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/conversation" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Conversations</Link>
          <Link href="/dashboard/acceptance/phase-4" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">Phase 4</Link>
        </div>
      </div>
      <EmailConversationWorkspace />
    </div>
  </main>;
}
