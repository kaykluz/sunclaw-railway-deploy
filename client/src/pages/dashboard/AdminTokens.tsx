import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Shield,
  Key,
  Users,
  TrendingUp,
  DollarSign,
  Loader2,
  Plus,
  BarChart3,
  Cpu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10b981",
  anthropic: "#f59e0b",
  google: "#3b82f6",
  openrouter: "#8b5cf6",
  xai: "#ef4444",
  venice: "#06b6d4",
  moonshot: "#f472b6",
  "kimi-coding": "#ec4899",
  groq: "#f97316",
  cerebras: "#a855f7",
  mistral: "#6366f1",
  deepseek: "#14b8a6",
  zai: "#22d3ee",
  opencode: "#84cc16",
  "vercel-ai-gateway": "#a78bfa",
  synthetic: "#fb923c",
  minimax: "#e879f9",
  qwen: "#38bdf8",
  qianfan: "#4ade80",
  bedrock: "#fbbf24",
  "github-copilot": "#818cf8",
  ollama: "#34d399",
  fallback: "#6b7280",
};

export default function AdminTokens() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");

  // Token usage tracking removed — OpenClaw handles this internally
  const allKeys = trpc.adminTokens.allKeys.useQuery();
  const allUsers = trpc.adminTokens.users.useQuery();
  const providers = trpc.apiKeys.providers.useQuery();
  const utils = trpc.useUtils();

  const addKeyForUser = trpc.adminTokens.addKeyForUser.useMutation({
    onSuccess: () => {
      toast.success("API key added for user");
      setShowAddKey(false);
      setNewUserId("");
      setNewProvider("");
      setNewLabel("");
      setNewKey("");
      utils.adminTokens.allKeys.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="p-6 text-center py-20">
        <Shield className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-sm text-muted-foreground">Admin access required</p>
      </div>
    );
  }



  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber" />
            Enterprise Token Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Admin-level API key management and usage tracking across all users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-amber text-background hover:bg-amber/90"
            onClick={() => setShowAddKey(!showAddKey)}
          >
            <Plus className="w-3 h-3" /> Add Key for User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber" />
              <span className="text-xs text-muted-foreground">Total Keys</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {allKeys.isLoading ? "..." : allKeys.data?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {allUsers.isLoading ? "..." : allUsers.data?.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Key for User Form */}
      {showAddKey && (
        <Card className="border-amber/30 bg-amber/5">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-amber" /> Add API Key for User
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">User</Label>
                <Select value={newUserId} onValueChange={setNewUserId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {(allUsers.data ?? []).map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name || u.email || `User #${u.id}`} ({u.plan})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Provider</Label>
                <Select value={newProvider} onValueChange={setNewProvider}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Label (optional)</Label>
                <Input className="mt-1" placeholder="e.g. Enterprise Key" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">API Key</Label>
                <Input className="mt-1 font-mono text-sm" type="password" placeholder="sk-..." value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddKey(false)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-amber text-background hover:bg-amber/90"
                onClick={() => addKeyForUser.mutate({ userId: Number(newUserId), provider: newProvider, apiKey: newKey, label: newLabel || undefined })}
                disabled={!newUserId || !newProvider || !newKey || addKeyForUser.isPending}
              >
                {addKeyForUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      {/* All Keys */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan" /> All API Keys ({allKeys.data?.length ?? 0})
          </h3>
          {allKeys.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (allKeys.data ?? []).length > 0 ? (
            <div className="space-y-1.5">
              {(allKeys.data ?? []).map((key) => {
                const userInfo = (allUsers.data ?? []).find((u) => u.id === key.userId);
                return (
                  <div key={key.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/20 text-xs">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[9px] font-mono">{key.provider}</Badge>
                      <span className="text-muted-foreground">{key.label || "—"}</span>
                      <span className="text-muted-foreground/60">→ {userInfo?.name || `User #${key.userId}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          key.status === "healthy" ? "text-emerald border-emerald/30" :
                          key.status === "failed" ? "text-destructive border-destructive/30" :
                          "text-muted-foreground border-border/30"
                        }`}
                      >
                        {key.status}
                      </Badge>
                      <span className="text-muted-foreground/60 font-mono">P{key.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-6">No API keys configured across any users</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
