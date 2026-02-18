import dotenv from 'dotenv';
dotenv.config();

const token = process.env.RAILWAY_API_TOKEN;
const projectId = "0babcde7-bac5-4845-9fca-e9fd6ed31915";
const environmentId = "c7143e76-8124-4671-b2a1-e87cd19588ce";
const serviceId = "5560cb5b-3745-490d-aec2-dc65cd672e60";

const res = await fetch('https://backboard.railway.com/graphql/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `query { variables(projectId: "${projectId}", environmentId: "${environmentId}", serviceId: "${serviceId}") }`
  })
});

const data = await res.json();
if (data.errors) {
  console.log('GraphQL errors:', JSON.stringify(data.errors));
} else {
  const vars = data?.data?.variables || {};
  const keys = Object.keys(vars);
  console.log('Total env vars:', keys.length);
  console.log('TELEGRAM_BOT_TOKEN set:', !!vars.TELEGRAM_BOT_TOKEN);
  if (vars.TELEGRAM_BOT_TOKEN) {
    console.log('Token (masked):', vars.TELEGRAM_BOT_TOKEN.substring(0, 15) + '...');
  }
  const channelVars = keys.filter(k => k.includes('TELEGRAM') || k.includes('DISCORD') || k.includes('SLACK'));
  console.log('Channel vars:', channelVars);
  console.log('All keys:', keys.sort().join(', '));
}
