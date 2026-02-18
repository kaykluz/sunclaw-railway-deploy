import { ExternalLink } from "lucide-react";
import type { PlatformDefinition } from "@/lib/platforms";

interface PlatformHeaderProps {
  platform: PlatformDefinition;
}

const complexityLabels: Record<string, { text: string; color: string }> = {
  beginner: { text: "Beginner-Friendly", color: "text-emerald border-emerald/30 bg-emerald/10" },
  intermediate: { text: "Intermediate", color: "text-amber border-amber/30 bg-amber/10" },
  developer: { text: "Developer", color: "text-violet-400 border-violet-400/30 bg-violet-400/10" },
};

export default function PlatformHeader({ platform }: PlatformHeaderProps) {
  const complexity = complexityLabels[platform.complexity];

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-${platform.color}/10 flex items-center justify-center`}>
          <platform.icon className={`w-5 h-5 text-${platform.color}`} />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{platform.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-muted-foreground">
              {platform.pricing.startingPrice}
              {platform.pricing.free && " (free tier)"}
            </span>
            <span className="text-border">|</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${complexity.color}`}>
              {complexity.text}
            </span>
            <span className="text-border">|</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {platform.setupTime}
            </span>
          </div>
        </div>
      </div>
      {platform.signupUrl && (
        <a
          href={platform.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-mono text-cyan hover:text-cyan/80 shrink-0"
        >
          Visit site
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
