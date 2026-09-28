import {json,type SearchProfile,split} from "@/lib/search-profiles";
function clean(v:any){return typeof v==="string"&&v.trim()?v.trim():undefined}
export function SearchStructuredData({profile,entity}:{profile:SearchProfile|null;entity:any}){
 if(!profile||profile.noindex)return null;
 const base="https://aslaldigital.com";
 const url=profile.canonicalUrl||base+(entity?.slug?"/products/"+entity.slug:"/");
 const type=profile.schemaType||(entity?.kind==="SERVICE"?"Service":entity?.title?"Article":"Product");
 const facts=split(profile.keyFacts),sameAs=json(profile.sameAsJson),faq=json(profile.faqJson);
 const node:any={"@context":"https://schema.org","@type":type,name:profile.entityName||entity?.name||entity?.title,description:profile.entityDescription||entity?.description||entity?.shortDescription,url,image:entity?.imageUrl?[entity.imageUrl]:undefined,category:profile.category||entity?.category,keywords:profile.keywords?split(profile.keywords):undefined,audience:profile.audience?{"@type":"Audience","audienceType":profile.audience}:undefined,areaServed:profile.serviceArea?split(profile.serviceArea).map(name=>({"@type":"Country",name})):{"@type":"Country",name:"Ethiopia"},mainEntityOfPage:url,sameAs,additionalProperty:facts.map((name)=>({"@type":"PropertyValue","name":name}))};
 if(type==="Product"){const rawPrice=String(entity?.startingPrice||"").trim();const price=/^[0-9][0-9,]*(?:\.[0-9]+)?\s*(?:ETB|birr)?$/i.test(rawPrice)?rawPrice.match(/[0-9][0-9,]*(?:\.[0-9]+)?/)?.[0]?.replace(/,/g,""):undefined;node.brand={"@type":"Brand",name:"Aslal Digital Solutions"};if(price)node.offers={"@type":"Offer",priceCurrency:"ETB",price,url,availability:entity?.stockQuantity===0?"https://schema.org/OutOfStock":"https://schema.org/InStock"};}
 if(type==="Service"){node.provider={"@type":"Organization",name:"Aslal Digital Solutions",url:base};}
 const graph=[node];if(faq?.length)graph.push({"@type":"FAQPage","mainEntity":faq.map((x:any)=>({"@type":"Question",name:x.question,acceptedAnswer:{"@type":"Answer",text:x.answer}}))});
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph.length===1?graph:{"@context":"https://schema.org","@graph":graph})}}/>;
}
export function SearchAnswerBlock({profile}:{profile:SearchProfile|null}){if(!profile?.directAnswer&&!profile?.localContext)return null;return <section className="mt-8 rounded-[2rem] border border-[#dbe4ef] bg-[#f8fafc] p-7"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Quick answer</div>{profile.directAnswer&&<p className="mt-3 text-lg font-semibold leading-8 text-[#1E293B]">{profile.directAnswer}</p>}{profile.localContext&&<p className="mt-4 text-sm leading-7 text-slate-600">{profile.localContext}</p>}</section>;}
