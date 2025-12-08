const { readFileSync } = require("fs");
const { resolve } = require("path");
const { Client } = require("pg");

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.SUPABASE_CONNECTION_STRING;

  if (!connectionString) {
    console.error("Set DATABASE_URL (or SUPABASE_DB_URL) to run the schema setup.");
    process.exit(1);
  }

  const sqlPath = resolve(__dirname, "../supabase/schema.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const client = new Client({ connectionString });
  await client.connect();
  await client.query(sql);
  await client.end();

  console.log("Supabase schema applied successfully.");
}

main().catch((err) => {
  console.error("Schema apply failed:", err);
  process.exit(1);
});
