import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyableCommandProps {
  code: string;
  label: string;
}

export default function CopyableCommand({ code, label }: CopyableCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-background/80 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-secondary/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
