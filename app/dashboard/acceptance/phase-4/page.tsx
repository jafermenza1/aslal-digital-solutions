import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";
import Phase4ControlRoom from "@/components/Phase4ControlRoom";

export const dynamic = "force-dynamic";

export default async function Phase4Acceptance() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({
      where: { personId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, name: true, email: true, phone: true, company: true, personId: true },
    }),
    Promise.all([
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.conversation.count({ where: { status: "HUMAN_HANDOFF" } }),
      prisma.message.count({ where: { direction: "INBOUND" } }),
      prisma.message.count({ where: { direction: "OUTBOUND" } }),
      prisma.message.count({ where: { status: "SENT" } }),
      prisma.message.count({ where: { status: "DELIVERED" } }),
      prisma.message.count({ where: { status: "FAILED" } }),
      prisma.channelAccount.count({ where: { active: true } }),
      prisma.communicationPreference.count({ where: { globalOptOut: true } }),
      prisma.activity.count({ where: { type: { startsWith: "MESSAGE_" } } }),
    ]),
  ]);

  const providerConfigured = {
    EMAIL: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
    SMS: Boolean(process.env.SMS_PROVIDER_URL && process.env.SMS_PROVIDER_TOKEN),
    TELEGRAM: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    WHATSAPP: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    MESSENGER: Boolean(process.env.MESSENGER_PAGE_ACCESS_TOKEN),
  };

  const snapshot = {
    conversations: counts[0],
    messages: counts[1],
    handoffs: counts[2],
    inbound: counts[3],
    outbound: counts[4],
    sent: counts[5],
    delivered: counts[6],
    failed: counts[7],
    channelAccounts: counts[8],
    optOuts: counts[9],
    messageActivities: counts[10],
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="container-aslal">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Reconciliation / Phase 4</div>
            <h1 className="mt-2 text-4xl font-black">Conversation & channel control room</h1>
            <p className="mt-2 max-w-4xl text-slate-500">
              Run controlled acceptance tests against the real conversation, consent, handoff, webhook and timeline paths.
              Simulation never sends a real provider message; live provider tests are explicitly separated.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link>
        </div>

        <Phase4ControlRoom
          leads={leads}
          providerConfigured={providerConfigured}
          snapshot={snapshot}
          simulationEnabled={process.env.PHASE4_ACCEPTANCE_MODE === "true"}
        />
      </div>
    </main>
  );
}
