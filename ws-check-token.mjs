import { setVariables, getVariables } from "./server/railway.js";

// Get the Railway deployment info from the database
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT metadata FROM deployments LIMIT 1");
const meta = JSON.parse(rows[0].metadata);
console.log("Railway serviceId:", meta.serviceId);
console.log("Railway environmentId:", meta.environmentId);

// Get all env vars
const vars = await getVariables(meta.serviceId, meta.environmentId);
console.log("\nAll Railway env vars:");
for (const [key, value] of Object.entries(vars)) {
  if (key.includes("TOKEN") || key.includes("SECRET") || key.includes("PASSWORD") || key.includes("KEY") || key.includes("GATEWAY")) {
    console.log(`  ${key} = ${value.substring(0, 10)}...`);
  } else {
    console.log(`  ${key} = ${value}`);
  }
}

await conn.end();
process.exit(0);
