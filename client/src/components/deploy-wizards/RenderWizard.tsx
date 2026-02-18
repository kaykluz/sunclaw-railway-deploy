import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("render")!;

export default function RenderWizard({ envContent }: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    "Create a Render Account",
    "Configure & Deploy",
    "You're Live",
  ];

  return (
    <div className="rounded-lg border border-cyan/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-cyan text-background"
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
            <h5 className="text-sm font-semibold mb-2">1. Create a Render Account</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Render offers a free tier that's perfect for trying out SunClaw. Sign up with GitHub for the fastest setup. Paid plans start at $7/mo for always-on services.
            </p>
            <a
              href="https://render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold hover:bg-cyan/20 transition-colors"
            >
              Sign up on Render
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-cyan text-background hover:bg-cyan/90 gap-2">
            I have a Render account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Deploy from Blueprint</h5>
            <p className="text-xs text-muted-foreground mb-3">
              First copy your environment variables below, then click "Deploy to Render". Paste them into Render's environment variable section during setup.
            </p>
          </div>
          <EnvVarsPreview envContent={envContent} label="Copy these first — paste into Render during deploy" />
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <ol className="text-xs text-muted-foreground space-y-2 mb-4 font-mono">
              <li className="flex gap-2"><span className="text-cyan font-bold">1.</span> Copy the environment variables above</li>
              <li className="flex gap-2"><span className="text-cyan font-bold">2.</span> Click "Deploy to Render" below</li>
              <li className="flex gap-2"><span className="text-cyan font-bold">3.</span> Paste env vars into the Environment section</li>
              <li className="flex gap-2"><span className="text-cyan font-bold">4.</span> Click "Create Web Service"</li>
            </ol>
            <a
              href="https://render.com/deploy?repo=https://github.com/kaykluz/sunclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-cyan text-background font-semibold text-sm hover:bg-cyan/90 transition-colors"
            >
              Deploy to Render
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-cyan text-background hover:bg-cyan/90 gap-2">
              I've deployed
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">Ready!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your environment variables were configured during deploy. Once your service is live, visit your Render URL + <span className="font-mono text-cyan">/setup</span> to complete the configuration.
            </p>
          </div>
          <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
