import { useState, useEffect } from "react";
import { Bot, User } from "lucide-react";

const conversation = [
  { role: "user" as const, text: "What's the solar irradiance for Lagos, Nigeria?" },
  { role: "bot" as const, text: `Solar Irradiance — Lagos, Nigeria (6.52°N, 3.37°E)

| Metric | Value |
|--------|-------|
| GHI    | 4.92 kWh/m²/day |
| DNI    | 3.81 kWh/m²/day |
| DHI    | 2.14 kWh/m²/day |
| Optimal Tilt | 7° |

Peak months: Nov–Feb (dry season)
Source: EU PVGIS / NASA POWER` },
  { role: "user" as const, text: "Calculate LCOE for a 10MW solar plant there" },
  { role: "bot" as const, text: `LCOE Calculation — 10MW Solar, Lagos

| Component | Value |
|-----------|-------|
| Capacity | 10 MW |
| CAPEX | $8.2M |
| Annual Gen | 16,420 MWh |
| LCOE | $0.048/kWh |

Below IRENA benchmark ($0.049/kWh)
Capacity Factor: 18.7%
Payback: ~6.2 years` },
];

export default function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (visibleCount >= conversation.length) return;
    const delay = visibleCount === 0 ? 1000 : conversation[visibleCount - 1].role === "bot" ? 800 : 1500;
    const timer = setTimeout(() => {
      setTyping(true);
      const typeDelay = conversation[visibleCount].role === "bot" ? 600 : 300;
      setTimeout(() => {
        setTyping(false);
        setVisibleCount((c) => c + 1);
      }, typeDelay);
    }, delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="rounded-2xl border border-[#3D3630] bg-[#1E1A16]/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3D3630]/50 bg-[#1E1A16]/50">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-emerald flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#1A1612]" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-[#1E1A16] pulse-green" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">SunClaw AI</div>
          <div className="text-xs text-emerald font-mono">Online</div>
        </div>
      </div>

      <div className="p-4 space-y-4 h-[420px] overflow-y-auto">
        {conversation.slice(0, visibleCount).map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "bot" && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan to-emerald flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3 h-3 text-[#1A1612]" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-cyan/10 border border-cyan/20 text-white"
                : "bg-[#1E1A16]/80 border border-[#3D3630]/50"
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#C4B9AB]">{msg.text}</pre>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-[#2C2824] border border-[#4D4640] flex items-center justify-center shrink-0 mt-1">
                <User className="w-3 h-3 text-[#9E958B]" />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan to-emerald flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3 h-3 text-[#1A1612]" />
            </div>
            <div className="bg-[#1E1A16]/80 border border-[#3D3630]/50 rounded-xl px-3.5 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#3D3630]/50 bg-[#1E1A16]/30">
        <div className="flex items-center gap-2 rounded-xl border border-[#3D3630] bg-[#1E1A16]/80 px-3 py-2">
          <span className="text-sm text-[#6B635B] flex-1 font-mono">Ask about solar, wind, grid...</span>
          <div className="w-7 h-7 rounded-lg bg-cyan/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
