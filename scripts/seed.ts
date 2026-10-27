import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

import { categories as seedCategories, products as seedProducts } from "../src/data/catalog";
import { categories, products } from "../src/db/schema";

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED atau DATABASE_URL harus tersedia untuk seed.");
}

const pool = new Pool({ connectionString, max: 1 });
const db = drizzle(pool);

async function main() {
  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();

    for (const [index, category] of seedCategories.entries()) {
      const [row] = await tx
        .insert(categories)
        .values({
          slug: category.slug,
          name: category.name,
          tagline: category.tagline,
          image: category.image,
          sortOrder: index,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: category.name,
            tagline: category.tagline,
            image: category.image,
            sortOrder: index,
          },
        })
        .returning({ id: categories.id });

      categoryIds.set(category.slug, row.id);
    }

    for (const product of seedProducts) {
      const categoryId = categoryIds.get(product.category);

      if (!categoryId) {
        throw new Error(`Kategori "${product.category}" tidak ditemukan saat seed.`);
      }

      await tx
        .insert(products)
        .values({
          slug: product.slug,
          name: product.name,
          categoryId,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          rating: product.rating.toFixed(1),
          reviewCount: product.reviewCount,
          stock: product.stock,
          image: product.image,
          badge: product.badge ?? null,
          featured: product.featured ?? false,
          isNew: product.isNew ?? false,
          releasedAt: product.releasedAt,
          specs: product.specs,
        })
        .onConflictDoUpdate({
          target: products.slug,
          set: {
            name: product.name,
            categoryId,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? null,
            rating: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
            stock: product.stock,
            image: product.image,
            badge: product.badge ?? null,
            featured: product.featured ?? false,
            isNew: product.isNew ?? false,
            releasedAt: product.releasedAt,
            specs: product.specs,
          },
        });
    }
  });

  const counts = await db.execute<{ categories: number; products: number }>(
    sql`select (select count(*) from ${categories})::int as categories, (select count(*) from ${products})::int as products`,
  );

  console.log("Seed selesai.");
  console.log(`Kategori di database: ${counts.rows[0].categories}`);
  console.log(`Produk di database: ${counts.rows[0].products}`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
