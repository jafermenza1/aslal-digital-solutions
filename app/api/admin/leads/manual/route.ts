import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePermission } from "@/lib/authorization";
import { normalizeEthiopianPhone } from "@/lib/ethiopian-phone";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { runLeadCreatedAutomation } from "@/lib/automation";
import { LeadCaptureMode } from "@prisma/client";
import { siteConfig } from "@/lib/config";
import { randomUUID } from "node:crypto";

const OFFLINE_CHANNELS = ["Radio","Television","Outdoor / Billboard","Flyer / Brochure","Event / Exhibition","Field Agent","Direct Sales","Word of Mouth","Other Offline"];
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const actor = await authorizePermission("leads.create");
  if (!actor) return NextResponse.json({ error: "You do not have permission to create leads." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = clean(body.name,160);
  const company = clean(body.company,190);
  const businessType = clean(body.businessType,100);
  const email = clean(body.email,190).toLowerCase();
  const phoneInput = clean(body.phone,40);
  const phone = normalizeEthiopianPhone(phoneInput);
  const leadCategory = clean(body.leadCategory,100);
  const campaign = clean(body.campaign,150);
  const productId = clean(body.productId,36);
  const location = clean(body.location,190);
  const reference = clean(body.reference,500);
  const message = clean(body.message,5000);

  if (!name || !businessType || !leadCategory || !message) return NextResponse.json({ error: "Name, business type, offline source and customer request are required." }, { status:400 });
  if (!OFFLINE_CHANNELS.includes(leadCategory)) return NextResponse.json({ error: "Choose a valid offline marketing source." }, { status:400 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status:400 });
  if (phoneInput && !phone) return NextResponse.json({ error: "Enter a valid Ethiopian phone number." }, { status:400 });
  if (!email && !phone) return NextResponse.json({ error: "Provide an email or valid Ethiopian mobile number." }, { status:400 });

  const existingPerson = await prisma.person.findFirst({ where: email ? { email } : { phone }, select:{id:true} });
  const personId = existingPerson?.id || randomUUID();
  const ownerEmail = siteConfig.defaultLeadOwnerEmail;
  const due = new Date(Date.now() + 30*60*1000);
  const enriched = [message, location ? "Offline location: " + location : "", reference ? "Offline reference: " + reference : ""].filter(Boolean).join("\n\n");

  const lead = await prisma.$transaction(async tx => {
    if (!existingPerson) await tx.person.create({ data:{id:personId,name,email:email||null,phone:phone||null} });
    else await tx.person.update({ where:{id:personId}, data:{name,email:email||null,phone:phone||null} });

    const created = await tx.lead.create({
      data:{
        id:randomUUID(),
        personId,
        name,
        email:email||null,
        phone:phone||null,
        company:company||null,
        businessType,
        message:enriched,
        status:"NEW",
        score:25,
        source:leadCategory,
        medium:"offline",
        campaign:campaign||null,
        ownerEmail,
        nextAction:"Review offline lead and contact customer",
        nextActionDueAt:due,
        leadCategory,
        captureMode:LeadCaptureMode.OFFLINE,
      },
    });

    await tx.leadStageHistory.create({
      data:{leadId:created.id,fromStage:null,toStage:"NEW",changedBy:actor.email,note:"Offline lead captured from " + leadCategory + "."},
    });
    if (productId) {
      await tx.leadProductInterest.create({
        data:{id:randomUUID(),leadId:created.id,productId,source:"offline",interestScore:10},
      });
    }
    return created;
  });

  try { await recalculateLeadScore(lead.id); } catch(error) { console.error("OFFLINE_LEAD_SCORE_ERROR",error); }
  try { await runLeadCreatedAutomation(lead.id); } catch(error) { console.error("OFFLINE_LEAD_AUTOMATION_ERROR",error); }
  return NextResponse.json({ok:true,leadId:lead.id});
}
