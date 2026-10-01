import { describe, expect, it } from "vitest";
import { requirePartnerAttributionWorkspace } from "@/lib/workspace-boundary";

describe("P10.1 partner cross-business attribution", () => {
  it("allows a partner whose home workspace differs from the commercial workspace", () => {
    expect(
      requirePartnerAttributionWorkspace("business-b", "business-b", "business-a"),
    ).toBe("business-b");
  });

  it("still rejects a referral owned by a different commercial workspace", () => {
    expect(() =>
      requirePartnerAttributionWorkspace("business-b", "business-a", "business-a"),
    ).toThrow("Workspace access denied.");
  });

  it("does not use partner home workspace as the commercial boundary", () => {
    expect(
      requirePartnerAttributionWorkspace("business-b", "business-b", "business-c"),
    ).toBe("business-b");
  });
});
