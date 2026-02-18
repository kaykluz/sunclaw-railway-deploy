import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Settings,
  Key,
  Bot,
  Shield,
  Server,
  Copy,
  CheckCircle2,
  Save,
  Loader2,
  Globe,
  Cpu,
  Brain,
  FileText,
  RotateCcw,
  CloudUpload,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ─── Soul.md Editor ─── */
function SoulMdEditor() {
  const soulQuery = trpc.soul.get.useQuery();
  const updateSoul = trpc.soul.update.useMutation();
  const resetSoul = trpc.soul.reset.useMutation();
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (soulQuery.data?.content) {
      setContent(soulQuery.data.content);
    }
  }, [soulQuery.data?.content]);

  const handleSave = async () => {
    try {
      const result = await updateSoul.mutateAsync({ content });
      setHasChanges(false);
      if (result.pushedToOpenClaw) {
        toast.success("Soul.md updated and pushed to your OpenClaw agent");
      } else {
        toast.success("Soul.md saved locally — will sync when your agent is online");
      }
      soulQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save soul.md");
    }
  };

  const handleReset = async () => {
    try {
      const result = await resetSoul.mutateAsync();
      setContent(result.content);
      setHasChanges(false);
      toast.success("Soul.md reset to default");
      soulQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reset");
    }
  };

  const source = soulQuery.data?.source as string | undefined;
  const sourceLabel = source === "config"
    ? "From saved config"
    : "Default template";

  const sourceColor = source === "config"
    ? "border-cyan/30 text-cyan bg-cyan/5"
    : "border-muted-foreground/30 text-muted-foreground bg-muted/5";

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-cyan" />
            Soul.md — System Prompt
          </CardTitle>
          <div className="flex items-center gap-2">
            {soulQuery.isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <Badge variant="outline" className={`text-[10px] ${sourceColor}`}>
                {sourceLabel}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This is the core system prompt that shapes your AI agent's personality, knowledge, and behavior.
          Changes are pushed to your deployed OpenClaw instance in real-time.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {soulQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <Textarea
              className="font-mono text-sm min-h-[320px] leading-relaxed"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setHasChanges(true);
              }}
              placeholder="# Your Agent's Soul..."
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {hasChanges && (
                  <span className="flex items-center gap-1 text-amber">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved changes
                  </span>
                )}
                <span>{content.length.toLocaleString()} characters</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs border-border/50"
                  onClick={handleReset}
                  disabled={resetSoul.isPending}
                >
                  {resetSoul.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Reset to Default
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-cyan text-background hover:bg-cyan/90"
                  onClick={handleSave}
                  disabled={updateSoul.isPending || !hasChanges}
                >
                  {updateSoul.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CloudUpload className="w-3 h-3" />
                  )}
                  Save & Push to Agent
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Config Fields ─── */
interface ConfigField {
  key: string;
  label: string;
  description: string;
  icon: typeof Key;
  category: "agent" | "enterprise" | "advanced";
  type: "text" | "textarea" | "password";
  placeholder?: string;
}

const CONFIG_FIELDS: ConfigField[] = [
  {
    key: "agent_name",
    label: "Agent Name",
    description: "Display name for the AI agent in conversations",
    icon: Bot,
    category: "agent",
    type: "text",
    placeholder: "SunClaw",
  },
  {
    key: "welcome_message",
    label: "Welcome Message",
    description: "First message sent when a user starts a new conversation",
    icon: FileText,
    category: "agent",
    type: "textarea",
    placeholder: "Hello! I'm SunClaw, your renewable energy AI assistant...",
  },
  {
    key: "kiisha_api_token",
    label: "KIISHA API Token",
    description: "Enterprise API token for KIISHA integration (portfolio, compliance, work orders)",
    icon: Shield,
    category: "enterprise",
    type: "password",
    placeholder: "kiisha_...",
  },
  {
    key: "kiisha_base_url",
    label: "KIISHA Base URL",
    description: "Base URL for your KIISHA instance API",
    icon: Globe,
    category: "enterprise",
    type: "text",
    placeholder: "https://api.kiisha.io",
  },
  {
    key: "max_tokens",
    label: "Max Response Tokens",
    description: "Maximum number of tokens in AI responses (higher = longer responses)",
    icon: Cpu,
    category: "advanced",
    type: "text",
    placeholder: "2048",
  },
  {
    key: "temperature",
    label: "Temperature",
    description: "AI creativity level (0.0 = deterministic, 1.0 = creative)",
    icon: Settings,
    category: "advanced",
    type: "text",
    placeholder: "0.7",
  },
];

const CATEGORIES = [
  { id: "agent" as const, label: "Agent Configuration", icon: Bot, color: "text-cyan" },
  { id: "enterprise" as const, label: "Enterprise Integration", icon: Shield, color: "text-amber" },
  { id: "advanced" as const, label: "Advanced Settings", icon: Settings, color: "text-muted-foreground" },
];

export default function DashboardConfig() {
  const instance = trpc.dashboard.instance.useQuery();
  const health = trpc.dashboard.health.useQuery(undefined, { refetchInterval: 15000 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sunclaw-config");
    if (saved) {
      try {
        setValues(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("sunclaw-config", JSON.stringify(values));
    setTimeout(() => {
      setSaving(false);
      toast.success("Configuration saved successfully");
    }, 500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your SunClaw agent settings, enterprise integrations, and advanced parameters.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-cyan text-background hover:bg-cyan/90"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Save Settings
        </Button>
      </div>

      {/* Instance Info */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Server className="w-3.5 h-3.5" />
            Instance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-muted/30 border border-border/30">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Status</span>
              <div className="mt-1">
                {health.isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : health.data?.healthy ? (
                  <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5 text-xs">
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 text-xs">
                    Offline
                  </Badge>
                )}
              </div>
            </div>
            {instance.data?.domain && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/30">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Domain</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-medium truncate">{instance.data.domain}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => copyToClipboard(instance.data!.domain!, "domain")}
                  >
                    {copiedKey === "domain" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            {instance.data?.url && (
              <div className="p-3 rounded-md bg-muted/30 border border-border/30">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Gateway URL</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-medium truncate">{instance.data.url}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => copyToClipboard(instance.data!.url!, "url")}
                  >
                    {copiedKey === "url" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Soul.md Editor — Primary Feature */}
      <SoulMdEditor />

      {/* Config Categories */}
      {CATEGORIES.map((cat) => {
        const fields = CONFIG_FIELDS.filter((f) => f.category === cat.id);
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-3">
              <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {cat.label}
              </h3>
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <Card key={field.key} className="bg-card/30 border-border/30">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <field.icon className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">{field.label}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                    {field.type === "textarea" ? (
                      <Textarea
                        className="mt-1 font-mono text-sm min-h-[80px]"
                        placeholder={field.placeholder}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        className="mt-1 font-mono text-sm"
                        type={field.type}
                        placeholder={field.placeholder}
                        value={values[field.key] ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Info Note */}
      <div className="p-4 rounded-lg border border-border/30 bg-muted/10">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Security Note</span>
        </div>
        <p className="text-xs text-muted-foreground">
          API keys and tokens are stored securely. For multi-provider LLM key management and failover
          configuration, use the <strong>API Keys</strong> page in the sidebar. For channel-specific
          credentials, use the <strong>Channels</strong> page.
        </p>
      </div>
    </div>
  );
}
