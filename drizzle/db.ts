import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, sessions, todos } from "./schema";

// Setup sqlite database connection
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./db.sqlite",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { users, sessions, todos } });
