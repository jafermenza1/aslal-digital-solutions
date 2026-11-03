import {NextResponse} from "next/server";
import {authorizePermission} from "@/lib/authorization";
import {getWorkspaceForUser} from "@/lib/workspaces";
import {getPage} from "@/lib/website-studio";
export const dynamic="force-dynamic";
export async function GET(req:Request){const u=await authorizePermission("content.view");if(!u)return NextResponse.json({error:"Unauthorized"},{status:403});const w=await getWorkspaceForUser(u);if(!w)return NextResponse.json({error:"Workspace unavailable"},{status:403});const slug=new URL(req.url).searchParams.get("slug")||"/";const page=await getPage(w.id,slug);if(!page)return NextResponse.json({error:"Page not found"},{status:404});return NextResponse.json({preview:true,slug:page.slug,title:page.title,status:page.status,version:page.draft_version,lockVersion:page.lock_version,draft:page.draft_json?JSON.parse(page.draft_json):{blocks:[]}})}