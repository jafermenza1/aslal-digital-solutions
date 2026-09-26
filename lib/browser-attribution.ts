export const SOCIAL_SOURCES = ["facebook","instagram","tiktok","linkedin","whatsapp","telegram","youtube","x","twitter","messenger","reddit","pinterest","snapchat","threads"] as const;

const aliases: Record<string,string> = {
  fb:"facebook", ig:"instagram", wa:"whatsapp", tg:"telegram", li:"linkedin", yt:"youtube",
};

const socialHosts: Record<string,string> = {
  "facebook.com":"facebook","fb.com":"facebook","l.facebook.com":"facebook","lm.facebook.com":"facebook",
  "instagram.com":"instagram","l.instagram.com":"instagram",
  "tiktok.com":"tiktok","vm.tiktok.com":"tiktok","vt.tiktok.com":"tiktok",
  "linkedin.com":"linkedin","lnkd.in":"linkedin",
  "whatsapp.com":"whatsapp","wa.me":"whatsapp",
  "telegram.me":"telegram","t.me":"telegram",
  "youtube.com":"youtube","youtu.be":"youtube",
  "twitter.com":"twitter","x.com":"x",
  "m.me":"messenger","messenger.com":"messenger",
  "reddit.com":"reddit","pinterest.com":"pinterest","snapchat.com":"snapchat","threads.net":"threads",
};

export function normalizeBrowserSource(value: string | null | undefined) {
  const key = (value || "").trim().toLowerCase();
  return aliases[key] || key || null;
}

export function classifyBrowserReferrer(referrer: string | null | undefined) {
  if (!referrer) return null;
  try {
    return socialHosts[new URL(referrer).hostname.toLowerCase().replace(/^www\./,"")] || null;
  } catch {
    return null;
  }
}

export function browserAttribution() {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  let previous: Record<string,string|null> = {};
  try {
    const raw = window.localStorage.getItem("aslal_attribution");
    previous = raw ? JSON.parse(raw) : {};
  } catch {}
  const referrer = document.referrer || null;
  const refSource = classifyBrowserReferrer(referrer);
  const clickSource =
    url.searchParams.get("fbclid") ? "facebook" :
    url.searchParams.get("ttclid") ? "tiktok" :
    url.searchParams.get("li_fat_id") ? "linkedin" :
    url.searchParams.get("igshid") ? "instagram" : null;
  const source = normalizeBrowserSource(url.searchParams.get("utm_source")) || clickSource || refSource || previous.source || null;
  const medium = url.searchParams.get("utm_medium") || previous.medium || (refSource ? "social" : null);
  const campaign = url.searchParams.get("utm_campaign") || previous.campaign || null;
  const content = url.searchParams.get("utm_content") || previous.content || null;
  const term = url.searchParams.get("utm_term") || previous.term || null;
  const attribution = { source, medium, campaign, content, term, referrer };
  if (source || medium || campaign) window.localStorage.setItem("aslal_attribution", JSON.stringify(attribution));
  return attribution;
}
