import { RichContent } from "@/components/RichContent";
import Link from "next/link";
import { getPageContent, contentValue, contentStyle } from "@/lib/public-content";

export default async function Page(){const content=await getPageContent("/privacy");return <main className="min-h-[70vh] bg-[var(--ui-canvas)] py-20 text-[var(--ui-primary-text)]"><div className="container-aslal max-w-3xl"><Link href="/" className="text-sm font-black text-[#E2B02A]">← Back to Aslal</Link><h1 className="mt-8 text-4xl font-black sm:text-5xl" style={contentStyle(content,"title",48)}>{contentValue(content,"title","Privacy Policy")}</h1><p className="mt-6 text-lg leading-8 text-[var(--ui-primary-text)]/70" style={contentStyle(content,"body",18)}><RichContent content={content} keyName="body" fallback="Aslal Digital Solutions respects your privacy. Information submitted through our website is used to respond to enquiries, deliver requested services and improve our digital experiences. We do not sell personal information. Contact us if you need details about data held about you." /></p></div></main>;
}
