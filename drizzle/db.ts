import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, sessions } from "./schema";

// Setup sqlite database connection
const client = createClient({
  url: "file:sqlite.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { users, sessions } });
