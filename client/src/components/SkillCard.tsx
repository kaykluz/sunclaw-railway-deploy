import { Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card3DGlare } from "@/components/ui/card-3d-glare";

interface SkillCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: "cyan" | "amber" | "emerald";
  locked?: boolean;
}

const colorMap = {
  cyan: {
    icon: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
  },
  amber: {
    icon: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/20",
  },
  emerald: {
    icon: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/20",
  },
};

export default function SkillCard({ id, name, description, icon: Icon, color, locked }: SkillCardProps) {
  const c = colorMap[color];
  return (
    <Card3DGlare>
      <div className="group relative rounded-xl border border-[#3D3630] bg-[#1E1A16]/60 p-5 hover:border-[#4D4640] transition-all hover:bg-[#1E1A16]/80 h-full">
        {locked && (
          <div className="absolute top-3 right-3">
            <Lock className="w-3.5 h-3.5 text-[#6B635B]" />
          </div>
        )}
        <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center mb-3`}>
          <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
        </div>
        <h4 className="font-medium text-sm text-white mb-1">{name}</h4>
        <p className="text-xs text-[#6B635B] leading-relaxed mb-3">{description}</p>
        <code className="text-[10px] font-mono text-[#6B635B] bg-[#2C2824]/50 px-1.5 py-0.5 rounded">{id}</code>
      </div>
    </Card3DGlare>
  );
}
