import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
    hashedPassword: varchar("hashed_password").notNull().default("unset"),
});


export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    userId: uuid("userId").references(() => users.id, {
        onDelete: "cascade",
    }).notNull(),
    body: varchar("body", { length: 140 })
});

export const refresh_tokens = pgTable("refresh_tokens", {
    token: varchar("token").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    userId: uuid("userId").references(() => users.id, {
        onDelete: "cascade",
    }).notNull(),
    expiresAt:timestamp("expires_at").notNull(),
    revokedAt:timestamp("revoked_at"),
});

export type NewRefreshToken = typeof refresh_tokens.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;
