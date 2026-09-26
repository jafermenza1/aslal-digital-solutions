import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { resolvePublicWorkspaceId } from "@/lib/workspaces";
export const SOCIAL_PLATFORMS=["facebook","instagram","tiktok","linkedin","whatsapp","telegram","youtube","x"] as const;
export type SocialPlatform=typeof SOCIAL_PLATFORMS[number];
export type SocialProfile={id:string;platform:SocialPlatform;label:string;url:string;handle:string|null;displayOrder:number;isActive:boolean};
type Row=RowDataPacket & {id:string;platform:string;label:string;url:string;handle:string|null;display_order:number;is_active:number};
export async function getSocialProfiles(hostname?:string|null){const workspaceId=resolvePublicWorkspaceId(hostname);const [rows]=await db.query<Row[]>("SELECT id,platform,label,url,handle,display_order,is_active FROM social_profiles WHERE workspace_id=? AND is_active=1 ORDER BY display_order ASC, platform ASC",[workspaceId]);return rows.map(r=>({id:r.id,platform:(SOCIAL_PLATFORMS.includes(r.platform as SocialPlatform)?r.platform:"facebook") as SocialPlatform,label:r.label,url:r.url,handle:r.handle,displayOrder:Number(r.display_order),isActive:Boolean(r.is_active)}));}
export async function getAllSocialProfiles(workspaceId:string){const [rows]=await db.query<Row[]>("SELECT id,platform,label,url,handle,display_order,is_active FROM social_profiles WHERE workspace_id=? ORDER BY display_order ASC, platform ASC",[workspaceId]);return rows;}
