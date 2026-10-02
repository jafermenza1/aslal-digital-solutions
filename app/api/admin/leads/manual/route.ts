import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEthiopianPhone } from "@/lib/ethiopian-phone";
import { recalculateLeadScore } from "@/lib/lead-scoring";
import { runLeadCreatedAutomation } from "@/lib/automation";
import { LeadCaptureMode } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { authorizeWorkspacePermission } from "@/lib/workspaces";
import { recordLeadAttribution } from "@/lib/attribution";

const OFFLINE_CHANNELS = ["PHONE","PHYSICAL_MEETING","EVENT","FLYER","RADIO","TELEVISION","OUTDOOR","FIELD_AGENT","WORD_OF_MOUTH","OTHER_OFFLINE"];
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspace = await authorizeWorkspacePermission("leads.create", typeof body.workspaceId === "string" ? body.workspaceId : undefined);
  if (!workspace) return NextResponse.json({ error: "You do not have access to this workspace." }, { status: 403 });
  const actor = workspace.user;

  const name = clean(body.name,160);
  const company = clean(body.company,190);
  const businessType = clean(body.businessType,100);
  const email = clean(body.email,190).toLowerCase();
  const phoneInput = clean(body.phone,40);
  const phone = normalizeEthiopianPhone(phoneInput);
  const leadCategory = clean(body.leadCategory,100);
  const campaignId = clean(body.campaignId,36);
  const campaign = clean(body.campaignName,190);
  const productId = clean(body.productId,36);
  const serviceAreaId = clean(body.serviceAreaId,36);
  const partnerId = clean(body.partnerId,36);
  const location = clean(body.locationName,190);
  const reference = clean(body.reference,500);
  const attributionMethod = clean(body.attributionMethod,40) || "DIRECT_OFFLINE";
  const reasonNotes = clean(body.reasonNotes,2000);
  const message = clean(body.message,5000);

  if (!name || !businessType || !leadCategory || !message) return NextResponse.json({ error: "Name, business type, offline source and customer request are required." }, { status:400 });
  if (!OFFLINE_CHANNELS.includes(leadCategory)) return NextResponse.json({ error: "Choose a valid offline source channel." }, { status:400 });
  const validAttributionMethods = ["DIRECT_OFFLINE","MANUAL_PARTNER","PARTNER_BROUGHT_CUSTOMER","OFFLINE_CODE","CAMPAIGN_EVENT","STAFF_CAPTURE"];
  if (!validAttributionMethods.includes(attributionMethod)) return NextResponse.json({ error: "Choose a valid offline attribution method." }, { status:400 });
  if (attributionMethod !== "DIRECT_OFFLINE" && !reasonNotes) return NextResponse.json({ error: "Attribution reason or evidence is required for an attributed offline lead." }, { status:400 });
  if (partnerId && attributionMethod === "DIRECT_OFFLINE") return NextResponse.json({ error: "Choose a partner attribution method when assigning a partner." }, { status:400 });
  if (serviceAreaId) {
    const areaRows = await prisma.$queryRawUnsafe<any[]>(`SELECT id,name,area_type FROM campaign_service_area_options WHERE id=? AND workspace_id=? AND active=1 LIMIT 1`,serviceAreaId,workspace.workspace.id);
    if (!areaRows?.[0]) return NextResponse.json({ error: "Selected city or event is not available in this workspace." }, { status: 400 });
  }
  if (campaignId) {
    const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT c.id,c.name,c.delivery_mode FROM partner_campaigns c WHERE c.id=? AND c.workspace_id=? LIMIT 1`,campaignId,workspace.workspace.id);
    if (!rows?.[0]) return NextResponse.json({ error: "Selected campaign was not found in this workspace." }, { status:400 });
    const campaignRow=rows[0];
    if (campaignRow.delivery_mode !== "ONLINE" && serviceAreaId) {
      const areaRows = await prisma.$queryRawUnsafe<any[]>(`SELECT 1 FROM partner_campaign_service_areas ca JOIN campaign_service_area_options o ON o.id=ca.service_area_id WHERE ca.campaign_id=? AND ca.service_area_id=? AND o.workspace_id=? AND o.active=1 LIMIT 1`,campaignId,serviceAreaId,workspace.workspace.id);
      if (!areaRows?.[0]) return NextResponse.json({ error: "Selected service area is not supported by this campaign." }, { status: 400 });
    }
    if (campaignRow.delivery_mode !== "ONLINE" && !serviceAreaId) return NextResponse.json({ error: "Select the supported city or event for an offline campaign." }, { status: 400 });
  }
  if (partnerId) {
    const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT cp.id FROM campaign_partners cp JOIN partners p ON p.id=cp.partner_id WHERE cp.partner_id=? AND cp.campaign_id=? AND cp.status IN ('APPROVED','ACTIVE','COMPLETED') AND p.workspace_id=? AND p.status='ACTIVE' LIMIT 1`,partnerId,campaignId,workspace.workspace.id);
    if (!campaignId || !rows?.[0]) return NextResponse.json({ error: "Select a campaign before assigning a campaign partner." }, { status: 400 });
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status:400 });
  if (phoneInput && !phone) return NextResponse.json({ error: "Enter a valid Ethiopian phone number." }, { status:400 });
  if (!email && !phone) return NextResponse.json({ error: "Provide an email or valid Ethiopian mobile number." }, { status:400 });

  const existingPerson = await prisma.person.findFirst({ where: email ? { email } : { phone }, select:{id:true} });
  const personId = existingPerson?.id || randomUUID();
  const salesOwner = await prisma.user.findFirst({
    where:{
      active:true,
      role:{in:["SALES_MANAGER","SALES_OPERATOR","BUSINESS_OWNER","ADMIN","SUPER_ADMIN"]},
      workspaceUsers:{some:{workspaceId:workspace.workspace.id}},
    },
    orderBy:[{lastLoginAt:"desc"},{createdAt:"asc"}],
    select:{email:true},
  });
  const ownerEmail = salesOwner?.email || null;
  const due = new Date(Date.now() + 30*60*1000);
  const enriched = [message, location ? "Offline location: " + location : "", reference ? "Offline reference: " + reference : ""].filter(Boolean).join("\n\n");

  const lead = await prisma.$transaction(async tx => {
    if (!existingPerson) await tx.person.create({ data:{id:personId,name,email:email||null,phone:phone||null} });
    else await tx.person.update({ where:{id:personId}, data:{name,email:email||null,phone:phone||null} });

    const created = await tx.lead.create({
      data:{
        id:randomUUID(),
        workspaceId:workspace.workspace.id,
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

  try {
    await recordLeadAttribution({
      leadId: lead.id,
      workspaceId: workspace.workspace.id,
      attribution: { source: leadCategory, medium: "offline", campaign },
      campaignId: campaignId || null,
      partnerId: partnerId || null,
      productId: productId || null,
      attributionMethod: attributionMethod as any,
      createdBy: actor.email,
      reasonNotes: reasonNotes || null,
    });
  } catch(error) {\n    console.error("OFFLINE_LEAD_ATTRIBUTION_ERROR",error);\n    return NextResponse.json({error:"Lead was created, but its attribution audit could not be recorded. Do not treat this lead as attributed until it is reviewed."},{status:500});\n  }
  try { await recalculateLeadScore(lead.id); } catch(error) { console.error("OFFLINE_LEAD_SCORE_ERROR",error); }
  try { await runLeadCreatedAutomation(lead.id); } catch(error) { console.error("OFFLINE_LEAD_AUTOMATION_ERROR",error); }
  return NextResponse.json({ok:true,leadId:lead.id});
}
