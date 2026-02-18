import { SunClawIcon } from "./SunClawLogo";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "60px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 24
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SunClawIcon size={24} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18 }}>
            <span style={{ color: "#F5A623" }}>Sun</span><span style={{ color: "#E8664A" }}>Claw</span>
          </span>
          <span style={{ fontSize: 13, color: "#6B635B", marginLeft: 16 }}>
            &copy; {new Date().getFullYear()} KIISHA Ltd. All rights reserved.
          </span>
        </div>
        <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Blog", href: "/blog" },
            { label: "Marketplace", href: "/marketplace" },
            { label: "OpenClaw", href: "https://openclaw.ai", external: true },
            { label: "KIISHA", href: "https://kiisha.io", external: true },
            { label: "Contact", href: "mailto:hello@sunclaw.ai" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{ color: "#6B635B", textDecoration: "none", fontSize: 13, transition: "color 0.3s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#F5A623")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#6B635B")}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <span style={{ fontSize: 12, color: "#6B635B", fontFamily: "'Space Mono', monospace", opacity: 0.5 }}>
          🦞 the lobster way
        </span>
      </div>
    </footer>
  );
}
