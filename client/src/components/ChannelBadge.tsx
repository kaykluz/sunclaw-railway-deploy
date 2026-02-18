interface ChannelBadgeProps {
  name: string;
  status: "active" | "coming";
}

export default function ChannelBadge({ name, status }: ChannelBadgeProps) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
      status === "active"
        ? "border-emerald/20 bg-emerald/5 hover:border-emerald/30 hover:bg-emerald/10"
        : "border-[#3D3630]/40 bg-[#1E1A16]/30 opacity-60"
    }`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${
        status === "active" ? "bg-emerald pulse-green" : "bg-[#4D4640]"
      }`} />
      <span className="text-sm font-medium text-[#D4CBC0]">{name}</span>
      {status === "coming" && (
        <span className="text-[9px] font-mono text-[#6B635B] uppercase ml-auto">Soon</span>
      )}
    </div>
  );
}
