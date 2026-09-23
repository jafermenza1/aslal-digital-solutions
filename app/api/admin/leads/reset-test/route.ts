import { cookies } from "next/headers";
import { verifySession,isAdminEmail } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request:Request){
 const session=verifySession((await cookies()).get("aslal_session")?.value); if(!session||!isAdminEmail(session.email)) return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>null); const reason=String(body?.reason||"").trim().slice(0,2000);
 if(!reason)return NextResponse.json({error:"A reason is required."},{status:400}); if(body?.confirmation!=="RESET TEST DATA")return NextResponse.json({error:"Type RESET TEST DATA to confirm."},{status:400});
 const leads=await prisma.lead.findMany({where:{isTest:true},select:{id:true,opportunities:{select:{id:true}}}});
 await prisma.$transaction(async tx=>{const ids=leads.map(x=>x.id);const oppIds=leads.flatMap(x=>x.opportunities.map(o=>o.id));if(oppIds.length)await tx.customer.deleteMany({where:{opportunityId:{in:oppIds}}});if(ids.length)await tx.leadAdminAudit.createMany({data:leads.map(l=>({id:crypto.randomUUID(),leadId:l.id,actor:session.email,action:"RESET_TEST",reason,details:{}}))});if(oppIds.length)await tx.opportunity.deleteMany({where:{id:{in:oppIds}}});if(ids.length)await tx.lead.deleteMany({where:{id:{in:ids}}});});
 return NextResponse.json({ok:true,deleted:leads.length});
}
