export type OfferChannel="WEBSITE"|"PARTNER_MARKETPLACE"|"TELEGRAM";
export type OfferStatus="DRAFT"|"PUBLISHED"|"PAUSED"|"ARCHIVED";
export type OfferPriceType="FIXED"|"STARTING_FROM"|"QUOTE"|"CONTACT";
export type OfferInput={workspaceId:string;productId?:string|null;resourceId?:string|null;status:OfferStatus;channels:OfferChannel[];priceType:OfferPriceType;price?:number|null};

export function validateOfferInput(input:OfferInput){
 const sourceCount=Number(Boolean(input.productId))+Number(Boolean(input.resourceId));
 if(!input.workspaceId)return {ok:false,reason:"WORKSPACE_REQUIRED"} as const;
 if(sourceCount!==1)return {ok:false,reason:"EXACTLY_ONE_SOURCE_REQUIRED"} as const;
 if(input.status==="PUBLISHED"&&!input.channels.length)return {ok:false,reason:"PUBLISHED_REQUIRES_CHANNEL"} as const;
 if(input.priceType==="FIXED"&&(input.price===null||input.price===undefined||!Number.isFinite(input.price)||input.price<0))return {ok:false,reason:"FIXED_PRICE_REQUIRED"} as const;
 if(input.price!==null&&input.price!==undefined&&(!Number.isFinite(input.price)||input.price<0))return {ok:false,reason:"INVALID_PRICE"} as const;
 return {ok:true} as const;
}

export function offerPriceLabel(input:{priceType:OfferPriceType;price?:number|null;currency:string}){
 if(input.priceType==="QUOTE")return "Quote";
 if(input.priceType==="CONTACT")return "Contact";
 if(input.price===null||input.price===undefined)return input.priceType==="STARTING_FROM"?"Starting price":"Price unavailable";
 return (input.priceType==="STARTING_FROM"?"From ":"")+input.currency+" "+input.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}
