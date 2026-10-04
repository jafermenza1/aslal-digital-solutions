import { createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/lib/config";

function secret(){
 return process.env.CONTACT_CONFIRMATION_SECRET||process.env.SESSION_SECRET||process.env.NEXTAUTH_SECRET||process.env.AUTH_SECRET||siteConfig.url;
}
function digest(value:string){return createHmac("sha256",secret()).update(value).digest("base64url");}
export function createContactConfirmationToken(leadId:string,email:string,issuedAt=Date.now()){
 const payload=issuedAt+"."+leadId+"."+email.toLowerCase();
 return Buffer.from(payload).toString("base64url")+"."+digest(payload);
}
export function verifyContactConfirmationToken(token:string,leadId:string,email:string,maxAgeMs=48*60*60*1000){
 try{
  const [encoded,sig]=token.split(".");
  if(!encoded||!sig)return false;
  const payload=Buffer.from(encoded,"base64url").toString("utf8");
  const expected=digest(payload);
  if(expected.length!==sig.length||!timingSafeEqual(Buffer.from(expected),Buffer.from(sig)))return false;
  const [issued,id,address]=payload.split(".");
  const issuedAt=Number(issued);
  return id===leadId&&address===email.toLowerCase()&&Number.isFinite(issuedAt)&&issuedAt<=Date.now()&&Date.now()-issuedAt<=maxAgeMs;
 }catch{return false}
}
export function contactConfirmationUrl(leadId:string,email:string){
 const token=createContactConfirmationToken(leadId,email);
 return siteConfig.url+"/contact/confirm?lead="+encodeURIComponent(leadId)+"&token="+encodeURIComponent(token);
}
