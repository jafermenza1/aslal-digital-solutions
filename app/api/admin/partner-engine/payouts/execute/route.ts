import { NextResponse } from "next/server";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { db } from "@/lib/db";
import { createPayoutExecution, confirmManualPayout } from "@/lib/payout-engine";
import type { PayoutProvider } from "@/lib/payout-providers";

export async function POST(request: Request) {
  const access=await authorizeWorkspacePermission("payouts.manage");
  if(!access) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await request.json();
  const action=String(body.action||"CREATE_EXECUTION").toUpperCase();
  const payoutId=String(body.payoutId||"").trim();
  if(!payoutId) return NextResponse.json({error:"payoutId is required."},{status:400});

  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    if(action==="VERIFY_MANUAL"){
      const result=await confirmManualPayout(conn,{
        workspaceId:access.workspace.id,payoutId,actor:access.user.email,
        reference:String(body.reference||""),
        notes:body.notes?String(body.notes):undefined,
        evidenceUrl:body.evidenceUrl?String(body.evidenceUrl):undefined,
      });
      await conn.commit();
      return NextResponse.json(result);
    }

    const provider=String(body.provider||"MANUAL").toUpperCase() as PayoutProvider;
    if(!["MANUAL","TELEBIRR","MPESA"].includes(provider)) throw new Error("Unsupported payout provider.");
    const idempotencyKey=String(body.idempotencyKey||"").trim();
    if(!idempotencyKey) throw new Error("idempotencyKey is required.");

    const result=await createPayoutExecution(conn,{workspaceId:access.workspace.id,payoutId,provider,idempotencyKey});
    await conn.commit();
    return NextResponse.json({execution:result});
  }catch(error){
    await conn.rollback();
    return NextResponse.json({error:error instanceof Error?error.message:"Payout operation failed."},{status:409});
  }finally{conn.release();}
}
