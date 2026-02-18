import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Radio,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Globe,
  Cpu,
  Wifi,
  RotateCcw,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function DashboardOverview() {
  const instance = trpc.dashboard.instance.useQuery();
  const health = trpc.dashboard.health.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const unreadCount = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const channels = trpc.channels.list.useQuery();

  const activeChannels = channels.data?.filter(
    (c) => c.status === "connected"
  ).length ?? 0;

  const [redeploying, setRedeploying] = useState(false);
  const redeployMutation = trpc.dashboard.redeploy.useMutation({
    onSuccess: () => {
      toast.success("Redeploy triggered successfully. Your instance will restart shortly.");
      setRedeploying(false);
      health.refetch();
    },
    onError: (err) => {
      toast.error(`Redeploy failed: ${err.message}`);
      setRedeploying(false);
    },
  });

  const isHealthy = health.data?.healthy === true;

  const handleRedeploy = () => {
    setRedeploying(true);
    redeployMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Status Banner */}
      <div
        className={`rounded-xl border p-5 flex items-center justify-between ${
          isHealthy
            ? "border-emerald/30 bg-emerald/5"
            : health.isLoading
            ? "border-border/50 bg-card/50"
            : "border-destructive/30 bg-destructive/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isHealthy
                ? "bg-emerald/20"
                : health.isLoading
                ? "bg-muted"
                : "bg-destructive/20"
            }`}
          >
            {health.isLoading ? (
              <Activity className="w-5 h-5 text-muted-foreground animate-pulse" />
            ) : isHealthy ? (
              <CheckCircle2 className="w-5 h-5 text-emerald" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {health.isLoading
                ? "Checking instance health..."
                : isHealthy
                ? "Instance is healthy and running"
                : "Instance is unreachable"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {instance.data?.domain ?? "No domain assigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-amber/30 text-amber hover:bg-amber/10 hover:border-amber/50"
            onClick={handleRedeploy}
            disabled={redeploying || !instance.data}
          >
            {redeploying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
            Redeploy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => health.refetch()}
            disabled={health.isFetching}
          >
            <RefreshCw
              className={`w-3 h-3 ${health.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Globe className="w-4 h-4 text-cyan" />}
          label="Status"
          value={
            health.isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : isHealthy ? (
              <Badge variant="outline" className="border-emerald/40 text-emerald bg-emerald/10 font-mono text-xs">Online</Badge>
            ) : (
              <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 font-mono text-xs">Offline</Badge>
            )
          }
        />
        <StatCard
          icon={<Cpu className="w-4 h-4 text-amber" />}
          label="OpenClaw"
          value={
            health.isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <span className="text-sm font-mono">
                {(health.data as any)?.openclawHealthy ? "Running" : "Down"}
              </span>
            )
          }
        />
        <StatCard
          icon={<Wifi className="w-4 h-4 text-emerald" />}
          label="Channels"
          value={
            channels.isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <span className="text-sm font-mono">{activeChannels} active</span>
            )
          }
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-cyan" />}
          label="Notifications"
          value={<span className="text-sm font-mono">{unreadCount.data?.count ?? 0} unread</span>}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider font-mono">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionCard
            icon={<MessageSquare className="w-5 h-5 text-cyan" />}
            title="Chat with Agent"
            description="Send messages via OpenClaw Gateway"
            onClick={() => window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "chat" }))}
          />
          <QuickActionCard
            icon={<Radio className="w-5 h-5 text-emerald" />}
            title="Manage Channels"
            description="Connect Telegram, Slack, Discord"
            onClick={() => window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "channels" }))}
          />
          <QuickActionCard
            icon={<Sparkles className="w-5 h-5 text-amber" />}
            title="Configure Skills"
            description="Upload and test custom skills"
            onClick={() => window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "skills" }))}
          />
          <QuickActionCard
            icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
            title="View Analytics"
            description="Message volume, provider stats"
            onClick={() => window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "analytics" }))}
          />
        </div>
      </div>

      {/* Instance Info */}
      {instance.data && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Instance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Instance Name" value={instance.data.name ?? "My SunClaw"} />
              <InfoRow label="Domain" value={instance.data.domain ?? "N/A"} />
              <InfoRow label="Created" value={instance.data.createdAt ? new Date(instance.data.createdAt).toLocaleDateString() : "N/A"} />
              <InfoRow
                label="Gateway URL"
                value={instance.data.url ? instance.data.domain : "N/A"}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">{icon}</div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="mt-0.5">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-border/50 bg-card/30 p-4 hover:border-cyan/30 hover:bg-card/60 transition-all group"
    >
      <div className="mb-3">{icon}</div>
      <h4 className="text-sm font-semibold mb-1 group-hover:text-cyan transition-colors">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
