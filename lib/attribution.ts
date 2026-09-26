import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export const SOCIAL_SOURCES = ["facebook","instagram","tiktok","linkedin","whatsapp","telegram","youtube","x","twitter","messenger","reddit","pinterest","snapchat","threads"] as const;
export type AttributionType = "DIRECT"|"SOCIAL"|"ORGANIC"|"PAID"|"EMAIL"|"PARTNER"|"AFFILIATE"|"REFERRAL";
const aliases:Record<string,string>={fb:"facebook",ig:"instagram",wa:"whatsapp",tg:"telegram",li:"linkedin",yt:"youtube"};
const socialHosts:Record<string,string>={"facebook.com":"facebook","fb.com":"facebook","l.facebook.com":"facebook","lm.facebook.com":"facebook","instagram.com":"instagram","l.instagram.com":"instagram","tiktok.com":"tiktok","vm.tiktok.com":"tiktok","vt.tiktok.com":"tiktok","linkedin.com":"linkedin","lnkd.in":"linkedin","whatsapp.com":"whatsapp","wa.me":"whatsapp","telegram.me":"telegram","t.me":"telegram","youtube.com":"youtube","youtu.be":"youtube","twitter.com":"twitter","x.com":"x","m.me":"messenger","messenger.com":"messenger","reddit.com":"reddit","pinterest.com":"pinterest","snapchat.com":"snapchat","threads.net":"threads"};

export type AttributionInput={source?:string|null;medium?:string|null;campaign?:string|null;content?:string|null;term?:string|null;referralCode?:string|null;referrer?:string|null};
export function normalizeSource(value:string|null|undefined){const key=(value||"").trim().toLowerCase();return aliases[key]||key||null;}
export function classifyReferrer(referrer:string|null|undefined){if(!referrer)return null;try{return socialHosts[new URL(referrer).hostname.toLowerCase().replace(/^www\./,"")]||null;}catch{return null;}}
export function resolveAttributionType(input:AttributionInput, referralExists=false):AttributionType{if(referralExists)return "PARTNER";const source=normalizeSource(input.source);const medium=(input.medium||"").toLowerCase();if(source&&SOCIAL_SOURCES.includes(source as typeof SOCIAL_SOURCES[number]))return "SOCIAL";if(medium.includes("paid"))return "PAID";if(medium==="email")return "EMAIL";if(medium==="organic"||source==="google"||source==="bing")return "ORGANIC";if(source&&medium==="referral")return "REFERRAL";return "DIRECT";}

export async function recordLeadAttribution(input:{leadId:string;workspaceId:string;attribution:AttributionInput;referralCode?:string|null;productId?:string|null;resourceId?:string|null;}){
 const referralCode=input.referralCode||input.attribution.referralCode||null;let referralLinkId:string|null=null,partnerId:string|null=null,campaignId:string|null=null;
 if(referralCode){const [rows]=await db.execute<any[]>("SELECT id,partner_id,campaign_id FROM referral_links WHERE code=? AND workspace_id=? LIMIT 1",[referralCode,input.workspaceId]);const link=rows[0];if(link){referralLinkId=link.id;partnerId=link.partner_id;campaignId=link.campaign_id||null;}}
 const type=resolveAttributionType(input.attribution,Boolean(referralLinkId));
 await db.execute("INSERT INTO lead_attributions (id,workspace_id,lead_id,attribution_type,source,medium,campaign,content,term,referral_code,referral_link_id,partner_id,campaign_id,product_id,resource_id,is_first_touch,is_last_touch) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[randomUUID(),input.workspaceId,input.leadId,type,input.attribution.source||null,input.attribution.medium||null,input.attribution.campaign||null,input.attribution.content||null,input.attribution.term||null,referralCode,referralLinkId,partnerId,campaignId,input.productId||null,input.resourceId||null,true,true]);
 return {type,partnerId,campaignId,referralLinkId};
}
export async function recordResourceAttribution(input:{resourceRequestId:string;workspaceId:string;attribution:AttributionInput;referralCode?:string|null;}){
 const referralCode=input.referralCode||input.attribution.referralCode||null;let referralLinkId:string|null=null,partnerId:string|null=null,campaignId:string|null=null;
 if(referralCode){const [rows]=await db.execute<any[]>("SELECT id,partner_id,campaign_id FROM referral_links WHERE code=? AND workspace_id=? LIMIT 1",[referralCode,input.workspaceId]);const link=rows[0];if(link){referralLinkId=link.id;partnerId=link.partner_id;campaignId=link.campaign_id||null;}}
 await db.execute("INSERT INTO resource_attributions (id,resource_request_id,workspace_id,referral_code,referral_link_id,partner_id,campaign_id,source,medium,campaign,content) VALUES (?,?,?,?,?,?,?,?,?,?,?)",[randomUUID(),input.resourceRequestId,input.workspaceId,referralCode,referralLinkId,partnerId,campaignId,input.attribution.source||null,input.attribution.medium||null,input.attribution.campaign||null,input.attribution.content||null]);
 return {partnerId,campaignId,referralLinkId};
}
