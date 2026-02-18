import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  MessageSquare,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * Memory page — OpenClaw manages conversation memory internally.
 * This page explains how memory works in OpenClaw rather than
 * exposing the old agent-memory system.
 */
export default function DashboardMemory() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan" />
          Agent Memory
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          OpenClaw manages conversation memory automatically across all channels.
        </p>
      </div>

      {/* How Memory Works in OpenClaw */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan" />
            How OpenClaw Memory Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                icon: MessageSquare,
                title: "Per-Session Context",
                desc: "Each conversation session maintains its own message history. OpenClaw automatically manages the context window, truncating older messages when the token limit is reached.",
              },
              {
                icon: Brain,
                title: "Persistent Memory (Optional)",
                desc: "When enabled in the OpenClaw config, the agent can use persistent memory across sessions. This is configured via the memory section in your openclaw.json config.",
              },
              {
                icon: AlertTriangle,
                title: "Volume Required",
                desc: "For memory to persist across redeployments, your Railway deployment must have a /data volume attached. Without it, all session data is lost on each redeploy.",
                color: "text-amber",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 border border-border/20"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color ?? "text-muted-foreground"}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Config Reference */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-amber" />
            Memory Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Memory behavior is controlled through the OpenClaw config. The following settings are available:
          </p>
          <div className="rounded-md bg-muted/20 border border-border/30 p-4 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre-wrap text-foreground/80">{`{
  "memory": {
    "enabled": true,
    "maxMessages": 50,
    "summarize": true
  }
}`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            These settings can be adjusted through the <strong>Configuration</strong> page by editing
            the Soul.md / system prompt, or directly in the OpenClaw Control UI at your Gateway URL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
