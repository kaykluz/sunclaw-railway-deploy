import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import CopyableCommand from "./shared/CopyableCommand";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("hostinger")!;

export default function HostingerWizard({ envContent }: PlatformWizardProps) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    "Get a Hostinger VPS",
    "Install SunClaw",
    "Configure & Launch",
  ];

  return (
    <div className="rounded-lg border border-violet-400/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-violet-400 text-background"
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
            <h5 className="text-sm font-semibold mb-2">1. Get a Hostinger VPS</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Get a KVM VPS from Hostinger starting at $5.99/mo. We recommend the KVM 2 plan (2 vCPUs, 8GB RAM) for smooth performance. Select the OpenClaw Docker template during checkout for one-click setup.
            </p>
            <div className="space-y-2 mb-4">
              {["Dedicated IP address", "99.9% uptime guarantee", "Full root SSH access", "OpenClaw Docker template available"].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px]">
                  <Check className="w-3 h-3 text-violet-400 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <a
              href="https://www.hostinger.com/vps/docker/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-400/10 border border-violet-400/30 text-violet-400 text-xs font-semibold hover:bg-violet-400/20 transition-colors"
            >
              Get Hostinger VPS
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-violet-400 text-background hover:bg-violet-400/90 gap-2">
            I have my VPS ready
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Install SunClaw</h5>
            <p className="text-xs text-muted-foreground mb-3">
              SSH into your Hostinger VPS and run the one-line install script. It auto-detects your OS and installs Docker, dependencies, and SunClaw.
            </p>
          </div>
          <CopyableCommand
            label="SSH into your VPS and run"
            code="curl -fsSL https://raw.githubusercontent.com/kaykluz/sunclaw/main/scripts/setup.sh | bash"
          />
          <p className="text-[10px] text-muted-foreground">
            The script will guide you through the configuration interactively. Or you can pre-configure using the environment variables from the next step.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setSubStep(0)} variant="outline" className="border-border/40">Back</Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-violet-400 text-background hover:bg-violet-400/90 gap-2">
              Script is running
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
              Your configuration is pre-built from the choices you made. When the setup script asks for configuration, paste the block below. Or save it as a <span className="font-mono text-violet-400">.env</span> file in the SunClaw directory before running the script.
            </p>
          </div>
          <EnvVarsPreview envContent={envContent} label="Your Pre-Built Configuration (.env)" />
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald" />
              <span className="text-xs font-semibold text-emerald">You're all set!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your SunClaw instance should now be running. Access it at <span className="font-mono text-cyan">http://your-vps-ip:3000</span>
            </p>
          </div>
          <Button onClick={() => setSubStep(1)} variant="outline" className="border-border/40">Back</Button>
        </motion.div>
      )}
    </div>
  );
}
