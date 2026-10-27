import type { MetadataRoute } from "next";

import { listAllProducts } from "@/db/catalog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const products = await listAllProducts();

    return [
      ...routes,
      ...products.map((product) => ({
        url: `${SITE_URL}/products/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error(
      "Sitemap gagal memuat produk:",
      error instanceof Error ? error.name : "unknown error",
    );
    return routes;
  }
}
