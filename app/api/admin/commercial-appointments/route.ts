import { NextResponse } from "next/server";
import { randomBytes, createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const STATUSES=["REQUESTED","SCHEDULED","CONFIRMED","ATTENDED","COMPLETED","CANCELLED","NO_SHOW"] as const;
const OUTCOMES=["PENDING","INSPECTION_COMPLETED","INTERESTED","NEEDS_QUOTE","NEGOTIATING","NOT_INTERESTED","RESCHEDULE_REQUIRED","NOT_AS_DESCRIBED","NO_DECISION","OTHER"] as const;
const hashToken=(token:string)=>createHash("sha256").update(token).digest("hex");

async function access(workspaceId:string){return authorizeWorkspacePermission("products.manage",workspaceId);}

export async function GET(request:Request){
  const url=new URL(request.url), workspaceId=clean(url.searchParams.get("workspaceId"),36);
  const registrationId=clean(url.searchParams.get("registrationId"),36);
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  const appointments=await prisma.commercialAppointment.findMany({
    where:{workspaceId:accessResult.workspace.id,...(registrationId?{registrationId}:{})},
    orderBy:{scheduledStart:"asc"},
    take:200,
    include:{
      registration:{select:{id:true,status:true,protectedUntil:true}},
      listing:{select:{id:true,title:true}},
      partner:{select:{id:true,name:true,partnerNumber:true}},
      lead:{select:{id:true,name:true,email:true,phone:true}}
    }
  });
  return NextResponse.json({appointments});
}

export async function POST(request:Request){
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36), registrationId=clean(body.registrationId,36);
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  if(!registrationId)return NextResponse.json({error:"registrationId is required."},{status:400});
  const registration=await prisma.commercialDealRegistration.findFirst({
    where:{id:registrationId,workspaceId:accessResult.workspace.id},
    include:{listing:true,partner:true,lead:true,authorization:true}
  });
  if(!registration)return NextResponse.json({error:"Deal registration not found."},{status:404});
  if(!["PROTECTED","CONVERTED"].includes(registration.status))return NextResponse.json({error:"An inspection requires a protected or converted deal registration."},{status:422});
  if(registration.protectedUntil&&registration.protectedUntil<=new Date()&&registration.status!=="CONVERTED")return NextResponse.json({error:"Deal protection has expired."},{status:422});

  const start=body.scheduledStart?new Date(body.scheduledStart):null;
  const end=body.scheduledEnd?new Date(body.scheduledEnd):null;
  if(start&&Number.isNaN(start.getTime()))return NextResponse.json({error:"Invalid scheduledStart."},{status:400});
  if(end&&Number.isNaN(end.getTime()))return NextResponse.json({error:"Invalid scheduledEnd."},{status:400});
  if(start&&end&&end<=start)return NextResponse.json({error:"scheduledEnd must be after scheduledStart."},{status:400});

  const conflict=start?await prisma.commercialAppointment.findFirst({
    where:{workspaceId:accessResult.workspace.id,partnerId:registration.partnerId,status:{in:["REQUESTED","SCHEDULED","CONFIRMED","ATTENDED"]},scheduledStart:{lt:end||new Date(start.getTime()+60*60000)},scheduledEnd:{gt:start}}
  }):null;
  if(conflict)return NextResponse.json({error:"The partner already has an overlapping active appointment.",conflictId:conflict.id},{status:409});

  const rawToken=randomBytes(24).toString("hex");
  const appointment=await prisma.commercialAppointment.create({
    data:{
      id:randomUUID(),workspaceId:accessResult.workspace.id,registrationId,listingId:registration.listingId,
      partnerId:registration.partnerId,leadId:registration.leadId,
      status:start?"SCHEDULED":"REQUESTED",
      checkInTokenHash:hashToken(rawToken),
      outcome:"PENDING",appointmentType:clean(body.appointmentType,60)||"INSPECTION",
      scheduledStart:start,scheduledEnd:end,location:clean(body.location,500)||registration.listing.location||null,
      meetingNotes:clean(body.meetingNotes,20000)||null,createdBy:accessResult.user.id,
      evidence:{createdBy:accessResult.user.id,createdAt:new Date().toISOString(),registrationStatus:registration.status}
    },
    include:{listing:true,partner:true,lead:true,registration:true}
  });
  return NextResponse.json({ok:true,appointment,checkInToken:rawToken},{status:201});
}

export async function PATCH(request:Request){
  const body=await request.json().catch(()=>({}));
  const workspaceId=clean(body.workspaceId,36), id=clean(body.id,36), status=String(body.status||""), outcome=String(body.outcome||"");
  const accessResult=await access(workspaceId);
  if(!accessResult)return NextResponse.json({error:"Workspace access denied."},{status:403});
  if(!id||!STATUSES.includes(status as any))return NextResponse.json({error:"Valid id and status are required."},{status:400});
  if(outcome&&!OUTCOMES.includes(outcome as any))return NextResponse.json({error:"Invalid appointment outcome."},{status:400});
  const current=await prisma.commercialAppointment.findFirst({where:{id,workspaceId:accessResult.workspace.id}});
  if(!current)return NextResponse.json({error:"Appointment not found."},{status:404});
  if(["CANCELLED","COMPLETED","NO_SHOW"].includes(current.status)&&status!==current.status)return NextResponse.json({error:"Final appointment states cannot be reopened by this operation."},{status:409});
  const now=new Date();
  const data:any={status, ...(outcome?{outcome}:{}), meetingNotes:body.meetingNotes===undefined?current.meetingNotes:clean(body.meetingNotes,20000)||null, customerNotes:body.customerNotes===undefined?current.customerNotes:clean(body.customerNotes,20000)||null};
  if(status==="COMPLETED"){data.completedAt=now;}
  if(status==="CANCELLED"){data.cancelledAt=now;}
  if(status==="NO_SHOW"){data.outcome="NO_DECISION";}
  const updated=await prisma.commercialAppointment.update({where:{id},data});
  return NextResponse.json({ok:true,appointment:updated});
}
