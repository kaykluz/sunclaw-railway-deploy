import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("northflank")!;

export default function NorthflankWizard({ envContent }: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    "Sign Up on Northflank",
    "Deploy Stack",
    "Configure & Verify",
  ];

  return (
    <div className="rounded-lg border border-blue-400/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-blue-400 text-background"
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
            <h5 className="text-sm font-semibold mb-2">1. Sign Up on Northflank</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Northflank offers a free tier and one-click templates for quick deployment. Create an account to get started — no credit card required for the free tier.
            </p>
            <a
              href="https://northflank.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400/10 border border-blue-400/30 text-blue-400 text-xs font-semibold hover:bg-blue-400/20 transition-colors"
            >
              Sign up on Northflank
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-blue-400 text-background hover:bg-blue-400/90 gap-2">
            I have an account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Deploy the OpenClaw Stack</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Click the button below to deploy the OpenClaw stack on Northflank. Set the <span className="font-mono text-blue-400">SETUP_PASSWORD</span> environment variable during setup.
            </p>
            <a
              href="https://northflank.com/stacks/deploy-openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-blue-400 text-background font-semibold text-sm hover:bg-blue-400/90 transition-colors"
            >
              Deploy to Northflank
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-blue-400 text-background hover:bg-blue-400/90 gap-2">
              Stack is deployed
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">3. Configure & Verify</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Open your Northflank service URL and navigate to <span className="font-mono text-blue-400">/setup</span>. Enter your SETUP_PASSWORD and configure your AI provider and channels using the values below.
            </p>
          </div>
          <EnvVarsPreview envContent={envContent} />
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">You're all set!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your SunClaw instance is now running on Northflank with persistent storage.
            </p>
          </div>
          <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
