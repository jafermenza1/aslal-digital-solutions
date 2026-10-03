"use client";

import { FormEvent, useMemo, useState } from "react";
import { browserAttribution } from "@/lib/browser-attribution";

type ContactFormProps = {
  initialBusiness?: string;
  initialGoal?: string;
  initialChannels?: string;
  initialProduct?: string;
  initialProductId?: string;
  initialReferralCode?: string;
  initialReferralName?: string;
  initialTeam?: string;
  products?: Array<{ id: string; slug: string; name: string }>;
};

type FieldErrors = Partial<Record<"name"|"email"|"phone"|"businessType"|"message", string>>;

export function ContactForm({
  initialBusiness = "", initialGoal = "", initialChannels = "", initialProduct = "", initialProductId = "",
  initialReferralCode = "", initialReferralName = "", initialTeam = "", products = [],
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(initialGoal || "");
  const context = useMemo(() => {
    if (initialTeam) return { title: "Book a consultation", subtitle: `You are requesting a conversation with ${initialTeam}.`, message: "Tell us what you would like to discuss and any preferred timing." };
    if (initialProduct) { const p = products.find(x => x.slug === initialProduct); return { title: p ? `Request ${p.name}` : "Request this solution", subtitle: "We already know which solution interested you.", message: "Tell us what you need and any questions about this solution." }; }
    if (initialGoal) return { title: "Let’s plan your next step", subtitle: "Your Growth Builder choices are already attached to this request.", message: "Tell us about your current situation, desired outcome and anything urgent." };
    if (initialReferralName) return { title: "Continue with your referral", subtitle: `Your request is connected to ${initialReferralName}.`, message: "Tell us what you need so we can route the request correctly." };
    return { title: "Tell us what you need", subtitle: "Choose a starting point. We’ll ask only what helps us understand the request.", message: "Describe the problem, desired outcome or product/service you are looking for." };
  }, [initialGoal, initialProduct, initialReferralName, initialTeam, products]);

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const rawPhone = String(data.get("phone") || "").trim();
    const phone = normalizeEthiopianPhone(rawPhone);
    if (rawPhone && phone) {
      const input = form.elements.namedItem("phone") as HTMLInputElement | null;
      if (input) input.value = phone;
    }
    const next: FieldErrors = {};
    if (!String(data.get("name") || "").trim()) next.name = "Please enter your name.";
    if (!email && !phone) {
      next.email = "Enter an email or phone number.";
      next.phone = "Enter a phone number if you do not use email.";
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address, for example name@example.com.";
    }
    if (phone && !/^\+251[79]\d{8}$/.test(phone)) {
      next.phone = "Enter a valid Ethiopian mobile number, e.g. +251 911 276682.";
    }

    if (!String(data.get("message") || "").trim()) next.message = "Tell us briefly what you want to build or grow.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validate(form)) return;
    setSubmitting(true); setStatus("idle"); setMessage("");
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const attribution = browserAttribution();
      if (attribution) body.attribution = JSON.stringify(attribution);
      if (typeof body.phone === "string") body.phone = normalizeEthiopianPhone(body.phone);
      const response = await fetch("/api/leads", { method:"POST", headers:{ "Content-Type":"application/json", Accept:"application/json" }, credentials:"same-origin", body:JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok === true) {
        const url = new URL(window.location.href);
        fetch("/api/track", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ eventName:"CONTACT_SUBMIT", pagePath:window.location.pathname, metadata:{ utmSource:url.searchParams.get("utm_source"), utmMedium:url.searchParams.get("utm_medium"), utmCampaign:url.searchParams.get("utm_campaign"), referralCode:initialReferralCode || null } }), keepalive:true }).catch(() => undefined);
        setStatus("success");
        setMessage("Your request has been received. Our team will review it and contact you using the details you provided.");
        return;
      }
      setStatus("error");
      setMessage(typeof data?.error === "string" ? data.error : "We could not complete your request. Please correct the highlighted fields or contact us directly.");
    } catch (error) {
      console.error("CONTACT_FORM_SUBMIT_FAILED", error);
      setStatus("error");
      setMessage("We could not reach Aslal right now. Please try again or contact us directly.");
    } finally { setSubmitting(false); }
  }

  if (status === "success") {
    return <div className="animate-[fadeIn_.45s_ease-out] py-6 text-center" role="status" aria-live="polite">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-emerald-200 bg-emerald-50 text-4xl font-black text-emerald-600 shadow-sm">✓</div>
      <h2 className="mt-6 text-3xl font-black text-[#0F3E8A]">Request received</h2>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">{message}</p>
      {initialReferralName && <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-900">Referred by <strong>{initialReferralName}</strong>{initialReferralCode ? <> · {initialReferralCode}</> : ""}</div>}
      <div className="mt-8">
        <div className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Need urgent help?</div>
        <p className="mt-2 text-sm text-slate-500">Please contact Aslal directly.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a href="https://wa.me/251911276682" target="_blank" rel="noreferrer" aria-label="Contact Aslal on WhatsApp" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white">◉ WhatsApp</a>
          <a href="https://t.me/share/url?url=https%3A%2F%2Faslaldigital.com%2Fcontact&text=Hi%20Aslal%2C%20I%20need%20urgent%20help." target="_blank" rel="noreferrer" aria-label="Contact Aslal on Telegram" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">✈ Telegram</a>
          <a href="mailto:info@aslaldigital.com" aria-label="Email Aslal" className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">✉ Email</a>
        </div>
        <p className="mt-4 text-xs text-slate-400">Email: info@aslaldigital.com · Phone/WhatsApp: +251 911-276682</p>
      </div>
    </div>;
  }

  const intentOptions = [
    ["Get more customers", "growth"],
    ["Sell online", "sell"],
    ["Automate conversations", "automate"],
    ["Build a digital system", "system"],
  ] as const;
  const goal = selectedIntent || initialGoal;
  const messagePlaceholder = context.message;

  return <form onSubmit={submit} noValidate className="grid gap-5">
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <input type="hidden" name="growthGoal" value={goal} /><input type="hidden" name="teamMember" value={initialTeam} /><input type="hidden" name="growthChannels" value={initialChannels} /><input type="hidden" name="referralCode" value={initialReferralCode} /><input type="hidden" name="productId" value={initialProductId} />
    <div><h2 className="text-2xl font-black text-[#0F3E8A]">{context.title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{context.subtitle}</p></div>
    {!initialTeam && !initialProduct && !initialGoal && <div><div className="mb-2 text-sm font-bold text-slate-700">What are you trying to do?</div><div className="grid gap-2 sm:grid-cols-2">{intentOptions.map(([label,key])=><button type="button" key={key} onClick={()=>setSelectedIntent(label)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${selectedIntent===label ? "border-[#0F3E8A] bg-blue-50 text-[#0F3E8A]" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}>{label}</button>)}</div></div>}
    {initialTeam && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700"><span className="font-black text-[#0F3E8A]">Consultation with:</span> {initialTeam}</div>}{(initialGoal || initialChannels) && <div className="rounded-2xl border border-[#E2B02A]/30 bg-[#E2B02A]/10 p-5 text-sm text-[#1E293B]"><div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Already selected</div><div className="mt-3 font-black">{goal || initialGoal}</div>{initialChannels && <div className="mt-1 text-slate-600">Channels: {initialChannels}</div>}</div>}
    {initialReferralName && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700"><span className="font-black text-[#0F3E8A]">Referral:</span> {initialReferralName}{initialReferralCode ? <> · {initialReferralCode}</> : ""}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Your name" name="name" required error={errors.name} />
      <Field id="company" label="Company" name="company" defaultValue={initialBusiness} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="email" label="Email" name="email" type="email" error={errors.email} hint="Use a valid email or provide your phone number." />
      <Field id="phone" label="Phone / WhatsApp" name="phone" error={errors.phone} hint="Ethiopian mobile: +251 9XX XXX XXX." />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label htmlFor="businessType" className="text-sm font-bold text-slate-700">Business type</label><select id="businessType" name="businessType" defaultValue="" aria-invalid={!!errors.businessType} aria-describedby={errors.businessType ? "businessType-error" : undefined} className={fieldClass(!!errors.businessType)}><option value="" disabled>Select business type</option><option>Retail</option><option>Professional Services</option><option>Manufacturing</option><option>Hospitality</option><option>Education</option><option>Healthcare</option><option>Real Estate</option><option>Other</option></select>{errors.businessType && <FieldError id="businessType-error">{errors.businessType}</FieldError>}</div>
      <div><label htmlFor="productSlug" className="text-sm font-bold text-slate-700">Solution / service interest <span className="font-normal text-slate-400">(optional)</span></label><select id="productSlug" name="productSlug" defaultValue={initialProduct} className={fieldClass(false)}><option value="">{initialProduct ? "Change solution (optional)" : "Select a solution (optional)"}</option>{products.map(product=><option key={product.id || product.slug} value={product.slug}>{product.name}</option>)}</select></div>
    </div>
    <div><label htmlFor="message" className="text-sm font-bold text-slate-700">Tell us more</label><textarea id="message" required name="message" maxLength={5000} rows={5} defaultValue={initialGoal ? "Growth goal: "+initialGoal+(initialChannels ? "\nPreferred channels: "+initialChannels : "")+"\n\n" : ""} placeholder={messagePlaceholder} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className={fieldClass(!!errors.message)+" resize-y"} />{errors.message ? <FieldError id="message-error">{errors.message}</FieldError> : <div className="mt-1 text-xs text-slate-400">You can write naturally. Our team will structure the request after submission.</div>}</div>
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><input name="emailConsent" type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-[#0F3E8A]" /><span><strong className="text-slate-800">Email me a confirmation</strong><br/><span className="text-xs leading-5">We’ll use your email to acknowledge this request. This does not subscribe you to promotional email.</span></span></label>
    {status === "error" && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{message}</div>}
    <button disabled={submitting} className="rounded-2xl bg-[#0F3E8A] px-6 py-4 font-extrabold text-white transition hover:bg-[#0F3E8A] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending…" : initialProduct ? "Send product request" : initialTeam ? "Request consultation" : "Send my request"}</button>
  </form>;
}

function fieldClass(error: boolean) {
  return `mt-2 w-full rounded-2xl border bg-white px-5 py-4 text-[#1E293B] outline-none focus:border-[#0F3E8A] ${error ? "border-red-400 ring-2 ring-red-100" : "border-slate-200"}`;
}
function Field({ id,label,name,type="text",required=false,defaultValue="",error,hint }: { id:string; label:string; name:string; type?:string; required?:boolean; defaultValue?:string; error?:string; hint?:string }) {
  return <div><label htmlFor={id} className="text-sm font-bold text-slate-700">{label}{required ? " *" : ""}</label><input id={id} name={name} type={type} required={required} defaultValue={defaultValue} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className={fieldClass(!!error)} />{error ? <FieldError id={`${id}-error`}>{error}</FieldError> : hint ? <div id={`${id}-hint`} className="mt-1 text-xs text-slate-400">{hint}</div> : null}</div>;
}
function FieldError({id,children}:{id:string;children:string}) { return <div id={id} className="mt-1 text-xs font-semibold text-red-600" role="alert">{children}</div>; }


function normalizeEthiopianPhone(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (/^0[79]\d{8}$/.test(digits)) return "+251" + digits.slice(1);
  if (/^[79]\d{8}$/.test(digits)) return "+251" + digits;
  if (/^251[79]\d{8}$/.test(digits)) return "+" + digits;
  return value.trim();
}
