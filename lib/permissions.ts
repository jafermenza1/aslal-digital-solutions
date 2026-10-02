import { UserRole } from "@prisma/client";

export const PERMISSIONS = [
  "dashboard.view",
  "leads.view",
  "leads.create",
  "leads.edit",
  "leads.admin",
  "customers.view",
  "conversations.view",
  "conversations.send",
  "conversations.manage",
  "products.manage",
  "content.manage",
  "email.view",
  "email.manage",
  "telegram.view",
  "telegram.manage",
  "email_templates.manage",
  "users.manage",
  "partners.manage",
  "partners.credentials",
  "partner.portal.view",
  "insights.view",
  "operations.view",
  "commerce.view",
  "commerce.manage",
  "commissions.manage",
  "payouts.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const sets: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [...PERMISSIONS],
  BUSINESS_OWNER: [
    "dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view",
    "conversations.view","conversations.send","conversations.manage","products.manage","content.manage",
    "email.view","email.manage","telegram.view","telegram.manage","email_templates.manage","users.manage","partners.manage","insights.view","operations.view","commerce.view","commerce.manage",
    "commissions.manage","payouts.manage"
  ],
  SALES_MANAGER: [
    "dashboard.view","leads.view","leads.create","leads.edit","customers.view",
    "conversations.view","conversations.send","conversations.manage","email.view","telegram.view","telegram.manage","insights.view","operations.view","commerce.view"
  ],
  SALES_OPERATOR: [
    "dashboard.view","leads.view","leads.create","leads.edit","customers.view",
    "conversations.view","conversations.send"
  ],
  MARKETING_OPERATOR: [
    "dashboard.view","leads.view","customers.view","products.manage",
    "email.view","email.manage","telegram.view","telegram.manage","email_templates.manage","insights.view"
  ],
  PARTNER_MANAGER: [
    "dashboard.view","leads.view","customers.view","partners.manage","insights.view"
  ],
  PARTNER: ["dashboard.view","partner.portal.view"],
  FINANCE: [
    "dashboard.view","customers.view","insights.view","operations.view","commerce.view","commerce.manage",
    "commissions.manage","payouts.manage"
  ],
  AUDITOR: ["dashboard.view","leads.view","customers.view","insights.view","operations.view","commerce.view"],
  CLIENT: ["dashboard.view","customers.view","insights.view"],
};

export function defaultPermissionsForRole(role: UserRole) {
  return [...sets[role]];
}

const workspaceSets: Record<string, Permission[]> = {
  OWNER: [...sets.BUSINESS_OWNER],
  ADMIN: [...PERMISSIONS],
  MANAGER: [...sets.SALES_MANAGER, "partners.manage", "products.manage", "content.manage", "email.manage", "telegram.manage", "email_templates.manage"],
  SALES: [...sets.SALES_OPERATOR, "commerce.view", "commerce.manage", "operations.view"],
  FINANCE: [...sets.FINANCE],
  AUDITOR: [...sets.AUDITOR],
  CLIENT: [...sets.CLIENT],
  PARTNER: [...sets.PARTNER],
  MEMBER: ["dashboard.view"],
};

export function defaultPermissionsForWorkspaceRole(role: string) {
  return [...(workspaceSets[role] || workspaceSets.MEMBER)];
}

export function resolveWorkspacePermissions(accountRole: UserRole, accountRaw: unknown, workspaceRole: string) {
  const account = new Set(resolvePermissions(accountRole, accountRaw));
  const workspace = new Set(defaultPermissionsForWorkspaceRole(workspaceRole));
  // Workspace role is the active operational scope. Account-level grants can only
  // narrow or extend capabilities that are valid for the user's account ceiling.
  return [...workspace].filter(permission => account.has(permission));
}

export function allPermissions() {
  return [...PERMISSIONS];
}

export function resolvePermissions(role: UserRole, raw: unknown) {
  const base = new Set(defaultPermissionsForRole(role));
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const data = raw as { grant?: unknown; revoke?: unknown };
    const allowed = new Set(allPermissions());
    if (Array.isArray(data.grant)) for (const item of data.grant) if (typeof item === "string" && allowed.has(item as Permission)) base.add(item as Permission);
    if (Array.isArray(data.revoke)) for (const item of data.revoke) if (typeof item === "string") base.delete(item as Permission);
  }
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") base.delete("partners.credentials");
  return [...base];
}
