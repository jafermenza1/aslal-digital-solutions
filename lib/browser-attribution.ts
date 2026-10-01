export type BrowserAttribution = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  referrer: string | null;
  referralCode: string | null;
};

export function browserAttribution(): BrowserAttribution | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  let previous: Partial<BrowserAttribution> = {};
  try {
    const raw = window.localStorage.getItem("aslal_attribution");
    previous = raw ? JSON.parse(raw) : {};
  } catch {}
  const referrer = document.referrer || null;
  let referralCode: string | null = null;
  try { referralCode = document.cookie.split("; ").find(v=>v.startsWith("aslal_referral_code="))?.split("=")[1] || null; } catch {}
  const socialHosts: Record<string, string> = {
    "facebook.com":"facebook","fb.com":"facebook","l.facebook.com":"facebook","lm.facebook.com":"facebook",
    "instagram.com":"instagram","l.instagram.com":"instagram","tiktok.com":"tiktok","vm.tiktok.com":"tiktok","vt.tiktok.com":"tiktok",
    "linkedin.com":"linkedin","lnkd.in":"linkedin","whatsapp.com":"whatsapp","wa.me":"whatsapp","telegram.me":"telegram","t.me":"telegram",
    "youtube.com":"youtube","youtu.be":"youtube","twitter.com":"twitter","x.com":"x","m.me":"messenger","messenger.com":"messenger",
    "reddit.com":"reddit","pinterest.com":"pinterest","snapchat.com":"snapchat","threads.net":"threads"
  };
  let refSource: string | null = null;
  if (referrer) {
    try {
      refSource = socialHosts[new URL(referrer).hostname.toLowerCase().replace(/^www\./, "")] || null;
    } catch {}
  }
  const clickSource = url.searchParams.get("fbclid") ? "facebook"
    : url.searchParams.get("ttclid") ? "tiktok"
    : url.searchParams.get("li_fat_id") ? "linkedin"
    : url.searchParams.get("igshid") ? "instagram" : null;
  const aliases: Record<string, string> = { fb:"facebook", ig:"instagram", wa:"whatsapp", tg:"telegram", li:"linkedin", yt:"youtube" };
  const rawSource = (url.searchParams.get("utm_source") || "").trim().toLowerCase();
  const source = (aliases[rawSource] || rawSource || null) || clickSource || refSource || previous.source || null;
  const medium = url.searchParams.get("utm_medium") || previous.medium || (refSource ? "social" : null);
  const campaign = url.searchParams.get("utm_campaign") || previous.campaign || null;
  const content = url.searchParams.get("utm_content") || previous.content || null;
  const term = url.searchParams.get("utm_term") || previous.term || null;
  const attribution = { source, medium, campaign, content, term, referrer, referralCode };
  if (source || medium || campaign) {
    try { window.localStorage.setItem("aslal_attribution", JSON.stringify(attribution)); } catch {}
  }
  return attribution;
}
