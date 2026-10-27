import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "./index";
import { orderItems, orders, products } from "./schema";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";

export interface CheckoutLineInput {
  slug: string;
  quantity: number;
}

export interface CheckoutRecipient {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | {
      ok: false;
      reason: "empty" | "missing_product" | "insufficient_stock";
      message: string;
    };

export interface OrderListEntry {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  itemCount: number;
  createdAt: Date;
}

export interface OrderItemRecord {
  productSlug: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDetailRecord {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  createdAt: Date;
  items: OrderItemRecord[];
}

function createOrderNumber() {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `USK-${suffix}`;
}

export async function createOrder(
  userId: string,
  items: CheckoutLineInput[],
  recipient: CheckoutRecipient,
): Promise<CreateOrderResult> {
  const normalized = new Map<string, number>();

  for (const item of items) {
    normalized.set(item.slug, (normalized.get(item.slug) ?? 0) + item.quantity);
  }

  if (normalized.size === 0) {
    return { ok: false, reason: "empty", message: "Keranjang masih kosong." };
  }

  const db = getDb();
  const slugs = Array.from(normalized.keys());

  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        image: products.image,
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(inArray(products.slug, slugs))
      .for("update");

    const productBySlug = new Map(rows.map((row) => [row.slug, row]));

    if (productBySlug.size !== slugs.length) {
      return {
        ok: false,
        reason: "missing_product",
        message: "Salah satu produk tidak ditemukan. Muat ulang keranjangmu.",
      } satisfies CreateOrderResult;
    }

    const lines: Array<OrderItemRecord & { productId: number }> = [];

    for (const [slug, quantity] of normalized) {
      const product = productBySlug.get(slug);
      if (!product) continue;

      if (quantity > product.stock) {
        return {
          ok: false,
          reason: "insufficient_stock",
          message: `Stok ${product.name} tersisa ${product.stock} unit.`,
        } satisfies CreateOrderResult;
      }

      lines.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        productImage: product.image,
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: createOrderNumber(),
        userId,
        status: "pending",
        paymentMethod: "transfer",
        paymentStatus: "pending",
        subtotal,
        shippingCost,
        total,
        recipientName: recipient.recipientName,
        recipientPhone: recipient.recipientPhone,
        addressLine: recipient.addressLine,
        city: recipient.city,
        province: recipient.province,
        postalCode: recipient.postalCode,
        notes: recipient.notes?.trim() ? recipient.notes.trim() : null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        productId: line.productId,
        productSlug: line.productSlug,
        productName: line.productName,
        productImage: line.productImage,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        lineTotal: line.lineTotal,
      })),
    );

    for (const line of lines) {
      const updated = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${line.quantity}` })
        .where(
          and(
            eq(products.id, line.productId),
            gte(products.stock, line.quantity),
          ),
        )
        .returning({ id: products.id });

      if (updated.length === 0) {
        throw new Error("Stok berubah saat pesanan dibuat.");
      }
    }

    return { ok: true, orderNumber: order.orderNumber } satisfies CreateOrderResult;
  });
}

export async function listOrdersForUser(
  userId: string,
  limit = 50,
): Promise<OrderListEntry[]> {
  const db = getDb();
  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    limit,
    with: { items: { columns: { quantity: true } } },
  });

  return rows.map((row) => ({
    orderNumber: row.orderNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    total: row.total,
    itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: row.createdAt,
  }));
}

export async function getOrderForUser(
  orderNumber: string,
  userId: string,
): Promise<OrderDetailRecord | null> {
  const db = getDb();
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)),
    with: { items: true },
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
    items: order.items.map((item) => ({
      productSlug: item.productSlug,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  };
}
