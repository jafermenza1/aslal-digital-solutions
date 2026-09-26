import { cache } from "react";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export const TEAM_DEPARTMENTS = ["Engineering","Growth & Marketing","Product","Leadership"] as const;
export type TeamDepartment = typeof TEAM_DEPARTMENTS[number];

export type TeamMember = {
  id:string; fullName:string; jobTitle:string; department:TeamDepartment; profileImage:string|null;
  bio:string; displayOrder:number; isActive:boolean; linkedinUrl:string|null; telegramUrl:string|null;
  githubTwitterUrl:string|null; featuredQuote:string|null; projects:string|null; bookingLabel:string|null;
};
type TeamRow = RowDataPacket & { id:string; full_name:string; job_title:string; department:string; profile_image:string|null; bio:string; display_order:number; is_active:number; linkedin_url:string|null; telegram_url:string|null; github_twitter_url:string|null; featured_quote:string|null; projects:string|null; booking_label:string|null; };

const selectFields="id,full_name,job_title,department,profile_image,bio,display_order,is_active,linkedin_url,telegram_url,github_twitter_url,featured_quote,projects,booking_label";

function toTeamMember(row:TeamRow):TeamMember {
  const department=TEAM_DEPARTMENTS.includes(row.department as TeamDepartment)?row.department as TeamDepartment:"Product";
  return {id:row.id,fullName:row.full_name,jobTitle:row.job_title,department,profileImage:row.profile_image,bio:row.bio,displayOrder:Number(row.display_order),isActive:Boolean(row.is_active),linkedinUrl:row.linkedin_url,telegramUrl:row.telegram_url,githubTwitterUrl:row.github_twitter_url,featuredQuote:row.featured_quote,projects:row.projects,bookingLabel:row.booking_label};
}
export const getTeamMembers=cache(async():Promise<TeamMember[]>=>{const [rows]=await db.query<TeamRow[]>(`SELECT ${selectFields} FROM team_members WHERE is_active=1 ORDER BY display_order ASC, full_name ASC`);return rows.map(toTeamMember);});
export async function getAllTeamMembers():Promise<TeamMember[]>{const [rows]=await db.query<TeamRow[]>(`SELECT ${selectFields} FROM team_members ORDER BY display_order ASC, full_name ASC`);return rows.map(toTeamMember);}
