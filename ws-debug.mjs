import WebSocket from "ws";

const TOKEN = "b48f129b9c1c14664353ffa88deb6e49d15b6a0c";

const urls = [
  "wss://sunclaw-production-403d.up.railway.app",
  "wss://sunclaw-production-403d.up.railway.app?token=" + TOKEN,
];

for (const url of urls) {
  console.log("\nTrying:", url.substring(0, 80));
  const ws = new WebSocket(url);
  
  const result = await new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.log("  Timeout - no response");
      ws.terminate();
      resolve("timeout");
    }, 5000);
    
    ws.on("open", () => {
      console.log("  OPEN!");
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "config.get",
        params: {},
        id: 1
      }));
    });
    
    ws.on("message", (data) => {
      clearTimeout(timer);
      console.log("  MSG:", data.toString().substring(0, 2000));
      ws.close();
      resolve("success");
    });
    
    ws.on("error", (err) => {
      clearTimeout(timer);
      console.log("  ERR:", err.message);
      resolve("error");
    });
    
    ws.on("unexpected-response", (req, res) => {
      clearTimeout(timer);
      console.log("  UNEXPECTED:", res.statusCode, res.statusMessage);
      resolve("unexpected");
    });
    
    ws.on("close", (code, reason) => {
      console.log("  CLOSE:", code, reason?.toString());
    });
  });
  
  if (result === "success") break;
}

process.exit(0);
