"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  initialBusiness?: string;
  initialGoal?: string;
  initialChannels?: string;
  initialProduct?: string;
  products?: Array<{ slug: string; name: string }>;
};

export function ContactForm({ initialBusiness = "", initialGoal = "", initialChannels = "", initialProduct = "", products = [] }: ContactFormProps) {
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus({ type: "idle", message: "Sending your request…" });

    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok === true) {
        const url = new URL(window.location.href);
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventName: "CONTACT_SUBMIT", pagePath: window.location.pathname, metadata: { utmSource: url.searchParams.get("utm_source"), utmMedium: url.searchParams.get("utm_medium"), utmCampaign: url.searchParams.get("utm_campaign") } }), keepalive: true }).catch(() => undefined);
        form.reset();
        setStatus({
          type: "success",
          message: "Thank you — your request has been received. Our team will review your growth needs and contact you using the details you provided.",
        });
        return;
      }

      setStatus({
        type: "error",
        message: typeof data?.error === "string" ? data.error : "We could not complete your request. Please try again or contact info@aslaldigital.com.",
      });
    } catch (error) {
      console.error("CONTACT_FORM_SUBMIT_FAILED", error);
      setStatus({
        type: "error",
        message: "We could not reach Aslal right now. Please try again, or contact info@aslaldigital.com or +251 911-276682.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="growthGoal" value={initialGoal} />
      <input type="hidden" name="growthChannels" value={initialChannels} />
      {initialGoal && (
        <div className="rounded-2xl border border-[#E2B02A]/30 bg-[#E2B02A]/10 p-5 text-sm text-[#1E293B]">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Growth Builder demand</div>
          <div className="mt-3 font-black">{initialGoal}</div>
          {initialChannels && <div className="mt-1 text-slate-600">Channels: {initialChannels}</div>}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" maxLength={160} placeholder="Your name" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
        <input name="company" defaultValue={initialBusiness} maxLength={190} placeholder="Company" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" maxLength={190} placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
        <input name="phone" maxLength={40} placeholder="Phone / WhatsApp" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <select required name="businessType" defaultValue="" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]">
        <option value="" disabled>Business type</option>
        <option>Retail</option><option>Professional Services</option><option>Manufacturing</option><option>Hospitality</option><option>Education</option><option>Healthcare</option><option>Real Estate</option><option>Other</option>
        </select>
        <select name="productSlug" defaultValue={initialProduct} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]">
          <option value="">Solution / service interest (optional)</option>
          {products.map(product => <option key={product.slug} value={product.slug}>{product.name}</option>)}
        </select>
      </div>
      <textarea required name="message" maxLength={5000} rows={6} defaultValue={initialGoal ? "Growth goal: " + initialGoal + (initialChannels ? "\nPreferred channels: " + initialChannels : "") + "\n\n" : ""} placeholder={initialGoal ? "Tell us what is blocking progress…" : "Tell us what you want to build or grow…"} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
      <button disabled={submitting} className="rounded-2xl bg-[#0F3E8A] px-6 py-4 font-extrabold text-white transition hover:bg-[#092d69] disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? "Sending…" : "Request a growth consultation"}
      </button>
      {status.message && (
        <p aria-live="polite" role={status.type === "error" ? "alert" : "status"} className={status.type === "success" ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900" : status.type === "error" ? "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" : "text-sm font-semibold text-[#0F3E8A]"}>
          {status.message}
        </p>
      )}
    </form>
  );
}
