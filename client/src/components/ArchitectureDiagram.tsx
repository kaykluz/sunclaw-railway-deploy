import { Bot, Shield, Database, MessageSquare, Cpu, Globe, Settings, Layers, Zap, Brain, Radio } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-2xl border border-[#3D3630] bg-[#1E1A16]/50 p-6 md:p-10 overflow-x-auto">
      <div className="min-w-[640px]">

        {/* Layer 1: SunClaw Management */}
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-5 mb-2">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan/10 border border-cyan/30">
              <Layers className="w-3.5 h-3.5 text-cyan" />
              <span className="font-mono text-[10px] text-cyan uppercase tracking-wider">SunClaw — Management &amp; Orchestration</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Settings, title: "Config Manager", sub: "Deploy & Sync" },
              { icon: Brain, title: "LLM Selector", sub: "Multi-Provider" },
              { icon: Radio, title: "Channel Control", sub: "Multi-Channel" },
              { icon: Globe, title: "Skill Registry", sub: "Energy Skills" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/80 p-3 text-center hover:border-cyan/20 transition-colors">
                <item.icon className="w-4 h-4 text-cyan mx-auto mb-1.5" />
                <div className="text-[11px] font-medium text-white">{item.title}</div>
                <div className="text-[9px] text-[#6B635B] font-mono mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3">
          <div className="flex flex-col items-center">
            <div className="w-px h-5 bg-gradient-to-b from-cyan/40 to-emerald/40" />
            <div className="px-2 py-0.5 rounded-lg bg-[#1E1A16] border border-[#3D3630]">
              <span className="text-[8px] font-mono text-[#6B635B]">WebSocket RPC</span>
            </div>
            <div className="w-px h-5 bg-gradient-to-b from-emerald/40 to-emerald/20" />
          </div>
        </div>

        {/* Layer 2: OpenClaw Gateway */}
        <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-5 mb-2">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald/10 border border-emerald/30">
              <Bot className="w-3.5 h-3.5 text-emerald" />
              <span className="font-mono text-[10px] text-emerald uppercase tracking-wider">OpenClaw Gateway — Agent Runtime</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/80 p-3 text-center hover:border-emerald/20 transition-colors">
              <Bot className="w-4 h-4 text-emerald mx-auto mb-1.5" />
              <div className="text-[11px] font-medium text-white">Agent Engine</div>
              <div className="text-[9px] text-[#6B635B] font-mono mt-0.5">Reasoning &amp; Tools</div>
            </div>
            <div className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/80 p-3 text-center hover:border-emerald/20 transition-colors">
              <Zap className="w-4 h-4 text-emerald mx-auto mb-1.5" />
              <div className="text-[11px] font-medium text-white">Plugin System</div>
              <div className="text-[9px] text-[#6B635B] font-mono mt-0.5">50+ Skills</div>
            </div>
            <div className="rounded-xl border border-amber/20 bg-amber/5 p-3 text-center hover:border-amber/30 transition-colors">
              <Shield className="w-4 h-4 text-amber mx-auto mb-1.5" />
              <div className="text-[11px] font-medium text-white">KIISHA Bridge</div>
              <div className="text-[9px] text-amber/60 font-mono mt-0.5">Enterprise API</div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <div className="grid grid-cols-3 gap-3 my-3">
          {["Messages", "LLM Calls", "Auth API"].map((label) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-px h-5 bg-gradient-to-b from-emerald/30 to-[#4D4640]" />
              <span className="text-[8px] font-mono text-[#6B635B]">{label}</span>
              <div className="w-px h-5 bg-gradient-to-b from-[#4D4640] to-[#3D3630]" />
            </div>
          ))}
        </div>

        {/* Layer 3: External Services */}
        <div className="grid grid-cols-3 gap-3">
          {/* Channels */}
          <div className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/50 p-3 hover:border-[#4D4640] transition-colors">
            <div className="text-center mb-2">
              <MessageSquare className="w-4 h-4 text-[#9E958B] mx-auto mb-1" />
              <div className="text-[11px] font-medium text-white">Channels</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {["Telegram", "WhatsApp", "Slack", "Discord", "Web"].map((ch) => (
                <span key={ch} className="px-1.5 py-0.5 rounded-md bg-[#2C2824] border border-[#4D4640] text-[8px] font-mono text-[#9E958B]">
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* LLM Providers */}
          <div className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/50 p-3 hover:border-[#4D4640] transition-colors">
            <div className="text-center mb-2">
              <Cpu className="w-4 h-4 text-[#9E958B] mx-auto mb-1" />
              <div className="text-[11px] font-medium text-white">LLM Providers</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {["Kimi", "MiniMax", "OpenAI", "Claude", "Gemini"].map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded-md bg-[#2C2824] border border-[#4D4640] text-[8px] font-mono text-[#9E958B]">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* KIISHA */}
          <div className="rounded-xl border border-amber/20 bg-amber/5 p-3 hover:border-amber/30 transition-colors">
            <div className="text-center mb-2">
              <Database className="w-4 h-4 text-amber mx-auto mb-1" />
              <div className="text-[11px] font-medium text-white">KIISHA Enterprise</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {["Portfolio", "VATR", "Tickets", "Payments"].map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded-md bg-[#2C2824] border border-[#4D4640] text-[8px] font-mono text-[#9E958B]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
