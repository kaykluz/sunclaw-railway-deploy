import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Trash2,
  MessageSquare,
  Clock,
  ChevronRight,
  ArrowLeft,
  FileJson,
  FileType,
  Copy,
} from "lucide-react";

export default function DashboardConversations() {
  const conversations = trpc.conversations.list.useQuery();
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const deleteConvo = trpc.conversations.delete.useMutation({
    onSuccess: () => {
      toast.success("Conversation deleted");
      utils.conversations.list.invalidate();
      setSelectedId(null);
    },
  });

  if (selectedId !== null) {
    return <ConversationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan" />
          Saved Conversations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View, export, and manage your saved chat conversations.
        </p>
      </div>

      {conversations.isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : conversations.data && conversations.data.length > 0 ? (
        <div className="space-y-2">
          {conversations.data.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setSelectedId(convo.id)}
              className="w-full text-left rounded-xl border border-border/50 bg-card/30 p-4 hover:border-cyan/30 hover:bg-card/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate group-hover:text-cyan transition-colors">
                      {convo.title}
                    </h4>
                    {convo.model && (
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        {convo.model}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {convo.messageCount} messages
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {convo.createdAt ? new Date(convo.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this conversation?")) {
                        deleteConvo.mutate({ id: convo.id });
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">No saved conversations</p>
          <p className="text-xs mt-1">
            Use the "Save Conversation" button in the Chat page to save conversations for later export.
          </p>
        </div>
      )}
    </div>
  );
}

function ConversationDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const convo = trpc.conversations.get.useQuery({ id });
  const exportMd = trpc.conversations.export.useQuery({ id, format: "markdown" });
  const exportJson = trpc.conversations.export.useQuery({ id, format: "json" });

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

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  if (convo.isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!convo.data) {
    return (
      <div className="p-6 max-w-4xl">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onBack}>
          <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
        </Button>
      </div>
    );
  }

  const messages = (convo.data.messages as Array<{ role: string; content: string }>) ?? [];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{convo.data.title}</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{convo.data.messageCount} messages</span>
              {convo.data.model && <Badge variant="outline" className="text-[10px]">{convo.data.model}</Badge>}
              <span>{convo.data.createdAt ? new Date(convo.data.createdAt).toLocaleString() : ""}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (exportMd.data) downloadFile(exportMd.data.content, exportMd.data.filename, exportMd.data.mimeType);
            }}
            disabled={!exportMd.data}
          >
            <FileType className="w-3 h-3" />
            Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (exportJson.data) downloadFile(exportJson.data.content, exportJson.data.filename, exportJson.data.mimeType);
            }}
            disabled={!exportJson.data}
          >
            <FileJson className="w-3 h-3" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (exportMd.data) copyToClipboard(exportMd.data.content);
            }}
            disabled={!exportMd.data}
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              msg.role === "user"
                ? "border-cyan/20 bg-cyan/5 ml-8"
                : msg.role === "assistant"
                ? "border-border/30 bg-card/30 mr-8"
                : "border-amber/20 bg-amber/5 mx-4 text-xs"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  msg.role === "user"
                    ? "border-cyan/30 text-cyan"
                    : msg.role === "assistant"
                    ? "border-emerald/30 text-emerald"
                    : "border-amber/30 text-amber"
                }`}
              >
                {msg.role === "user" ? "You" : msg.role === "assistant" ? "SunClaw" : "System"}
              </Badge>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
