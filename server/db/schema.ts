import { timeStamp } from "console";
import {
    boolean,
    date,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull().unique(),
    passwordHashed: text("password_hashed").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("project_name").notNull().unique(),
    totalHours: numeric("total_hours", { precision: 5, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const workLogs = pgTable("work_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull()
        .references(() => users.id, { onDelete: "cascade"}),
    projectId: uuid("project_id").notNull()
        .references(() => projects.id, {onDelete: "restrict"}),
    hours: numeric("hours", { precision: 4, scale: 2}).notNull(),
    workDate: date("work_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});