import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  height?: string;
  position?: "top" | "bottom";
}

export function ProgressiveBlur({
  className,
  height = "80px",
  position = "bottom",
}: ProgressiveBlurProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 pointer-events-none z-10",
        position === "bottom" ? "bottom-0" : "top-0",
        className
      )}
      style={{
        height,
        background:
          position === "bottom"
            ? "linear-gradient(to top, #0a0a0a 0%, transparent 100%)"
            : "linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)",
      }}
    />
  );
}
