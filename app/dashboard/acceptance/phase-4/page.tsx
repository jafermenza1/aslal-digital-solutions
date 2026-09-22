import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

export const dynamic = "force-dynamic";
type Evidence = [string, boolean, string];
const channels = ["EMAIL", "SMS", "TELEGRAM", "WHATSAPP", "MESSENGER"] as const;

export default async function Phase4Acceptance() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");

  const results = await Promise.allSettled([
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
  ]);
  const value = (i: number) => results[i].status === "fulfilled" ? results[i].value : null;
  const conversations=value(0), messages=value(1), handoffs=value(2), inbound=value(3), outbound=value(4), sent=value(5), delivered=value(6), failed=value(7), channelAccounts=value(8), optOuts=value(9), messageActivities=value(10);
  const tableReady = conversations !== null && messages !== null && channelAccounts !== null && optOuts !== null;
  const providerConfigured: Record<string, boolean> = {
    EMAIL:Boolean(process.env.EMAIL_PROVIDER_URL && process.env.EMAIL_PROVIDER_TOKEN),
    SMS:Boolean(process.env.SMS_PROVIDER_URL && process.env.SMS_PROVIDER_TOKEN),
    TELEGRAM:Boolean(process.env.TELEGRAM_BOT_TOKEN),
    WHATSAPP:Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    MESSENGER:Boolean(process.env.MESSENGER_PAGE_ACCESS_TOKEN),
  };
  const automated: Evidence[] = [
    ["Conversation records exist",(conversations ?? 0)>0,\`\${conversations ?? 0} conversation(s)\`],
    ["Message records exist",(messages ?? 0)>0,\`\${messages ?? 0} message(s)\`],
    ["Inbound message records exist",(inbound ?? 0)>0,\`\${inbound ?? 0} inbound message(s)\`],
    ["Outbound message records exist",(outbound ?? 0)>0,\`\${outbound ?? 0} outbound message(s)\`],
    ["Provider success states persist",((sent ?? 0)+(delivered ?? 0))>0,\`\${sent ?? 0} sent · \${delivered ?? 0} delivered\`],
    ["Provider failure states persist",(failed ?? 0)>0,\`\${failed ?? 0} failed\`],
    ["Human handoff records exist",(handoffs ?? 0)>0,\`\${handoffs ?? 0} handoff conversation(s)\`],
    ["Channel accounts exist",(channelAccounts ?? 0)>0,\`\${channelAccounts ?? 0} active account(s)\`],
    ["Global opt-out records exist",(optOuts ?? 0)>0,\`\${optOuts ?? 0} opted-out person(s)\`],
    ["Message activity reaches the timeline",(messageActivities ?? 0)>0,\`\${messageActivities ?? 0} message activity record(s)\`],
  ];
  const manual = [
    "Create or identify a known Lead/Person and grant exactly one channel permission.",
    "Send an inbound test through a configured provider and confirm signature verification, Conversation creation, Message persistence, and no fabricated Person identity for an unknown sender.",
    "For a known sender, confirm the inbound conversation links to the correct Person/Lead/Customer context.",
    "Send an outbound test on the permitted channel and confirm the Message records QUEUED/SENT/DELIVERED or the provider failure state.",
    "Remove the channel permission and confirm outbound delivery is refused before provider dispatch.",
    "Enable global opt-out and confirm outbound delivery is refused on every channel.",
    "Start human handoff and confirm the conversation owner/state changes to HUMAN_HANDOFF and competing automated/operator sends are rejected.",
    "Confirm message activity appears chronologically in the customer/lead timeline.",
    "Exercise Telegram and Email end to end when provider credentials, sender identities and callbacks are configured.",
    "Exercise WhatsApp, Messenger and SMS end to end when provider credentials, sender identities and callbacks are configured.",
    "Repeat an inbound webhook delivery and confirm retry/idempotency does not create duplicate commercial records.",
    "Verify production health after the conversation migration and provider tests.",
  ];
  return <main className="min-h-screen bg-[#F8FAFC] py-8"><div className="container-aslal">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Reconciliation / Phase 4</div><h1 className="mt-2 text-4xl font-black">Conversations & channel acceptance</h1><p className="mt-2 max-w-4xl text-slate-500">Automated evidence covers persisted conversation/message state and safe configuration visibility. Provider callbacks, signatures and real delivery still require controlled end-to-end tests.</p></div><Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold">← Dashboard</Link></div>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Conversations",conversations ?? 0],["Messages",messages ?? 0],["Inbound",inbound ?? 0],["Outbound",outbound ?? 0],["Handoffs",handoffs ?? 0]].map(([k,v])=><div key={String(k)} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-bold text-slate-400">{k}</div><div className="mt-2 text-3xl font-black">{v}</div></div>)}</section>
    <div className="mt-7 grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Automated evidence</h2>{!tableReady&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Conversation tables are not fully readable. Apply the additive conversation migration before treating these counts as evidence.</div>}<div className="mt-5 space-y-2">{automated.map(([label,ok,detail])=><div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-4"><div><div className="font-bold">{label}</div><div className="text-xs text-slate-500">{detail}</div></div><span className={ok?"font-black text-emerald-700":"font-black text-amber-700"}>{ok?"EVIDENCED":"NOT YET"}</span></div>)}</div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Provider configuration</h2><p className="mt-2 text-sm text-slate-500">Only configuration presence is shown; secrets are never rendered.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{channels.map(channel=><div key={channel} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-4"><span className="font-bold">{channel}</span><span className={providerConfigured[channel]?"font-black text-emerald-700":"font-black text-amber-700"}>{providerConfigured[channel]?"CONFIGURED":"NOT CONFIGURED"}</span></div>)}</div></section>
    </div>
    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Phase 4 acceptance checklist</h2><p className="mt-2 text-sm text-slate-500">Controlled end-to-end checks remain required for signatures, consent, handoff and real provider delivery.</p><div className="mt-5 grid gap-3 lg:grid-cols-2">{manual.map((item,i)=><div key={item} className="flex gap-3 rounded-xl border border-slate-100 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-[#0F3E8A]">{i+1}</span><span className="text-sm leading-6 text-slate-600">{item}</span></div>)}</div></section>
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/customers" className="rounded-xl bg-[#0F3E8A] px-5 py-3 font-black text-white">Open Customers & timelines</Link><Link href="/dashboard/leads" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Leads</Link><Link href="/dashboard/journey" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold">Open Journeys</Link></div>
  </div></main>;
}
