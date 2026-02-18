import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Shield,
  Bot,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";

interface TelegramWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (credentials: { botToken: string }) => void;
  isConnecting: boolean;
}

interface BotInfo {
  ok: boolean;
  username?: string;
  firstName?: string;
  canJoinGroups?: boolean;
  canReadMessages?: boolean;
}

const STEPS = [
  { id: 1, title: "Open BotFather", short: "BotFather" },
  { id: 2, title: "Create Your Bot", short: "Create" },
  { id: 3, title: "Copy Token", short: "Token" },
  { id: 4, title: "Paste & Verify", short: "Verify" },
  { id: 5, title: "Connect", short: "Connect" },
];

export default function TelegramWizard({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
}: TelegramWizardProps) {
  const [step, setStep] = useState(1);
  const [botToken, setBotToken] = useState("");
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [validating, setValidating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const resetWizard = useCallback(() => {
    setStep(1);
    setBotToken("");
    setBotInfo(null);
    setValidating(false);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) resetWizard();
    onOpenChange(open);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`Copied: ${text}`);
  };

  const validateToken = async () => {
    if (!botToken.trim()) {
      toast.error("Please paste your bot token first");
      return;
    }

    // Basic format check: should be like 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
    const tokenRegex = /^\d+:[A-Za-z0-9_-]{35,}$/;
    if (!tokenRegex.test(botToken.trim())) {
      toast.error("Invalid token format. It should look like: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ");
      return;
    }

    setValidating(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
      const data = await response.json();

      if (data.ok) {
        setBotInfo({
          ok: true,
          username: data.result.username,
          firstName: data.result.first_name,
          canJoinGroups: data.result.can_join_groups,
          canReadMessages: data.result.can_read_all_group_messages,
        });
        toast.success(`Token verified! Bot: @${data.result.username}`);
        setStep(5);
      } else {
        setBotInfo({ ok: false });
        toast.error("Invalid token — Telegram rejected it. Please check and try again.");
      }
    } catch {
      toast.error("Could not reach Telegram API. Check your connection and try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleConnect = () => {
    onConnect({ botToken: botToken.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-xl bg-blue-400/10 flex items-center justify-center">
                <Send className="w-5.5 h-5.5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-base">Connect Telegram Bot</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Step-by-step guide to create and connect your Telegram bot
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-1 mt-5 mb-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => {
                    // Only allow going back, not forward past current progress
                    if (s.id <= step) setStep(s.id);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all w-full justify-center ${
                    s.id === step
                      ? "bg-blue-400/15 text-blue-400 border border-blue-400/30"
                      : s.id < step
                        ? "bg-emerald/10 text-emerald border border-emerald/20 cursor-pointer"
                        : "bg-muted/30 text-muted-foreground/50 border border-transparent"
                  }`}
                >
                  {s.id < step ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                      s.id === step ? "bg-blue-400/20" : "bg-muted/50"
                    }`}>
                      {s.id}
                    </span>
                  )}
                  <span className="hidden sm:inline">{s.short}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`w-3 h-3 shrink-0 ${s.id < step ? "text-emerald/50" : "text-muted-foreground/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6">
          {/* Step 1: Open BotFather */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/15 flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Open @BotFather on Telegram</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      BotFather is Telegram's official bot for creating and managing bots.
                      Click the button below to open it directly in Telegram.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    className="w-full bg-blue-400 text-white hover:bg-blue-500 gap-2 h-10"
                    onClick={() => window.open("https://t.me/BotFather", "_blank")}
                  >
                    <Send className="w-4 h-4" />
                    Open @BotFather in Telegram
                    <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Opens in Telegram app or web — make sure you're logged in
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Security note:</strong> Only use the official @BotFather
                    (verified with a blue checkmark). Never share your bot token with anyone else.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="gap-1.5">
                  I've opened BotFather
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Create Bot */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Send these commands to BotFather
                </h3>

                <div className="space-y-3">
                  {/* Command 1 */}
                  <div className="rounded-lg bg-background/80 border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[9px] border-blue-400/30 text-blue-400 px-1.5">
                        Step 1
                      </Badge>
                      <button
                        onClick={() => copyText("/newbot", "newbot")}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px]"
                      >
                        {copied === "newbot" ? <Check className="w-3 h-3 text-emerald" /> : <Clipboard className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <code className="text-sm font-mono text-blue-400 font-semibold">/newbot</code>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Send this command to start creating a new bot
                    </p>
                  </div>

                  {/* Command 2 */}
                  <div className="rounded-lg bg-background/80 border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[9px] border-blue-400/30 text-blue-400 px-1.5">
                        Step 2
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">Enter your bot's display name</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      BotFather will ask: <em>"Alright, a new bot. How are we going to call it?"</em>
                      <br />
                      Type a friendly name like <code className="text-blue-400 bg-blue-400/10 px-1 rounded">SunClaw Energy Assistant</code>
                    </p>
                  </div>

                  {/* Command 3 */}
                  <div className="rounded-lg bg-background/80 border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[9px] border-blue-400/30 text-blue-400 px-1.5">
                        Step 3
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">Choose a username (must end in "bot")</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      BotFather will ask: <em>"Now let's choose a username..."</em>
                      <br />
                      Type a unique username like <code className="text-blue-400 bg-blue-400/10 px-1 rounded">MySunClawBot</code>
                      <br />
                      <span className="text-amber text-[10px]">Must end with "bot" or "Bot" and be unique on Telegram</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber/20 bg-amber/5 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Tip:</strong> After step 3, BotFather will respond with a
                    message containing your <strong>bot token</strong>. It looks like{" "}
                    <code className="text-[10px] bg-muted/50 px-1 rounded">123456789:ABCdefGHIjklMNOpqrSTUvwxYZ</code>.
                    You'll need this in the next step.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="gap-1.5">
                  I've created my bot
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Copy Token */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-blue-400" />
                  Copy Your Bot Token
                </h3>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    BotFather should have sent you a message that looks like this:
                  </p>

                  {/* Mock BotFather message */}
                  <div className="rounded-lg bg-background border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-xs font-medium">BotFather</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1.5 pl-8">
                      <p>Done! Congratulations on your new bot.</p>
                      <p>You will find it at <span className="text-blue-400">t.me/YourBotName</span></p>
                      <p>Use this token to access the HTTP API:</p>
                      <div className="bg-muted/50 rounded px-2 py-1.5 font-mono text-[11px] text-foreground break-all">
                        123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
                      </div>
                      <p className="text-[10px] text-amber">
                        Keep your token secure and store it safely.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber/20 bg-amber/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Copy the entire token</strong> — including the numbers before
                        the colon and the letters after it. Don't add any extra spaces.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="gap-1.5">
                  I've copied the token
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Paste & Verify */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Paste & Verify Your Token
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Bot Token</label>
                    <Input
                      type="password"
                      placeholder="Paste your bot token here..."
                      value={botToken}
                      onChange={(e) => {
                        setBotToken(e.target.value);
                        setBotInfo(null);
                      }}
                      className="font-mono text-xs h-10"
                      autoFocus
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Format: <code>123456789:ABCdefGHIjklMNOpqrSTUvwxYZ</code>
                    </p>
                  </div>

                  <Button
                    onClick={validateToken}
                    disabled={validating || !botToken.trim()}
                    className="w-full gap-2 h-9"
                    variant={botInfo?.ok ? "outline" : "default"}
                  >
                    {validating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Validating with Telegram...
                      </>
                    ) : botInfo?.ok ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                        Verified — @{botInfo.username}
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        Verify Token
                      </>
                    )}
                  </Button>

                  {/* Bot Info Card */}
                  {botInfo?.ok && (
                    <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald/15 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-emerald" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{botInfo.firstName}</p>
                          <p className="text-xs text-emerald font-mono">@{botInfo.username}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald ml-auto" />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${botInfo.canJoinGroups ? "bg-emerald" : "bg-muted-foreground"}`} />
                          Can join groups: {botInfo.canJoinGroups ? "Yes" : "No"}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${botInfo.canReadMessages ? "bg-emerald" : "bg-muted-foreground"}`} />
                          Read group messages: {botInfo.canReadMessages ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {botInfo && !botInfo.ok && (
                    <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-red-400">Token Invalid</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Telegram rejected this token. Please go back to BotFather and copy the token again.
                            Make sure you copy the entire token including the numbers and colon.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                {botInfo?.ok && (
                  <Button onClick={() => setStep(5)} className="gap-1.5">
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Connect */}
          {step === 5 && botInfo?.ok && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald/15 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald" />
                </div>
                <h3 className="font-semibold text-base mb-1">Ready to Connect!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your bot <strong className="text-foreground">@{botInfo.username}</strong> ({botInfo.firstName}) is
                  verified and ready to be connected to SunClaw.
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">What happens next</h4>
                <div className="space-y-1.5">
                  {[
                    "Your bot token is securely saved and encrypted",
                    "The OpenClaw Gateway config is updated with Telegram enabled",
                    "The Gateway redeploys with your bot connected",
                    "Within 2-3 minutes, your bot will start responding to messages",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-emerald text-white hover:bg-emerald/90 gap-2 h-10 px-6"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Connect @{botInfo.username}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
