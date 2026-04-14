import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DIFFAUDIT_DB_PATH ?? "./data/diffaudit.db",
  },
} satisfies Config;
