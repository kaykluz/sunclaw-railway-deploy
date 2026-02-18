import WebSocket from "ws";

const GATEWAY_URL = "wss://sunclaw-production-403d.up.railway.app";
const TOKEN = "b48f129b9c1c14664353ffa88deb6e49d15b6a0c";

const ws = new WebSocket(GATEWAY_URL);
let authenticated = false;

ws.on("open", () => {
  console.log("Connected");
});

ws.on("message", (data) => {
  const text = data.toString();
  const msg = JSON.parse(text);
  
  console.log("\n--- MSG ---");
  console.log(JSON.stringify(msg, null, 2).substring(0, 2000));
  
  if (msg.type === "event" && msg.event === "connect.challenge") {
    console.log("\nSending connect with auth...");
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      method: "connect",
      params: {
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
      },
      id: 1
    }));
  } else if (msg.id === 1 && !msg.error) {
    authenticated = true;
    console.log("\nAuthenticated! Sending config.get...");
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      method: "config.get",
      params: {},
      id: 2
    }));
  } else if (msg.id === 2) {
    console.log("\n=== CONFIG RESULT ===");
    console.log(JSON.stringify(msg, null, 2).substring(0, 5000));
    ws.close();
    process.exit(0);
  }
});

ws.on("error", (err) => {
  console.error("Error:", err.message);
});

ws.on("close", (code, reason) => {
  console.log("Closed:", code, reason?.toString());
  process.exit(0);
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 15000);
