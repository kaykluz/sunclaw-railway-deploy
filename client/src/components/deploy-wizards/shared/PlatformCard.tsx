import type { PlatformDefinition } from "@/lib/platforms";

interface PlatformCardProps {
  platform: PlatformDefinition;
  selected?: boolean;
  onClick?: () => void;
  mode: "homepage" | "wizard";
}

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  amber: {
    border: "border-amber/60",
    bg: "bg-amber/5",
    text: "text-amber",
    badge: "bg-amber/10 border-amber/20 text-amber",
  },
  cyan: {
    border: "border-cyan/60",
    bg: "bg-cyan/5",
    text: "text-cyan",
    badge: "bg-cyan/10 border-cyan/20 text-cyan",
  },
  violet: {
    border: "border-violet-400/60",
    bg: "bg-violet-400/5",
    text: "text-violet-400",
    badge: "bg-violet-400/10 border-violet-400/20 text-violet-400",
  },
  emerald: {
    border: "border-emerald/60",
    bg: "bg-emerald/5",
    text: "text-emerald",
    badge: "bg-emerald/10 border-emerald/20 text-emerald",
  },
  blue: {
    border: "border-blue-400/60",
    bg: "bg-blue-400/5",
    text: "text-blue-400",
    badge: "bg-blue-400/10 border-blue-400/20 text-blue-400",
  },
  orange: {
    border: "border-orange-400/60",
    bg: "bg-orange-400/5",
    text: "text-orange-400",
    badge: "bg-orange-400/10 border-orange-400/20 text-orange-400",
  },
  neutral: {
    border: "border-border",
    bg: "bg-secondary/5",
    text: "text-muted-foreground",
    badge: "bg-secondary/50 border-border/40 text-muted-foreground",
  },
};

export default function PlatformCard({
  platform,
  selected,
  onClick,
  mode,
}: PlatformCardProps) {
  const colors = colorMap[platform.color] ?? colorMap.neutral;

  if (mode === "homepage") {
    return (
      <a
        href={`/setup?platform=${platform.id}`}
        className={`block text-left p-5 rounded-xl border ${colors.border.replace("/60", "/20")} bg-card/30 hover:${colors.border.replace("/60", "/40")} transition-colors`}
      >
        <div className="flex items-center gap-2 mb-2">
          <platform.icon className={`w-5 h-5 ${colors.text}`} />
          <span className="font-semibold text-sm">{platform.name}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{platform.tagline}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground">
            {platform.pricing.startingPrice}
            {platform.pricing.free ? " / free" : "/mo"}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${colors.badge}`}>
            {platform.setupTime}
          </span>
        </div>
      </a>
    );
  }

  // wizard mode
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-lg border transition-all ${
        selected
          ? `${colors.border} ${colors.bg} ring-1 ring-${platform.color}/20`
          : "border-border/50 bg-card/30 hover:border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <platform.icon className={`w-4 h-4 ${colors.text}`} />
        <span className="font-semibold text-xs">{platform.name}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mb-2">
        {platform.tagline}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">
          {platform.pricing.startingPrice}
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${colors.badge}`}>
          {platform.setupTime}
        </span>
      </div>
    </button>
  );
}
