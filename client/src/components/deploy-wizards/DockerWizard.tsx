import { CheckCircle2, Check } from "lucide-react";
import { getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import CopyableCommand from "./shared/CopyableCommand";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("docker")!;

export default function DockerWizard({ envContent }: PlatformWizardProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      <div className="rounded-lg bg-background/40 border border-border/30 p-4">
        <h5 className="text-sm font-semibold mb-3">Self-Hosted — One-Line Install</h5>
        <p className="text-xs text-muted-foreground mb-4">
          Run on your own server with full control. The script auto-detects your OS and installs Docker, Docker Compose, and Git if they're missing. Then it clones SunClaw, walks you through configuration, and starts everything.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            "Installs Docker & Compose",
            "Installs Git & curl",
            "Clones SunClaw repo",
            "Writes your .env config",
            "Pulls all Docker images",
            "Starts SunClaw services",
            "Sets up auto-restart",
            "Opens firewall ports",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <CopyableCommand
        label="Paste on any Linux/macOS machine"
        code="curl -fsSL https://raw.githubusercontent.com/kaykluz/sunclaw/main/scripts/setup.sh | bash"
      />

      <p className="text-[10px] text-muted-foreground">
        Works on Ubuntu, Debian, CentOS, RHEL, macOS. Installs all dependencies automatically.
      </p>

      <EnvVarsPreview envContent={envContent} label="Your Pre-Built Configuration (.env)" />

      <div className="rounded-lg border border-emerald/20 bg-emerald/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-emerald" />
          <span className="text-xs font-semibold text-emerald">Ready to install</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your configuration is pre-built from the choices you made above. Save the .env block to your server first, then run the install command. The script will detect the .env file and skip interactive setup.
        </p>
      </div>

      <div className="rounded-lg border border-border/30 bg-background/40 p-3">
        <p className="text-[10px] text-muted-foreground">
          <strong className="text-foreground/80">Requirements:</strong> Ubuntu 20.04+, Debian 11+, CentOS 8+, or macOS 12+. Minimum 2GB RAM, 10GB disk. The script will install Docker, Docker Compose, and Git if they're missing.
        </p>
      </div>
    </div>
  );
}
