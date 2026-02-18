import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";

async function main() {
  // Get deployment metadata from DB
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute("SELECT metadata FROM deployments LIMIT 1");
  await conn.end();
  
  const rawMeta = rows[0].metadata;
  const meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;
  console.log('Raw meta type:', typeof rawMeta);
  console.log('Meta keys:', Object.keys(meta));
  const serviceId = meta.railwayServiceId;
  const environmentId = meta.railwayEnvironmentId;
  console.log("serviceId:", serviceId);
  console.log("environmentId:", environmentId);
  
  // Get env vars from Railway
  const resp = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RAILWAY_API_TOKEN}`
    },
    body: JSON.stringify({
      query: `query { variables(serviceId: "${serviceId}", environmentId: "${environmentId}") }`
    })
  });
  
  const data = await resp.json();
  const vars = data?.data?.variables || {};
  
  console.log("\n=== Railway Environment Variables ===");
  for (const [key, value] of Object.entries(vars).sort()) {
    const val = String(value);
    if (key.includes("TOKEN") || key.includes("SECRET") || key.includes("PASSWORD") || key.includes("KEY")) {
      console.log(`  ${key} = ${val.substring(0, 15)}...`);
    } else {
      console.log(`  ${key} = ${val}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
