import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";

const TYPES=new Set(["CREATIVE","COPY","PRICE_SHEET","QR","POSTER","LINK"]);
const STATUSES=new Set(["DRAFT","PUBLISHED","ARCHIVED"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const actor=await authorizePermission("partners.manage");
 if(!actor)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 try{
  const b=await request.json();
  const fields:{key:string;value:unknown}[]=[
   {key:"name",value:String(b.name??"").trim()},
   {key:"type",value:String(b.type??"").toUpperCase()},
   {key:"status",value:String(b.status??"").toUpperCase()},
   {key:"description",value:String(b.description??"").trim()||null},
   {key:"content",value:String(b.content??"").trim()||null},
   {key:"asset_url",value:String(b.assetUrl??"").trim()||null},
   {key:"placement",value:String(b.placement??"").trim()||null},
   {key:"tracking_code",value:String(b.trackingCode??"").trim()||null}
  ];
  const name=String(fields[0].value),type=String(fields[1].value),status=String(fields[2].value);
  if(!name||!TYPES.has(type)||!STATUSES.has(status))return NextResponse.json({error:"Name, valid asset type and status are required."},{status:400});
  const [r]=await db.query<any[]>(
   `UPDATE campaign_assets SET name=?,type=?,status=?,description=?,content=?,asset_url=?,placement=?,tracking_code=?,updated_at=NOW() WHERE id=?`,
   [...fields.slice(0,8).map(x=>x.value),id]
  );
  if(!r.affectedRows)return NextResponse.json({error:"Campaign asset not found."},{status:404});
  await db.query(
   `INSERT INTO user_audits (id,user_id,actor,action,reason,details,created_at)
    VALUES (UUID(),NULL,?,?,?,?,?,NOW())`,
   [actor.email,"CAMPAIGN_ASSET_UPDATED","Campaign asset updated.",JSON.stringify({assetId:id,status,type})]
  );
  return NextResponse.json({ok:true,id});
 }catch(error){
  console.error("CAMPAIGN_ASSET_UPDATE_ERROR",error);
  return NextResponse.json({error:"Could not update campaign asset."},{status:500});
 }
}
