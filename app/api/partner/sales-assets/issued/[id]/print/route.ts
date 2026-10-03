import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/authorization";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await authorizePermission("partner.portal.view");if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const [u]=await db.query<any[]>(`SELECT partner_id FROM users WHERE id=? LIMIT 1`,[user.id]);
 const partnerId=u[0]?.partner_id;if(!partnerId)return NextResponse.json({error:"Partner account is not linked."},{status:409});
 const [rows]=await db.query<any[]>(`
  SELECT i.*,a.name asset_name,a.asset_type,a.description,a.currency,a.redemption_instructions,a.campaign_id,
         p.name partner_name,p.partner_number
  FROM issued_sales_assets i
  JOIN commercial_distribution_items a ON a.id=i.asset_id AND a.workspace_id=i.workspace_id
  JOIN partners p ON p.id=i.partner_id AND p.workspace_id=i.workspace_id
  WHERE i.id=? AND i.partner_id=? LIMIT 1`,[id,partnerId]);
 const item=rows[0];if(!item)return NextResponse.json({error:"Issued asset not found."},{status:404});
 const qr=await QRCode.toDataURL(item.qr_payload,{margin:1,width:180});
 const qrBuffer=Buffer.from(qr.split(",")[1],"base64");
 const doc=new PDFDocument({size:"A6",margin:28});
 const chunks:Buffer[]=[];
 doc.on("data",(chunk:Buffer)=>chunks.push(chunk));
 const done=new Promise<Buffer>((resolve,reject)=>{doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject);});
 doc.fontSize(16).text("ASLAL DIGITAL SOLUTIONS",{align:"center"});
 doc.moveDown(0.4).fontSize(12).text(item.asset_name,{align:"center"});
 doc.moveDown(0.2).fontSize(9).text(String(item.asset_type),{align:"center"});
 doc.moveDown(0.8).image(qrBuffer,{fit:[130,130],align:"center"});
 doc.moveDown(0.5).fontSize(11).text(`Serial: ${item.serial_number}`,{align:"center"});
 if(item.holder_name)doc.fontSize(9).text(`Holder: ${item.holder_name}`,{align:"center"});
 if(item.holder_phone)doc.fontSize(9).text(`Phone: ${item.holder_phone}`,{align:"center"});
 if(item.issued_price!==null)doc.fontSize(10).text(`Price: ${item.currency} ${Number(item.issued_price).toFixed(2)}`,{align:"center"});
 if(item.valid_until)doc.fontSize(8).text(`Valid until: ${new Date(item.valid_until).toLocaleString("en-ET")}`,{align:"center"});
 doc.moveDown(0.5).fontSize(7).text("Present this QR/serial for verification. Keep this document secure.",{align:"center"});
 doc.end();
 const pdf=await done;
 return new NextResponse(new Uint8Array(pdf),{status:200,headers:{
  "Content-Type":"application/pdf",
  "Content-Disposition":`attachment; filename="aslal-${item.serial_number}.pdf"`,
  "Cache-Control":"private, no-store"
 }});
}
