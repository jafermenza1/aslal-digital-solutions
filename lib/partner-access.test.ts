import {describe,expect,it} from "vitest";
import {canJoinProgram,partnerCapabilities,profileComplete} from "./partner-access";

describe("P1 partner access",()=>{
 it("allows BASIC active affiliate into OPEN program",()=>{
  const p={accountStatus:"ACTIVE",verificationLevel:"BASIC",type:"AFFILIATE" as const,emailVerifiedAt:new Date(),phoneVerifiedAt:null};
  expect(canJoinProgram(p,"OPEN")).toBe(true);
  expect(partnerCapabilities(p)).toContain("partner.referral_links");
 });
 it("does not allow unverified registered accounts to join",()=>{
  const p={accountStatus:"REGISTERED",verificationLevel:"BASIC",type:"AFFILIATE" as const,emailVerifiedAt:null,phoneVerifiedAt:null};
  expect(canJoinProgram(p,"OPEN")).toBe(false);
 });
 it("restricts suspended accounts",()=>{
  const p={accountStatus:"SUSPENDED",verificationLevel:"BASIC",type:"AFFILIATE" as const,emailVerifiedAt:new Date(),phoneVerifiedAt:null};
  expect(partnerCapabilities(p)).toEqual(["partner.profile.view"]);
  expect(canJoinProgram(p,"OPEN")).toBe(false);
 });
 it("requires core profile fields",()=>{
  expect(profileComplete({name:"A",email:"a@example.com",phone:"+251900000000",country:"Ethiopia",type:"AFFILIATE"})).toBe(true);
  expect(profileComplete({name:"A",email:"a@example.com",phone:null,country:"Ethiopia",type:"AFFILIATE"})).toBe(false);
 });
});


describe("program admission",()=>{
  const base={accountStatus:"ACTIVE",verificationLevel:"BASIC",type:"AFFILIATE" as const,emailVerifiedAt:new Date(),phoneVerifiedAt:null};
  it("allows BASIC affiliates into OPEN programs",()=>{expect(canJoinProgram(base,"OPEN")).toBe(true)});
  it("requires elevated verification for VERIFICATION_REQUIRED programs",()=>{expect(canJoinProgram(base,"VERIFICATION_REQUIRED")).toBe(false);expect(canJoinProgram({...base,verificationLevel:"TRUSTED"},"VERIFICATION_REQUIRED")).toBe(true)});
  it("does not self-join approval or invitation programs",()=>{expect(canJoinProgram(base,"BUSINESS_APPROVAL")).toBe(false);expect(canJoinProgram(base,"INVITATION_ONLY")).toBe(false)});
});
