import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  expiresAt: integer("expires_at").notNull(),
});

export const todos = sqliteTable(
  "todo",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => uuid()),
    title: text("title").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    description: text("description").notNull(),
    completed: integer("completed", {
      mode: "boolean",
    }).notNull(),
    createdAt: integer("created_at", {
      mode: "timestamp",
    })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", {
      mode: "timestamp",
    })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdAtIndex: index("created_at_index").on(table.createdAt),
  }),
);
