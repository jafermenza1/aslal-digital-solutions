"use client";

import { FormEvent, useState } from "react";

type Created = {
  id: string;
  partnerNumber: string;
  name: string;
  code: string;
  url: string;
  email: string;
};

type PartnerCreateFormProps = {
  products?: Array<{ slug: string; name: string }>;
  openInitially?: boolean;
  showTrigger?: boolean;
  canIssueCredentials?: boolean;
  /** Backward-compatible admin gate used by the partner dashboard. */
  adminOnlyActions?: boolean;
};

export default function PartnerCreateForm({ products = [], openInitially = false, showTrigger = true, canIssueCredentials = false, adminOnlyActions }: PartnerCreateFormProps) {
  const credentialsAllowed = adminOnlyActions ?? canIssueCredentials;
  const [open, setOpen] = useState(openInitially);
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; emailSent: boolean; emailRecipient?: string; error?: string } | null>(null);
  const [cardStatus, setCardStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create partner.");

      setCreated({
        id: String(data.partnerId),
        partnerNumber: String(data.partnerNumber || ""),
        name: String(payload.name),
        code: String(data.code || ""),
        url: String(data.referralUrl || ""),
        email: String(payload.email || ""),
      });
      setMessage("Registration submitted. Partner ID and referral identity are created; next steps are profile review → verification → approval → credentials → campaign matching.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create partner.");
    } finally {
      setBusy(false);
    }
  }

  async function issueCredentials() {
    if (!created) return;
    setActionBusy("credentials");
    setMessage("");
    try {
      const response = await fetch("/api/admin/partners/" + encodeURIComponent(created.id) + "/credentials", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not issue credentials.");
      setCredentials({
        username: String(data.username || ""),
        emailSent: Boolean(data.emailSent),
        emailRecipient: data.emailRecipient ? String(data.emailRecipient) : undefined,
      });
      setMessage(data.message || "Portal credentials processed.");
    } catch (error) {
      setCredentials(null);
      setMessage(error instanceof Error ? error.message : "Could not issue credentials.");
    } finally {
      setActionBusy("");
    }
  }

  function resetAndClose() {
    setOpen(false);
    setCreated(null);
    setCredentials(null);
    setCardStatus("");
    setMessage("");
  }

  function startAnother() {
    setCreated(null);
    setCredentials(null);
    setCardStatus("");
    setMessage("");
  }

  return (
    <>
      {showTrigger && (
        <button type="button" onClick={() => { setOpen(true); setCreated(null); setCredentials(null); setMessage(""); }} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#0b3475]">
          + Add partner
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
            {!created ? (
              <form onSubmit={submit}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Partner operations</div>
                    <h2 className="mt-1 text-2xl font-black">Create partner</h2>
                    <p className="mt-1 text-sm text-slate-500">Step 1: register the partner. The partner stays Pending until profile review and verification are completed. Credentials come only after approval.</p>
                  </div>
                  <button type="button" onClick={resetAndClose} className="rounded-full border px-3 py-1 text-slate-500">×</button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" required placeholder="Partner or agent name" />
                  <Field label="Registered email" name="email" type="email" placeholder="name@example.com" />
                  <label className="text-sm font-bold text-slate-700">Type<select name="type" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>AGENT</option><option>INFLUENCER</option><option>AFFILIATE</option><option>RESELLER</option></select></label>
                  <label className="text-sm font-bold text-slate-700">Registration status<select name="status" defaultValue="PENDING" disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><option>PENDING</option></select><input type="hidden" name="status" value="PENDING" /></label>
                  <Field label="Referral code" name="code" placeholder="e.g. agent-abebe" />
                  <Field label="Campaign" name="campaign" placeholder="e.g. september" />
                  <label className="text-sm font-bold text-slate-700">Product / service<select name="productSlug" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option value="">All solutions</option>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
                  <Field label="Destination" name="destinationPath" defaultValue="/" placeholder="/products/crm-pro" />
                  <Field label="Specialties" name="specialties" placeholder="What products/services do you promote?" />
                  <Field label="Service areas" name="serviceAreas" placeholder="Cities, regions or online" />
                  <Field label="Audience size" name="audienceSize" type="number" placeholder="0" />
                  <label className="sm:col-span-2 text-sm font-bold text-slate-700">Partner bio<textarea name="bio" maxLength={5000} placeholder="Experience, market focus and relevant capabilities" className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
                </div>

                {message && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</div>}
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={resetAndClose} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Cancel</button>
                  <button disabled={busy} className="rounded-full bg-[#E2B02A] px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy ? "Creating…" : "Create partner"}</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-emerald-600">✓</div>
                  <div className="mt-4 text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Registration received</div>
                  <h2 className="mt-2 text-2xl font-black">{created.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">The partner record and referral link are ready. The registration is Pending until an authorized manager verifies the profile.</p>
                </div>

                <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5">
                  <div className="text-xs font-black uppercase text-slate-400">Partner identity</div>
                  <div className="mt-2 font-mono text-xs font-black text-slate-500">Partner ID: {created.partnerNumber || created.id}</div>
                  <a href={created.url} target="_blank" rel="noreferrer" className="mt-2 block break-all font-mono text-sm font-black text-[#0F3E8A] underline">{created.url} ↗</a>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><div><b>Code:</b> {created.code}</div><div><b>Email:</b> {created.email || "Not registered"}</div></div>
                </div>

                <div className="mb-5 grid gap-2 sm:grid-cols-6">{["1 Register","2 Review","3 Verify","4 Approve","5 Credentials","6 Match"].map((step,i)=><div key={step} className={"rounded-xl p-2 text-center text-[10px] font-black uppercase "+(i===0?"bg-[#E2B02A] text-slate-950":"bg-slate-100 text-slate-500")}>{step}</div>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2">
                  {credentialsAllowed ? (<section className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Step 2</div>
                    <h3 className="mt-1 font-black">Portal credentials</h3>
                    <p className="mt-1 text-sm text-slate-500">Create the PARTNER login independently. The password is hashed and never displayed again.</p>
                    {credentials ? <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">Username: <span className="font-mono">{credentials.username}</span><br/>{credentials.emailSent ? "Credentials emailed to " + credentials.emailRecipient + "." : "Credentials created; email delivery needs attention."}</div> : null}
                    <button type="button" onClick={issueCredentials} disabled={actionBusy === "credentials" || Boolean(credentials)} className="mt-4 rounded-full bg-[#0F3E8A] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{actionBusy === "credentials" ? "Issuing…" : credentials ? "Credentials issued" : "Issue portal credentials"}</button>
                  </section>

                                      ) : (<section className="rounded-2xl border border-slate-200 p-5"><div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Step 2</div><h3 className="mt-1 font-black">Portal credentials</h3><p className="mt-1 text-sm text-slate-500">Credential issuance is restricted to administrators. Ask an administrator to complete this step.</p></section>)}

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-xs font-black uppercase tracking-wider text-[#0F3E8A]">Step 3</div>
                    <h3 className="mt-1 font-black">Partner ID card</h3>
                    <p className="mt-1 text-sm text-slate-500">Generate the printable PDF independently. PDF/SMTP failures cannot block partner creation.</p>
                    {cardStatus && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{cardStatus}</div>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={"/api/admin/partners/" + encodeURIComponent(created.id) + "/card"} className="rounded-full bg-[#E2B02A] px-4 py-2.5 text-sm font-black text-slate-950">Generate / download ID</a>
                      <button type="button" onClick={async () => {
                        setActionBusy("card-email");
                        setCardStatus("");
                        try {
                          const response = await fetch("/api/admin/partners/" + encodeURIComponent(created.id) + "/card/email", { method: "POST" });
                          const data = await response.json();
                          if (!response.ok) throw new Error(data.error || "Could not email ID card.");
                          setCardStatus("ID card emailed to " + data.recipient + ".");
                        } catch (error) {
                          setCardStatus(error instanceof Error ? error.message : "Could not email ID card.");
                        } finally { setActionBusy(""); }
                      }} disabled={actionBusy === "card-email"} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 disabled:opacity-50">{actionBusy === "card-email" ? "Sending…" : "Email ID card"}</button>
                    </div>
                  </section>
                </div>

                {message && <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</div>}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={startAnother} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold">Create another</button>
                  <button type="button" onClick={resetAndClose} className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = "text", required, placeholder, defaultValue }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0F3E8A]" /></label>;
}
