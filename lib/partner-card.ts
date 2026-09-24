import { db } from "@/lib/db";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit") as typeof import("pdfkit");
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

type PartnerCardRow = RowDataPacket & {
  id: string;
  partnerNumber: string;
  name: string;
  type: string;
  email: string | null;
};

type ReferralCardRow = RowDataPacket & { code: string };
type ReferralCode = { code: string };

async function fetchCardData(partnerId: string) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const [partnerRows] = await db.query<PartnerCardRow[]>(
        "SELECT id, partner_number AS partnerNumber, name, type, email FROM partners WHERE id = ? LIMIT 1",
        [partnerId],
      );
      const partner = partnerRows[0];
      if (!partner) throw new Error("Partner not found.");

      const [referralRows] = await db.query<ReferralCardRow[]>(
        "SELECT code FROM referral_links WHERE partner_id = ? ORDER BY created_at ASC LIMIT 1",
        [partnerId],
      );
      let referral: ReferralCode | undefined = referralRows[0];
      if (!referral?.code) {
        const base = safeText(partner.partnerNumber, partner.id.slice(0, 12)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const code = `${base}-${partner.id.slice(0, 8)}`;
        await db.query("INSERT INTO referral_links (id, partner_id, code, campaign, product_slug, destination_path) VALUES (?, ?, ?, ?, ?, ?)", [crypto.randomUUID(), partnerId, code, null, null, "/"]);
        referral = { code };
      }
      return { partner, referral };
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_ATTEMPTS) await sleep(FETCH_DELAY_MS * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Partner card data is not ready.");
}

function createPdf(partner: PartnerCardRow, referralCode: string, referralUrl: string, qr?: Buffer) {
  const doc = new PDFDocument({ size: [WIDTH, HEIGHT], margin: 0, autoFirstPage: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

  doc.roundedRect(0, 0, WIDTH, HEIGHT, 12).fill("#082F49");
  doc.fillOpacity(0.22).circle(220, 12, 58).fill("#38BDF8");
  doc.fillOpacity(0.16).circle(246, 72, 72).fill("#E2B02A");
  doc.fillOpacity(1).fillColor("#E2B02A").roundedRect(12, 12, 4, HEIGHT - 24, 2).fill();
  doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold").text("ASLAL DIGITAL SOLUTIONS", 26, 17);
  doc.fillColor("#D8E5FF").fontSize(5.5).font("Helvetica").text("Growth Partner Network", 26, 30);
  doc.fillColor("#FFFFFF").fontSize(13).font("Helvetica-Bold").text(safeText(partner.name), 26, 48, { width: 140, ellipsis: true });
  doc.fillColor("#D8E5FF").fontSize(6.2).font("Helvetica").text(safeText(partner.type), 26, 64);
  doc.fillColor("#FFFFFF").fontSize(5.2).font("Helvetica-Bold").text("PARTNER ID", 26, 76);
  doc.fillColor("#FFFFFF").fontSize(10.5).font("Helvetica-Bold").text(safeText(partner.partnerNumber), 26, 83, { width: 135, ellipsis: true });
  doc.fillColor("#FFFFFF").fontSize(5.5).font("Helvetica-Bold").text("REFERRAL CODE", 26, 94);
  doc.fillColor("#E2B02A").fontSize(7.5).font("Helvetica-Bold").text(safeText(referralCode), 26, 103, { width: 130, ellipsis: true });
  doc.fillColor("#D8E5FF").fontSize(5).font("Helvetica").text("Scan or use the referral link", 26, 115);
  doc.fillColor("#FFFFFF").fontSize(4.8).text(referralUrl, 26, 124, { width: 135, ellipsis: true, link: referralUrl });

  if (qr) {
    doc.save();
    doc.fillColor("#FFFFFF").roundedRect(WIDTH - 84, 26, 68, 76, 8).fill();
    doc.restore();
    doc.image(qr, WIDTH - 78, 32, { fit: [56, 56] });
    doc.fillColor("#FFFFFF").fontSize(4.8).font("Helvetica").text("aslaldigital.com", WIDTH - 78, 96, { width: 56, align: "center" });
  } else {
    doc.fillColor("#FFFFFF").fontSize(5.2).font("Helvetica-Bold").text("REFERRAL", WIDTH - 78, 54, { width: 56, align: "center" });
    doc.fillColor("#D8E5FF").fontSize(4.5).font("Helvetica").text("QR unavailable", WIDTH - 78, 64, { width: 56, align: "center" });
  }

  doc.fillColor("#D8E5FF").fontSize(4.5).font("Helvetica").text(safeText(partner.email, "Partner network"), WIDTH - 92, 108, { width: 84, align: "center", ellipsis: true });

  return new Promise<Buffer>((resolve, reject) => {
    doc.once("end", () => resolve(Buffer.concat(chunks)));
    doc.once("error", reject);
    doc.end();
  });
}

export async function generatePartnerCardPdf(partnerId: string) {
  const { partner, referral } = await fetchCardData(partnerId);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://aslaldigital.com").replace(/\/$/, "");
  const referralUrl = `${baseUrl}/go/${referral.code}`;

  let qr: Buffer | undefined;
  try {
    qr = await QRCode.toBuffer(referralUrl, {
      type: "png",
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch (error) {
    console.error("PARTNER_CARD_QR_ERROR", error);
  }

  return createPdf(partner, referral.code, referralUrl, qr);
}

export function partnerCardFileName(code: string) {
  return `aslal-partner-card-${code}.pdf`;
}
