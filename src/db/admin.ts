import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { getDb } from "./index";
import { categories, orderItems, orders, products, users } from "./schema";
import { canTransitionOrderStatus } from "@/lib/order-status";
import { orderStatusLabel } from "@/lib/order-labels";
import type { ProductSpec } from "@/types/catalog";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export interface ProductInput {
  slug: string;
  name: string;
  categoryId: number;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  badge: string | null;
  featured: boolean;
  isNew: boolean;
  releasedAt: string;
  specs: ProductSpec[];
}

export interface CategoryInput {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  sortOrder: number;
}

export interface AdminOrderSummary {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: Date;
  itemCount: number;
  customerName: string;
  customerEmail: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  paymentMethod: "cod" | "transfer";
  subtotal: number;
  shippingCost: number;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  items: Array<{
    productName: string;
    productSlug: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export type UpdateOrderResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "invalid_transition";
      message: string;
    };

function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

const orderItemCount = sql<number>`(
  select coalesce(sum(oi.quantity), 0)::int
  from order_items oi
  where oi.order_id = ${orders.id}
)`;

export async function getAdminDashboard() {
  async function load() {
    const db = getDb();

    const [
      productStats,
      categoryStats,
      orderStats,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      db
        .select({
          total: count(),
          lowStock: sql<number>`(count(*) filter (where ${products.stock} <= 5))::int`,
        })
        .from(products),
      db.select({ total: count() }).from(categories),
      db
        .select({
          total: count(),
          pending: sql<number>`(count(*) filter (where ${orders.status} = 'pending'))::int`,
          awaitingPayment: sql<number>`(count(*) filter (where ${orders.paymentStatus} = 'pending'))::int`,
          paidRevenue: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
        })
        .from(orders),
      db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          stock: products.stock,
        })
        .from(products)
        .where(lte(products.stock, 5))
        .orderBy(asc(products.stock), asc(products.name))
        .limit(6),
      listAdminOrders({ limit: 6 }),
    ]);

    return {
      productCount: productStats[0]?.total ?? 0,
      lowStockCount: productStats[0]?.lowStock ?? 0,
      categoryCount: categoryStats[0]?.total ?? 0,
      orderCount: orderStats[0]?.total ?? 0,
      pendingOrderCount: orderStats[0]?.pending ?? 0,
      awaitingPaymentCount: orderStats[0]?.awaitingPayment ?? 0,
      paidRevenue: Number(orderStats[0]?.paidRevenue ?? 0),
      lowStockProducts,
      recentOrders,
    };
  }

  try {
    return await load();
  } catch {
    // Koneksi Neon yang idle bisa gagal sekali; seluruh kueri di sini hanya baca.
    return await load();
  }
}

export async function listAdminProducts(query?: string) {
  const db = getDb();
  const pattern = query ? likePattern(query) : undefined;

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      categoryName: categories.name,
      price: products.price,
      stock: products.stock,
      featured: products.featured,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      pattern
        ? or(ilike(products.name, pattern), ilike(products.slug, pattern))
        : undefined,
    )
    .orderBy(asc(products.name))
    .limit(100);
}

export async function getAdminProductById(id: number) {
  const db = getDb();
  const [row] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      categoryId: products.categoryId,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
      image: products.image,
      badge: products.badge,
      featured: products.featured,
      isNew: products.isNew,
      releasedAt: products.releasedAt,
      specs: products.specs,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return row ?? null;
}

export async function createAdminProduct(input: ProductInput) {
  const db = getDb();
  const [row] = await db
    .insert(products)
    .values(input)
    .returning({ id: products.id, slug: products.slug });

  return row;
}

export async function updateAdminProduct(id: number, input: ProductInput) {
  const db = getDb();
  const [row] = await db
    .update(products)
    .set(input)
    .where(eq(products.id, id))
    .returning({ id: products.id, slug: products.slug });

  return row ?? null;
}

export async function deleteAdminProduct(id: number) {
  const db = getDb();
  const rows = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({ id: products.id });

  return rows.length > 0;
}

export async function updateAdminProductStock(id: number, stock: number) {
  const db = getDb();
  const rows = await db
    .update(products)
    .set({ stock })
    .where(eq(products.id, id))
    .returning({ id: products.id });

  return rows.length > 0;
}

export async function listAdminCategories() {
  const db = getDb();

  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      tagline: categories.tagline,
      image: categories.image,
      sortOrder: categories.sortOrder,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getAdminCategoryById(id: number) {
  const db = getDb();
  const [row] = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      tagline: categories.tagline,
      image: categories.image,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return row ?? null;
}

export async function createAdminCategory(input: CategoryInput) {
  const db = getDb();
  const [row] = await db
    .insert(categories)
    .values(input)
    .returning({ id: categories.id, slug: categories.slug });

  return row;
}

export async function updateAdminCategory(id: number, input: CategoryInput) {
  const db = getDb();
  const [row] = await db
    .update(categories)
    .set(input)
    .where(eq(categories.id, id))
    .returning({ id: categories.id, slug: categories.slug });

  return row ?? null;
}

export async function deleteAdminCategory(id: number) {
  const db = getDb();
  const rows = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });

  return rows.length > 0;
}

export async function listAdminOrders(options: {
  status?: OrderStatus;
  query?: string;
  limit?: number;
} = {}): Promise<AdminOrderSummary[]> {
  const db = getDb();
  const conditions: SQL[] = [];

  if (options.status) {
    conditions.push(eq(orders.status, options.status));
  }

  if (options.query) {
    const pattern = likePattern(options.query);
    const match = or(
      ilike(orders.orderNumber, pattern),
      ilike(users.email, pattern),
      ilike(users.name, pattern),
    );

    if (match) conditions.push(match);
  }

  const rows = await db
    .select({
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: orderItemCount,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(options.limit ?? 100);

  return rows.map((row) => ({
    ...row,
    itemCount: Number(row.itemCount),
  }));
}

export async function getAdminOrderByNumber(
  orderNumber: string,
): Promise<AdminOrderDetail | null> {
  const db = getDb();
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      items: true,
      user: { columns: { name: true, email: true } },
    },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    addressLine: order.addressLine,
    city: order.city,
    province: order.province,
    postalCode: order.postalCode,
    notes: order.notes,
    createdAt: order.createdAt,
    customerName: order.user.name,
    customerEmail: order.user.email,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map((item) => ({
      productName: item.productName,
      productSlug: item.productSlug,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  };
}

export async function updateAdminOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  paymentStatus: PaymentStatus,
): Promise<UpdateOrderResult> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .for("update");

    if (!order) {
      return { ok: false, reason: "not_found", message: "Pesanan tidak ditemukan." };
    }

    if (!canTransitionOrderStatus(order.status, status)) {
      return {
        ok: false,
        reason: "invalid_transition",
        message: `Status "${orderStatusLabel(order.status)}" tidak bisa langsung diubah ke "${orderStatusLabel(status)}".`,
      };
    }

    if (status === "dibatalkan" && order.status !== "dibatalkan") {
      const items = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        if (item.productId === null) continue;

        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }

    await tx
      .update(orders)
      .set({ status, paymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    return { ok: true };
  });
}
