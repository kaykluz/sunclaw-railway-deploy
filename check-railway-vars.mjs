import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/ubuntu/sunclaw-website/.env' });

const RAILWAY_TOKEN = process.env.RAILWAY_API_TOKEN;

async function check() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute('SELECT metadata FROM deployments WHERE userId = 1 ORDER BY id DESC LIMIT 1');
  if (rows.length === 0) { console.log('No deployment found'); await conn.end(); return; }
  
  const meta = typeof rows[0].metadata === 'string' ? JSON.parse(rows[0].metadata) : rows[0].metadata;
  console.log('Railway IDs:', JSON.stringify(meta, null, 2));
  
  const res = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({
      query: `query { variables(projectId: "${meta.projectId}", environmentId: "${meta.environmentId}", serviceId: "${meta.serviceId}") }`
    })
  });
  const data = await res.json();
  const vars = data?.data?.variables || {};
  
  console.log('\nTELEGRAM_BOT_TOKEN set:', !!vars.TELEGRAM_BOT_TOKEN);
  if (vars.TELEGRAM_BOT_TOKEN) {
    console.log('TELEGRAM_BOT_TOKEN (masked):', vars.TELEGRAM_BOT_TOKEN.substring(0, 15) + '...');
  } else {
    console.log('TELEGRAM_BOT_TOKEN: NOT SET');
  }
  
  const channelVars = Object.keys(vars).filter(k => 
    k.includes('TELEGRAM') || k.includes('DISCORD') || k.includes('SLACK') || k.includes('WHATSAPP')
  );
  console.log('Channel env vars found:', channelVars);
  
  // Also check all env var keys
  console.log('\nAll env var keys:', Object.keys(vars).sort().join(', '));
  
  await conn.end();
}

check().catch(e => console.error('Error:', e.message));
