export type MobileRole = "SALES" | "PARTNER" | "CLIENT" | "FINANCE" | "ADMIN";

export type MobileTab =
  | "today" | "inbox" | "leads" | "tasks" | "campaigns" | "referrals"
  | "earnings" | "customers" | "orders" | "payments" | "command" | "more";

export type SyncState = "LIVE" | "LIMITED" | "OFFLINE" | "SYNCING" | "ATTENTION";
export type LocalOperationStatus = "QUEUED" | "SYNCING" | "ACCEPTED" | "FAILED" | "CONFLICT";

export function resolveMobileRole(role: string, permissions: string[]): MobileRole {
  if (role === "SUPER_ADMIN" || role === "ADMIN" || permissions.some((p) => p.startsWith("admin."))) return "ADMIN";
  if (permissions.some((p) => p.includes("finance") || p.includes("payment") || p.includes("reconciliation"))) return "FINANCE";
  if (role === "CLIENT" || permissions.some((p) => p.startsWith("client."))) return "CLIENT";
  if (role === "PARTNER" || permissions.some((p) => p.startsWith("partners."))) return "PARTNER";
  return "SALES";
}

export function tabsForRole(role: MobileRole): MobileTab[] {
  switch (role) {
    case "PARTNER": return ["today", "campaigns", "referrals", "earnings", "more"];
    case "CLIENT": return ["today", "leads", "customers", "orders", "more"];
    case "FINANCE": return ["today", "orders", "payments", "command", "more"];
    case "ADMIN": return ["command", "leads", "campaigns", "payments", "more"];
    default: return ["today", "inbox", "leads", "tasks", "more"];
  }
}
