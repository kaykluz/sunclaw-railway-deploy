import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Search,
  Cpu,
  Zap,
  ArrowRight,
  Rocket,
  Cloud,
  CloudOff,
  Timer,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardApiKeys() {
  const keys = trpc.apiKeys.list.useQuery();
  const providers = trpc.apiKeys.providers.useQuery();
  const activeModelQuery = trpc.apiKeys.activeModel.useQuery();
  const deployStatusQuery = trpc.apiKeys.deployStatus.useQuery(undefined, {
    refetchInterval: (query) => {
      // Poll every 5s while deploying/building, stop when done
      const status = query.state.data?.status;
      if (status === "deploying" || status === "building") return 5000;
      return false;
    },
  });
  const utils = trpc.useUtils();

  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newModel, setNewModel] = useState("");
  const [checking, setChecking] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");

  // Track pending model selection (separate from saved model)
  const savedModel = activeModelQuery.data?.activeModel ?? null;
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const hasUnsavedModel = pendingModel !== null && pendingModel !== savedModel;

  // Reset pending when saved model changes (after successful save)
  useEffect(() => {
    if (savedModel && pendingModel === savedModel) {
      setPendingModel(null);
    }
  }, [savedModel, pendingModel]);

  // Get selected provider info
  const selectedProviderInfo = useMemo(
    () => providers.data?.find(p => p.id === newProvider),
    [providers.data, newProvider]
  );

  // Filter providers by search
  const filteredProviders = useMemo(() => {
    if (!providers.data) return [];
    if (!providerSearch) return providers.data;
    const q = providerSearch.toLowerCase();
    return providers.data.filter(
      p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [providers.data, providerSearch]);

  // Build a flat list of all selectable models from providers that have active keys
  const selectableModels = useMemo(() => {
    if (!providers.data || !keys.data) return [];
    const activeProviderIds = new Set(
      keys.data.filter(k => k.enabled).map(k => k.provider)
    );
    const models: Array<{
      value: string;
      label: string;
      provider: string;
      providerName: string;
      tag?: string;
      hasKey: boolean;
    }> = [];

    for (const p of providers.data) {
      for (const m of p.models) {
        models.push({
          value: `${p.id}/${m.id}`,
          label: m.name,
          provider: p.id,
          providerName: p.name,
          tag: m.tag,
          hasKey: activeProviderIds.has(p.id),
        });
      }
    }
    return models;
  }, [providers.data, keys.data]);

  // Group models by provider for the dropdown
  const modelsByProvider = useMemo(() => {
    const groups: Record<string, typeof selectableModels> = {};
    for (const m of selectableModels) {
      if (!groups[m.providerName]) groups[m.providerName] = [];
      groups[m.providerName].push(m);
    }
    return groups;
  }, [selectableModels]);

  const addKey = trpc.apiKeys.add.useMutation({
    onSuccess: () => {
      toast.success("API key added — config syncing to gateway...");
      setShowAdd(false);
      setNewProvider("");
      setNewLabel("");
      setNewKey("");
      setNewBaseUrl("");
      setNewModel("");
      setProviderSearch("");
      utils.apiKeys.list.invalidate();
      // Start polling deploy status
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const removeKey = trpc.apiKeys.remove.useMutation({
    onSuccess: () => {
      toast.success("API key removed — config syncing to gateway...");
      utils.apiKeys.list.invalidate();
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
  });

  const toggleKey = trpc.apiKeys.toggle.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      toast.info("Key toggled — config syncing to gateway...");
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
  });

  const setPriority = trpc.apiKeys.setPriority.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      // Priority changes also auto-sync now
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
  });

  const reEnableKey = trpc.apiKeys.reEnable.useMutation({
    onSuccess: (data) => {
      if (data.healthy) {
        toast.success("Key re-enabled and passed health check");
      } else {
        toast.error(`Key still failing: ${data.error ?? "Unknown error"}. It has been disabled again.`);
      }
      utils.apiKeys.list.invalidate();
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const healthCheck = trpc.apiKeys.healthCheck.useMutation({
    onSuccess: (data) => {
      setChecking(false);
      const healthy = data.filter((r: any) => r.healthy).length;
      const failed = data.filter((r: any) => !r.healthy);
      const total = data.length;
      if (total === 0) {
        toast.info("No enabled API keys to test");
      } else if (healthy === total) {
        toast.success(`All ${total} provider${total > 1 ? "s" : ""} healthy`);
      } else {
        const failedNames = failed.map((f: any) => f.provider).join(", ");
        toast.error(`${healthy}/${total} healthy — failed: ${failedNames}`, {
          duration: 8000,
          description: failed[0]?.error ? failed[0].error.slice(0, 120) : undefined,
        });
      }
      utils.apiKeys.list.invalidate();
    },
    onError: () => {
      setChecking(false);
      toast.error("Health check failed — server error");
    },
  });

  const setActiveModel = trpc.apiKeys.setActiveModel.useMutation({
    onSuccess: (data) => {
      if (data.deployed) {
        toast.success(`Model set to ${data.model} — deploying to gateway...`, {
          duration: 6000,
          description: "Container will restart in ~60 seconds.",
        });
      } else {
        toast.warning(`Model saved but deploy failed: ${data.deployError ?? "Unknown error"}`, {
          duration: 8000,
        });
      }
      setPendingModel(null);
      utils.apiKeys.activeModel.invalidate();
      // Start polling deploy status
      setTimeout(() => utils.apiKeys.deployStatus.invalidate(), 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleHealthCheck = () => {
    setChecking(true);
    healthCheck.mutate();
  };

  const handleSaveAndDeploy = () => {
    if (pendingModel) {
      setActiveModel.mutate({ model: pendingModel });
    }
  };

  const displayModel = pendingModel ?? savedModel;

  // Deploy status helpers
  const deployStatus = deployStatusQuery.data?.status;
  const isDeploying = deployStatus === "deploying" || deployStatus === "building";

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* ═══ DEPLOY STATUS BANNER ═══ */}
      {deployStatusQuery.data && (
        <DeployStatusBanner
          status={deployStatusQuery.data}
          onRefresh={() => utils.apiKeys.deployStatus.invalidate()}
        />
      )}

      {/* ═══ MODEL SELECTION ═══ */}
      <Card className="border-cyan/30 bg-gradient-to-br from-cyan/5 to-transparent overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
              <Cpu className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Active Model
                {setActiveModel.isPending && <Loader2 className="w-3 h-3 animate-spin text-cyan" />}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select the primary AI model for your agent. Only providers with active API keys can be used.
              </p>
            </div>
          </div>

          {activeModelQuery.isLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select
                  value={displayModel ?? ""}
                  onValueChange={(val) => {
                    if (val) setPendingModel(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-background/50 border-border/50">
                    <SelectValue placeholder="Select a model..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.entries(modelsByProvider).map(([providerName, models]) => {
                      const hasKey = models.some(m => m.hasKey);
                      return (
                        <div key={providerName}>
                          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            {providerName}
                            {hasKey ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald" />
                            ) : (
                              <span className="text-[9px] text-muted-foreground/60 font-normal normal-case">(no key)</span>
                            )}
                          </div>
                          {models.map(m => (
                            <SelectItem
                              key={m.value}
                              value={m.value}
                              disabled={!m.hasKey}
                              className="pl-4"
                            >
                              <div className="flex items-center gap-2">
                                <span>{m.label}</span>
                                {m.tag && (
                                  <Badge variant="outline" className="text-[8px] px-1 py-0 text-cyan border-cyan/30">
                                    {m.tag}
                                  </Badge>
                                )}
                                {!m.hasKey && (
                                  <span className="text-[9px] text-muted-foreground/50">needs key</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Save & Deploy button — visible when model selection differs from saved */}
                <Button
                  className="gap-1.5 bg-cyan text-background hover:bg-cyan/90 shrink-0"
                  size="default"
                  onClick={handleSaveAndDeploy}
                  disabled={!hasUnsavedModel || setActiveModel.isPending}
                >
                  {setActiveModel.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  {setActiveModel.isPending ? "Deploying..." : "Save & Deploy"}
                </Button>
              </div>

              {/* Unsaved change indicator */}
              {hasUnsavedModel && (
                <div className="flex items-center gap-2 text-xs px-1">
                  <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                  <span className="text-amber font-medium">
                    Unsaved change — click "Save & Deploy" to apply
                  </span>
                </div>
              )}

              {savedModel && !hasUnsavedModel && (
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3 text-amber" />
                  <span className="text-muted-foreground">
                    Currently using <span className="text-foreground font-mono font-medium">{savedModel}</span>
                  </span>
                  {keys.data && keys.data.filter(k => k.enabled).length > 1 && (
                    <>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-muted-foreground">
                        with {keys.data.filter(k => k.enabled).length - 1} failover provider{keys.data.filter(k => k.enabled).length > 2 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ API KEY MANAGEMENT HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan" />
            API Key Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add multiple provider keys for automatic failover. 20 providers supported.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleHealthCheck}
            disabled={checking || !keys.data?.length}
          >
            {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {checking ? "Testing..." : "Health Check"}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-cyan text-background hover:bg-cyan/90"
            onClick={() => setShowAdd(!showAdd)}
          >
            <Plus className="w-3 h-3" />
            Add Key
          </Button>
        </div>
      </div>

      {/* ═══ ADD KEY FORM ═══ */}
      {showAdd && (
        <Card className="border-cyan/30 bg-cyan/5">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-xs">Provider</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 text-sm"
                  placeholder="Search providers..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border/30 p-2">
                {filteredProviders.map((p) => (
                  <button
                    key={p.id}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                      newProvider === p.id
                        ? "bg-cyan/15 border border-cyan/40 text-foreground"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => {
                      setNewProvider(p.id);
                      setProviderSearch("");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.freeTier && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-emerald border-emerald/30 bg-emerald/10">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                            FREE TIER
                          </Badge>
                        )}
                        {p.category === "local" && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-blue-400 border-blue-400/30 bg-blue-400/10">
                            LOCAL
                          </Badge>
                        )}
                        {p.category === "gateway" && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-purple-400 border-purple-400/30 bg-purple-400/10">
                            GATEWAY
                          </Badge>
                        )}
                      </div>
                      {newProvider === p.id && <CheckCircle2 className="w-4 h-4 text-cyan" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>
                  </button>
                ))}
                {filteredProviders.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No providers match your search</p>
                )}
              </div>
            </div>

            {selectedProviderInfo && (
              <>
                <div className="rounded-lg bg-muted/30 border border-border/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{selectedProviderInfo.name}</span>
                    {selectedProviderInfo.url && (
                      <a
                        href={selectedProviderInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan hover:underline flex items-center gap-1"
                      >
                        Get API Key <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{selectedProviderInfo.description}</p>
                  {selectedProviderInfo.models.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProviderInfo.models.map(m => (
                        <Badge key={m.id} variant="outline" className="text-[9px] px-1.5 py-0">
                          {m.name}
                          {m.tag && <span className="ml-1 text-cyan">({m.tag})</span>}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Label (optional)</Label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. Production Key"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">API Key</Label>
                    <Input
                      className="mt-1 font-mono text-sm"
                      placeholder={selectedProviderInfo.keyPlaceholder}
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Custom Base URL (optional)</Label>
                    <Input
                      className="mt-1 text-sm"
                      placeholder="https://api.openai.com/v1"
                      value={newBaseUrl}
                      onChange={(e) => setNewBaseUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Specific Model (optional)</Label>
                    <Input
                      className="mt-1 text-sm"
                      placeholder="gpt-4o-mini"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setProviderSearch(""); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-cyan text-background hover:bg-cyan/90"
                onClick={() => {
                  addKey.mutate({
                    provider: newProvider,
                    label: newLabel || undefined,
                    apiKey: newKey,
                    baseUrl: newBaseUrl || undefined,
                    model: newModel || undefined,
                  });
                }}
                disabled={!newProvider || (!newKey && selectedProviderInfo?.category !== "local") || addKey.isPending}
              >
                {addKey.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ FAILOVER EXPLANATION ═══ */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">How Failover Works</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                When you send a message, SunClaw tries your API keys in priority order (lowest number first).
                If a provider fails, it automatically switches to the next healthy provider.
                If all user keys fail, an error is returned. Make sure to configure at least one reliable provider.
                All failover events are logged in Analytics.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-[9px] text-emerald border-emerald/30 bg-emerald/10">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  Free tier providers: Kimi, Groq, Cerebras, Gemini, Mistral, Z.AI, Qwen, OpenRouter
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ KEY LIST ═══ */}
      {keys.isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : keys.data && keys.data.length > 0 ? (
        <div className="space-y-2">
          {keys.data.map((key, idx) => {
            const statusColor =
              key.status === "healthy"
                ? "text-emerald border-emerald/30 bg-emerald/10"
                : key.status === "failed"
                ? "text-destructive border-destructive/30 bg-destructive/10"
                : "text-muted-foreground border-border/30 bg-muted/10";

            const providerInfo = providers.data?.find(p => p.id === key.provider);

            return (
              <div
                key={key.id}
                className={`rounded-xl border p-4 transition-all ${
                  key.enabled ? "border-border/50 bg-card/30" : "border-border/20 bg-card/10 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        className="p-0.5 hover:text-cyan transition-colors text-muted-foreground"
                        onClick={() => {
                          if (key.priority > 0) setPriority.mutate({ id: key.id, priority: key.priority - 1 });
                        }}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-5 text-center">{key.priority}</span>
                      <button
                        className="p-0.5 hover:text-cyan transition-colors text-muted-foreground"
                        onClick={() => setPriority.mutate({ id: key.id, priority: key.priority + 1 })}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{providerInfo?.name ?? key.provider}</h4>
                        {key.label && (
                          <span className="text-xs text-muted-foreground">({key.label})</span>
                        )}
                        {key.model && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-cyan/10 text-cyan border-cyan/20">
                            {key.model}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${statusColor}`}>
                          {key.status === "healthy" ? (
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                          ) : key.status === "failed" ? (
                            <XCircle className="w-2.5 h-2.5 mr-1" />
                          ) : null}
                          {key.status ?? "unknown"}
                        </Badge>
                        {providerInfo?.freeTier && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 text-emerald border-emerald/30 bg-emerald/10">
                            FREE
                          </Badge>
                        )}
                      </div>
                      {key.lastError && (
                        <p className="text-[10px] text-destructive mt-1 flex items-center gap-1" title={key.lastError}>
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-md">
                            {key.lastError.includes("Details:") ? key.lastError.split("Details:")[0].trim() : key.lastError.slice(0, 120)}
                          </span>
                        </p>
                      )}
                      {key.baseUrl && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-xs">
                          Base URL: {key.baseUrl}
                        </p>
                      )}
                      {key.lastCheckedAt && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Last checked: {new Date(key.lastCheckedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => toggleKey.mutate({ id: key.id, enabled: !key.enabled })}
                      title={key.enabled ? "Disable" : "Enable"}
                    >
                      {key.enabled ? (
                        <Eye className="w-3.5 h-3.5 text-emerald" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    {!key.enabled && key.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 border-amber/30 text-amber hover:bg-amber/10"
                        onClick={() => reEnableKey.mutate({ id: key.id })}
                        disabled={reEnableKey.isPending}
                      >
                        {reEnableKey.isPending ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-2.5 h-2.5" />
                        )}
                        Re-enable
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Remove this API key?")) {
                          removeKey.mutate({ id: key.id });
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Key className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">No API keys configured</p>
          <p className="text-xs mt-1">
            Add your provider API keys to enable multi-provider failover.
            Without custom keys, AI features will not be available.
          </p>
          <p className="text-xs mt-2 text-emerald">
            Tip: Kimi (Moonshot), Groq, Cerebras, and Google Gemini offer generous free tiers!
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══ DEPLOY STATUS BANNER COMPONENT ═══ */
function DeployStatusBanner({
  status,
  onRefresh,
}: {
  status: {
    status: string;
    rawStatus?: string;
    message?: string;
    deploymentId?: string;
    createdAt?: string;
    url?: string | null;
  };
  onRefresh: () => void;
}) {
  const s = status.status;

  if (s === "no_deployment") return null;

  const isActive = s === "deploying" || s === "building";
  const isSuccess = s === "success";
  const isFailed = s === "failed";

  const bgClass = isActive
    ? "border-amber/40 bg-amber/5"
    : isSuccess
    ? "border-emerald/30 bg-emerald/5"
    : isFailed
    ? "border-destructive/30 bg-destructive/5"
    : "border-border/30 bg-muted/5";

  const icon = isActive ? (
    <Timer className="w-4 h-4 text-amber animate-pulse" />
  ) : isSuccess ? (
    <Cloud className="w-4 h-4 text-emerald" />
  ) : isFailed ? (
    <CloudOff className="w-4 h-4 text-destructive" />
  ) : (
    <Cloud className="w-4 h-4 text-muted-foreground" />
  );

  const label = isActive
    ? `Gateway ${s === "building" ? "building" : "deploying"}...`
    : isSuccess
    ? "Gateway running"
    : isFailed
    ? "Gateway deploy failed"
    : `Gateway: ${status.rawStatus ?? s}`;

  const timeAgo = status.createdAt
    ? getTimeAgo(status.createdAt)
    : null;

  return (
    <div className={`rounded-lg border px-4 py-2.5 flex items-center justify-between ${bgClass}`}>
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <span className="text-xs font-semibold">{label}</span>
          {timeAgo && (
            <span className="text-[10px] text-muted-foreground ml-2">
              {isActive ? "started" : "deployed"} {timeAgo}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status.url && isSuccess && (
          <a
            href={status.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-cyan hover:underline flex items-center gap-1"
          >
            Open <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onRefresh}
          title="Refresh status"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
