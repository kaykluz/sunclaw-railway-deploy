import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/platforms";
import PlatformCard from "@/components/deploy-wizards/shared/PlatformCard";
import { BorderBeam } from "@/components/ui/border-beam";

export default function DeploySection() {
  return (
    <div className="container">
      <div className="text-center mb-16">
        <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">Deploy</span>
        <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">Deploy in Minutes</h2>
        <p className="text-[#6B635B] mt-4 max-w-2xl mx-auto text-base">
          Choose your platform. No CLI needed. Configure through the guided wizard.
        </p>
      </div>

      {/* Setup Wizard — Primary CTA */}
      <div className="relative rounded-2xl border border-[#3D3630] bg-[#1E1A16]/60 p-8 md:p-10 mb-8 overflow-hidden group hover:border-[#4D4640] transition-colors">
        <BorderBeam size={400} duration={6} borderWidth={1.5} colorVia="rgba(245, 166, 35, 0.3)" />

        <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 mb-5">
              <span className="text-[10px] font-mono text-[#F5A623] uppercase tracking-wider">Recommended</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-tight">Setup Wizard</h3>
            <p className="text-[#6B635B] text-sm leading-relaxed max-w-xl">
              Configure your AI provider, messaging channels, and KIISHA connection — then deploy with pre-filled configuration.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {["16+ Providers", "5 Channels", "8 Platforms", "Auto Config"].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-mono text-[#9E958B]">
                  <Check className="w-3.5 h-3.5 text-[#F5A623]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="bg-[#F5A623] text-[#1A1612] hover:bg-[#FFB840] font-medium gap-2 h-14 px-10 text-base"
              asChild
            >
              <a href="/agent/setup">
                Launch Wizard
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <span className="text-[10px] font-mono text-[#6B635B]">Configure once, deploy anywhere</span>
          </div>
        </div>
      </div>

      {/* All Deployment Platforms */}
      <div className="mb-6">
        <h4 className="text-xs font-mono text-[#6B635B] uppercase tracking-wider mb-4">
          Or deploy directly
        </h4>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            mode="homepage"
          />
        ))}
      </div>
    </div>
  );
}
