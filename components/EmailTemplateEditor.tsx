"use client";

import { useState } from "react";

type Template={id:string;templateKey:string;name:string;subjectTemplate:string;htmlTemplate:string;textTemplate:string;transactional:boolean;active:boolean;updatedAt?:string};
const vars=["{{name}}","{{email}}","{{companyOrType}}","{{serviceOrProduct}}","{{message}}","{{leadId}}","{{contactUrl}}","{{logoUrl}}","{{location}}","{{phone}}"];
const blank:Template={id:"",templateKey:"new_template",name:"New email template",subjectTemplate:"",htmlTemplate:"",textTemplate:"",transactional:true,active:true};

export function EmailTemplateEditor({initial}:{initial:Template[]}){
 const [rows,setRows]=useState(initial);
 const [selectedId,setSelectedId]=useState(initial[0]?.id||"");
 const [creating,setCreating]=useState(initial.length===0);
 const [draft,setDraft]=useState<Template>(initial[0]||blank);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");

 function select(id:string){const item=rows.find(row=>row.id===id);if(!item)return;setSelectedId(id);setCreating(false);setDraft(item);setNotice("");}
 function startCreate(){setCreating(true);setSelectedId("");setDraft({...blank});setNotice("");}
 function update(key:keyof Template,value:string|boolean){setDraft(current=>({...current,[key]:value}));setNotice("");}

 async function save(e:React.FormEvent){
  e.preventDefault();
  if(!draft.name.trim()||!draft.subjectTemplate.trim()||!draft.htmlTemplate.trim()||!draft.textTemplate.trim()){setNotice("Complete all template fields before saving.");return;}
  const reason=window.prompt("Reason for creating or updating this template","Create/update transactional email template");
  if(!reason?.trim())return;
  setBusy(true);setNotice("");
  try{
   const isNew=creating;
   const response=await fetch(isNew?"/api/admin/email-templates":"/api/admin/email-templates/"+draft.id,{method:isNew?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,reason})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||"Unable to save template.");
   const saved=data.template as Template;
   setRows(old=>isNew?[saved,...old]:old.map(item=>item.id===saved.id?saved:item));
   setSelectedId(saved.id);setCreating(false);setDraft(saved);setNotice(isNew?"Template created and stored safely.":"Template saved.");
  }catch(error){setNotice(error instanceof Error?error.message:"Unable to save template.");}
  finally{setBusy(false);}
 }

 return <div className="template-manager">
  <aside className="template-list">
   <div className="template-list-head"><div><div className="dashboard-kicker">TRANSACTIONAL EMAIL</div><h2>Template library</h2></div><button type="button" onClick={startCreate} className="dashboard-primary-link">+ New</button></div>
   <div className="template-list-note">Stored templates do not send messages by themselves. Only integrations that explicitly select a template can use it.</div>
   <div className="template-list-scroll">{rows.map(row=><button key={row.id} type="button" onClick={()=>select(row.id)} className={`template-list-item ${selectedId===row.id&&!creating?"active":""}`}><span className="template-status-dot"/><span><strong>{row.name}</strong><small>{row.templateKey}</small></span><em>{row.active?"ON":"OFF"}</em></button>)}{!rows.length&&<div className="dashboard-empty-state">No templates yet. Create the first one.</div>}</div>
  </aside>
  <form onSubmit={save} className="template-editor">
   <div className="template-editor-head"><div><div className="dashboard-kicker">{creating?"NEW TEMPLATE":"EDIT TEMPLATE"}</div><h2>{draft.name||"New email template"}</h2></div><div className="flex flex-wrap items-center gap-4"><label className="template-active"><input type="checkbox" checked={draft.active} onChange={e=>update("active",e.target.checked)}/> Active</label><label className="template-active"><input type="checkbox" checked={draft.transactional} onChange={e=>update("transactional",e.target.checked)}/> Transactional</label></div></div>
   <div className="template-vars"><strong>Variables</strong><span>{vars.join(" · ")}</span></div>
   {creating&&<label>Template key<input required value={draft.templateKey} onChange={e=>update("templateKey",e.target.value)} placeholder="followup_confirmation"/></label>}
   <label>Name<input required value={draft.name} onChange={e=>update("name",e.target.value)}/></label>
   <label>Subject<input required value={draft.subjectTemplate} maxLength={250} onChange={e=>update("subjectTemplate",e.target.value)}/></label>
   <label>HTML template<textarea required value={draft.htmlTemplate} rows={16} onChange={e=>update("htmlTemplate",e.target.value)}/></label>
   <label>Plain-text fallback<textarea required value={draft.textTemplate} rows={8} onChange={e=>update("textTemplate",e.target.value)}/></label>
   {notice&&<div className="template-notice">{notice}</div>}
   <div className="template-editor-actions"><button disabled={busy} className="dashboard-primary-link">{busy?"Saving…":creating?"Create template":"Save template"}</button>{creating&&rows.length>0&&<button type="button" onClick={()=>select(rows[0].id)} className="dashboard-secondary-link">Cancel</button>}</div>
  </form>
 </div>;
}
