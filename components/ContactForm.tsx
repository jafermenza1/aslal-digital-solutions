"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  initialBusiness?: string;
  initialGoal?: string;
  initialChannels?: string;
};

export function ContactForm({ initialBusiness = "", initialGoal = "", initialChannels = "" }: ContactFormProps) {
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
      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" maxLength={160} placeholder="Your name" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
        <input name="company" defaultValue={initialBusiness} maxLength={190} placeholder="Company" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" maxLength={190} placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
        <input name="phone" maxLength={40} placeholder="Phone / WhatsApp" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
      </div>
      <select required name="businessType" defaultValue="" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]">
        <option value="" disabled>Business type</option>
        <option>Retail</option><option>Professional Services</option><option>Manufacturing</option><option>Hospitality</option><option>Education</option><option>Healthcare</option><option>Real Estate</option><option>Other</option>
      </select>
      <textarea required name="message" maxLength={5000} rows={6} placeholder={initialGoal ? "Growth goal: " + initialGoal + ". Tell us what is blocking progress…" : "Tell us what you want to build or grow…"} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A]" />
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
