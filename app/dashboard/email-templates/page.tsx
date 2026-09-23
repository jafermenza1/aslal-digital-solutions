import { requirePermission } from "@/lib/authorization";
import { ensureContactTemplate } from "@/lib/email-templates";
import { EmailTemplateEditor } from "@/components/EmailTemplateEditor";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const user=await requirePermission("email_templates.manage");
  const template=await ensureContactTemplate();
  return <main className="min-h-screen bg-[#071F47] py-10 text-white">
    <div className="mx-auto max-w-[1100px] px-4 sm:px-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#E2B02A]">Automation / Email</div><h1 className="mt-2 text-4xl font-black">Contact auto-reply</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Customize the acknowledgement sent after a visitor submits the contact form and explicitly requests email confirmation.</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/55">{user.email}</span><Link href="/dashboard/products" className="rounded-full border border-white/15 px-4 py-3 text-sm font-black">Products & services</Link><Link href="/dashboard/users" className="rounded-full border border-white/15 px-4 py-3 text-sm font-black">Users & access</Link></div>
      </header>
      <div className="mt-8"><EmailTemplateEditor initial={{id:template.id,name:template.name,subjectTemplate:template.subjectTemplate,htmlTemplate:template.htmlTemplate,textTemplate:template.textTemplate,active:template.active}}/></div>
    </div>
  </main>;
}
