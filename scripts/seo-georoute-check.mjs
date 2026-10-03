import fs from "node:fs";
import process from "node:process";

const required=[
 ["app/layout.tsx",["alternates:{canonical","languages","x-default"]],
 ["app/robots.ts",["sitemap:","disallow"]],
 ["app/sitemap.ts",["alternates","languages","x-default","/platform","/marketplace","/wanted"]],
 ["proxy.ts",["supportedLocales","NextResponse.rewrite","x-aslal-locale"]],
 ["components/LanguageToggle.tsx",["window.location.assign","/am","/om"]],
 ["components/SearchStructuredData.tsx",["BreadcrumbList"]]
];
const errors=[];
for(const [file,tokens] of required){
 if(!fs.existsSync(file)){errors.push(file+" is missing");continue;}
 const text=fs.readFileSync(file,"utf8");
 for(const token of tokens) if(!text.includes(token)) errors.push(file+" missing "+token);
}
const schema=fs.readFileSync("components/SearchStructuredData.tsx","utf8");
if(schema.includes('"FAQPage"')) errors.push("SearchStructuredData must not emit deprecated FAQPage rich-result markup.");
const robots=fs.readFileSync("app/robots.ts","utf8");
for(const blocked of ["/dashboard/","/api/","/admin/"]) if(!robots.includes(blocked)) errors.push("robots.txt must disallow "+blocked);
if(errors.length){console.error("SEO/GEO route compliance failed.\n- "+errors.join("\n- "));process.exit(1);}
console.log("SEO/GEO route compliance passed.");
