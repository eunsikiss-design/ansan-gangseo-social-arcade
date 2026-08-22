import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL_NON_POOLING 또는 POSTGRES_URL이 필요합니다.");
}

const migrationPath = path.join(process.cwd(), "supabase", "migrations", "202608230001_social_arcade.sql");
const sqlText = await fs.readFile(migrationPath, "utf8");
const sql = postgres(connectionString, { max: 1, ssl: "require" });

try {
  await sql.unsafe(sqlText);
  console.log("Supabase schema applied successfully.");
} finally {
  await sql.end();
}

