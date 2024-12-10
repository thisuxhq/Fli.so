import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const usersRelations = relations(user, ({ many }) => ({
  customers: many(customers),
  domains: many(domains),
  subscriptions: many(subscriptions),
  tags: many(tags),
  urls: many(urls),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(user, { fields: [customers.userId], references: [user.id] }),
}));

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  domain: text("domain"),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 50 }),
  verificationToken: text("verification_token"),
  verificationMethod: varchar("verification_method", { length: 50 }),
});

export const domainsRelations = relations(domains, ({ one }) => ({
  user: one(user, { fields: [domains.userId], references: [user.id] }),
}));

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  planName: text("plan_name"),
  status: varchar("status", { length: 50 }),
  currentPeriodStart: date("current_period_start"),
  currentPeriodEnd: date("current_period_end"),
  customerId: integer("customer_id").references(() => customers.id),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  canceledAt: date("canceled_at"),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(user, { fields: [subscriptions.userId], references: [user.id] }),
}));

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name"),
  color: text("color"),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});

export const tagsRelations = relations(tags, ({ one }) => ({
  user: one(user, { fields: [tags.createdBy], references: [user.id] }),
}));

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  slug: text("slug").notNull(),
  clicks: integer("clicks").default(0),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  passwordHash: text("password_hash"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaImageUrl: text("meta_image_url"),
  qrCode: text("qr_code"),
  expirationUrl: text("expiration_url"),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }),
  domainId: integer("domain_id").references(() => domains.id),
});

export const urlsRelations = relations(urls, ({ one }) => ({
  user: one(user, { fields: [urls.createdBy], references: [user.id] }),
}));

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Domain = typeof domains.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Url = typeof urls.$inferSelect;
