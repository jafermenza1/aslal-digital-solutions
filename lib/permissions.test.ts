import { describe, expect, it } from "vitest";
import { resolveWorkspacePermissions } from "@/lib/permissions";

describe("P10.1 account/workspace authorization", () => {
  it("caps Finance account access to Finance workspace permissions", () => {
    const permissions = resolveWorkspacePermissions("FINANCE", null, "FINANCE");
    expect(permissions).toContain("commissions.manage");
    expect(permissions).toContain("payouts.manage");
    expect(permissions).not.toContain("partners.manage");
    expect(permissions).not.toContain("users.manage");
  });

  it("caps a Finance account when it operates in an Auditor workspace", () => {
    const permissions = resolveWorkspacePermissions("FINANCE", null, "AUDITOR");
    expect(permissions).toContain("dashboard.view");
    expect(permissions).toContain("commerce.view");
    expect(permissions).not.toContain("commissions.manage");
    expect(permissions).not.toContain("payouts.manage");
  });

  it("does not allow account permission grants to escape the account role ceiling", () => {
    const permissions = resolveWorkspacePermissions(
      "SALES_OPERATOR",
      { grant: ["users.manage", "payouts.manage"] },
      "SALES",
    );
    expect(permissions).not.toContain("users.manage");
    expect(permissions).not.toContain("payouts.manage");
    expect(permissions).toContain("leads.edit");
  });

  it("isolates Partner workspace capability from internal business administration", () => {
    const permissions = resolveWorkspacePermissions("PARTNER", null, "PARTNER");
    expect(permissions).toEqual(["dashboard.view", "partner.portal.view"]);
    expect(permissions).not.toContain("partners.manage");
    expect(permissions).not.toContain("commerce.manage");
    expect(permissions).not.toContain("commissions.manage");
  });

  it("keeps Client read scope narrow", () => {
    const permissions = resolveWorkspacePermissions("CLIENT", null, "CLIENT");
    expect(permissions).toContain("customers.view");
    expect(permissions).toContain("insights.view");
    expect(permissions).not.toContain("leads.edit");
    expect(permissions).not.toContain("products.manage");
    expect(permissions).not.toContain("payouts.manage");
  });

  it("allows Auditor read oversight without mutation permissions", () => {
    const permissions = resolveWorkspacePermissions("AUDITOR", null, "AUDITOR");
    expect(permissions).toContain("leads.view");
    expect(permissions).toContain("commerce.view");
    expect(permissions).not.toContain("leads.edit");
    expect(permissions).not.toContain("commerce.manage");
    expect(permissions).not.toContain("commissions.manage");
  });

  it("allows the same account identity to have different workspace capabilities", () => {
    const financeInBusinessA = resolveWorkspacePermissions("FINANCE", null, "FINANCE");
    const financeInBusinessB = resolveWorkspacePermissions("FINANCE", null, "AUDITOR");
    expect(financeInBusinessA).toContain("payouts.manage");
    expect(financeInBusinessB).not.toContain("payouts.manage");
  });
});
