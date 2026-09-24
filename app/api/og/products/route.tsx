import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#071F47", color: "white", padding: "72px 86px", fontFamily: "Arial" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "28px", background: "#E2B02A", display: "flex", alignItems: "center", justifyContent: "center", color: "#071F47", fontSize: "70px", fontWeight: 900 }}>A</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "54px", fontWeight: 900, letterSpacing: "-2px" }}>ASLAL DIGITAL SOLUTIONS</div>
            <div style={{ marginTop: "10px", fontSize: "32px", fontWeight: 800, color: "#E2B02A" }}>Products & Services</div>
          </div>
        </div>
        <div style={{ marginTop: "55px", fontSize: "30px", color: "#E1EBF5" }}>Technology • commerce • marketing • growth systems</div>
        <div style={{ marginTop: "45px", width: "560px", border: "3px solid #E2B02A", borderRadius: "22px", padding: "22px 30px", fontSize: "30px", fontWeight: 800 }}>Explore the Aslal catalog →</div>
        <div style={{ marginTop: "55px", fontSize: "22px", color: "#B4C5D8" }}>aslaldigital.com/products</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
