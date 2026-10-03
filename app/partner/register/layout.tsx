import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become an Aslal Partner",
  description: "Create an Aslal partner account for eligible affiliate, influencer, referral-agent and reseller opportunities.",
  alternates: { canonical: "https://aslaldigital.com/partner/register" },
  robots: { index: true, follow: true },
};

export default function PartnerRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
