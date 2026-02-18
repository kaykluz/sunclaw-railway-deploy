import WebSocket from "ws";
import crypto from "crypto";

const GATEWAY_URL = "wss://sunclaw-production-403d.up.railway.app";

function genId() {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 16);
}

const ws = new WebSocket(GATEWAY_URL);
let msgCount = 0;

ws.on("open", () => console.log("OPEN"));

ws.on("message", (data) => {
  msgCount++;
  const msg = JSON.parse(data.toString());
  console.log(`\nMSG[${msgCount}]:`, JSON.stringify(msg).substring(0, 1000));
  
  if (msg.type === "event" && msg.event === "connect.challenge") {
    console.log("\nSending connect (correct format)...");
    ws.send(JSON.stringify({
      type: "req",
      id: genId(),
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "openclaw-control-ui",
          version: "1.0.0",
          platform: "node",
          mode: "webchat"
        },
        role: "operator",
        scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
        caps: [],
        userAgent: "Node.js/22",
        locale: "en-US"
      }
    }));
    return;
  }
  
  // If we got a successful connect response, send config.get
  if (msg.type === "res" && msgCount === 2) {
    console.log("\nAuthenticated! Sending config.get...");
    ws.send(JSON.stringify({
      type: "req",
      id: genId(),
      method: "config.get",
      params: {}
    }));
    return;
  }
  
  // Config response
  if (msgCount >= 3) {
    console.log("\n=== GOT CONFIG ===");
    // Save to file for inspection
    import("fs").then(fs => fs.writeFileSync("/home/ubuntu/openclaw_config.json", JSON.stringify(msg, null, 2)));
    console.log("Saved to /home/ubuntu/openclaw_config.json");
    ws.close();
    process.exit(0);
  }
});

ws.on("error", (e) => console.log("ERR:", e.message));
ws.on("close", (c, r) => { console.log("CLOSE:", c, r?.toString()); process.exit(0); });
setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 12000);
