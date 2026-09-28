import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getResources } from "@/lib/resources-server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://aslaldigital.com";
  const resources = await getResources({ days: 3650 });
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const staticPaths = ["/", "/services", "/products", "/portfolio", "/automation-lab", "/about", "/resources", "/contact", "/growth-builder"];
  return [
    ...staticPaths.map(path => ({ url: `${base}${path}` })),
    ...resources.map(resource => ({ url: `${base}/resources/${resource.slug}`, lastModified: resource.updated_at })),
    ...products.map(product => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
