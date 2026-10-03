import { requirePermission } from "@/lib/authorization";
import { ensureContactTemplate } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { EmailTemplateEditor } from "@/components/EmailTemplateEditor";

export const dynamic="force-dynamic";

export default async function EmailTemplatesPage(){await requirePermission("email_templates.manage");await ensureContactTemplate();const templates=await prisma.emailTemplate.findMany({orderBy:[{transactional:"desc"},{active:"desc"},{name:"asc"}]});return <main className=" min-h-screen py-8"><div className="mx-auto max-w-[1220px] px-4 sm:px-7"><header><div className="dashboard-kicker">Conversations / Email</div><h1 className="mt-2 text-3xl font-black sm:text-4xl">Email templates</h1><p className="mt-2 max-w-3xl text-sm leading-6 opacity-65">Reusable transactional email templates managed separately from the conversation workspace. Creating a template does not send a message or create a campaign.</p></header><div className="mb-5"><a href="/dashboard/email" className="inline-flex rounded-xl bg-[#0F3E8A] px-4 py-3 text-sm font-black text-white">Open email operations →</a></div><div className="mt-6"><EmailTemplateEditor initial={templates.map(template=>({id:template.id,templateKey:template.templateKey,name:template.name,subjectTemplate:template.subjectTemplate,htmlTemplate:template.htmlTemplate,textTemplate:template.textTemplate,transactional:template.transactional,active:template.active,updatedAt:template.updatedAt.toISOString()}))}/></div></div></main>;}
