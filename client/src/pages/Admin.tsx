/*
  Admin Dashboard — Command Center Aesthetic
  Only accessible to users with role === "admin"
  Tabs: Waitlist, Configurations, Deployments, Railway
*/

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserCheck, Settings, Rocket, Globe, ArrowLeft, RefreshCw, Mail, Building, Calendar, ExternalLink, Download, CheckCircle2, XCircle, Shield } from "lucide-react";
import { useLocation } from "wouter";

type Tab = "waitlist" | "users" | "configs" | "deployments" | "railway";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}

function WaitlistTab() {
  const { data: entries, isLoading, refetch } = trpc.waitlist.list.useQuery({ limit: 500 });
  const { data: countData } = trpc.waitlist.count.useQuery();

  const exportCSV = () => {
    if (!entries?.length) return;
    const headers = ["Email", "Name", "Company", "Role", "Source", "Date"];
    const rows = entries.map((e) => [
      e.email,
      e.name || "",
      e.company || "",
      e.role || "",
      e.source || "website",
      new Date(e.createdAt).toISOString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sunclaw-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Waitlist Signups</h3>
          <p className="text-sm text-muted-foreground">
            {countData?.count ?? 0} total signups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={!entries?.length}
            className="gap-2 border-amber/40 text-amber hover:bg-amber/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/60">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : !entries?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No waitlist signups yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan shrink-0" />
                        <span className="font-mono text-xs">{entry.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{entry.name || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {entry.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          {entry.company}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.role || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/50 border border-border/40">
                        {entry.source || "website"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { data: usersList, isLoading, refetch } = trpc.adminTokens.users.useQuery();

  const planColor: Record<string, string> = {
    free: "text-muted-foreground border-border/40 bg-secondary/50",
    pro: "text-cyan border-cyan/20 bg-cyan/10",
    enterprise: "text-amber border-amber/20 bg-amber/10",
  };

  const exportCSV = () => {
    if (!usersList?.length) return;
    const headers = ["Email", "Name", "Plan", "Verified", "Role", "Login Method", "Joined"];
    const rows = usersList.map((u) => [
      u.email || "",
      u.name || "",
      u.plan || "free",
      u.emailVerified ? "Yes" : "No",
      u.role || "user",
      u.loginMethod || "email",
      new Date(u.createdAt).toISOString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sunclaw-users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Registered Users</h3>
          <p className="text-sm text-muted-foreground">
            {usersList?.length ?? 0} total users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={!usersList?.length}
            className="gap-2 border-amber/40 text-amber hover:bg-amber/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/60">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : !usersList?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserCheck className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No registered users yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Verified</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan shrink-0" />
                        <span className="font-mono text-xs">{u.email || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{u.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${planColor[u.plan ?? "free"] || planColor.free}`}>
                        {u.plan || "free"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.emailVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber" />
                          <span className="text-[10px] font-mono text-amber">admin</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">user</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigsTab() {
  const { data: configs, isLoading, refetch } = trpc.config.listAll.useQuery({ limit: 200 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Saved Configurations</h3>
          <p className="text-sm text-muted-foreground">
            {configs?.length ?? 0} configurations across all users
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/60">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : !configs?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No configurations saved yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {configs.map((config) => {
            const configData = config.config as Record<string, unknown> | null;
            return (
              <div key={config.id} className="rounded-lg border border-border/50 bg-card/30 p-4 hover:border-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-cyan" />
                    <span className="font-semibold text-sm">{config.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ID: {config.id} | User: {config.userId}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configData?.llmProvider ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan/10 border border-cyan/20 text-cyan">
                      LLM: {String(configData.llmProvider)}
                    </span>
                  ) : null}
                  {configData?.deployMethod ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber/10 border border-amber/20 text-amber">
                      Deploy: {String(configData.deployMethod)}
                    </span>
                  ) : null}
                  {configData?.kiishaEnabled ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-emerald">
                      KIISHA
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Updated: {new Date(config.updatedAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeploymentsTab() {
  const { data: deploys, isLoading, refetch } = trpc.deploy.listAll.useQuery({ limit: 200 });

  const statusColor: Record<string, string> = {
    pending: "text-amber border-amber/20 bg-amber/10",
    deploying: "text-cyan border-cyan/20 bg-cyan/10",
    success: "text-emerald border-emerald/20 bg-emerald/10",
    failed: "text-red-400 border-red-500/20 bg-red-500/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Deployments</h3>
          <p className="text-sm text-muted-foreground">
            {deploys?.length ?? 0} total deployment attempts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/60">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : !deploys?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Rocket className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No deployments yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Instance</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Method</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">URL</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {deploys.map((deploy) => (
                  <tr key={deploy.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{deploy.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{deploy.instanceName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${deploy.method === "railway" ? "text-amber border-amber/20 bg-amber/10" : "text-cyan border-cyan/20 bg-cyan/10"}`}>
                        {deploy.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor[deploy.status] || ""}`}>
                        {deploy.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {deploy.externalUrl ? (
                        <a href={deploy.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan hover:underline flex items-center gap-1">
                          {deploy.externalUrl.replace("https://", "")}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(deploy.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RailwayTab() {
  const { data: projects, isLoading, refetch } = trpc.deploy.railwayProjects.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Railway Projects</h3>
          <p className="text-sm text-muted-foreground">
            Projects visible to the connected Railway API token
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/60">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : !projects?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No Railway projects found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border/50 bg-card/30 p-4 hover:border-amber/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-amber" />
                  <span className="font-semibold text-sm">{project.name}</span>
                </div>
                <a
                  href={`https://railway.com/project/${project.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber hover:underline flex items-center gap-1"
                >
                  Open in Railway
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">ID: {project.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("waitlist");
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button variant="outline" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "waitlist", label: "Waitlist", icon: Users },
    { id: "users", label: "Users", icon: UserCheck },
    { id: "configs", label: "Configurations", icon: Settings },
    { id: "deployments", label: "Deployments", icon: Rocket },
    { id: "railway", label: "Railway", icon: Globe },
  ];

  // Get counts for stat cards
  const { data: waitlistCount } = trpc.waitlist.count.useQuery();
  const { data: allUsers } = trpc.adminTokens.users.useQuery();
  const { data: configs } = trpc.config.listAll.useQuery({ limit: 1 });
  const { data: deploys } = trpc.deploy.listAll.useQuery({ limit: 1 });
  const { data: railwayProjects } = trpc.deploy.railwayProjects.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan to-amber flex items-center justify-center">
                <span className="text-background font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-lg tracking-tight">SunClaw</span>
              <span className="text-xs font-mono text-muted-foreground ml-2">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber px-2 py-0.5 rounded bg-amber/10 border border-amber/20">ADMIN</span>
            <span className="text-xs text-muted-foreground">{user.email || user.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Waitlist" value={waitlistCount?.count ?? 0} icon={Users} color="text-cyan" />
          <StatCard label="Users" value={allUsers?.length ?? 0} icon={UserCheck} color="text-emerald" />
          <StatCard label="Configs" value={configs?.length ?? 0} icon={Settings} color="text-amber" />
          <StatCard label="Deployments" value={deploys?.length ?? 0} icon={Rocket} color="text-emerald" />
          <StatCard label="Railway Projects" value={railwayProjects?.length ?? 0} icon={Globe} color="text-amber" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-cyan text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "waitlist" && <WaitlistTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "configs" && <ConfigsTab />}
        {activeTab === "deployments" && <DeploymentsTab />}
        {activeTab === "railway" && <RailwayTab />}
      </div>
    </div>
  );
}
