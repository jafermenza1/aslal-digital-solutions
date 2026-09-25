#!/usr/bin/env node
/**
 * Q1 Step 6 — mandatory two-workspace negative tests.
 * Test/staging only. Never point this at production.
 *
 * Required: Q1_BASE_URL Q1_WORKSPACE_A Q1_WORKSPACE_B Q1_SESSION_A Q1_SESSION_B Q1_B_LEAD_ID
 * Optional: Q1_B_QUOTE_ID Q1_B_ORDER_ID Q1_B_PAYMENT_ID Q1_B_COMMISSION_ID
 *           Q1_B_CUSTOMER_ID Q1_B_REVENUE_ID Q1_B_INVOICE_ID Q1_B_PAYOUT_ID
 */
const required=["Q1_BASE_URL","Q1_WORKSPACE_A","Q1_WORKSPACE_B","Q1_SESSION_A","Q1_SESSION_B","Q1_B_LEAD_ID"];
for(const name of required) if(!process.env[name]){console.error("Missing "+name);process.exit(2);}
if(!/^https?:\/\/localhost(?::\d+)?$/i.test(process.env.Q1_BASE_URL) && process.env.Q1_ALLOW_NONLOCAL!=="true"){
  console.error("Refusing non-local target. Set Q1_ALLOW_NONLOCAL=true only for an isolated staging/test environment.");process.exit(2);
}
const base=process.env.Q1_BASE_URL.replace(/\/$/,""),A=process.env.Q1_WORKSPACE_A;
const sessionA=process.env.Q1_SESSION_A, ids=Object.fromEntries(Object.entries(process.env).filter(([k,v])=>k.startsWith("Q1_B_")&&k.endsWith("_ID")&&v));
const results=[];
async function req(label,method,path,expected,body){
  const response=await fetch(base+path,{method,headers:{cookie:"aslal_session="+sessionA,"content-type":"application/json","x-q1-negative-test":"true"},body:body===undefined?undefined:JSON.stringify(body),redirect:"manual"});
  const raw=await response.text();let json=null;try{json=JSON.parse(raw);}catch{}
  const ok=expected.includes(response.status);results.push({label,status:response.status,ok});
  if(!ok)throw new Error(label+": expected "+expected.join("/")+" got "+response.status);
  return json;
}
async function snapshot(label,path){return JSON.stringify(await req(label,"GET",path,[200]));}
async function rejectedUnchanged(label,path,method,body){
  const before=await snapshot(label+" baseline",path);
  await req(label+" rejected",method,path,[403,404],body);
  const after=await snapshot(label+" after",path);
  if(before!==after)throw new Error(label+": target changed after rejected request");
}
const leadPath="/api/admin/leads/"+ids.Q1_B_LEAD_ID+"?workspaceId="+encodeURIComponent(A);
await req("A reads B lead","GET",leadPath,[403,404]);
/* The read above must not leak B. A direct baseline is intentionally unavailable on A scope. */
await req("A updates B lead","PATCH",leadPath,[403,404],{workspaceId:A,name:"Q1 NEGATIVE TEST",reason:"Q1 cross-workspace rejection test"});
if(ids.Q1_B_QUOTE_ID){
 const p="/api/quotes/"+ids.Q1_B_QUOTE_ID+"?workspaceId="+encodeURIComponent(A);
 await req("A reads B quote","GET",p,[403,404]);
 await req("A updates B quote","PATCH",p,[403,404],{workspaceId:A,action:"VIEWED"});
}
if(ids.Q1_B_ORDER_ID)await req("A creates payment against B order","POST","/api/orders/"+ids.Q1_B_ORDER_ID+"/payments",[403,404],{workspaceId:A,idempotencyKey:"q1-negative-"+Date.now(),provider:"NEGATIVE_TEST",amount:1,currency:"ETB",status:"INITIATED"});
if(ids.Q1_B_PAYMENT_ID)await req("A updates B payment","PATCH","/api/payments/"+ids.Q1_B_PAYMENT_ID,[401,403,404],{status:"FAILED",failureReason:"Q1 negative test"});
if(ids.Q1_B_COMMISSION_ID)await req("A updates B commission","PATCH","/api/admin/commissions/"+ids.Q1_B_COMMISSION_ID,[401,403,404],{status:"VOID"});
if(ids.Q1_B_INVOICE_ID&&ids.Q1_B_PAYMENT_ID)await req("A allocates B payment to B invoice","POST","/api/admin/invoices/"+ids.Q1_B_INVOICE_ID+"/payments",[401,403,404],{workspaceId:A,paymentId:ids.Q1_B_PAYMENT_ID,amount:1});
if(ids.Q1_B_CUSTOMER_ID)await req("A reads B customer","GET","/api/customers/"+ids.Q1_B_CUSTOMER_ID+"?workspaceId="+encodeURIComponent(A),[401,403,404]);
if(ids.Q1_B_REVENUE_ID)await req("A reads B revenue","GET","/api/admin/revenue/"+ids.Q1_B_REVENUE_ID+"?workspaceId="+encodeURIComponent(A),[401,403,404]);
if(ids.Q1_B_PAYOUT_ID)await req("A reads B payout","GET","/api/admin/partner-engine/payouts/"+ids.Q1_B_PAYOUT_ID+"?workspaceId="+encodeURIComponent(A),[401,403,404]);
console.log("\nQ1 Step 6 negative-test results");
for(const x of results)console.log((x.ok?"PASS":"FAIL")+" | "+x.label+" | HTTP "+x.status);
console.log("Passed "+results.filter(x=>x.ok).length+"/"+results.length+" executed checks.");
