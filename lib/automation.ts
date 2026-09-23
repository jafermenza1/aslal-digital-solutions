import { Prisma, TaskPriority, WorkflowActionStatus, WorkflowActionType, WorkflowExecutionStatus, WorkflowTriggerType } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

type LeadTarget = { id:string; status:string; score:number; ownerEmail:string|null; nextActionDueAt:Date|null; name:string };
type Conditions = { activeOnly?:boolean; minScore?:number; allowedStatuses?:string[] };
export type WorkflowActionDefinition = { type:WorkflowActionType; title?:string; subject?:string; description?:string; priority?:TaskPriority; dueMinutes?:number; delayMinutes?:number; retryDelayMinutes?:number; maxAttempts?:number };
export type WorkflowDefinition = { version:number; conditions?:Conditions; actions:WorkflowActionDefinition[] };

const ACTIVE=["NEW","CONTACTED","QUALIFIED","DEMO","PROPOSAL","NEGOTIATION"];
const CORE:Array<{systemKey:string;name:string;description:string;triggerType:WorkflowTriggerType;definition:WorkflowDefinition}>=
[
 {systemKey:"lead_high_intent_triage",name:"High-intent lead triage",description:"Create prioritized internal follow-up work for a newly captured high-intent lead.",triggerType:WorkflowTriggerType.LEAD_CREATED,
  definition:{version:1,conditions:{activeOnly:true,minScore:60,allowedStatuses:ACTIVE},actions:[
   {type:WorkflowActionType.CREATE_TASK,title:"High-intent lead: contact within 15 minutes",description:"Review the journey, confirm ownership, and contact the lead promptly.",priority:TaskPriority.HIGH,dueMinutes:15,maxAttempts:3},
   {type:WorkflowActionType.CREATE_ACTIVITY,subject:"High-intent automation triggered",description:"The high-intent lead triage workflow executed.",maxAttempts:3}
 ]}},
 {systemKey:"lead_overdue_internal_reminder",name:"Overdue sales action reminder",description:"Create one internal reminder when an active lead's next action becomes overdue.",triggerType:WorkflowTriggerType.LEAD_OVERDUE,
  definition:{version:1,conditions:{activeOnly:true,allowedStatuses:ACTIVE},actions:[
   {type:WorkflowActionType.CREATE_TASK,title:"Overdue sales follow-up: review next action",description:"The configured next action is overdue. Complete the work or set a truthful new due date.",priority:TaskPriority.URGENT,dueMinutes:30,retryDelayMinutes:10,maxAttempts:3},
   {type:WorkflowActionType.CREATE_ACTIVITY,subject:"Overdue follow-up automation triggered",description:"An internal overdue-follow-up reminder was created.",retryDelayMinutes:10,maxAttempts:3}
 ]}}
];

let bootstrap:Promise<void>|null=null;
const isUnique=(e:unknown)=>e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002";
const json=(v:unknown)=>v as Prisma.InputJsonValue;
const matches=(lead:LeadTarget,c?:Conditions)=>{
 if(!c)return true;
 if(c.activeOnly&&!ACTIVE.includes(lead.status))return false;
 if(typeof c.minScore==="number"&&lead.score<c.minScore)return false;
 return !c.allowedStatuses?.length||c.allowedStatuses.includes(lead.status);
};
async function lead(id:string){return prisma.lead.findUnique({where:{id},select:{id:true,status:true,score:true,ownerEmail:true,nextActionDueAt:true,name:true}});}
async function ensureInternal(){
 for(const d of CORE){
  const w=await prisma.workflow.upsert({where:{systemKey:d.systemKey},update:{name:d.name,description:d.description,triggerType:d.triggerType},create:{id:randomUUID(),systemKey:d.systemKey,name:d.name,description:d.description,triggerType:d.triggerType,ownerEmail:process.env.ADMIN_EMAIL||null}});
  const v=await prisma.workflowVersion.findFirst({where:{workflowId:w.id},orderBy:{versionNo:"desc"},select:{versionNo:true}});
  if(!v)try{await prisma.workflowVersion.create({data:{id:randomUUID(),workflowId:w.id,versionNo:d.definition.version,definition:json(d.definition),createdBy:process.env.ADMIN_EMAIL||"system"}});}catch(e){if(!isUnique(e))throw e;}
 }
}
export async function ensureCoreWorkflows(){if(!bootstrap)bootstrap=ensureInternal().catch(e=>{bootstrap=null;throw e;});await bootstrap;}

function keyFor(w:{systemKey:string},i:{triggerType:WorkflowTriggerType;targetType:string;targetId:string;idempotencyKey?:string},l:LeadTarget|null){
 if(i.idempotencyKey)return `${w.systemKey}:${i.idempotencyKey}`;
 if(i.triggerType===WorkflowTriggerType.LEAD_CREATED)return `${w.systemKey}:LEAD_CREATED:${i.targetId}`;
 if(i.triggerType===WorkflowTriggerType.LEAD_OVERDUE)return `${w.systemKey}:LEAD_OVERDUE:${i.targetId}:${l?.nextActionDueAt?.toISOString()||"none"}`;
 return `${w.systemKey}:${i.triggerType}:${i.targetType}:${i.targetId}`;
}
async function createTask(aid:string,l:LeadTarget,a:WorkflowActionDefinition){
 const marker=`[automation-action:${aid}]`;
 const old=await prisma.leadTask.findFirst({where:{leadId:l.id,description:{contains:marker}},select:{id:true}});
 if(old)return {taskId:old.id,existing:true};
 const task=await prisma.leadTask.create({data:{id:randomUUID(),leadId:l.id,title:String(a.title||"Automated sales follow-up").slice(0,190),description:`${String(a.description||"").slice(0,900)}\n\n${marker}`,status:"OPEN",priority:a.priority||TaskPriority.NORMAL,dueAt:new Date(Date.now()+Math.max(0,Math.min(7*24*60,Number(a.dueMinutes??0)))*60000),assignedTo:l.ownerEmail||process.env.ADMIN_EMAIL||null},select:{id:true}});
 return {taskId:task.id,existing:false};
}
async function createActivity(aid:string,eid:string,index:number,a:WorkflowActionDefinition,key:string){
 const subject=`Automation: ${key} · ${aid}`.slice(0,190);
 const old=await prisma.activity.findFirst({where:{type:"AUTOMATION",subject},select:{id:true}});
 if(old)return {activityId:old.id.toString(),existing:true};
 const row=await prisma.activity.create({data:{type:"AUTOMATION",subject,details:json({executionId:eid,actionExecutionId:aid,actionIndex:index,description:a.description||null,actor:`automation:${key}`})},select:{id:true}});
 return {activityId:row.id.toString(),existing:false};
}
export async function processWorkflowExecution(id:string){
 const e=await prisma.workflowExecution.findUnique({where:{id},include:{workflow:{select:{systemKey:true,active:true}},workflowVersion:{select:{definition:true}},actions:{orderBy:{actionIndex:"asc"}}}});
 if(!e)return {status:"MISSING" as const};
 if([WorkflowExecutionStatus.COMPLETED,WorkflowExecutionStatus.CANCELLED,WorkflowExecutionStatus.SKIPPED].includes(e.status))return {status:e.status};
 if(!e.workflow.active){
  await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.CANCELLED,completedAt:new Date(),lastError:"Workflow is disabled."}});
  await prisma.workflowActionExecution.updateMany({where:{executionId:id,status:WorkflowActionStatus.PENDING},data:{status:WorkflowActionStatus.SKIPPED,error:"Workflow disabled before execution.",completedAt:new Date()}});
  return {status:"CANCELLED" as const};
 }
 const def=e.workflowVersion.definition as unknown as WorkflowDefinition;
 let target=e.targetType==="LEAD"?await lead(e.targetId):null;
 if(e.targetType==="LEAD"&&(!target||!matches(target,def.conditions))){
  await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.SKIPPED,completedAt:new Date(),result:json({reason:!target?"lead-not-found":"conditions-not-met"})}});
  await prisma.workflowActionExecution.updateMany({where:{executionId:id,status:WorkflowActionStatus.PENDING},data:{status:WorkflowActionStatus.SKIPPED,error:"Workflow conditions were not met.",completedAt:new Date()}});
  return {status:"SKIPPED" as const};
 }
 await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.RUNNING,startedAt:e.startedAt||new Date(),attempts:{increment:1},lastError:null}});
 for(const ax of e.actions){
  const action=def.actions[ax.actionIndex];
  if(!action){await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.FAILED,error:"Action definition missing.",completedAt:new Date()}});continue;}
  if([WorkflowActionStatus.COMPLETED,WorkflowActionStatus.SKIPPED].includes(ax.status))continue;
  if(ax.scheduledFor&&ax.scheduledFor>new Date())continue;
  target=e.targetType==="LEAD"?await lead(e.targetId):null;
  if(e.targetType==="LEAD"&&(!target||!matches(target,def.conditions))){
   await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.CANCELLED,completedAt:new Date(),lastError:"Stop condition reached before action execution."}});
   await prisma.workflowActionExecution.updateMany({where:{executionId:id,status:{in:[WorkflowActionStatus.PENDING,WorkflowActionStatus.RUNNING]}},data:{status:WorkflowActionStatus.SKIPPED,error:"Stop condition reached.",completedAt:new Date()}});
   return {status:"CANCELLED" as const};
  }
  const current=await prisma.workflowActionExecution.findUnique({where:{id:ax.id},select:{attempts:true,status:true}});
  if(!current||current.status!==WorkflowActionStatus.PENDING)continue;
  const max=Math.max(1,Math.min(10,Number(action.maxAttempts??3)));
  if(current.attempts>=max){await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.FAILED,error:ax.error||"Maximum attempts reached.",completedAt:new Date()}});continue;}
  await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.RUNNING,startedAt:new Date(),attempts:{increment:1},error:null}});
  try{
   if(!target)throw new Error("Automation action requires an active lead target.");
   const result=action.type===WorkflowActionType.CREATE_TASK
    ?await createTask(ax.id,target,action)
    :await createActivity(ax.id,id,ax.actionIndex,action,e.workflow.systemKey);
   await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.COMPLETED,completedAt:new Date(),result:json(result)}});
  }catch(err){
   const msg=err instanceof Error?err.message:"Automation action failed."; const attempt=current.attempts+1;
   if(attempt>=max)await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.FAILED,completedAt:new Date(),error:msg}});
   else await prisma.workflowActionExecution.update({where:{id:ax.id},data:{status:WorkflowActionStatus.PENDING,scheduledFor:new Date(Date.now()+Math.max(1,Math.min(120,Number(action.retryDelayMinutes??5)))*60000),error:msg}});
  }
 }
 const final=await prisma.workflowActionExecution.findMany({where:{executionId:id},select:{status:true}});
 const failed=final.filter(x=>x.status===WorkflowActionStatus.FAILED).length;
 const pending=final.filter(x=>[WorkflowActionStatus.PENDING,WorkflowActionStatus.RUNNING].includes(x.status)).length;
 const completed=final.filter(x=>x.status===WorkflowActionStatus.COMPLETED).length;
 if(failed){await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.FAILED,completedAt:new Date(),lastError:`Automation failed: ${failed} action(s).`,result:json({completed,pending,failed})}});return {status:"FAILED" as const,completed,pending,failed};}
 if(pending){await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.PENDING,result:json({completed,pending,failed})}});return {status:"PENDING" as const,completed,pending,failed};}
 await prisma.workflowExecution.update({where:{id},data:{status:WorkflowExecutionStatus.COMPLETED,completedAt:new Date(),result:json({completed,pending:0,failed:0})}});
 return {status:"COMPLETED" as const,completed,pending:0,failed:0};
}
export async function runTrigger(i:{triggerType:WorkflowTriggerType;targetType:string;targetId:string;payload?:unknown;idempotencyKey?:string}){
 await ensureCoreWorkflows(); const ws=await prisma.workflow.findMany({where:{active:true,triggerType:i.triggerType},include:{versions:{orderBy:{versionNo:"desc"},take:1}}}); const l=i.targetType==="LEAD"?await lead(i.targetId):null; const out=[];
 for(const w of ws){const v=w.versions[0];if(!v)continue;const def=v.definition as unknown as WorkflowDefinition;if(l&&!matches(l,def.conditions))continue;const key=keyFor(w,i,l);let e;try{e=await prisma.workflowExecution.create({data:{id:randomUUID(),workflowId:w.id,workflowVersionId:v.id,triggerType:w.triggerType,idempotencyKey:key,targetType:i.targetType,targetId:i.targetId,status:WorkflowExecutionStatus.PENDING,payload:i.payload===undefined?undefined:json(i.payload)}})}catch(err){if(isUnique(err)){out.push({workflow:w.systemKey,duplicate:true});continue;}throw err;}
  for(let n=0;n<def.actions.length;n++)await prisma.workflowActionExecution.create({data:{id:randomUUID(),executionId:e.id,actionIndex:n,actionType:def.actions[n].type,status:WorkflowActionStatus.PENDING,scheduledFor:new Date(Date.now()+Math.max(0,Math.min(7*24*60,Number(def.actions[n].delayMinutes||0)))*60000)}});
  out.push({workflow:w.systemKey,duplicate:false,executionId:e.id,result:await processWorkflowExecution(e.id)});
 }
 return out;
}
async function processDue(limit:number){
 const now=new Date(),stale=new Date(now.getTime()-15*60000);
 await prisma.workflowExecution.updateMany({where:{status:WorkflowExecutionStatus.RUNNING,startedAt:{lt:stale}},data:{status:WorkflowExecutionStatus.PENDING,lastError:"Recovered stale running execution; retrying safely."}});
 const rows=await prisma.workflowExecution.findMany({where:{status:WorkflowExecutionStatus.PENDING,actions:{some:{status:WorkflowActionStatus.PENDING,scheduledFor:{lte:now}}}},orderBy:{createdAt:"asc"},take:limit,select:{id:true}});
 const out=[];for(const row of rows)out.push(await processWorkflowExecution(row.id));return out;
}
async function overdue(limit:number){
 const rows=await prisma.lead.findMany({where:{status:{in:ACTIVE as any},nextActionDueAt:{lt:new Date()}},orderBy:{nextActionDueAt:"asc"},take:limit,select:{id:true}});
 let triggered=0;for(const row of rows)triggered+=(await runTrigger({triggerType:WorkflowTriggerType.LEAD_OVERDUE,targetType:"LEAD",targetId:row.id})).length;
 return {overdueLeads:rows.length,triggered};
}
export async function runScheduledAutomation(o?:{leadLimit?:number;executionLimit?:number}){await ensureCoreWorkflows();return {overdue:await overdue(Math.max(1,Math.min(200,o?.leadLimit??100))),executions:await processDue(Math.max(1,Math.min(200,o?.executionLimit??100)))};}
export function runLeadCreatedAutomation(id:string){return runTrigger({triggerType:WorkflowTriggerType.LEAD_CREATED,targetType:"LEAD",targetId:id,idempotencyKey:`lead-created:${id}`});}
export async function cancelLeadAutomation(id:string,reason:string){
 const rows=await prisma.workflowExecution.findMany({where:{targetType:"LEAD",targetId:id,status:{in:[WorkflowExecutionStatus.PENDING,WorkflowExecutionStatus.RUNNING]}},select:{id:true}});
 if(!rows.length)return {cancelled:0};const ids=rows.map(x=>x.id),msg=reason.slice(0,500);
 await prisma.$transaction([
  prisma.workflowExecution.updateMany({where:{id:{in:ids},status:{in:[WorkflowExecutionStatus.PENDING,WorkflowExecutionStatus.RUNNING]}},data:{status:WorkflowExecutionStatus.CANCELLED,completedAt:new Date(),lastError:msg}}),
  prisma.workflowActionExecution.updateMany({where:{executionId:{in:ids},status:{in:[WorkflowActionStatus.PENDING,WorkflowActionStatus.RUNNING]}},data:{status:WorkflowActionStatus.SKIPPED,error:msg,completedAt:new Date()}})
 ]);return {cancelled:ids.length};
}
export function handleConversationInbound(leadId:string|null|undefined){return leadId?cancelLeadAutomation(leadId,"Customer reply received; eligible follow-up automation cancelled."):Promise.resolve({cancelled:0});}
export function handleLeadStatusChange(i:{leadId:string;fromStatus:string;toStatus:string;actor:string}){return ["WON","LOST"].includes(i.toStatus)?cancelLeadAutomation(i.leadId,`Lead moved from ${i.fromStatus} to ${i.toStatus} by ${i.actor}; prospecting automation cancelled.`):Promise.resolve({cancelled:0});}
export async function getAutomationSnapshot(limit=30){
 await ensureCoreWorkflows();const cutoff=new Date(Date.now()-24*60*60000);
 const [workflows,recent,failed,counts]=await Promise.all([
  prisma.workflow.findMany({orderBy:{name:"asc"},include:{versions:{orderBy:{versionNo:"desc"},take:1}}}),
  prisma.workflowExecution.findMany({orderBy:{createdAt:"desc"},take:limit,include:{workflow:{select:{systemKey:true,name:true}},actions:{orderBy:{actionIndex:"asc"}}}}),
  prisma.workflowExecution.count({where:{status:WorkflowExecutionStatus.FAILED,createdAt:{gte:cutoff}}}),
  prisma.workflowExecution.groupBy({by:["status"],_count:{_all:true}})
 ]);
 const n=(s:WorkflowExecutionStatus)=>counts.find(x=>x.status===s)?._count._all??0;
 return {workflows:workflows.map(w=>({id:w.id,systemKey:w.systemKey,name:w.name,active:w.active,triggerType:w.triggerType,version:w.versions[0]?.versionNo??null})),executions:{recentTotal:recent.length,completed:n(WorkflowExecutionStatus.COMPLETED),pending:n(WorkflowExecutionStatus.PENDING),running:n(WorkflowExecutionStatus.RUNNING),failedRecent:failed},recentExecutions:recent};
}