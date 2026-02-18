import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Sun,
  User,
  Trash2,
  Save,
  Download,
  FileJson,
  FileType,
  Copy,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  provider?: string;
  model?: string;
};

const SUGGESTED_PROMPTS = [
  "What's the solar irradiance in Lagos, Nigeria?",
  "Calculate LCOE for a 10MW solar farm",
  "Compare Vestas V150 vs Siemens SG 5.8",
  "What's the grid renewable share in Kenya?",
  "Estimate avoided CO\u2082 for 50MW wind farm",
];

export default function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();

  // Check if deployment is active
  const instance = trpc.dashboard.instance.useQuery();

  // Chat via OpenClaw Gateway — no split-brain, no failover engine
  const chatMutation = trpc.dashboard.chatWithMemory.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          provider: data.provider,
          model: data.model,
        },
      ]);
    },
    onError: (err) => {
      toast.error("Chat error", { description: err.message });
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "user") return prev.slice(0, -1);
        return prev;
      });
    },
  });

  const saveConvo = trpc.conversations.save.useMutation({
    onSuccess: () => {
      toast.success("Conversation saved! View it in the Conversations tab.");
      utils.conversations.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const displayMessages = messages;

  // Auto-scroll to bottom
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || chatMutation.isPending) return;

    const newMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    chatMutation.mutate({ message: text });

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleSaveConversation = () => {
    if (displayMessages.length === 0) {
      toast.error("No messages to save");
      return;
    }
    const firstUserMsg = displayMessages.find((m) => m.role === "user");
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 80) + (firstUserMsg.content.length > 80 ? "..." : "")
      : `Chat ${new Date().toLocaleString()}`;

    saveConvo.mutate({
      title,
      messages: displayMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const exportAsMarkdown = () => {
    if (displayMessages.length === 0) return;
    const lines = displayMessages.map((m) => {
      const label = m.role === "user" ? "**You**" : "**SunClaw**";
      const meta = m.provider ? ` _(${m.provider}${m.model ? `: ${m.model}` : ""})_` : "";
      return `${label}${meta}\n\n${m.content}\n\n---\n`;
    });
    const content = `# SunClaw Chat Export\n\n_Exported: ${new Date().toLocaleString()}_\n\n---\n\n${lines.join("\n")}`;
    downloadFile(content, `sunclaw-chat-${Date.now()}.md`, "text/markdown");
  };

  const exportAsJson = () => {
    if (displayMessages.length === 0) return;
    const content = JSON.stringify(
      {
        exported: new Date().toISOString(),
        messages: displayMessages,
      },
      null,
      2
    );
    downloadFile(content, `sunclaw-chat-${Date.now()}.json`, "application/json");
  };

  const copyToClipboard = () => {
    if (displayMessages.length === 0) return;
    const text = displayMessages
      .map((m) => `[${m.role === "user" ? "You" : "SunClaw"}]\n${m.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const noDeployment = !instance.data;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan/30 text-cyan bg-cyan/5 font-mono text-[10px] gap-1">
            <Zap className="w-2.5 h-2.5" />
            OpenClaw Gateway
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {displayMessages.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={handleSaveConversation}
                disabled={saveConvo.isPending}
              >
                {saveConvo.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={exportAsMarkdown}
              >
                <FileType className="w-3 h-3" />
                .md
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={exportAsJson}
              >
                <FileJson className="w-3 h-3" />
                .json
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={copyToClipboard}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground"
            onClick={clearChat}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* No Deployment Warning */}
      {noDeployment && !instance.isLoading && (
        <div className="mx-6 mt-3 p-3 rounded-lg border border-amber/20 bg-amber/5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber">No Active Deployment</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deploy SunClaw to Railway first to start chatting. The chat routes through your deployed OpenClaw Gateway.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan/20 to-amber/20 border border-cyan/20 flex items-center justify-center">
                <Sun className="w-7 h-7 text-cyan" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">Chat with SunClaw</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask about solar irradiance, LCOE calculations, wind turbine specs,
                  grid status, or anything renewable energy. Messages are routed through
                  your deployed OpenClaw Gateway.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={chatMutation.isPending || noDeployment}
                  className="rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs hover:border-cyan/30 hover:bg-card transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-6 max-w-3xl mx-auto">
              {displayMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-amber/20 flex items-center justify-center shrink-0 mt-1">
                      <Sun className="w-4 h-4 text-cyan" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-cyan/15 text-foreground border border-cyan/20"
                        : "bg-card border border-border/50"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                        {msg.provider && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] font-mono border-border/40 text-muted-foreground">
                              {msg.provider}{msg.model ? ` · ${msg.model}` : ""}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-amber/20 flex items-center justify-center shrink-0 mt-1">
                    <Sun className="w-4 h-4 text-cyan" />
                  </div>
                  <div className="rounded-xl bg-card border border-border/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan" />
                      <span className="text-xs text-muted-foreground font-mono">
                        Thinking via OpenClaw Gateway...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-4 bg-background/80 backdrop-blur-sm shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SunClaw anything about renewable energy..."
            className="flex-1 max-h-32 resize-none min-h-10 bg-card border-border/60 focus:border-cyan/40"
            rows={1}
            disabled={noDeployment}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || chatMutation.isPending || noDeployment}
            className="bg-cyan text-background hover:bg-cyan/90 h-10 w-10 shrink-0"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
