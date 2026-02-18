import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import CopyableCommand from "./shared/CopyableCommand";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("alibaba")!;

export default function AlibabaWizard({ envContent }: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    "Sign Up on Alibaba Cloud",
    "Create Application Server",
    "Configure & Launch",
  ];

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
            <h5 className="text-sm font-semibold mb-2">1. Sign Up on Alibaba Cloud</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Alibaba Cloud offers a Simple Application Server (SAS) starting at $0.99/mo for new users. It's pre-configured with the OpenClaw image for one-click setup. Best for APAC-facing enterprises.
            </p>
            <div className="space-y-2 mb-4">
              {["Starting at $0.99/mo (promo)", "Pre-built OpenClaw image", "Qwen/Model Studio integration", "Global multi-region deployment"].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px]">
                  <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <a
              href="https://www.alibabacloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-400/10 border border-orange-400/30 text-orange-400 text-xs font-semibold hover:bg-orange-400/20 transition-colors"
            >
              Sign up on Alibaba Cloud
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-orange-400 text-background hover:bg-orange-400/90 gap-2">
            I have an account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Create a Simple Application Server</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Create a Simple Application Server with the OpenClaw application image. We recommend 2 vCPUs and 2 GiB memory as a starting configuration.
            </p>
            <ol className="text-xs text-muted-foreground space-y-2 mb-4 font-mono">
              <li className="flex gap-2"><span className="text-orange-400 font-bold">1.</span> Go to Simple Application Server in your console</li>
              <li className="flex gap-2"><span className="text-orange-400 font-bold">2.</span> Select the OpenClaw application image</li>
              <li className="flex gap-2"><span className="text-orange-400 font-bold">3.</span> Choose 2 vCPUs / 2 GiB (or higher)</li>
              <li className="flex gap-2"><span className="text-orange-400 font-bold">4.</span> Activate Model Studio for your API key</li>
            </ol>
            <a
              href="https://www.alibabacloud.com/en/campaign/ai-openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-400/80 font-mono"
            >
              View OpenClaw on Alibaba Cloud
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-orange-400 text-background hover:bg-orange-400/90 gap-2">
              Server is created
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">3. Configure & Launch</h5>
            <p className="text-xs text-muted-foreground mb-3">
              SSH into your server and run the setup script. Alternatively, if you selected the OpenClaw image, it's already pre-installed — just configure the environment.
            </p>
          </div>
          <CopyableCommand
            label="SSH into your server and run"
            code="curl -fsSL https://raw.githubusercontent.com/kaykluz/sunclaw/main/scripts/setup.sh | bash"
          />
          <EnvVarsPreview envContent={envContent} label="Your Configuration (.env)" />
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">You're all set!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your SunClaw instance is running on Alibaba Cloud. For Qwen/Model Studio integration, activate Model Studio in your Alibaba Cloud console and use the API key in your config.
            </p>
          </div>
          <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
