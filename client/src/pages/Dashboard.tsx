import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MessageSquare,
  Radio,
  Sparkles,
  Settings,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Sun,
  User,
  BarChart3,
  Bell,
  Key,
  Brain,
  Save,
  Shield,
  Rocket,
  ArrowRight,
  Link2,
  Globe,
  Terminal,
  Loader2,
} from "lucide-react";
import DashboardOverview from "./dashboard/Overview";
import DashboardChat from "./dashboard/Chat";
import DashboardChannels from "./dashboard/Channels";
import DashboardSkills from "./dashboard/Skills";
import DashboardConfig from "./dashboard/Config";
import DashboardSessions from "./dashboard/Sessions";
import DashboardLogs from "./dashboard/Logs";
import DashboardAnalytics from "./dashboard/Analytics";
import DashboardNotifications from "./dashboard/Notifications";
import DashboardApiKeys from "./dashboard/ApiKeys";
import DashboardMemory from "./dashboard/Memory";
import DashboardConversations from "./dashboard/Conversations";
import DashboardAdminTokens from "./dashboard/AdminTokens";

import { useWebSocketNotifications } from "@/hooks/useWebSocketNotifications";

type Section =
  | "overview"
  | "chat"
  | "channels"
  | "skills"
  | "config"
  | "sessions"
  | "logs"
  | "analytics"
  | "notifications"
  | "apikeys"
  | "memory"
  | "conversations"
  | "admin-tokens"
;

const NAV_ITEMS: Array<{
  id: Section;
  label: string;
  icon: React.ElementType;
  group: string;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Control" },
  { id: "chat", label: "Chat", icon: MessageSquare, group: "Control" },
  { id: "channels", label: "Channels", icon: Radio, group: "Control" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Control" },
  { id: "skills", label: "Skills", icon: Sparkles, group: "Agent" },
  { id: "config", label: "Config", icon: Settings, group: "Agent" },
  { id: "apikeys", label: "API Keys", icon: Key, group: "Agent" },
  { id: "memory", label: "Memory", icon: Brain, group: "Agent" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Insights" },
  { id: "conversations", label: "Conversations", icon: Save, group: "Insights" },
  { id: "sessions", label: "Sessions", icon: Activity, group: "Insights" },
  { id: "admin-tokens", label: "Enterprise Tokens", icon: Shield, group: "Admin" },

  { id: "logs", label: "Logs", icon: FileText, group: "Settings" },
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    instanceName: "",
    gatewayUrl: "",
    gatewayToken: "",
    method: "docker" as "docker" | "render" | "hostinger" | "emergent" | "northflank" | "cloudflare" | "alibaba",
  });
  const [registerError, setRegisterError] = useState("");

  const instance = trpc.dashboard.instance.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: billingStatus } = trpc.billing.status.useQuery(undefined, {
    enabled: !!user,
  });

  const userPlan = billingStatus?.plan ?? "free";

  const registerMutation = trpc.deploy.registerSelfHosted.useMutation({
    onSuccess: () => {
      instance.refetch();
      setShowRegister(false);
      setRegisterForm({ instanceName: "", gatewayUrl: "", gatewayToken: "", method: "docker" });
      setRegisterError("");
    },
    onError: (err) => {
      setRegisterError(err.message);
    },
  });

  const unreadCount = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30_000,
  });

  // Real-time WebSocket push notifications
  const { connected: wsConnected } = useWebSocketNotifications(!!user);

  // Listen for navigation events from child components (e.g., Overview quick actions)
  useEffect(() => {
    const handler = (e: Event) => {
      const section = (e as CustomEvent).detail as Section;
      if (section) setActiveSection(section);
    };
    window.addEventListener("dashboard-navigate", handler);
    return () => window.removeEventListener("dashboard-navigate", handler);
  }, []);

  // Group nav items
  const groups = useMemo(() => {
    const map = new Map<string, typeof NAV_ITEMS>();
    NAV_ITEMS.forEach((item) => {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    });
    return Array.from(map.entries());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan to-amber flex items-center justify-center animate-pulse">
            <span className="text-background font-bold text-sm">SC</span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan to-amber flex items-center justify-center">
            <span className="text-background font-bold">SC</span>
          </div>
          <h1 className="text-xl font-semibold">Sign in to access your dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your SunClaw AI agent, channels, skills, and configuration.
          </p>
          <Button
            className="bg-cyan text-background hover:bg-cyan/90 gap-2"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            <Zap className="w-4 h-4" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!instance.data && !instance.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan/20 to-amber/20 border border-cyan/30 flex items-center justify-center">
            <Sun className="w-8 h-8 text-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">No Active Deployment</h1>
            <p className="text-muted-foreground">
              Deploy a new SunClaw instance or connect one you've already deployed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 w-full">
            {/* Option 1: Setup Wizard */}
            <button
              onClick={() => (window.location.href = "/agent/setup")}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-card/30 hover:border-cyan/40 hover:bg-cyan/5 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
                <Zap className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">New Deployment</p>
                <p className="text-xs text-muted-foreground">
                  Launch the Setup Wizard to deploy a fresh SunClaw instance
                </p>
              </div>
            </button>

            {/* Option 2: Connect Existing */}
            <button
              onClick={() => setShowRegister(true)}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-card/30 hover:border-amber/40 hover:bg-amber/5 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                <Link2 className="w-5 h-5 text-amber" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Connect Existing</p>
                <p className="text-xs text-muted-foreground">
                  Link a self-hosted instance (Docker, Render, etc.) to your dashboard
                </p>
              </div>
            </button>
          </div>

          {/* Registration Form */}
          {showRegister && (
            <div className="w-full rounded-xl border border-border/50 bg-card/30 p-5 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber" />
                  Connect Self-Hosted Instance
                </h3>
                <button
                  onClick={() => { setShowRegister(false); setRegisterError(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Instance Name</label>
                  <input
                    type="text"
                    placeholder="e.g. my-sunclaw-prod"
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
                    value={registerForm.instanceName}
                    onChange={(e) => setRegisterForm(f => ({ ...f, instanceName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Gateway URL</label>
                  <input
                    type="url"
                    placeholder="https://your-sunclaw.example.com"
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
                    value={registerForm.gatewayUrl}
                    onChange={(e) => setRegisterForm(f => ({ ...f, gatewayUrl: e.target.value }))}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    The public URL where your SunClaw gateway is running (must include https://)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Gateway Token</label>
                  <input
                    type="password"
                    placeholder="Your OPENCLAW_TOKEN value"
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan"
                    value={registerForm.gatewayToken}
                    onChange={(e) => setRegisterForm(f => ({ ...f, gatewayToken: e.target.value }))}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    The OPENCLAW_TOKEN from your .env file — used to authenticate with the gateway
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Platform</label>
                  <select
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan"
                    value={registerForm.method}
                    onChange={(e) => setRegisterForm(f => ({ ...f, method: e.target.value as any }))}
                  >
                    <option value="docker">Self-Hosted (Docker)</option>
                    <option value="render">Render</option>
                    <option value="hostinger">Hostinger VPS</option>
                    <option value="emergent">Emergent.sh</option>
                    <option value="northflank">Northflank</option>
                    <option value="cloudflare">Cloudflare Workers</option>
                    <option value="alibaba">Alibaba Cloud</option>
                  </select>
                </div>
              </div>

              {registerError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {registerError}
                </div>
              )}

              <Button
                className="w-full bg-amber text-background hover:bg-amber/90 gap-2"
                disabled={!registerForm.instanceName || !registerForm.gatewayUrl || !registerForm.gatewayToken || registerMutation.isPending}
                onClick={() => registerMutation.mutate(registerForm)}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Connect Instance
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                We'll verify your gateway is reachable before connecting.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-60"
        } shrink-0 border-r border-border/50 bg-sidebar flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 gap-2.5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan to-amber flex items-center justify-center shrink-0">
            <span className="text-background font-bold text-xs">SC</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-sidebar-foreground truncate">
                SunClaw
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {instance.data?.domain ?? "loading..."}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-2">
          {groups.map(([group, items]) => (
            <div key={group} className="mb-1">
              {!collapsed && (
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                    {group}
                  </span>
                </div>
              )}
              {items.map((item) => {
                const isActive = activeSection === item.id;
                const hasNotifBadge = item.id === "notifications" && (unreadCount.data?.count ?? 0) > 0;

                const btn = (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-md text-sm transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center mx-auto w-10 px-0" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <item.icon
                        className={`w-4 h-4 ${isActive ? "text-cyan" : ""}`}
                      />
                      {hasNotifBadge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan" />
                      )}
                    </div>
                    {!collapsed && (
                      <span className="flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && hasNotifBadge && (
                      <Badge variant="outline" className="border-cyan/30 text-cyan bg-cyan/10 text-[9px] h-4 px-1.5">
                        {unreadCount.data!.count}
                      </Badge>
                    )}
                  </button>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="font-sans">
                        {item.label}
                        {hasNotifBadge && ` (${unreadCount.data!.count})`}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return btn;
              })}
            </div>
          ))}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>

          <Separator className="my-2" />

          {/* User */}
          {!collapsed ? (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name ?? "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user.email ?? ""}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="w-full flex justify-center py-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold capitalize">
              {activeSection === "apikeys" ? "API Keys" : activeSection}
            </h1>
            {instance.data && (
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {instance.data.name ?? "SunClaw Instance"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-border/60"
              onClick={() => (window.location.href = "/agent/account")}
            >
              <User className="w-3 h-3" />
              Account
            </Button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {/* Upgrade Banner for Free Users */}
          {userPlan === "free" && (
            <div className="mx-6 mt-4 rounded-xl border border-amber/30 bg-amber/5 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber/20 flex items-center justify-center shrink-0">
                  <Rocket className="w-4.5 h-4.5 text-amber" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Upgrade to Pro for managed deployments</p>
                  <p className="text-xs text-muted-foreground">
                    Get managed Railway hosting, live logs, persistent memory, and up to 3 bot instances.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-amber text-background hover:bg-amber/90 gap-1.5 shrink-0"
                onClick={() => (window.location.href = "/pricing")}
              >
                Upgrade
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {activeSection === "overview" && <DashboardOverview />}
          {activeSection === "chat" && <DashboardChat />}
          {activeSection === "channels" && <DashboardChannels />}
          {activeSection === "skills" && <DashboardSkills />}
          {activeSection === "config" && <DashboardConfig />}
          {activeSection === "sessions" && <DashboardSessions />}
          {activeSection === "logs" && <DashboardLogs />}
          {activeSection === "analytics" && <DashboardAnalytics />}
          {activeSection === "notifications" && <DashboardNotifications />}
          {activeSection === "apikeys" && <DashboardApiKeys />}
          {activeSection === "memory" && <DashboardMemory />}
          {activeSection === "conversations" && <DashboardConversations />}
          {activeSection === "admin-tokens" && <DashboardAdminTokens />}

        </div>
      </main>
    </div>
  );
}
