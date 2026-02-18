import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorVia?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 6,
  borderWidth = 1.5,
  colorFrom = "transparent",
  colorVia = "rgba(163, 163, 163, 0.5)",
  colorTo = "transparent",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        borderWidth,
        borderStyle: "solid",
        borderColor: "transparent",
        WebkitMask:
          "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        backgroundImage: `conic-gradient(from calc(var(--border-beam-angle) * 1deg), ${colorFrom}, ${colorVia} calc(var(--border-beam-size) * 0.5), ${colorTo} var(--border-beam-size))`,
        animation: `border-beam-spin ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        ["--border-beam-size" as string]: `${size}px`,
      }}
    >
      <style>{`
        @keyframes border-beam-spin {
          from { --border-beam-angle: 0; }
          to { --border-beam-angle: 360; }
        }
        @property --border-beam-angle {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
      `}</style>
    </div>
  );
}
