import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  notInArray,
  or,
  type SQL,
} from "drizzle-orm";

import { getDb } from "./index";
import { categories, products } from "./schema";
import type { Category, Product, ProductSpec } from "@/types/catalog";

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

interface ProductRow {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  rating: string;
  reviewCount: number;
  stock: number;
  image: string;
  badge: string | null;
  featured: boolean;
  isNew: boolean;
  releasedAt: string;
  specs: ProductSpec[];
}

const productColumns = {
  slug: products.slug,
  name: products.name,
  category: categories.slug,
  categoryName: categories.name,
  description: products.description,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  rating: products.rating,
  reviewCount: products.reviewCount,
  stock: products.stock,
  image: products.image,
  badge: products.badge,
  featured: products.featured,
  isNew: products.isNew,
  releasedAt: products.releasedAt,
  specs: products.specs,
};

function mapProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    categoryName: row.categoryName,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    stock: row.stock,
    image: row.image,
    specs: row.specs,
    badge: row.badge ?? undefined,
    featured: row.featured,
    isNew: row.isNew,
    releasedAt: row.releasedAt,
  };
}

function productQuery() {
  const db = getDb();

  return db
    .select(productColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));
}

function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

function buildWhere(options: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const conditions: SQL[] = [];

  if (options.q) {
    const pattern = likePattern(options.q);
    const match = or(
      ilike(products.name, pattern),
      ilike(products.description, pattern),
      ilike(categories.name, pattern),
    );
    if (match) conditions.push(match);
  }

  if (options.category) {
    conditions.push(eq(categories.slug, options.category));
  }

  if (options.minPrice !== undefined) {
    conditions.push(gte(products.price, options.minPrice));
  }

  if (options.maxPrice !== undefined) {
    conditions.push(lte(products.price, options.maxPrice));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function orderFor(sort: ProductSort) {
  switch (sort) {
    case "newest":
      return [desc(products.releasedAt), desc(products.id)];
    case "price-asc":
      return [asc(products.price), desc(products.id)];
    case "price-desc":
      return [desc(products.price), desc(products.id)];
    case "rating":
      return [desc(products.rating), desc(products.reviewCount)];
    default:
      return [desc(products.featured), desc(products.releasedAt), desc(products.id)];
  }
}

export async function listCategories(): Promise<Category[]> {
  const db = getDb();

  return db
    .select({
      slug: categories.slug,
      name: categories.name,
      tagline: categories.tagline,
      image: categories.image,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function countProducts(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));

  return row.total;
}

export async function listProducts(options: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize: number;
}) {
  const db = getDb();
  const where = buildWhere(options);
  const [totalRow] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  const total = totalRow.total;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
  const page = Math.min(Math.max(1, options.page ?? 1), totalPages);

  const rows = await productQuery()
    .where(where)
    .orderBy(...orderFor(options.sort ?? "featured"))
    .limit(options.pageSize)
    .offset((page - 1) * options.pageSize);

  return { products: rows.map(mapProduct), total, page, totalPages };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await productQuery().where(eq(products.slug, slug)).limit(1);
  return row ? mapProduct(row) : undefined;
}

export async function listAllProducts(): Promise<Product[]> {
  const rows = await productQuery().orderBy(desc(products.featured), asc(products.name));
  return rows.map(mapProduct);
}

export async function getFeaturedProducts(limit: number): Promise<Product[]> {
  const rows = await productQuery()
    .where(eq(products.featured, true))
    .orderBy(desc(products.releasedAt))
    .limit(limit);

  return rows.map(mapProduct);
}

export async function getNewestProducts(limit: number): Promise<Product[]> {
  const rows = await productQuery()
    .orderBy(desc(products.releasedAt), desc(products.id))
    .limit(limit);

  return rows.map(mapProduct);
}

export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit: number,
): Promise<Product[]> {
  const rows = await productQuery()
    .where(and(eq(categories.slug, category), ne(products.slug, excludeSlug)))
    .orderBy(desc(products.featured), desc(products.rating))
    .limit(limit);

  return rows.map(mapProduct);
}

export async function getOtherProducts(
  excludeSlugs: string[],
  limit: number,
): Promise<Product[]> {
  const rows = await productQuery()
    .where(excludeSlugs.length > 0 ? notInArray(products.slug, excludeSlugs) : undefined)
    .orderBy(desc(products.featured), desc(products.releasedAt))
    .limit(limit);

  return rows.map(mapProduct);
}
