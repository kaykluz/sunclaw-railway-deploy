import WebSocket from "ws";

const ws = new WebSocket("wss://sunclaw-production-403d.up.railway.app");
const TOKEN = "b48f129b9c1c14664353ffa88deb6e49d15b6a0c";

let msgCount = 0;

ws.on("open", () => console.log("OPEN"));

ws.on("message", (data) => {
  msgCount++;
  const text = data.toString();
  console.log(`MSG[${msgCount}]:`, text.substring(0, 500));
  
  if (msgCount === 1) {
    console.log("SENDING CONNECT...");
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: "sunclaw", version: "1.0", platform: "node", mode: "webchat" },
        role: "operator",
        scopes: ["operator.admin"],
        auth: { token: TOKEN },
        caps: []
      },
      id: 1
    }));
  } else if (msgCount === 2) {
    console.log("SENDING CONFIG.GET...");
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      method: "config.get",
      params: {},
      id: 2
    }));
  } else if (msgCount === 3) {
    console.log("GOT CONFIG - DONE");
    ws.close();
    process.exit(0);
  }
});

ws.on("error", (e) => console.log("ERR:", e.message));
ws.on("close", (c) => { console.log("CLOSE:", c); process.exit(0); });
setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 12000);
