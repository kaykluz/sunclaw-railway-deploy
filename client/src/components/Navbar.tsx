import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { SunClawIcon } from "./SunClawLogo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Skills", href: "#skills" },
    { label: "Demo", href: "#demo" },
    { label: "Channels", href: "#channels" },
    { label: "Architecture", href: "#architecture" },
    { label: "Deploy", href: "#deploy" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        padding: "20px 40px",
        background: scrolled ? "rgba(26,22,18,0.85)" : "rgba(26,22,18,0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(245,166,35,0.06)" : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <SunClawIcon size={32} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
              <span style={{ color: "#F5A623" }}>Sun</span><span style={{ color: "#E8664A" }}>Claw</span>
            </span>
          </a>
          <span style={{ color: "#3D3630", fontSize: 18, fontWeight: 300, margin: "0 4px" }}>|</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" as const, color: "#9E958B" }}>Agent</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: "#9E958B", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#F5A623")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#9E958B")}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 12 }}>
          {isAuthenticated && (
            <>
              <a
                href="/agent/dashboard"
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#9E958B", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; e.currentTarget.style.color = "#F0EAE0"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9E958B"; }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </a>
              <a
                href="/agent/account"
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#9E958B", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; e.currentTarget.style.color = "#F0EAE0"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9E958B"; }}
              >
                <User size={14} />
                Account
              </a>
            </>
          )}
          <a
            href="/agent/setup"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 100, background: "#F5A623", color: "#1A1612", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none", transition: "all 0.3s" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#FFB840"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#F5A623"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get Started
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" style={{ padding: 8, color: "#9E958B", background: "none", border: "none", cursor: "pointer" }} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: "rgba(26,22,18,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(245,166,35,0.06)", padding: "16px 40px" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "12px 0", fontSize: 14, color: "#9E958B", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <a
              href="/agent/setup"
              style={{ flex: 1, textAlign: "center" as const, padding: "12px 24px", borderRadius: 100, background: "#F5A623", color: "#1A1612", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
