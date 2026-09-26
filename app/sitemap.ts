import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { RESOURCES } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com";
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const staticPaths = ["/", "/services", "/products", "/portfolio", "/automation-lab", "/contact"];
  return [
    ...staticPaths.map(path => ({ url: `${base}${path}` })),
    ...RESOURCES.map(resource => ({ url: `${base}/resources/${resource.slug}` })),
    ...products.map(product => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
