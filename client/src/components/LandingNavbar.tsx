import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { SunClawIcon, SunClawWordmark } from "./SunClawLogo";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Agent", href: "/agent" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1A1612]/85 backdrop-blur-xl border-b border-[#F5A623]/6"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1100px] mx-auto flex items-center justify-between h-16 px-5 md:px-10">
        <a href="/" className="flex items-center gap-1.5 no-underline">
          <SunClawIcon size={32} />
          <SunClawWordmark />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#9E958B] hover:text-[#F5A623] transition-colors no-underline"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/agent/setup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F5A623] text-[#1A1612] font-display font-bold text-[13px] hover:bg-[#FFB840] transition-all hover:-translate-y-px no-underline"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          className="md:hidden p-2 text-[#9E958B] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#1A1612]/95 backdrop-blur-xl border-b border-[#F5A623]/6 px-5 pb-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm text-[#9E958B] hover:text-[#F5A623] border-b border-white/5 no-underline"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4">
            <a
              href="/agent/setup"
              className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 rounded-full bg-[#F5A623] text-[#1A1612] font-display font-bold text-sm no-underline"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
