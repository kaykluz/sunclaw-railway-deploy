import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Radio,
  MessageSquare,
  Hash,
  Send,
  Headphones,
  Globe,
  Mail,
  Smartphone,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Copy,
  Check,
  QrCode,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import TelegramWizard from "@/components/TelegramWizard";

/* ─── Channel Definitions ─── */
interface ChannelDef {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  available: boolean;
  description: string;
  /** How this channel connects in OpenClaw */
  connectionType: "credentials" | "qr-pairing" | "built-in" | "coming-soon";
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: "text" | "password" | "textarea";
    required?: boolean;
    helpText?: string;
  }>;
  setupGuide: string[];
  /** Notes about how OpenClaw handles this channel */
  openclawNotes?: string;
}

const CHANNEL_DEFS: ChannelDef[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    available: true,
    description: "Connect using a Telegram Bot Token from @BotFather. The simplest channel to set up.",
    connectionType: "credentials",
    fields: [
      {
        key: "botToken",
        label: "Bot Token",
        placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
        type: "password",
        required: true,
        helpText: "Message @BotFather on Telegram → /newbot → copy the token",
      },
    ],
    setupGuide: [
      "Open Telegram and search for @BotFather",
      "Send /newbot and follow the prompts to create a bot",
      "Copy the Bot Token provided by BotFather",
      "Paste it below and click Connect",
      "Your bot will start responding to DMs immediately (open access by default)",
    ],
    openclawNotes: "OpenClaw connects via long-polling (no webhook URL needed). DM access is open by default — anyone can message the bot.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageSquare,
    color: "text-emerald",
    bgColor: "bg-emerald/10",
    borderColor: "border-emerald/20",
    available: true,
    description: "Connect via WhatsApp Web QR code pairing using Baileys. No Business API account needed.",
    connectionType: "qr-pairing",
    fields: [],
    setupGuide: [
      "Click Connect to start the QR code pairing process",
      "A QR code will appear — scan it with WhatsApp on your phone",
      "Go to WhatsApp → Settings → Linked Devices → Link a Device",
      "Point your camera at the QR code to pair",
      "Once paired, the bot will respond to messages on your WhatsApp number",
    ],
    openclawNotes: "OpenClaw uses Baileys (WhatsApp Web protocol) — not the official Business API. This means no Meta Business account is needed, but the connection uses your personal/business WhatsApp number. Session data is stored in the Gateway's /data volume.",
  },
  {
    id: "slack",
    name: "Slack",
    icon: Hash,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    available: true,
    description: "Install as a Slack App using Socket Mode. Requires a Slack App with Bot Token and App-Level Token.",
    connectionType: "credentials",
    fields: [
      {
        key: "botToken",
        label: "Bot Token (xoxb-...)",
        placeholder: "xoxb-1234567890-abcdef",
        type: "password",
        required: true,
        helpText: "From api.slack.com → Your App → OAuth & Permissions → Bot User OAuth Token",
      },
      {
        key: "appToken",
        label: "App-Level Token (xapp-...)",
        placeholder: "xapp-1-A0...",
        type: "password",
        required: true,
        helpText: "For Socket Mode. From api.slack.com → Your App → Basic Information → App-Level Tokens",
      },
    ],
    setupGuide: [
      "Go to api.slack.com/apps and create a new app (From Manifest recommended)",
      "Enable Socket Mode under Settings → Socket Mode",
      "Generate an App-Level Token with connections:write scope",
      "Under OAuth & Permissions, add scopes: chat:write, app_mentions:read, im:read, im:write, im:history",
      "Install the app to your workspace and copy the Bot User OAuth Token",
    ],
    openclawNotes: "OpenClaw uses Socket Mode (not webhook-based), so no public URL is needed. The bot connects outbound from the Gateway.",
  },
  {
    id: "discord",
    name: "Discord",
    icon: Headphones,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    available: true,
    description: "Add as a Discord bot to your server. Only requires a Bot Token.",
    connectionType: "credentials",
    fields: [
      {
        key: "token",
        label: "Bot Token",
        placeholder: "MTIzNDU2Nzg5MDEy...",
        type: "password",
        required: true,
        helpText: "From discord.com/developers → Your App → Bot → Reset Token → Copy",
      },
    ],
    setupGuide: [
      "Go to discord.com/developers/applications and create a new application",
      "Go to Bot section and click Reset Token to get a new token",
      "Enable MESSAGE CONTENT INTENT under Bot → Privileged Gateway Intents",
      "Under OAuth2 → URL Generator, select bot scope with Send Messages, Read Message History permissions",
      "Use the generated URL to invite the bot to your server",
      "Paste the Bot Token below and click Connect",
    ],
    openclawNotes: "OpenClaw uses Discord.js with Gateway intents. Only the bot token is needed — Application ID and Guild ID are auto-detected.",
  },
  {
    id: "webchat",
    name: "Web Chat",
    icon: Globe,
    color: "text-cyan",
    bgColor: "bg-cyan/10",
    borderColor: "border-cyan/20",
    available: true,
    description: "Built-in web chat via the OpenClaw Gateway control UI. No additional setup needed.",
    connectionType: "built-in",
    fields: [],
    setupGuide: [
      "Web Chat is automatically available through the OpenClaw Gateway control UI",
      "Access it at your Gateway URL (e.g., https://your-gateway.up.railway.app)",
      "Click 'Open Control UI' → Chat to start messaging",
      "No additional configuration needed — it works out of the box",
    ],
    openclawNotes: "The Gateway control UI includes a built-in web chat. Enable it in config with gateway.enabled: true.",
  },
  {
    id: "signal",
    name: "Signal",
    icon: Radio,
    color: "text-blue-300",
    bgColor: "bg-blue-300/10",
    borderColor: "border-blue-300/20",
    available: false,
    description: "Signal integration via signal-cli. Requires a dedicated phone number.",
    connectionType: "coming-soon",
    fields: [],
    setupGuide: [],
    openclawNotes: "OpenClaw supports Signal via signal-cli, but it requires complex server-side setup. Coming soon to SunClaw.",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: Hash,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
    available: false,
    description: "Microsoft Teams integration coming soon.",
    connectionType: "coming-soon",
    fields: [],
    setupGuide: [],
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    available: false,
    description: "Email channel integration coming soon. IMAP/SMTP or API-based.",
    connectionType: "coming-soon",
    fields: [],
    setupGuide: [],
  },
];

/* ─── Status helpers ─── */
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "connected":
      return (
        <Badge variant="outline" className="border-emerald/30 text-emerald bg-emerald/5 text-[10px] font-mono gap-1">
          <Wifi className="w-2.5 h-2.5" /> Connected
        </Badge>
      );
    case "error":
      return (
        <Badge variant="outline" className="border-red-400/30 text-red-400 bg-red-400/5 text-[10px] font-mono gap-1">
          <XCircle className="w-2.5 h-2.5" /> Error
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="border-amber/30 text-amber bg-amber/5 text-[10px] font-mono gap-1">
          <Clock className="w-2.5 h-2.5" /> Pending
        </Badge>
      );
    case "disconnected":
      return (
        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-[10px] font-mono gap-1">
          <WifiOff className="w-2.5 h-2.5" /> Disconnected
        </Badge>
      );
    default:
      return null;
  }
}

/* ─── Main Component ─── */
export default function DashboardChannels() {
  const utils = trpc.useUtils();
  const connections = trpc.channels.list.useQuery();
  const connectMutation = trpc.channels.connect.useMutation({
    onSuccess: () => {
      utils.channels.list.invalidate();
      toast.success("Channel connected — config pushed to Gateway.");
    },
    onError: (err: { message: string }) => toast.error(`Connection failed: ${err.message}`),
  });
  const disconnectMutation = trpc.channels.disconnect.useMutation({
    onSuccess: () => {
      utils.channels.list.invalidate();
      toast.info("Channel disconnected");
    },
  });
  const removeMutation = trpc.channels.remove.useMutation({
    onSuccess: () => {
      utils.channels.list.invalidate();
      toast.info("Channel removed");
    },
  });
  const verifyMutation = trpc.channels.verify.useMutation({
    onSuccess: (data: { verified: boolean }) => {
      utils.channels.list.invalidate();
      if (data.verified) toast.success("Connection verified");
      else toast.error("Verification failed");
    },
  });

  const [setupChannel, setSetupChannel] = useState<ChannelDef | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [telegramWizardOpen, setTelegramWizardOpen] = useState(false);

  const connectedChannelIds = new Set(
    (connections.data ?? [])
      .filter((c: { status: string }) => c.status !== "disconnected")
      .map((c: { channel: string }) => c.channel)
  );

  const openSetup = (ch: ChannelDef) => {
    // Use the dedicated wizard for Telegram
    if (ch.id === "telegram") {
      setTelegramWizardOpen(true);
      return;
    }
    setFormData({});
    setSetupChannel(ch);
  };

  const handleTelegramConnect = (credentials: { botToken: string }) => {
    connectMutation.mutate(
      { channel: "telegram", label: "Telegram", credentials },
      { onSuccess: () => setTelegramWizardOpen(false) }
    );
  };

  const handleConnect = () => {
    if (!setupChannel) return;
    const credentials: Record<string, unknown> = {};
    for (const field of setupChannel.fields) {
      if (formData[field.key]) {
        credentials[field.key] = formData[field.key];
      }
    }
    connectMutation.mutate(
      { channel: setupChannel.id, label: `${setupChannel.name}`, credentials },
      { onSuccess: () => setSetupChannel(null) }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Channel Connections</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect SunClaw to messaging platforms. Channels are configured in the OpenClaw Gateway config and pushed automatically.
        </p>
      </div>

      {/* Active Connections */}
      {(connections.data ?? []).length > 0 && (
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald" />
            Active Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(connections.data ?? []).map((conn: { id: number; channel: string; status: string; lastStatusMessage: string | null; webhookUrl: string | null }) => {
              const def = CHANNEL_DEFS.find((d) => d.id === conn.channel);
              const Icon = def?.icon ?? Globe;
              return (
                <Card key={conn.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${def?.bgColor ?? "bg-muted"} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${def?.color ?? "text-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{def?.name ?? conn.channel}</span>
                          <StatusBadge status={conn.status} />
                        </div>
                        {conn.lastStatusMessage && (
                          <p className="text-[11px] text-muted-foreground truncate">{conn.lastStatusMessage}</p>
                        )}
                        {conn.webhookUrl && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <code className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                              {conn.webhookUrl}
                            </code>
                            <button
                              onClick={() => copyToClipboard(conn.webhookUrl ?? "")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copied ? <Check className="w-3 h-3 text-emerald" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => verifyMutation.mutate({ id: conn.id })}
                          disabled={verifyMutation.isPending}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifyMutation.isPending ? "animate-spin" : ""}`} />
                        </Button>
                        {conn.status === "connected" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber hover:text-amber"
                            onClick={() => disconnectMutation.mutate({ id: conn.id })}
                          >
                            <WifiOff className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-400"
                            onClick={() => removeMutation.mutate({ id: conn.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Channels */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Available Channels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHANNEL_DEFS.filter((c) => c.available).map((ch) => {
            const isConnected = connectedChannelIds.has(ch.id);
            return (
              <Card
                key={ch.id}
                className={`bg-card/50 border-border/50 hover:${ch.borderColor} transition-colors cursor-pointer group`}
                onClick={() => !isConnected && openSetup(ch)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${ch.bgColor} flex items-center justify-center shrink-0`}>
                      <ch.icon className={`w-4.5 h-4.5 ${ch.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ch.name}</span>
                        {ch.connectionType === "qr-pairing" && (
                          <Badge variant="outline" className="text-[9px] border-amber/30 text-amber px-1 py-0">
                            <QrCode className="w-2.5 h-2.5 mr-0.5" />
                            QR
                          </Badge>
                        )}
                        {ch.connectionType === "built-in" && (
                          <Badge variant="outline" className="text-[9px] border-cyan/30 text-cyan px-1 py-0">
                            Auto
                          </Badge>
                        )}
                        {isConnected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{ch.description}</p>
                    </div>
                    {!isConnected && (
                      <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Coming Soon
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CHANNEL_DEFS.filter((c) => !c.available).map((ch) => (
            <Card key={ch.id} className="bg-card/30 border-border/30 opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md ${ch.bgColor} flex items-center justify-center shrink-0`}>
                    <ch.icon className={`w-4 h-4 ${ch.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{ch.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-mono">Coming soon</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Setup Dialog */}
      <Dialog open={!!setupChannel} onOpenChange={(open) => !open && setSetupChannel(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {setupChannel && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-10 h-10 rounded-lg ${setupChannel.bgColor} flex items-center justify-center`}>
                    <setupChannel.icon className={`w-5 h-5 ${setupChannel.color}`} />
                  </div>
                  <div>
                    <DialogTitle>Connect {setupChannel.name}</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">{setupChannel.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* OpenClaw Notes */}
              {setupChannel.openclawNotes && (
                <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-3 mb-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{setupChannel.openclawNotes}</p>
                  </div>
                </div>
              )}

              {/* QR Pairing Notice (WhatsApp) */}
              {setupChannel.connectionType === "qr-pairing" && (
                <div className="rounded-lg border border-amber/20 bg-amber/5 p-4 mb-2 text-center">
                  <QrCode className="w-10 h-10 text-amber mx-auto mb-2" />
                  <p className="text-xs font-medium text-amber mb-1">QR Code Pairing Required</p>
                  <p className="text-[11px] text-muted-foreground">
                    After clicking Connect, you'll need to access the OpenClaw Gateway control UI to scan the QR code with your WhatsApp app. The QR code appears in the Gateway's web interface.
                  </p>
                </div>
              )}

              {/* Built-in Channel Notice (Web Chat) */}
              {setupChannel.connectionType === "built-in" && (
                <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-4 mb-2 text-center">
                  <Globe className="w-10 h-10 text-cyan mx-auto mb-2" />
                  <p className="text-xs font-medium text-cyan mb-1">Automatically Available</p>
                  <p className="text-[11px] text-muted-foreground">
                    Web Chat is built into the OpenClaw Gateway. It's enabled by default when the Gateway is deployed. Access it through the Gateway control UI.
                  </p>
                </div>
              )}

              {/* Setup Guide */}
              {setupChannel.setupGuide.length > 0 && (
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 mb-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Setup Guide</h4>
                  <div className="space-y-1.5">
                    {setupChannel.setupGuide.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credential Fields (only for credential-based channels) */}
              {setupChannel.connectionType === "credentials" && setupChannel.fields.length > 0 && (
                <div className="space-y-3">
                  {setupChannel.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </Label>
                      <Input
                        type={field.type ?? "text"}
                        placeholder={field.placeholder}
                        value={formData[field.key] ?? ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="text-xs font-mono"
                      />
                      {field.helpText && (
                        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          {field.helpText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setSetupChannel(null)}>
                  Cancel
                </Button>
                {setupChannel.connectionType !== "built-in" && (
                  <Button
                    onClick={handleConnect}
                    disabled={connectMutation.isPending}
                    className="bg-cyan text-background hover:bg-cyan/90 gap-1.5"
                  >
                    {connectMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : setupChannel.connectionType === "qr-pairing" ? (
                      <QrCode className="w-3.5 h-3.5" />
                    ) : (
                      <Wifi className="w-3.5 h-3.5" />
                    )}
                    {setupChannel.connectionType === "qr-pairing" ? "Start Pairing" : "Connect"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Telegram BotFather Wizard */}
      <TelegramWizard
        open={telegramWizardOpen}
        onOpenChange={setTelegramWizardOpen}
        onConnect={handleTelegramConnect}
        isConnecting={connectMutation.isPending}
      />
    </div>
  );
}
