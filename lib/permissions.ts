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

export function allPermissions() {
  return [...PERMISSIONS];
}

export function resolvePermissions(role: UserRole, raw: unknown) {
  const base = new Set(defaultPermissionsForRole(role));
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const data = raw as { grant?: unknown; revoke?: unknown };
    const allowed = new Set(allPermissions());
    // Grants can only operate inside the permissions already allowed by the account role.
    // The account role is the ceiling; overrides cannot elevate a user into another role.
    if (Array.isArray(data.grant)) for (const item of data.grant) if (typeof item === "string" && allowed.has(item as Permission) && base.has(item as Permission)) base.add(item as Permission);
    if (Array.isArray(data.revoke)) for (const item of data.revoke) if (typeof item === "string") base.delete(item as Permission);
  }
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") base.delete("partners.credentials");
  return [...base];
}

export type WorkspaceRole =
  | "OWNER" | "ADMIN" | "MANAGER" | "SALES" | "FINANCE" | "AUDITOR" | "CLIENT" | "PARTNER" | "MEMBER";

const workspaceSets: Record<WorkspaceRole, Permission[]> = {
  OWNER: [...PERMISSIONS],
  ADMIN: [...PERMISSIONS],
  MANAGER: ["dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view","conversations.view","conversations.send","conversations.manage","products.manage","content.manage","email.view","email.manage","telegram.view","telegram.manage","email_templates.manage","partners.manage","insights.view","operations.view","commerce.view","commerce.manage","commissions.manage","payouts.manage"],
  SALES: ["dashboard.view","leads.view","leads.create","leads.edit","customers.view","conversations.view","conversations.send","insights.view","operations.view","commerce.view"],
  FINANCE: ["dashboard.view","customers.view","insights.view","operations.view","commerce.view","commerce.manage","commissions.manage","payouts.manage"],
  AUDITOR: ["dashboard.view","leads.view","customers.view","insights.view","operations.view","commerce.view"],
  CLIENT: ["dashboard.view","customers.view","insights.view"],
  PARTNER: ["dashboard.view","partner.portal.view"],
  MEMBER: ["dashboard.view"],
};

export function permissionsForWorkspaceRole(role: WorkspaceRole) {
  return [...workspaceSets[role]];
}

export function resolveWorkspacePermissions(role: UserRole, raw: unknown, workspaceRole: WorkspaceRole) {
  const account = new Set(resolvePermissions(role, raw));
  const workspace = new Set(permissionsForWorkspaceRole(workspaceRole));
  return [...account].filter(permission => workspace.has(permission));
}
