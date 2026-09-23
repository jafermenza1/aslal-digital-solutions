import { db } from "@/lib/db";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { RowDataPacket } from "mysql2/promise";

const WIDTH = 252;
const HEIGHT = 144;
const FETCH_ATTEMPTS = 5;
const FETCH_DELAY_MS = 300;

function safeText(value: string | null | undefined, fallback = "—") {
  return (value || fallback).replace(/[\r\n]+/g, " ").trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PartnerCardRow = {
  id: string;
  name: string;
  type: string;
  email: string | null;
} & RowDataPacket;

type ReferralCardRow = {
  code: string;
} & RowDataPacket;

/**
 * Fetch partner and referral separately, with a short retry window.
 * Partner creation inserts these records sequentially, so this also
 * tolerates brief DB visibility/replication lag before PDF generation.
 */
async function fetchCardData(partnerId: string) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const [partnerRows] = await db.query<PartnerCardRow[]>(
        "SELECT id, name, type, email FROM partners WHERE id = ? LIMIT 1",
        [partnerId],
      );
      const partner = partnerRows[0];

      if (!partner) throw new Error("Partner not found.");

      const [referralRows] = await db.query<ReferralCardRow[]>(`
        SELECT code
        FROM referral_links
        WHERE partner_id = ?
        ORDER BY created_at ASC
        LIMIT 1
      `, [partnerId]);
      const referral = referralRows[0];

      if (!referral?.code) throw new Error("Partner referral link is not ready.");

      return { partner, referral };
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_ATTEMPTS) await sleep(FETCH_DELAY_MS * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Partner card data is not ready.");
}

export async function generatePartnerCardPdf(partnerId: string) {
  const { partner, referral } = await fetchCardData(partnerId);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://aslaldigital.com").replace(/\/$/, "");
  const referralUrl = `${baseUrl}/go/${referral.code}`;
  const qr = await QRCode.toBuffer(referralUrl, {
    type: "png",
    width: 300,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const doc = new PDFDocument({ size: [WIDTH, HEIGHT], margin: 0, autoFirstPage: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.roundedRect(0, 0, WIDTH, HEIGHT, 12).fill("#0F3E8A");
  doc.fillColor("#E2B02A").roundedRect(12, 12, 4, HEIGHT - 24, 2).fill();
  doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold").text("ASLAL DIGITAL SOLUTIONS", 26, 17);
  doc.fillColor("#D8E5FF").fontSize(5.5).font("Helvetica").text("Growth Partner Network", 26, 30);

  doc.fillColor("#FFFFFF").fontSize(13).font("Helvetica-Bold").text(safeText(partner.name), 26, 50, { width: 140, ellipsis: true });
  doc.fillColor("#D8E5FF").fontSize(6.5).font("Helvetica").text(safeText(partner.type), 26, 67);
  doc.fillColor("#FFFFFF").fontSize(6).font("Helvetica-Bold").text("REFERRAL CODE", 26, 83);
  doc.fillColor("#E2B02A").fontSize(8.5).font("Helvetica-Bold").text(safeText(referral.code), 26, 93, { width: 130, ellipsis: true });
  doc.fillColor("#D8E5FF").fontSize(5.5).font("Helvetica").text("Scan or use the referral link", 26, 109);
  doc.fillColor("#FFFFFF").fontSize(5.2).text(referralUrl, 26, 118, { width: 135, ellipsis: true, link: referralUrl });

  doc.image(qr, WIDTH - 78, 34, { fit: [56, 56] });
  doc.fillColor("#FFFFFF").fontSize(4.8).font("Helvetica").text("aslaldigital.com", WIDTH - 78, 96, { width: 56, align: "center" });
  doc.fillColor("#D8E5FF").fontSize(4.5).text(safeText(partner.email, "Partner network"), WIDTH - 92, 108, { width: 84, align: "center", ellipsis: true });

  const pdfReady = new Promise<void>((resolve, reject) => {
    doc.once("end", resolve);
    doc.once("error", reject);
  });
  doc.end();
  await pdfReady;

  return Buffer.concat(chunks);
}

export function partnerCardFileName(code: string) {
  return `aslal-partner-card-${code}.pdf`;
}