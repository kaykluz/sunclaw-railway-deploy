import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Shield,
  Terminal,
  Server,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Hammer,
  Play,
  Variable,
} from "lucide-react";

type LogTab = "notifications" | "runtime" | "build" | "envvars";

export default function DashboardLogs() {
  const [activeTab, setActiveTab] = useState<LogTab>("runtime");
  const [logLimit, setLogLimit] = useState(100);
  const [showEnvVars, setShowEnvVars] = useState(false);

  const notifications = trpc.notifications.list.useQuery();
  const health = trpc.dashboard.health.useQuery(undefined, {
    refetchInterval: 15000,
  });

  // @ts-expect-error - tRPC type inference lag; procedure exists in server/routers.ts
  const runtimeLogs = trpc.deploy.railwayLogs.useQuery(
    { type: "runtime", limit: logLimit },
    { enabled: activeTab === "runtime", refetchInterval: 10000 }
  );

  // @ts-expect-error - tRPC type inference lag; procedure exists in server/routers.ts
  const buildLogs = trpc.deploy.railwayLogs.useQuery(
    { type: "build", limit: logLimit },
    { enabled: activeTab === "build" }
  );

  // @ts-expect-error - tRPC type inference lag; procedure exists in server/routers.ts
  const envVars = trpc.deploy.railwayEnvVars.useQuery(undefined, {
    enabled: activeTab === "envvars",
  });

  const tabs: { id: LogTab; label: string; icon: React.ReactNode }[] = [
    { id: "runtime", label: "Runtime Logs", icon: <Play className="w-3.5 h-3.5" /> },
    { id: "build", label: "Build Logs", icon: <Hammer className="w-3.5 h-3.5" /> },
    { id: "envvars", label: "Env Vars", icon: <Variable className="w-3.5 h-3.5" /> },
    { id: "notifications", label: "Notifications", icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold">System Logs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View Railway deployment logs, environment variables, and system notifications.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-amber/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">
                  {notifications.data?.filter((n) => n.severity === "error").length ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                <Info className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">
                  {notifications.data?.filter((n) => n.severity === "warning").length ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-emerald/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald" />
              </div>
              <div>
                <div className="mb-0.5">
                  {health.data?.healthy ? (
                    <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5 text-[10px]">
                      Healthy
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 text-[10px]">
                      Degraded
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">System Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/20 border border-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-cyan/10 text-cyan border border-cyan/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Runtime Logs */}
      {activeTab === "runtime" && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan" />
                Railway Runtime Logs
                {runtimeLogs.data?.deploymentStatus && (
                  <Badge variant="outline" className="text-[10px] ml-2">
                    {runtimeLogs.data.deploymentStatus}
                  </Badge>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={logLimit}
                  onChange={(e) => setLogLimit(Number(e.target.value))}
                  className="text-xs bg-muted/20 border border-border/30 rounded px-2 py-1"
                >
                  <option value={50}>50 lines</option>
                  <option value={100}>100 lines</option>
                  <option value={200}>200 lines</option>
                  <option value={500}>500 lines</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => runtimeLogs.refetch()}
                  disabled={runtimeLogs.isFetching}
                >
                  <RefreshCw className={`w-3 h-3 ${runtimeLogs.isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {runtimeLogs.data?.error && (
              <div className="mb-3 p-2 rounded bg-amber/10 border border-amber/20 text-xs text-amber">
                {runtimeLogs.data.error}
              </div>
            )}

            {runtimeLogs.isLoading ? (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full rounded" />
                ))}
              </div>
            ) : runtimeLogs.data?.logs && runtimeLogs.data.logs.length > 0 ? (
              <div className="bg-[#0d1117] rounded-lg border border-border/30 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-0.5">
                  {runtimeLogs.data.logs.map((log: { timestamp: string; message: string; severity: string }, i: number) => {
                    const severity = log.severity?.toLowerCase() ?? "info";
                    const colorClass =
                      severity === "error" ? "text-red-400" :
                      severity === "warn" || severity === "warning" ? "text-amber" :
                      "text-gray-300";
                    const ts = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "";
                    return (
                      <div key={i} className={`${colorClass} flex gap-2`}>
                        <span className="text-gray-600 shrink-0 select-none">{ts}</span>
                        <span className="whitespace-pre-wrap break-all">{log.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Terminal className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No runtime logs available</p>
                <p className="text-[10px] mt-1">Deploy your gateway first to see logs here</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Build Logs */}
      {activeTab === "build" && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Hammer className="w-4 h-4 text-amber" />
                Railway Build Logs
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => buildLogs.refetch()}
                disabled={buildLogs.isFetching}
              >
                <RefreshCw className={`w-3 h-3 ${buildLogs.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {buildLogs.data?.error && (
              <div className="mb-3 p-2 rounded bg-amber/10 border border-amber/20 text-xs text-amber">
                {buildLogs.data.error}
              </div>
            )}

            {buildLogs.isLoading ? (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full rounded" />
                ))}
              </div>
            ) : buildLogs.data?.logs && buildLogs.data.logs.length > 0 ? (
              <div className="bg-[#0d1117] rounded-lg border border-border/30 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-0.5">
                  {buildLogs.data.logs.map((log: { timestamp: string; message: string; severity: string }, i: number) => {
                    const severity = log.severity?.toLowerCase() ?? "info";
                    const colorClass =
                      severity === "error" ? "text-red-400" :
                      severity === "warn" || severity === "warning" ? "text-amber" :
                      "text-gray-300";
                    return (
                      <div key={i} className={`${colorClass} whitespace-pre-wrap break-all`}>
                        {log.message}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Hammer className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No build logs available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Environment Variables */}
      {activeTab === "envvars" && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald" />
                Railway Environment Variables
                {envVars.data?.count !== undefined && (
                  <Badge variant="outline" className="text-[10px] ml-2">
                    {envVars.data.count} vars
                  </Badge>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowEnvVars(!showEnvVars)}
                >
                  {showEnvVars ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showEnvVars ? "Hide Values" : "Show Values"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => envVars.refetch()}
                  disabled={envVars.isFetching}
                >
                  <RefreshCw className={`w-3 h-3 ${envVars.isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {envVars.data?.error && (
              <div className="mb-3 p-2 rounded bg-amber/10 border border-amber/20 text-xs text-amber">
                {envVars.data.error}
              </div>
            )}

            {envVars.isLoading ? (
              <div className="space-y-1">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
              </div>
            ) : envVars.data?.vars && Object.keys(envVars.data.vars).length > 0 ? (
              <div className="bg-[#0d1117] rounded-lg border border-border/30 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#161b22] border-b border-border/30">
                      <tr>
                        <th className="text-left text-[10px] font-mono text-gray-500 uppercase px-3 py-2">Key</th>
                        <th className="text-left text-[10px] font-mono text-gray-500 uppercase px-3 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {Object.entries(envVars.data.vars)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, value]) => {
                          const isConfig = key === "OPENCLAW_CONFIG_B64";
                          return (
                            <tr key={key} className="hover:bg-white/5">
                              <td className="px-3 py-1.5 font-mono text-[11px] text-cyan whitespace-nowrap align-top">
                                {key}
                              </td>
                              <td className="px-3 py-1.5 font-mono text-[11px] text-gray-300 align-top">
                                {showEnvVars ? (
                                  isConfig ? (
                                    <pre className="whitespace-pre-wrap break-all text-[10px] max-w-[600px]">
                                      {String(value)}
                                    </pre>
                                  ) : (
                                    <span className="whitespace-pre-wrap break-all">{String(value)}</span>
                                  )
                                ) : (
                                  <span className="text-gray-600">••••••••</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Variable className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No environment variables found</p>
                <p className="text-[10px] mt-1">Deploy your gateway first</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber" />
              System Notifications &amp; Audit Trail
            </h3>
            {notifications.isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : notifications.data && notifications.data.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {notifications.data.map((notif) => {
                  const severityStyles = {
                    error: "border-destructive/20 bg-destructive/5",
                    warning: "border-amber/20 bg-amber/5",
                    success: "border-emerald/20 bg-emerald/5",
                    info: "border-border/20 bg-muted/5",
                  };
                  const severityIcons = {
                    error: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
                    warning: <AlertTriangle className="w-3.5 h-3.5 text-amber" />,
                    success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />,
                    info: <Info className="w-3.5 h-3.5 text-muted-foreground" />,
                  };
                  const severity = (notif.severity ?? "info") as keyof typeof severityStyles;

                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-3 rounded-md border ${severityStyles[severity]}`}
                    >
                      <div className="mt-0.5 shrink-0">{severityIcons[severity]}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold">{notif.title}</h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No system notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debugging Tips */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Debugging Tips
        </h3>
        <div className="space-y-2">
          {[
            "Runtime logs show real-time output from the OpenClaw gateway container on Railway.",
            "Build logs show the Docker build process — check here if deployments fail.",
            "Env Vars shows what's actually set on Railway — verify OPENCLAW_CONFIG_B64 and API keys are present.",
            "If Telegram stops responding, check runtime logs for 'telegram' or 'plugin' errors.",
            "After config changes, a redeploy is triggered — watch build logs for progress.",
          ].map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2.5 rounded-md bg-muted/10 border border-border/20"
            >
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
