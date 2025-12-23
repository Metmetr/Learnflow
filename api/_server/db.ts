import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../../shared/schema";

// Safe DB Setup for Serverless
if (!process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is missing in environment variables!");
} else {
  console.log("DATABASE_URL is set (Length: " + process.env.DATABASE_URL.length + ")");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db", // Fallback to prevent init crash
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  max: 1,
});

// Drizzle will attempt to use the pool, but queries will fail if config is bad (which is what we want to see in /api/health)
export const db = drizzle(pool, { schema });
