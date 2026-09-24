"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  permissions: string[];
  lastLoginAt: string | null;
};

const permissions = [
  "dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view",
  "conversations.view","conversations.send","conversations.manage","products.manage","content.manage",
  "email_templates.manage","users.manage","partners.manage","partners.credentials","partner.portal.view","insights.view","operations.view",
];

const roleDefaults: Record<string, string[]> = {
  SUPER_ADMIN: permissions,
  ADMIN: permissions,
  BUSINESS_OWNER: ["dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view","conversations.view","conversations.send","conversations.manage","products.manage","content.manage","email_templates.manage","users.manage","partners.manage","insights.view","operations.view"],
  SALES_MANAGER: ["dashboard.view","leads.view","leads.create","leads.edit","customers.view","conversations.view","conversations.send","conversations.manage","insights.view","operations.view"],
  SALES_OPERATOR: ["dashboard.view","leads.view","leads.create","leads.edit","customers.view","conversations.view","conversations.send"],
  MARKETING_OPERATOR: ["dashboard.view","leads.view","customers.view","products.manage","email_templates.manage","insights.view"],
  PARTNER: ["dashboard.view","partner.portal.view"],
  PARTNER_MANAGER: ["dashboard.view","leads.view","customers.view","partners.manage","insights.view"],
};

type Draft = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  selected: string[];
  reason: string;
};

const emptyDraft = (): Draft => ({
  id: "", name: "", email: "", password: "", role: "SALES_OPERATOR", active: true,
  selected: [...roleDefaults.SALES_OPERATOR], reason: "",
});

export function UserManagement({ initial }: { initial: UserRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  const edit = (user: UserRow) => {
    setDraft({
      id: user.id, name: user.name, email: user.email, password: "",
      role: user.role, active: user.active, selected: user.permissions, reason: "",
    });
    setNotice("");
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.reason.trim()) {
      setNotice("Enter a reason so access changes are auditable.");
      return;
    }
    setBusy("save");
    setNotice("");
    const defaults = roleDefaults[draft.role] || [];
    const grant = draft.selected.filter(permission => !defaults.includes(permission));
    const revoke = defaults.filter(permission => !draft.selected.includes(permission));
    const payload = {
      name: draft.name,
      email: draft.email,
      password: draft.password || undefined,
      role: draft.role,
      active: draft.active,
      permissions: { grant, revoke },
      reason: draft.reason.trim(),
    };

    try {
      const response = await fetch(
        draft.id ? "/api/admin/users/" + draft.id : "/api/admin/users",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save user.");
      setRows(current => draft.id
        ? current.map(row => row.id === draft.id ? data.user : row)
        : [data.user, ...current]);
      setDraft(emptyDraft());
      setNotice("User saved. Access changes are active for subsequent requests.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save user.");
    } finally {
      setBusy("");
    }
  };

  const toggle = async (user: UserRow) => {
    const reason = window.prompt(
      "Reason for changing this user's active status",
      user.active ? "Disable user access" : "Restore user access",
    );
    if (!reason?.trim()) return;
    setBusy(user.id);
    setNotice("");

    try {
      const response = await fetch("/api/admin/users/" + user.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active, reason: reason.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update user.");
      setRows(current => current.map(row => row.id === user.id ? data.user : row));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to update user.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
      <form onSubmit={save} className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#E2B02A]">User access</div>
            <h2 className="mt-2 text-xl font-black">{draft.id ? "Edit user" : "Add user"}</h2>
          </div>
          {draft.id && <button type="button" onClick={() => { setDraft(emptyDraft()); setNotice(""); }} className="text-xs font-bold text-white/50">Cancel</button>}
        </div>

        <div className="mt-5 grid gap-3">
          <input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Full name" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" />
          <input required type="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} placeholder="Email" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" />
          <input type="password" minLength={10} value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} placeholder={draft.id ? "New password (leave blank to keep)" : "Password · 10+ characters"} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" />
          <select value={draft.role} onChange={event => {
            const role = event.target.value;
            setDraft({ ...draft, role, selected: [...(roleDefaults[role] || [])] });
          }} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white">
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="ADMIN">Administrator</option>
            <option value="BUSINESS_OWNER">Business Owner</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="SALES_OPERATOR">Sales Operator</option>
            <option value="MARKETING_OPERATOR">Marketing Operator</option>
            <option value="PARTNER_MANAGER">Partner Manager</option>
            <option value="PARTNER">Partner</option>
          </select>
          <label className="flex items-center gap-3 text-sm font-bold text-white/70">
            <input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} />
            Active user
          </label>
          <label className="grid gap-1 text-sm font-bold text-white/70">
            Reason for this access change
            <textarea required value={draft.reason} onChange={event => setDraft({ ...draft, reason: event.target.value })} rows={3} placeholder="Why is this user being created or changed?" className="mt-2 rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder:text-white/30" />
          </label>
        </div>

        <div className="mt-6">
          <div className="text-xs font-black uppercase tracking-[.16em] text-white/45">Editable permissions</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {permissions.map(permission => (
              <label key={permission} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs">
                <input
                  type="checkbox"
                  checked={draft.selected.includes(permission)}
                  disabled={permission==="partners.credentials" && !["ADMIN","SUPER_ADMIN"].includes(draft.role)}
                  onChange={event => setDraft({
                    ...draft,
                    selected: event.target.checked
                      ? Array.from(new Set([...draft.selected, permission]))
                      : draft.selected.filter(item => item !== permission),
                  })}
                />
                <span className="font-semibold text-white/75">{permission}{permission==="partners.credentials" && <span className="ml-1 text-[#E2B02A]">(admin only)</span>}</span>
              </label>
            ))}
          </div>
        </div>

        {notice && <div className="mt-4 rounded-xl border border-[#E2B02A]/20 bg-[#E2B02A]/10 p-3 text-sm text-white/80">{notice}</div>}
        <button disabled={busy !== ""} className="mt-5 rounded-full bg-[#E2B02A] px-6 py-3 font-black text-[#1E293B]">
          {busy === "save" ? "Saving…" : draft.id ? "Save access" : "Create user"}
        </button>
      </form>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.03]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#E2B02A]">Workspace users</div>
          <h2 className="mt-2 text-xl font-black">People who can operate the Growth OS</h2>
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-white/35">
              <tr>{["Name","Role","Status","Permissions","Last login","Actions"].map(header => <th key={header} className="px-4 py-4">{header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(user => (
                <tr key={user.id} className="border-t border-white/5 align-top">
                  <td className="px-4 py-4"><div className="font-black">{user.name}</div><div className="text-xs text-white/40">{user.email}</div></td>
                  <td className="px-4 py-4 text-xs font-bold">{user.role}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black">{user.active ? "ACTIVE" : "OFF"}</span></td>
                  <td className="max-w-[230px] px-4 py-4 text-xs text-white/50">{user.permissions.length} permissions</td>
                  <td className="px-4 py-4 text-xs text-white/45">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-ET") : "Never"}</td>
                  <td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => edit(user)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Edit</button><button type="button" disabled={busy === user.id} onClick={() => toggle(user)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">{user.active ? "Disable" : "Enable"}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {rows.map(user => (
            <article key={user.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <div className="font-black">{user.name}</div>
              <div className="text-xs text-white/40">{user.email}</div>
              <div className="mt-3 text-xs">{user.role} · {user.active ? "ACTIVE" : "OFF"} · {user.permissions.length} permissions</div>
              <div className="mt-3 flex gap-2"><button type="button" onClick={() => edit(user)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Edit</button><button type="button" onClick={() => toggle(user)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">{user.active ? "Disable" : "Enable"}</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
