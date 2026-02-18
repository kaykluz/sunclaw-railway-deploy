import { SunClawIcon, SunClawWordmark } from "./SunClawLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/4 max-w-[1100px] mx-auto px-5 md:px-10 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <SunClawIcon size={24} />
            <SunClawWordmark />
          </div>
          <p className="text-sm text-[#6B635B] max-w-[280px] leading-relaxed">
            The conversational operating system for renewable energy.
          </p>
          <p className="text-xs text-[#6B635B] mt-4 font-mono opacity-50">
            🦞 Born in the reef. Built for the sun.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-8">
          <div>
            <h4 className="font-mono text-[10px] text-[#6B635B] uppercase tracking-[4px] mb-4">Product</h4>
            <ul className="space-y-2.5 list-none p-0">
              <li><a href="/agent" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Agent</a></li>
              <li><a href="/marketplace" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Marketplace</a></li>
              <li><a href="/pricing" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Pricing</a></li>
              <li><a href="/agent/setup" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Setup</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] text-[#6B635B] uppercase tracking-[4px] mb-4">Resources</h4>
            <ul className="space-y-2.5 list-none p-0">
              <li><a href="/blog" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Blog</a></li>
              <li><a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">OpenClaw Docs</a></li>
              <li><a href="mailto:hello@sunclaw.ai" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] text-[#6B635B] uppercase tracking-[4px] mb-4">Company</h4>
            <ul className="space-y-2.5 list-none p-0">
              <li><a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">KIISHA</a></li>
              <li><a href="/privacy" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Privacy</a></li>
              <li><a href="/terms" className="text-sm text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/4 flex items-center justify-between">
        <p className="text-xs text-[#6B635B]">
          &copy; {new Date().getFullYear()}{" "}
          <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5A623] transition-colors no-underline text-[#9E958B]">
            KIISHA Ltd
          </a>. All rights reserved.
        </p>
        <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#6B635B] hover:text-[#F5A623] transition-colors no-underline">
          Powered by OpenClaw
        </a>
      </div>
    </footer>
  );
}
