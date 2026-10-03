import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const hash=(token:string)=>createHash("sha256").update(token).digest("hex");

export async function POST(request:Request){
  const body=await request.json().catch(()=>({}));
  const token=typeof body.token==="string"?body.token.trim():"";
  if(!token)return NextResponse.json({error:"Check-in token is required."},{status:400});
  const appointment=await prisma.commercialAppointment.findUnique({
    where:{checkInTokenHash:hash(token)},
    include:{listing:{select:{id:true,title:true}},registration:{select:{id:true,status:true,protectedUntil:true}}}
  });
  if(!appointment)return NextResponse.json({error:"Invalid or expired check-in token."},{status:404});
  if(["CANCELLED","NO_SHOW","COMPLETED"].includes(appointment.status))return NextResponse.json({error:"This appointment is no longer check-in eligible.",status:appointment.status},{status:409});
  if(appointment.checkInAt)return NextResponse.json({ok:true,alreadyCheckedIn:true,appointment:{id:appointment.id,status:appointment.status,checkInAt:appointment.checkInAt,listing:appointment.listing}},{status:200});
  const now=new Date();
  const updated=await prisma.commercialAppointment.update({
    where:{id:appointment.id},
    data:{
      status:"ATTENDED",checkInAt:now,checkInBy:"QR_PUBLIC_CHECKIN",
      evidence:{...(appointment.evidence as object||{}),checkIn:{at:now.toISOString(),method:"QR_PUBLIC_CHECKIN"}}
    },
    select:{id:true,status:true,checkInAt:true,listing:{select:{id:true,title:true}},scheduledStart:true,location:true}
  });
  return NextResponse.json({ok:true,appointment:updated});
}
