import dotenv from 'dotenv';
dotenv.config();

const token = process.env.RAILWAY_API_TOKEN;
const projectId = "0babcde7-bac5-4845-9fca-e9fd6ed31915";
const environmentId = "c7143e76-8124-4671-b2a1-e87cd19588ce";
const serviceId = "5560cb5b-3745-490d-aec2-dc65cd672e60";
const TELEGRAM_TOKEN = "8592279206:AAGGfRMgMmx13keCXG-LjOWqVUMtBNZcnSg";

console.log("Step 1: Setting TELEGRAM_BOT_TOKEN on Railway...");

const setRes = await fetch('https://backboard.railway.com/graphql/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }`,
    variables: {
      input: {
        projectId,
        environmentId,
        serviceId,
        variables: { TELEGRAM_BOT_TOKEN: TELEGRAM_TOKEN }
      }
    }
  })
});

const setData = await setRes.json();
console.log("Set result:", JSON.stringify(setData, null, 2));

console.log("\nStep 2: Verifying the variable was set...");

const getRes = await fetch('https://backboard.railway.com/graphql/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `query { variables(projectId: "${projectId}", environmentId: "${environmentId}", serviceId: "${serviceId}") }`
  })
});

const getData = await getRes.json();
const vars = getData?.data?.variables || {};
console.log("TELEGRAM_BOT_TOKEN set:", !!vars.TELEGRAM_BOT_TOKEN);
if (vars.TELEGRAM_BOT_TOKEN) {
  console.log("Token (masked):", vars.TELEGRAM_BOT_TOKEN.substring(0, 15) + "...");
}

console.log("\nStep 3: Triggering redeploy...");

const deployRes = await fetch('https://backboard.railway.com/graphql/v2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `mutation serviceInstanceDeployV2($serviceId: String!, $environmentId: String!) {
      serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    variables: { serviceId, environmentId }
  })
});

const deployData = await deployRes.json();
console.log("Deploy result:", JSON.stringify(deployData, null, 2));
console.log("\nDone! Wait 1-2 minutes for Railway to redeploy, then test the bot.");
