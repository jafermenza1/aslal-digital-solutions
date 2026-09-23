import { cookies } from "next/headers";
import { verifySession,isAdminEmail } from "@/lib/security";
import { prisma } from "@/lib/prisma";
export async function GET(){
 const s=verifySession((await cookies()).get("aslal_session")?.value); if(!s||!isAdminEmail(s.email))return new Response("Unauthorized",{status:401});
 const rows=await prisma.lead.findMany({orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,phone:true,company:true,businessType:true,status:true,score:true,source:true,medium:true,campaign:true,referralCode:true,ownerEmail:true,nextAction:true,nextActionDueAt:true,dealValue:true,isTest:true,createdAt:true,updatedAt:true}});
 const keys=["id","name","email","phone","company","businessType","status","score","source","medium","campaign","referralCode","ownerEmail","nextAction","nextActionDueAt","dealValue","isTest","createdAt","updatedAt"];
 const esc=(v:unknown)=>'"'+String(v??"").replaceAll('"','""')+'"';
 const csv=[keys.join(","),...rows.map(r=>keys.map(k=>esc((r as unknown as Record<string,unknown>)[k])).join(","))].join("\n");
 return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=aslal-leads-export.csv"}});
}
