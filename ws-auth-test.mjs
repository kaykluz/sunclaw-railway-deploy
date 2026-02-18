import WebSocket from "ws";

const GATEWAY_URL = "wss://sunclaw-production-403d.up.railway.app";

const authVariants = [
  { name: "no auth", auth: undefined },
  { name: "empty auth", auth: {} },
  { name: "empty token", auth: { token: "" } },
  { name: "empty password", auth: { password: "" } },
  { name: "null token", auth: { token: null } },
];

for (const variant of authVariants) {
  console.log(`\n--- Trying: ${variant.name} ---`);
  
  const result = await new Promise((resolve) => {
    const ws = new WebSocket(GATEWAY_URL);
    const timer = setTimeout(() => {
      ws.terminate();
      resolve("timeout");
    }, 6000);
    
    let gotChallenge = false;
    
    ws.on("open", () => console.log("  OPEN"));
    
    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === "event" && msg.event === "connect.challenge" && !gotChallenge) {
        gotChallenge = true;
        console.log("  Got challenge, sending connect...");
        const params = {
          minProtocol: 3,
          maxProtocol: 3,
          client: { id: "sunclaw", version: "1.0", platform: "node", mode: "webchat" },
          role: "operator",
          scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
          caps: []
        };
        if (variant.auth !== undefined) {
          params.auth = variant.auth;
        }
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          method: "connect",
          params,
          id: 1
        }));
        return;
      }
      
      // Any response after connect
      console.log("  Response:", JSON.stringify(msg).substring(0, 300));
      clearTimeout(timer);
      ws.close();
      resolve("got-response");
    });
    
    ws.on("close", (code, reason) => {
      clearTimeout(timer);
      console.log("  CLOSE:", code, reason?.toString());
      resolve("closed-" + code);
    });
    
    ws.on("error", (err) => {
      clearTimeout(timer);
      console.log("  ERR:", err.message);
      resolve("error");
    });
  });
  
  console.log("  Result:", result);
  if (result === "got-response") break;
}

process.exit(0);
