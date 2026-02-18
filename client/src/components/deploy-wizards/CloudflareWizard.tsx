import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import CopyableCommand from "./shared/CopyableCommand";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("cloudflare")!;

export default function CloudflareWizard({
  wizardState,
  buildEnvVars,
}: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);
  const envVars = buildEnvVars();

  const steps = [
    "Sign Up for Cloudflare",
    "Install Wrangler CLI",
    "Clone & Deploy",
    "Set Secrets",
  ];

  // Build wrangler secret commands from env vars
  const secretCommands = Object.entries(envVars)
    .filter(([, v]) => v && v !== "false" && v !== "my-sunclaw")
    .map(([k, v]) => `echo "${v}" | npx wrangler secret put ${k}`)
    .join("\n");

  return (
    <div className="rounded-lg border border-orange-400/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-orange-400 text-background"
                    : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              {i < subStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[11px] font-mono ${i === subStep ? "text-foreground" : "text-muted-foreground"} hidden sm:inline`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border/40" />}
          </div>
        ))}
      </div>

      {subStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">1. Sign Up for Cloudflare</h5>
            <p className="text-xs text-muted-foreground mb-3">
              You need a Cloudflare Workers Paid plan ($5/mo) for Sandbox containers. Sign up and enable Workers in your dashboard.
            </p>
            <a
              href="https://dash.cloudflare.com/sign-up"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-400/10 border border-orange-400/30 text-orange-400 text-xs font-semibold hover:bg-orange-400/20 transition-colors"
            >
              Sign up on Cloudflare
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-orange-400 text-background hover:bg-orange-400/90 gap-2">
            I have a Cloudflare account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Install Wrangler CLI</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Wrangler is Cloudflare's CLI tool for deploying Workers. Install it globally and log in to your Cloudflare account.
            </p>
          </div>
          <CopyableCommand label="Install Wrangler" code="npm install -g wrangler" />
          <CopyableCommand label="Login to Cloudflare" code="wrangler login" />
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-orange-400 text-background hover:bg-orange-400/90 gap-2">
              Wrangler is installed
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">3. Clone & Deploy MoltWorker</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Clone the MoltWorker repository and deploy it to Cloudflare Workers.
            </p>
          </div>
          <CopyableCommand
            label="Clone the repository"
            code="git clone https://github.com/nicepkg/moltworker.git && cd moltworker"
          />
          <CopyableCommand label="Install dependencies" code="npm install" />
          <CopyableCommand label="Deploy to Cloudflare" code="npm run deploy" />
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(3)} className="flex-1 bg-orange-400 text-background hover:bg-orange-400/90 gap-2">
              Deployed successfully
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">4. Set Secrets</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Set your API keys and configuration as Wrangler secrets. Run each command below in your terminal.
            </p>
          </div>
          <CopyableCommand
            label="Generate gateway token"
            code={`export MOLTBOT_GATEWAY_TOKEN=$(openssl rand -hex 32)\necho "$MOLTBOT_GATEWAY_TOKEN" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN`}
          />
          {secretCommands && (
            <CopyableCommand label="Set your config secrets" code={secretCommands} />
          )}
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">You're all set!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Access your MoltWorker at <span className="font-mono text-cyan">https://your-worker.workers.dev/?token=YOUR_TOKEN</span>.
              Consider setting up Cloudflare Access for UI protection.
            </p>
          </div>
          <Button onClick={() => setSubStep(2)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
