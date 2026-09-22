"use client";

import { useState } from "react";

export function CustomerConversionButton({ leadId }: { leadId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function convert() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/customers/from-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Customer conversion failed.");
      setMessage(data.created === false ? "Customer already existed; no duplicate was created." : "Customer created successfully.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Customer conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <button type="button" onClick={convert} disabled={busy} className="w-full rounded-xl bg-[#E2B02A] px-5 py-3 font-black text-[#1E293B] disabled:opacity-50">
      {busy ? "Converting…" : "Convert WON lead to customer"}
    </button>
    {message && <p className="mt-2 text-xs font-semibold text-slate-600">{message}</p>}
  </div>;
}
