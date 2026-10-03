import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import type { RowDataPacket } from "mysql2/promise";

const TYPES=new Set(["CITY","EVENT"]);

export async function GET(request:Request){
  const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId"));
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
  const [rows]=await db.query<RowDataPacket[]>(
    "SELECT id,area_type,name,active,created_by,created_at FROM campaign_service_area_options WHERE workspace_id=? ORDER BY area_type,name ASC LIMIT 500",
    [access.workspace.id]
  );
  return NextResponse.json({serviceAreas:rows});
}

export async function POST(request:Request){
  const access=await authorizeWorkspacePermission("partners.manage",new URL(request.url).searchParams.get("workspaceId")||undefined);
  if(!access)return NextResponse.json({error:"Unauthorized or workspace access denied"},{status:403});
  try{
    const b=await request.json();
    const areaType=String(b.areaType??"").toUpperCase();
    const name=String(b.name??"").trim().replace(/\s+/g," ");
    if(!TYPES.has(areaType)||name.length<2||name.length>190)return NextResponse.json({error:"Choose City or Event and provide a name of 2–190 characters."},{status:400});
    const id=crypto.randomUUID();
    await db.query(
      "INSERT INTO campaign_service_area_options (id,workspace_id,area_type,name,active,created_by) VALUES (?,?,?,?,1,?)",
      [id,access.workspace.id,areaType,name,access.user.email]
    );
    return NextResponse.json({ok:true,id,areaType,name},{status:201});
  }catch(error){
    if(error instanceof Error && /duplicate|unique/i.test(error.message))return NextResponse.json({error:"That city/event already exists in this workspace."},{status:409});
    console.error("SERVICE_AREA_CREATE_ERROR",error);
    return NextResponse.json({error:"Could not create the service area option."},{status:500});
  }
}
