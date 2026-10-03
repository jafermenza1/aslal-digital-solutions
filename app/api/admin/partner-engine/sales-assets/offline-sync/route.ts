import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const clean=(value:unknown,max=500)=>typeof value==="string"?value.trim().slice(0,max):"";

export async function GET(request:Request){
  const url=new URL(request.url);
  const access=await authorizeWorkspacePermission("partners.manage",url.searchParams.get("workspaceId"));
  if(!access) return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
  const rows=await prisma.$queryRawUnsafe<any[]>(`
    SELECT i.id issued_asset_id,i.serial_number,i.qr_payload,i.status,i.valid_from,i.valid_until,
           i.holder_name,i.holder_phone,i.issued_price,i.issued_value,
           a.name asset_name,a.asset_type,a.currency
    FROM issued_sales_assets i
    JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id
    WHERE i.workspace_id=? AND i.status='VALID' AND a.status='ACTIVE'
      AND (i.valid_from IS NULL OR i.valid_from<=NOW())
      AND (i.valid_until IS NULL OR i.valid_until>=NOW())
    ORDER BY i.issued_at ASC
    LIMIT 2000`,access.workspace.id);
  return NextResponse.json({manifestVersion:new Date().toISOString(),workspaceId:access.workspace.id,assets:rows});
}

export async function POST(request:Request){
  const url=new URL(request.url);
  const access=await authorizeWorkspacePermission("partners.manage",url.searchParams.get("workspaceId"));
  if(!access) return NextResponse.json({error:"Unauthorized or workspace access denied."},{status:403});
  const body=await request.json().catch(()=>({}));
  const events=Array.isArray(body?.events)?body.events:[body];
  if(events.length<1||events.length>100) return NextResponse.json({error:"Submit between 1 and 100 offline redemption events."},{status:400});
  const results=[];
  for(const event of events){
    const clientEventId=clean(event?.clientEventId,100);
    const issuedAssetId=clean(event?.issuedAssetId,36);
    const serialNumber=clean(event?.serialNumber,50);
    const deviceId=clean(event?.deviceId,120);
    const verificationPayload=clean(event?.verificationPayload,500);
    const occurredAtRaw=clean(event?.occurredAt,40);
    const occurredAt=occurredAtRaw?new Date(occurredAtRaw):new Date();
    if(!clientEventId||!issuedAssetId||!serialNumber||!deviceId||Number.isNaN(occurredAt.getTime())){
      results.push({clientEventId,status:"INVALID",message:"Offline event is missing a valid event ID, asset ID, serial, device ID, or timestamp."});
      continue;
    }
    try{
      const result=await prisma.$transaction(async(tx)=>{
        const existing=await tx.$queryRawUnsafe<any[]>(`SELECT id,sync_status,sync_message,synced_at FROM offline_sales_asset_redemptions WHERE workspace_id=? AND client_event_id=? LIMIT 1`,access.workspace.id,clientEventId);
        if(existing[0]) return {status:existing[0].sync_status,message:existing[0].sync_message,syncedAt:existing[0].synced_at};
        const rows=await tx.$queryRawUnsafe<any[]>(`
          SELECT i.*,a.status asset_definition_status,a.name asset_name,o.id order_id
          FROM issued_sales_assets i
          JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id
          LEFT JOIN orders o ON o.distribution_asset_id=i.asset_id AND o.workspace_id=i.workspace_id AND o.source='partner_sales_asset'
          WHERE i.workspace_id=? AND i.id=? AND i.serial_number=? LIMIT 1 FOR UPDATE`,
          access.workspace.id,issuedAssetId,serialNumber);
        const item=rows[0];
        if(!item) throw Object.assign(new Error("Asset is not part of this workspace manifest."),{code:"CONFLICT"});
        const queueId=randomUUID();
        if(item.status==="REDEEMED"){
          await tx.$executeRawUnsafe(`INSERT INTO offline_sales_asset_redemptions (id,workspace_id,issued_asset_id,serial_number,device_id,client_event_id,occurred_at,synced_at,sync_status,sync_message,redeemed_by,verification_payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            queueId,access.workspace.id,item.id,item.serial_number,deviceId,clientEventId,occurredAt,new Date(),"CONFLICT","Asset was already redeemed online or by another device.",access.user.email,verificationPayload||item.qr_payload);
          return {status:"CONFLICT",message:"Asset was already redeemed online or by another device."};
        }
        if(item.status!=="VALID") throw Object.assign(new Error("Asset status is "+item.status+"; it cannot be redeemed from the offline manifest."),{code:"CONFLICT"});
        if(item.asset_definition_status!=="ACTIVE") throw Object.assign(new Error("The underlying sales asset is no longer active."),{code:"CONFLICT"});
        if(item.valid_from&&new Date(item.valid_from)>occurredAt) throw Object.assign(new Error("Offline redemption occurred before the asset became valid."),{code:"CONFLICT"});
        if(item.valid_until&&new Date(item.valid_until)<occurredAt) throw Object.assign(new Error("Offline redemption occurred after the asset validity period."),{code:"CONFLICT"});
        const now=new Date();
        const redemptionId=randomUUID();
        await tx.$executeRawUnsafe(`INSERT INTO issued_sales_asset_redemptions (id,workspace_id,issued_asset_id,serial_number,asset_id,allocation_id,partner_id,order_id,redeemed_by,redeemed_at,redemption_method,verification_payload,holder_name,holder_phone,asset_status_before,valid_from,valid_until) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          redemptionId,access.workspace.id,item.id,item.serial_number,item.asset_id,item.allocation_id,item.partner_id,item.order_id||null,access.user.email,occurredAt,"OFFLINE",verificationPayload||item.qr_payload,item.holder_name||null,item.holder_phone||null,item.status,item.valid_from||null,item.valid_until||null);
        const changed=await tx.$executeRawUnsafe(`UPDATE issued_sales_assets SET status='REDEEMED',redeemed_at=?,redeemed_by=? WHERE id=? AND workspace_id=? AND status='VALID'`,occurredAt,access.user.email,item.id,access.workspace.id);
        if(Number(changed)!==1) throw Object.assign(new Error("Asset changed before offline redemption could be synchronized."),{code:"CONFLICT"});
        await tx.$executeRawUnsafe(`INSERT INTO offline_sales_asset_redemptions (id,workspace_id,issued_asset_id,serial_number,device_id,client_event_id,occurred_at,synced_at,sync_status,sync_message,redeemed_by,verification_payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          queueId,access.workspace.id,item.id,item.serial_number,deviceId,clientEventId,occurredAt,now,"SYNCED","Offline redemption synchronized successfully.",access.user.email,verificationPayload||item.qr_payload);
        return {status:"SYNCED",message:"Offline redemption synchronized successfully.",syncedAt:now};
      });
      results.push({clientEventId,...result});
    }catch(error:any){
      results.push({clientEventId,status:error?.code==="CONFLICT"?"CONFLICT":"FAILED",message:error instanceof Error?error.message:"Could not synchronize offline redemption."});
    }
  }
  const summary={
    synced:results.filter((r:any)=>r.status==="SYNCED").length,
    conflicts:results.filter((r:any)=>r.status==="CONFLICT").length,
    invalid:results.filter((r:any)=>r.status==="INVALID").length,
    failed:results.filter((r:any)=>r.status==="FAILED").length
  };
  return NextResponse.json({ok:summary.failed===0&&summary.invalid===0,summary,results},{status:summary.failed||summary.invalid?400:200});
}
