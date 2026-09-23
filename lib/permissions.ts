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
  "email_templates.manage",
  "users.manage",
  "partners.manage",
  "insights.view",
  "operations.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const sets: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [...PERMISSIONS],
  BUSINESS_OWNER: [
    "dashboard.view","leads.view","leads.create","leads.edit","leads.admin","customers.view",
    "conversations.view","conversations.send","conversations.manage","products.manage",
    "email_templates.manage","users.manage","partners.manage","insights.view","operations.view"
  ],
  SALES_MANAGER: [
    "dashboard.view","leads.view","leads.create","leads.edit","customers.view",
    "conversations.view","conversations.send","conversations.manage","insights.view","operations.view"
  ],
  SALES_OPERATOR: [
    "dashboard.view","leads.view","leads.create","leads.edit","customers.view",
    "conversations.view","conversations.send"
  ],
  MARKETING_OPERATOR: [
    "dashboard.view","leads.view","customers.view","products.manage",
    "email_templates.manage","insights.view"
  ],
  PARTNER_MANAGER: [
    "dashboard.view","leads.view","customers.view","partners.manage","insights.view"
  ],
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
    if (Array.isArray(data.grant)) for (const item of data.grant) if (typeof item === "string" && allowed.has(item as Permission)) base.add(item as Permission);
    if (Array.isArray(data.revoke)) for (const item of data.revoke) if (typeof item === "string") base.delete(item as Permission);
  }
  return [...base];
}
