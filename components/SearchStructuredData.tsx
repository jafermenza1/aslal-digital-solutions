import {json,type SearchProfile,split} from "@/lib/search-profiles";
export function SearchStructuredData({profile,entity}:{profile:SearchProfile|null;entity:any}){
 if(!profile||profile.noindex)return null;
 const base="https://aslaldigital.com";
 const path=profile.targetType==="RESOURCE"?"/resources/":profile.targetType==="SERVICE"?"/services/":profile.targetType==="PRODUCT"?"/products/":"";
 const url=profile.canonicalUrl||base+(entity?.slug?path+entity.slug:"/");
 const type=profile.schemaType||(entity?.kind==="SERVICE"?"Service":entity?.title?"Article":"Product");
 const facts=split(profile.keyFacts),sameAs=json(profile.sameAsJson);
 const node:any={"@context":"https://schema.org","@type":type,name:profile.entityName||entity?.name||entity?.title,description:profile.entityDescription||entity?.description||entity?.shortDescription,url,image:entity?.imageUrl?[entity.imageUrl]:undefined,category:profile.category||entity?.category,keywords:profile.keywords?split(profile.keywords):undefined,audience:profile.audience?{"@type":"Audience",audienceType:profile.audience}:undefined,areaServed:profile.serviceArea?split(profile.serviceArea).map(name=>({"@type":"Place",name})):{"@type":"Country",name:"Ethiopia"},mainEntityOfPage:url,sameAs,additionalProperty:facts.map(name=>({"@type":"PropertyValue",name}))};
 if(type==="Product"){const rawPrice=String(entity?.startingPrice||"").trim();const price=/^[0-9][0-9,]*(?:\.[0-9]+)?\s*(?:ETB|birr)?$/i.test(rawPrice)?rawPrice.match(/[0-9][0-9,]*(?:\.[0-9]+)?/)?.[0]?.replace(/,/g,""):undefined;node.brand={"@type":"Brand",name:"Aslal Digital Solutions"};if(price)node.offers={"@type":"Offer",priceCurrency:"ETB",price,url,availability:entity?.stockQuantity===0?"https://schema.org/OutOfStock":"https://schema.org/InStock"};}
 if(type==="Service")node.provider={"@type":"Organization",name:"Aslal Digital Solutions",url:base};
 const crumbs=[{"@type":"ListItem",position:1,name:"Aslal Digital Solutions",item:base},{"@type":"ListItem",position:2,name:type==="Product"?"Products":type==="Service"?"Services":type==="Article"?"Resources":"Website",item:base+path.slice(0,-1)}];
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[node,{"@type":"BreadcrumbList",itemListElement:crumbs]})}}/>;
}
export function SearchAnswerBlock({profile}:{profile:SearchProfile|null}){if(!profile?.directAnswer&&!profile?.localContext)return null;return <section className="mt-8 rounded-[2rem] border border-[#F8FAFC] bg-[#F8FAFC] p-7"><div className="text-xs font-black uppercase tracking-[.18em] text-[#0F3E8A]">Quick answer</div>{profile.directAnswer&&<p className="mt-3 text-lg font-semibold leading-8 text-[#1E293B]">{profile.directAnswer}</p>}{profile.localContext&&<p className="mt-4 text-sm leading-7 text-slate-600">{profile.localContext}</p>}</section>;}
