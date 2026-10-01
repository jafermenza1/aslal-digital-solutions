import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { defaultPermissionsForWorkspaceRole, resolveWorkspacePermissions } from "./permissions";

describe("workspace-effective permissions",()=>{
 it("gives OWNER business capabilities but not account-revoked permissions",()=>{
  const p=resolveWorkspacePermissions(UserRole.BUSINESS_OWNER,{revoke:["finance.view"]},"OWNER");
  expect(p).toContain("users.manage");
  expect(p).toContain("commerce.manage");
  expect(p).not.toContain("finance.view");
 });
 it("does not leak Finance capabilities into SALES workspace role",()=>{
  const p=resolveWorkspacePermissions(UserRole.FINANCE,{}, "SALES");
  expect(p).toContain("commerce.view");
  expect(p).not.toContain("commissions.manage");
  expect(p).not.toContain("payouts.manage");
 });
 it("supports explicit workspace role defaults",()=>{
  expect(defaultPermissionsForWorkspaceRole("AUDITOR")).toContain("operations.view");
  expect(defaultPermissionsForWorkspaceRole("AUDITOR")).not.toContain("users.manage");
 });
 it("prevents suspended/removed memberships from being represented by role permissions at the authorization boundary",()=>{
  expect(defaultPermissionsForWorkspaceRole("MEMBER")).toEqual(["dashboard.view"]);
 });
});
