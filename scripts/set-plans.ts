/**
 * One-off script to manually set user plans in the database.
 * Usage: npx tsx scripts/set-plans.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(dbUrl);

  // Set mbbent11@gmail.com → pro
  const r1 = await db
    .update(users)
    .set({ plan: "pro", planSelected: true })
    .where(eq(users.email, "mbbent11@gmail.com"));
  console.log(`mbbent11@gmail.com → pro (rows affected: ${r1[0]?.affectedRows ?? "unknown"})`);

  // Set ojoawosolomon@gmail.com → enterprise
  const r2 = await db
    .update(users)
    .set({ plan: "enterprise", planSelected: true })
    .where(eq(users.email, "ojoawosolomon@gmail.com"));
  console.log(`ojoawosolomon@gmail.com → enterprise (rows affected: ${r2[0]?.affectedRows ?? "unknown"})`);

  console.log("Done. Exiting.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
