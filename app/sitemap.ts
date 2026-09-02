import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com";
  return ["/", "/services", "/products", "/work", "/demo", "/contact"].map((path) => ({
    url: `${base}${path}`,
  }));
}
