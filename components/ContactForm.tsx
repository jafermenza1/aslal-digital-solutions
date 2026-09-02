"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Sending…");

    try {
      const form = new FormData(event.currentTarget);
      const body = Object.fromEntries(form.entries());
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("Thank you. Your request is now in our sales pipeline.");
      event.currentTarget.reset();
    } catch {
      setStatus("We couldn't send your request. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" maxLength={160} placeholder="Your name" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]" />
        <input name="company" maxLength={190} placeholder="Company" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" maxLength={190} placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]" />
        <input name="phone" maxLength={40} placeholder="Phone / WhatsApp" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]" />
      </div>
      <select required name="businessType" defaultValue="" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]">
        <option value="" disabled>Business type</option>
        <option>Retail</option><option>Professional Services</option><option>Manufacturing</option><option>Hospitality</option><option>Education</option><option>Healthcare</option><option>Real Estate</option><option>Other</option>
      </select>
      <textarea required name="message" maxLength={5000} rows={6} placeholder="Tell us what you want to build or grow…" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#0F3E8A]" />
      <button disabled={submitting} className="rounded-2xl bg-[#0F3E8A] px-6 py-4 font-extrabold text-white transition hover:bg-[#092d69] disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? "Sending…" : "Request a growth consultation"}
      </button>
      {status && <p aria-live="polite" className="text-sm font-semibold text-[#0F3E8A]">{status}</p>}
    </form>
  );
}
