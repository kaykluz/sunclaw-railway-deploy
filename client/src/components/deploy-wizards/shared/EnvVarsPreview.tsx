import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface EnvVarsPreviewProps {
  envContent: string;
  label?: string;
}

export default function EnvVarsPreview({
  envContent,
  label = "Your Environment Variables",
}: EnvVarsPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    toast.success("Configuration copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/30 bg-card/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-cyan hover:text-cyan/80"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="rounded-lg bg-background/80 border border-border/30 p-3 text-[10px] font-mono text-foreground/70 overflow-x-auto max-h-48 overflow-y-auto leading-relaxed">
        {envContent}
      </pre>
    </div>
  );
}
