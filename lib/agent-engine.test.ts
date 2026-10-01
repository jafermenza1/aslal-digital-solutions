import { describe, expect, it } from "vitest";
import { agentClaimIsEligible } from "./agent-engine";

describe("P4 referral agent claim protection", () => {
  it("rejects submitted claims without verified work", () => {
    expect(agentClaimIsEligible({ status: "SUBMITTED", workEvidence: [] })).toBe(false);
    expect(agentClaimIsEligible({ status: "SUBMITTED", workEvidence: [{ verificationStatus: "PENDING" }] })).toBe(false);
  });
  it("rejects accepted claims if all evidence was rejected", () => {
    expect(agentClaimIsEligible({ status: "ACCEPTED", workEvidence: [{ verificationStatus: "REJECTED" }] })).toBe(false);
  });
  it("allows commission eligibility only after accepted registration and verified work", () => {
    expect(agentClaimIsEligible({ status: "ACCEPTED", workEvidence: [{ verificationStatus: "VERIFIED" }] })).toBe(true);
  });
});
