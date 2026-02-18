import WebSocket from "ws";

const GATEWAY_URL = "wss://sunclaw-production-403d.up.railway.app";
const TOKEN = "b48f129b9c1c14664353ffa88deb6e49d15b6a0c";

let requestId = 0;

function sendRequest(ws, method, params) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 10000);
    
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        clearTimeout(timer);
        ws.removeListener("message", handler);
        resolve(msg);
      }
    };
    ws.on("message", handler);
    
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id
    }));
  });
}

const ws = new WebSocket(GATEWAY_URL);

ws.on("open", () => {
  console.log("Connected to OpenClaw Gateway");
});

ws.on("message", async (data) => {
  const msg = JSON.parse(data.toString());
  
  // Handle connect.challenge
  if (msg.type === "event" && msg.event === "connect.challenge") {
    console.log("Got challenge, authenticating...");
    
    try {
      const hello = await sendRequest(ws, "connect", {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "sunclaw-admin",
          version: "1.0.0",
          platform: "node",
          mode: "webchat"
        },
        role: "operator",
        scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
        auth: { token: TOKEN },
        caps: []
      });
      
      console.log("Auth result:", JSON.stringify(hello).substring(0, 500));
      
      if (hello.error) {
        console.error("Auth failed:", hello.error);
        process.exit(1);
      }
      
      // Now get the config
      console.log("\nGetting config...");
      const config = await sendRequest(ws, "config.get", {});
      console.log("Config result:", JSON.stringify(config, null, 2).substring(0, 5000));
      
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
  }
});

ws.on("error", (err) => {
  console.error("WS Error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("Global timeout");
  process.exit(1);
}, 20000);
