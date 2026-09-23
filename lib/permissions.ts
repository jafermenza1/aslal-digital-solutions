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