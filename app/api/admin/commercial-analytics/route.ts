import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeWorkspacePermission } from "@/lib/workspaces";

const DAY=24*60*60*1000;
const money=(v:unknown)=>v==null?"0":String(v);
const pct=(n:number,d:number)=>d?Math.round((n/d)*1000)/10:0;
function dates(start?:string|null,end?:string|null){
  const now=new Date();
  const to=end?new Date(end):now;
  const from=start?new Date(start):new Date(to.getTime()-30*DAY);
  if(Number.isNaN(from.getTime())||Number.isNaN(to.getTime())||from>=to) throw new Error("Invalid date range.");
  if(to.getTime()-from.getTime()>366*DAY) throw new Error("Date range cannot exceed 366 days.");
  return {from,to};
}
export async function GET(req:Request){
  const access=await authorizeWorkspacePermission("commerce.view");
  if(!access)return NextResponse.json({error:"Workspace access denied."},{status:403});
  const u=new URL(req.url);
  let from:Date,to:Date;
  try{({from,to}=dates(u.searchParams.get("start"),u.searchParams.get("end")));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid date range."},{status:422});}
  const w=access.workspace.id, period={gte:from,lte:to};
  const [listings,requests,leads,opportunities,quotes,orders,paidOrders,revenue,revenueTotal,partnerRevenue,commissions,commissionPaid,payouts,matches,appointments,disputes,externalEvidence,repeatCustomers,requestTypes,orderStatuses,topPartnerRows]=await Promise.all([
    prisma.commercialListing.count({where:{workspaceId:w,createdAt:period}}),
    prisma.commercialRequest.count({where:{workspaceId:w,createdAt:period}}),
    prisma.lead.count({where:{workspaceId:w,createdAt:period,isTest:false}}),
    prisma.opportunity.count({where:{workspaceId:w,createdAt:period}}),
    prisma.quote.count({where:{workspaceId:w,createdAt:period}}),
    prisma.order.count({where:{workspaceId:w,createdAt:period}}),
    prisma.order.count({where:{workspaceId:w,createdAt:period,paymentState:"CONFIRMED"}}),
    prisma.revenue.count({where:{workspaceId:w,recognizedAt:period,status:"RECOGNIZED"}}),
    prisma.revenue.aggregate({where:{workspaceId:w,recognizedAt:period,status:"RECOGNIZED"},_sum:{recognizedAmount:true,commissionableAmount:true,collectedAmount:true}}),
    prisma.revenue.aggregate({where:{workspaceId:w,recognizedAt:period,status:"RECOGNIZED",partnerId:{not:null}},_sum:{recognizedAmount:true}}),
    prisma.commission.aggregate({where:{workspaceId:w,createdAt:period,status:{not:"VOID"}},_sum:{amount:true}}),
    prisma.commission.aggregate({where:{workspaceId:w,createdAt:period,status:"PAID"},_sum:{amount:true}}),
    prisma.partnerPayout.aggregate({where:{workspaceId:w,createdAt:period,status:"PAID"},_sum:{amount:true}}),
    prisma.commercialMatch.count({where:{workspaceId:w,createdAt:period}}),
    prisma.commercialAppointment.count({where:{workspaceId:w,createdAt:period}}),
    prisma.commercialDispute.count({where:{workspaceId:w,createdAt:period}}),
    prisma.externalPaymentEvidence.count({where:{workspaceId:w,createdAt:period,status:"VERIFIED"}}),
    prisma.order.groupBy({by:["customerId"],where:{workspaceId:w,createdAt:period,customerId:{not:null}},_count:{_all:true},having:{id:{_count:{gt:1}}}} as any).catch(()=>[]),
    prisma.commercialRequest.groupBy({by:["requestType"],where:{workspaceId:w,createdAt:period},_count:{_all:true}}),
    prisma.order.groupBy({by:["status"],where:{workspaceId:w,createdAt:period},_count:{_all:true},_sum:{total:true}}),
    prisma.revenue.groupBy({by:["partnerId"],where:{workspaceId:w,recognizedAt:period,status:"RECOGNIZED",partnerId:{not:null}},_sum:{recognizedAmount:true},_count:{_all:true},orderBy:{_sum:{recognizedAmount:"desc"}},take:10})
  ]);
  const partnerIds=topPartnerRows.map(x=>x.partnerId).filter(Boolean) as string[];
  const partnerNames=partnerIds.length?await prisma.partner.findMany({where:{workspaceId:w,id:{in:partnerIds}},select:{id:true,name:true,partnerNumber:true}}):[];
  const nameMap=new Map(partnerNames.map(x=>[x.id,x]));
  const responseEligible=await prisma.commercialRequest.count({where:{workspaceId:w,createdAt:period,status:{in:["RESPONSES_OPEN","NEGOTIATING","FULFILLED","CLOSED"]}}});
  const responseRequestGroups=await prisma.commercialRequestResponse.groupBy({by:["requestId"],where:{workspaceId:w,createdAt:period},_count:{_all:true}});
  const partnerAttributed=Number(money(revenueTotal._sum?.recognizedAmount))?Number(money(partnerRevenue._sum?.recognizedAmount)):0;
  const recognized=Number(money(revenueTotal._sum?.recognizedAmount));
  return NextResponse.json({
    ok:true,workspace:{id:w,name:access.workspace.name},period:{start:from.toISOString(),end:to.toISOString(),days:Math.max(1,Math.round((to.getTime()-from.getTime())/DAY))},
    metrics:{
      listingsPublished:listings, demandRequests:requests, leads, opportunities, quotes, orders, paidOrders,
      recognizedRevenue:money(revenueTotal._sum?.recognizedAmount), collectedRevenue:money(revenueTotal._sum?.collectedAmount),
      commissionableRevenue:money(revenueTotal._sum?.commissionableAmount), partnerAttributedRevenue:money(partnerRevenue._sum?.recognizedAmount),
      commissionLiability:money(commissions._sum?.amount), commissionPaid:money(commissionPaid._sum?.amount),
      payoutsPaid:money(payouts._sum?.amount), matches, appointments, verifiedExternalPayments:externalEvidence, disputes,
      repeatCustomers:repeatCustomers.length,
      responseRate:pct(new Set(responseRequestGroups.map(x=>x.requestId)).size,responseEligible),
      leadToOpportunityRate:pct(opportunities,leads), opportunityToQuoteRate:pct(quotes,opportunities),
      quoteToOrderRate:pct(orders,quotes), orderToPaidRate:pct(paidOrders,orders),
      paidToRecognizedRevenueRate:pct(revenue,paidOrders), partnerRevenueShare:pct(partnerAttributed,recognized)
    },
    breakdowns:{
      requestTypes:requestTypes.map(x=>({type:x.requestType,count:x._count._all})),
      orderStatuses:orderStatuses.map(x=>({status:x.status,count:x._count._all,total:money(x._sum.total)})),
      topPartners:topPartnerRows.map(x=>({partnerId:x.partnerId,name:nameMap.get(x.partnerId||"")?.name||"Unknown partner",partnerNumber:nameMap.get(x.partnerId||"")?.partnerNumber||null,recognizedRevenue:money(x._sum.recognizedAmount),orders:x._count._all}))
    },
    definitions:{
      population:"Workspace-scoped records created or recognized inside the selected period; test leads are excluded.",
      attribution:"Partner-attributed revenue uses canonical Revenue.partnerId; no click-only revenue is counted.",
      revenue:"Recognized revenue uses Revenue.status=RECOGNIZED and recognizedAt in the selected period.",
      commission:"Liability includes all non-VOID commissions created in the selected period; paid is Commission.status=PAID.",
      responseRate:"Requests eligible for responses with at least one recorded response, based on request/response records in the selected period."
    }
  });
}