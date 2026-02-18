import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("emergent")!;

export default function EmergentWizard({ envContent }: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    "Sign Up on Emergent.sh",
    "Launch MoltBot Chip",
    "Configure & Connect",
  ];

  return (
    <div className="rounded-lg border border-emerald/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-emerald text-background"
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
            <h5 className="text-sm font-semibold mb-2">1. Sign Up on Emergent.sh</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Emergent.sh is the fastest way to deploy OpenClaw — no terminal required. Create a free account and you can have a running instance in under 5 minutes.
            </p>
            <a
              href="https://emergent.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold hover:bg-emerald/20 transition-colors"
            >
              Sign up on Emergent.sh
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-emerald text-background hover:bg-emerald/90 gap-2">
            I have an account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Launch a MoltBot Chip</h5>
            <p className="text-xs text-muted-foreground mb-3">
              On the Emergent dashboard, look for the MoltBot chip (the red lobster icon). Click it to launch a pre-built OpenClaw instance.
            </p>
            <ol className="text-xs text-muted-foreground space-y-2 mb-4 font-mono">
              <li className="flex gap-2"><span className="text-emerald font-bold">1.</span> Find the MoltBot chip on the homepage</li>
              <li className="flex gap-2"><span className="text-emerald font-bold">2.</span> Click "Launch" to create your instance</li>
              <li className="flex gap-2"><span className="text-emerald font-bold">3.</span> Wait for provisioning to complete (~1-2 min)</li>
            </ol>
            <a
              href="https://emergent.sh/tutorial/moltbot-on-emergent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-emerald hover:text-emerald/80 font-mono"
            >
              View full tutorial
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-emerald text-background hover:bg-emerald/90 gap-2">
              Chip is running
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">3. Configure & Connect</h5>
            <p className="text-xs text-muted-foreground mb-3">
              In your Emergent chip settings, paste the environment variables below to configure your AI provider and messaging channels. You can also use the chip's built-in config panel.
            </p>
          </div>
          <EnvVarsPreview envContent={envContent} />
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">You're all set!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click "Publish" in the top-right of Emergent to ensure your bot stays online 24/7. Your SunClaw instance is now running on Emergent's infrastructure.
            </p>
          </div>
          <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
