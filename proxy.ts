import {NextRequest,NextResponse} from "next/server";
import {supportedLocales,localeCookie,type Locale} from "@/lib/i18n";

const localePattern=new RegExp("^/("+supportedLocales.join("|")+")(?=/|$)");
const publicPrefixPattern=/^\/(platform|marketplace|wanted|partner|growth-builder|services|products|automation-lab|resources|portfolio|about|contact|privacy|terms)(\/|$)/;

export function proxy(request:NextRequest){
 const pathname=request.nextUrl.pathname;
 const match=pathname.match(localePattern);
 if(!match)return NextResponse.next();
 const locale=match[1] as Locale;
 const remainder=pathname.slice(match[0].length)||"/";
 if(!publicPrefixPattern.test(remainder)&&remainder!=="/")return NextResponse.next();
 const requestHeaders=new Headers(request.headers);
 requestHeaders.set("x-aslal-locale",locale);
 requestHeaders.set("x-aslal-public-path",remainder);
 const url=request.nextUrl.clone();
 url.pathname=remainder;
 const response=NextResponse.rewrite(url,{request:{headers:requestHeaders}});
 response.cookies.set(localeCookie,locale,{path:"/",maxAge:31536000,sameSite:"lax"});
 return response;
}

export const config={matcher:["/((?!api|_next|dashboard|portal|admin|auth|login).*)"]};
