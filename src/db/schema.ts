import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { ProductSpec } from "../types/catalog";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "../types/order";
import type { UserRole } from "../types/user";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    image: text("image").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    image: text("image").notNull(),
    badge: text("badge"),
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    releasedAt: date("released_at").notNull(),
    specs: jsonb("specs").$type<ProductSpec[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("products_category_idx").on(table.categoryId),
    index("products_price_idx").on(table.price),
    index("products_released_idx").on(table.releasedAt),
  ],
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRole>().notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    paymentMethod: text("payment_method")
      .$type<PaymentMethod>()
      .notNull()
      .default("cod"),
    paymentStatus: text("payment_status")
      .$type<PaymentStatus>()
      .notNull()
      .default("pending"),
    subtotal: integer("subtotal").notNull(),
    shippingCost: integer("shipping_cost").notNull().default(0),
    total: integer("total").notNull(),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    addressLine: text("address_line").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_user_idx").on(table.userId),
    index("orders_created_idx").on(table.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    productImage: text("product_image").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
