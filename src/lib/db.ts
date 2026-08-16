import { Pool } from "pg";

const globalForDb = globalThis as unknown as { docsiesPool?: Pool };

export const db = globalForDb.docsiesPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") globalForDb.docsiesPool = db;
