import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { retryEmail } from "@/lib/email-queue";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const row=await prisma.emailOutbox.findUnique({where:{id}});
 if(!row)return NextResponse.json({error:"Email message not found."},{status:404});
 const access=await authorizeWorkspacePermission("email.manage",row.workspaceId);
 if(!access)return NextResponse.json({error:"Email management is not permitted."},{status:403});
 try{return NextResponse.json({ok:true,result:await retryEmail(id)});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to send email."},{status:409});}
}