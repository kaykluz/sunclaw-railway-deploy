import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  MessageSquare,
  Clock,
  Users,
  Zap,
  Radio,
  Brain,
} from "lucide-react";

export default function DashboardSessions() {
  const health = trpc.dashboard.health.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const conversations = trpc.conversations.list.useQuery();
  const analytics = trpc.analytics.summary.useQuery({ days: 7 });
  const channels = trpc.channels.list.useQuery();

  const activeChannels = channels.data?.filter(
    (c) => c.status === "connected"
  ).length ?? 0;

  const totalConversations = conversations.data?.length ?? 0;
  const totalMessages = conversations.data?.reduce(
    (sum, c) => sum + (c.messageCount ?? 0),
    0
  ) ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold">Sessions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor active sessions, conversation history, and system health across all channels.
        </p>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan" />
              </div>
              <div>
                {conversations.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold font-mono">{totalConversations}</p>
                )}
                <p className="text-xs text-muted-foreground">Saved Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber" />
              </div>
              <div>
                {conversations.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold font-mono">{totalMessages}</p>
                )}
                <p className="text-xs text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald" />
              </div>
              <div>
                {channels.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold font-mono">{activeChannels}</p>
                )}
                <p className="text-xs text-muted-foreground">Active Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="mb-1">
                  {health.data?.healthy ? (
                    <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5 text-xs">
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 text-xs">
                      Offline
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Agent Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Conversations
          </h3>
          {conversations.isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : conversations.data && conversations.data.length > 0 ? (
            <div className="space-y-2">
              {conversations.data.slice(0, 10).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20 hover:border-border/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-cyan/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-cyan" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{conv.title}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {conv.messageCount} messages
                        {conv.model && <> &middot; {conv.model}</>}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {conv.createdAt
                      ? new Date(conv.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations saved yet</p>
              <p className="text-xs mt-1">
                Save conversations from the Chat page to see them here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Info */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Agent Memory
          </h3>
          <p className="text-xs text-muted-foreground">
            OpenClaw manages conversation memory automatically. Memory persists across sessions
            when a /data volume is attached to your Railway deployment.
          </p>
        </CardContent>
      </Card>

      {/* How Sessions Work */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          How Sessions Work
        </h3>
        <div className="space-y-3">
          {[
            {
              icon: MessageSquare,
              title: "Automatic Creation",
              desc: "A new session is created each time a user starts a conversation on any connected channel.",
            },
            {
              icon: Brain,
              title: "Persistent Memory",
              desc: "SunClaw maintains context across sessions and model switches. Memory is summarized and injected into each new conversation.",
            },
            {
              icon: Activity,
              title: "Multi-Channel Tracking",
              desc: "Sessions are tracked per-user across channels. Each channel maintains its own session history.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 border border-border/20"
            >
              <div className="w-8 h-8 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
