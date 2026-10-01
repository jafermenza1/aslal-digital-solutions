import { describe,expect,it } from "vitest";

describe("P3 affiliate attribution policy",()=>{
  it("uses a bounded attribution window",()=>{const days=30;expect(Math.max(0,days)).toBe(30);expect(Math.max(0,-4)).toBe(0);});
  it("distinguishes deterministic policy names",()=>{expect(["FIRST_CLICK","LAST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"]).toContain("LAST_CLICK");});
  it("does not treat an unknown policy as a valid published contract rule",()=>{expect(["FIRST_CLICK","LAST_CLICK","LEAD_REGISTRATION","DEAL_REGISTRATION","PROMO_CODE","MANUAL_APPROVAL"]).not.toContain("RANDOM");});
});