import {describe,expect,it} from "vitest";
import {offerPriceLabel,validateOfferInput} from "./catalog-offer-engine";
describe("catalog offer engine",()=>{
 it("requires exactly one canonical source",()=>expect(validateOfferInput({workspaceId:"w",status:"DRAFT",channels:["WEBSITE"],priceType:"QUOTE"}).reason).toBe("EXACTLY_ONE_SOURCE_REQUIRED"));
 it("rejects published offers with no channel",()=>expect(validateOfferInput({workspaceId:"w",productId:"p",status:"PUBLISHED",channels:[],priceType:"QUOTE"}).reason).toBe("PUBLISHED_REQUIRES_CHANNEL"));
 it("requires a valid fixed price",()=>expect(validateOfferInput({workspaceId:"w",productId:"p",status:"DRAFT",channels:["WEBSITE"],priceType:"FIXED"}).reason).toBe("FIXED_PRICE_REQUIRED"));
 it("formats commercial price labels",()=>expect(offerPriceLabel({priceType:"STARTING_FROM",price:2500,currency:"ETB"})).toBe("From ETB 2,500.00"));
});
