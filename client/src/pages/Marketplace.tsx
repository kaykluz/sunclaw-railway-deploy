import { useEffect } from "react";

// SunClaw mini icon for nav
const SunClawIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" fill="url(#scGrad)" />
    <ellipse cx="14" cy="17" rx="3" ry="4" fill="#1A1612" />
    <ellipse cx="26" cy="17" rx="3" ry="4" fill="#1A1612" />
    <ellipse cx="14.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
    <ellipse cx="26.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
    <path d="M12 26c1.5 3 4 4.5 8 4.5s6.5-1.5 8-4.5" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10c-3-4-2-7 1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 10c3-4 2-7-1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="scGrad" x1="4" y1="4" x2="36" y2="36">
        <stop stopColor="#F5A623" />
        <stop offset="1" stopColor="#E8664A" />
      </linearGradient>
    </defs>
  </svg>
);

// Footer logo
const FooterLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" fill="url(#scGradF)" />
    <ellipse cx="14" cy="17" rx="3" ry="4" fill="#1A1612" />
    <ellipse cx="26" cy="17" rx="3" ry="4" fill="#1A1612" />
    <ellipse cx="14.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
    <ellipse cx="26.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
    <path d="M12 26c1.5 3 4 4.5 8 4.5s6.5-1.5 8-4.5" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10c-3-4-2-7 1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 10c3-4 2-7-1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="scGradF" x1="4" y1="4" x2="36" y2="36">
        <stop stopColor="#F5A623" />
        <stop offset="1" stopColor="#E8664A" />
      </linearGradient>
    </defs>
  </svg>
);

// Marketplace verticals data
const VERTICALS = [
  {
    icon: "💰",
    title: "Project-to-Finance",
    desc: "Developers find capital. Investors find deal flow. Anonymous matching with consent-based introductions.",
    supply: "DFIs, VCs, PE funds, impact investors, commercial banks, green bond issuers",
    demand: "Project developers, IPPs, asset owners, mini-grid operators",
    example: "I have a 12MW solar project in Kenya at PPA stage. Who's financing?"
  },
  {
    icon: "🔨",
    title: "Developer-to-Installer",
    desc: "Developers find verified installers. Installers receive qualified leads by region and specialization.",
    supply: "Solar installers, electrical contractors, rooftop specialists",
    demand: "C&I clients, homeowners, developers, facility managers",
    example: "Find me a certified installer for a 200kW rooftop in Accra."
  },
  {
    icon: "👷",
    title: "Developer-to-EPC",
    desc: "Projects find full-service contractors. EPCs, engineers, and consultants find new mandates.",
    supply: "EPC contractors, civil engineers, structural consultants, grid specialists",
    demand: "Utility-scale developers, government agencies, large C&I",
    example: "I need an EPC with West African experience for a 50MW ground-mount."
  },
  {
    icon: "🌱",
    title: "Carbon Credits",
    desc: "Project owners assess eligibility and estimate volumes. Buyers find verified carbon credit supply.",
    supply: "Carbon-eligible project owners, verification bodies",
    demand: "Corporate offsetters, carbon traders, compliance buyers",
    example: "Estimate the carbon credit yield for my 8MW biomass plant."
  },
  {
    icon: "👥",
    title: "Talent Matching",
    desc: "Job seekers build profiles through conversation. Employers search by skills, not keywords.",
    supply: "Engineers, technicians, project managers, sales professionals, analysts",
    demand: "RE companies, EPCs, utilities, startups, DFIs",
    example: "I'm a solar PV engineer with 5 years in East Africa. What's available?"
  },
  {
    icon: "⚡",
    title: "Equipment Market",
    desc: "Buyers find panels, inverters, batteries, and balance-of-system. Distributors and OEMs reach verified demand.",
    supply: "Panel manufacturers, inverter OEMs, battery distributors, BoS suppliers",
    demand: "Installers, EPCs, developers, procurement teams",
    example: "I need 500 Tier-1 monocrystalline panels delivered to Lagos."
  },
  {
    icon: "🏗️",
    title: "Startup-to-Funder",
    desc: "RE startups find VCs, grants, and accelerators. Funders find vetted early-stage pipeline.",
    supply: "VCs, angel investors, grant programs, accelerators, impact funds",
    demand: "Clean energy startups, climate tech founders",
    example: "We're a pre-seed mini-grid SaaS. Who funds this space?"
  },
  {
    icon: "🗺️",
    title: "Land-to-Developer",
    desc: "Landowners list suitable parcels. Developers find sites for utility-scale and mini-grid projects.",
    supply: "Landowners, government land agencies, lease brokers",
    demand: "Utility-scale developers, mini-grid operators, EV charging networks",
    example: "I have 50 hectares in northern Nigeria. Is it suitable for solar?"
  },
  {
    icon: "🛡️",
    title: "Insurance Marketplace",
    desc: "Projects find brokers and underwriters. Insurers access a pipeline of RE risk they can price.",
    supply: "Insurance brokers, underwriters, risk assessors",
    demand: "Project developers, asset owners, O&M providers, lenders",
    example: "I need construction all-risk insurance for a 20MW project."
  }
];

// CSS for the marketplace page
const marketplaceCSS = `
/* MARKETPLACE PAGE */
.sc-marketplace {
  --bg-primary: #1A1612;
  --bg-card: rgba(255,255,255,0.02);
  --text-primary: #FFF8F0;
  --text-secondary: #C4BAA8;
  --text-muted: #9E958B;
  --sun-gold: #F5A623;
  --lobster-coral: #E8664A;
  --border-subtle: rgba(255,255,255,0.06);

  min-height: 100vh;
  background: var(--bg-primary);
  font-family: 'DM Sans', sans-serif;
  color: var(--text-primary);
}

/* NAV */
.sc-marketplace .sc-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(26,22,18,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.sc-marketplace .nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.sc-marketplace .nav-wordmark {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
}

.sc-marketplace .nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.sc-marketplace .nav-links a {
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s;
}

.sc-marketplace .nav-links a:hover {
  color: var(--text-primary);
}

.sc-marketplace .nav-cta {
  padding: 10px 24px;
  border-radius: 100px;
  background: var(--sun-gold);
  color: #1A1612;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s;
}

.sc-marketplace .nav-cta:hover {
  background: #FFB840;
  transform: translateY(-1px);
}

/* HERO */
.sc-marketplace .mp-hero {
  text-align: center;
  padding: 160px 24px 80px;
  max-width: 800px;
  margin: 0 auto;
}

.sc-marketplace .mp-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--sun-gold);
  display: block;
  margin-bottom: 24px;
}

.sc-marketplace .mp-hero h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: clamp(36px, 6vw, 52px);
  color: var(--text-primary);
  line-height: 1.1;
  margin: 0 0 20px 0;
}

.sc-marketplace .mp-hero > p {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 32px;
}

.sc-marketplace .coming-soon-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 100px;
  background: rgba(245,166,35,0.06);
  border: 1px solid rgba(245,166,35,0.15);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: var(--sun-gold);
  letter-spacing: 1px;
  animation: scComingSoonPulse 3s ease-in-out infinite;
}

@keyframes scComingSoonPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0); }
  50% { box-shadow: 0 0 0 6px rgba(245,166,35,0.08); }
}

/* SECTIONS */
.sc-marketplace .mp-section {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.sc-marketplace .mp-section h2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 40px);
  color: var(--text-primary);
  margin: 16px 0;
}

.sc-marketplace .mp-desc {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.7;
}

/* STEPS */
.sc-marketplace .steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.sc-marketplace .step-card {
  padding: 32px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  position: relative;
  text-align: left;
  transition: all 0.3s ease;
}

.sc-marketplace .step-card:hover {
  border-color: rgba(245,166,35,0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.15);
}

.sc-marketplace .step-number {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 48px;
  color: rgba(245,166,35,0.12);
  position: absolute;
  top: 24px;
  right: 28px;
  line-height: 1;
}

.sc-marketplace .step-icon {
  font-size: 28px;
  margin-bottom: 16px;
}

.sc-marketplace .step-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.sc-marketplace .step-card p {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* AUDIENCE CARDS */
.sc-marketplace .audience-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  text-align: left;
}

.sc-marketplace .audience-card {
  padding: 36px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
}

.sc-marketplace .audience-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.15);
}

.sc-marketplace .audience-card-seek {
  border-color: rgba(245,166,35,0.12);
}

.sc-marketplace .audience-card-seek:hover {
  border-color: rgba(245,166,35,0.25);
}

.sc-marketplace .audience-card-offer {
  border-color: rgba(232,102,74,0.12);
}

.sc-marketplace .audience-card-offer:hover {
  border-color: rgba(232,102,74,0.25);
}

.sc-marketplace .audience-card-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.sc-marketplace .audience-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 20px;
  margin: 0 0 12px 0;
}

.sc-marketplace .audience-card-seek h3 {
  color: var(--sun-gold);
}

.sc-marketplace .audience-card-offer h3 {
  color: var(--lobster-coral);
}

.sc-marketplace .audience-card > p {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

.sc-marketplace .audience-card-quotes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sc-marketplace .audience-card-quote {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-style: italic;
  color: var(--text-muted);
  padding-left: 12px;
  border-left: 2px solid rgba(255,255,255,0.06);
}

.sc-marketplace .audience-card-seek .audience-card-quote {
  border-left-color: rgba(245,166,35,0.2);
}

.sc-marketplace .audience-card-offer .audience-card-quote {
  border-left-color: rgba(232,102,74,0.2);
}

/* VERTICALS GRID */
.sc-marketplace .verticals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: left;
}

.sc-marketplace .vertical-card {
  padding: 32px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
}

.sc-marketplace .vertical-card:hover {
  border-color: rgba(245,166,35,0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.15);
}

.sc-marketplace .vertical-card-icon {
  font-size: 28px;
  margin-bottom: 16px;
}

.sc-marketplace .vertical-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.sc-marketplace .vertical-card-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

.sc-marketplace .vertical-card-sides {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.sc-marketplace .vertical-card-side {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-subtle);
}

.sc-marketplace .vertical-card-side-label {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--sun-gold);
  display: block;
  margin-bottom: 4px;
}

.sc-marketplace .vertical-card-side-label.demand {
  color: var(--lobster-coral);
}

.sc-marketplace .vertical-card-example {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-style: italic;
  color: var(--text-muted);
  padding-left: 12px;
  border-left: 2px solid rgba(245,166,35,0.15);
  margin-top: 16px;
}

/* CTA SECTION */
.sc-marketplace .cta-section {
  text-align: center;
  padding: 100px 24px;
  max-width: 600px;
  margin: 0 auto;
}

.sc-marketplace .cta-section h2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 40px);
  color: var(--text-primary);
  margin: 16px 0;
}

.sc-marketplace .cta-section > p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.7;
}

.sc-marketplace .cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  border-radius: 100px;
  background: var(--sun-gold);
  color: #1A1612;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(245,166,35,0.25);
}

.sc-marketplace .cta-btn:hover {
  background: #FFB840;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(245,166,35,0.35);
}

.sc-marketplace .cta-alt {
  display: block;
  margin-top: 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-muted);
}

.sc-marketplace .cta-alt a {
  color: var(--lobster-coral);
  text-decoration: none;
}

.sc-marketplace .cta-alt a:hover {
  text-decoration: underline;
}

/* FOOTER */
.sc-marketplace .sc-footer {
  padding: 60px 40px;
  border-top: 1px solid rgba(255,255,255,0.04);
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.sc-marketplace .footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sc-marketplace .footer-wordmark {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
}

.sc-marketplace .footer-copy {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 16px;
}

.sc-marketplace .footer-links {
  display: flex;
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.sc-marketplace .footer-links a {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s;
}

.sc-marketplace .footer-links a:hover {
  color: var(--text-primary);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .sc-marketplace .verticals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sc-marketplace .sc-nav {
    padding: 12px 20px;
  }

  .sc-marketplace .nav-links {
    display: none;
  }

  .sc-marketplace .mp-hero {
    padding: 120px 20px 60px;
  }

  .sc-marketplace .mp-section {
    padding: 60px 20px;
  }

  .sc-marketplace .steps {
    grid-template-columns: 1fr;
  }

  .sc-marketplace .audience-cards {
    grid-template-columns: 1fr;
  }

  .sc-marketplace .verticals-grid {
    grid-template-columns: 1fr;
  }

  .sc-marketplace .sc-footer {
    padding: 40px 20px;
    flex-direction: column;
    text-align: center;
  }

  .sc-marketplace .footer-left {
    flex-direction: column;
  }

  .sc-marketplace .footer-copy {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* LIGHT MODE — Brand-compliant Soft Cream palette */
[data-theme="light"] .sc-marketplace {
  /* Backgrounds */
  --bg-primary: #FFF8F0;
  --bg-secondary: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-card-hover: #FFFCF7;
  /* Borders */
  --border-subtle: rgba(26,22,18,0.08);
  --border-hover: rgba(26,22,18,0.15);
  /* Text — Deep Earth as primary */
  --text-primary: #1A1612;
  --text-secondary: #4A4540;
  --text-muted: #8B8279;
  /* Brand colors — FULL SATURATION on light */
  --sun-gold: #F5A623;
  --lobster-coral: #E8664A;
}

[data-theme="light"] .sc-marketplace .sc-nav {
  background: rgba(255,248,240,0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: rgba(26,22,18,0.06);
}

[data-theme="light"] .sc-marketplace .nav-links a {
  color: #4A4540;
}

[data-theme="light"] .sc-marketplace .nav-links a:hover {
  color: #1A1612;
}

[data-theme="light"] .sc-marketplace .nav-cta {
  background: #F5A623;
}

[data-theme="light"] .sc-marketplace .nav-cta:hover {
  background: #FFB840;
}

/* Cards — WHITE backgrounds */
[data-theme="light"] .sc-marketplace .step-card,
[data-theme="light"] .sc-marketplace .audience-card,
[data-theme="light"] .sc-marketplace .vertical-card {
  background: #FFFFFF;
  border: 1px solid rgba(26,22,18,0.06);
  box-shadow: 0 2px 8px rgba(26,22,18,0.03);
}

[data-theme="light"] .sc-marketplace .step-card:hover,
[data-theme="light"] .sc-marketplace .audience-card:hover,
[data-theme="light"] .sc-marketplace .vertical-card:hover {
  border-color: rgba(245,166,35,0.2);
  box-shadow: 0 12px 36px rgba(26,22,18,0.08);
}

[data-theme="light"] .sc-marketplace .step-card h3,
[data-theme="light"] .sc-marketplace .audience-card h3,
[data-theme="light"] .sc-marketplace .vertical-card h3 {
  color: #1A1612;
}

[data-theme="light"] .sc-marketplace .step-card p,
[data-theme="light"] .sc-marketplace .audience-card p,
[data-theme="light"] .sc-marketplace .vertical-card p {
  color: #4A4540;
}

[data-theme="light"] .sc-marketplace .audience-card-seek h3 {
  color: #F5A623;
}

[data-theme="light"] .sc-marketplace .audience-card-offer h3 {
  color: #E8664A;
}

/* Section headings */
[data-theme="light"] .sc-marketplace .mp-label {
  color: #F5A623;
}

[data-theme="light"] .sc-marketplace .mp-hero h1,
[data-theme="light"] .sc-marketplace .mp-section h2,
[data-theme="light"] .sc-marketplace .cta-section h2 {
  color: #1A1612;
}

[data-theme="light"] .sc-marketplace .mp-hero > p,
[data-theme="light"] .sc-marketplace .mp-desc,
[data-theme="light"] .sc-marketplace .cta-section > p {
  color: #4A4540;
}

/* Coming Soon badge */
[data-theme="light"] .sc-marketplace .coming-soon-badge {
  background: rgba(245,166,35,0.08);
  border-color: rgba(245,166,35,0.15);
  color: #B8891E;
}

/* CTA button */
[data-theme="light"] .sc-marketplace .cta-btn {
  background: #F5A623;
}

[data-theme="light"] .sc-marketplace .cta-btn:hover {
  background: #FFB840;
}

/* Footer — ALWAYS dark */
[data-theme="light"] .sc-marketplace .sc-footer {
  background: #1A1612;
  border-top-color: transparent;
}
`;

export default function Marketplace() {
  useEffect(() => {
    // Inject CSS
    const style = document.createElement("style");
    style.textContent = marketplaceCSS;
    document.head.appendChild(style);

    // Scroll to top on mount
    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="sc-marketplace">
      {/* NAV */}
      <nav className="sc-nav">
        <a href="/" className="nav-left">
          <SunClawIcon size={32} />
          <span className="nav-wordmark">
            <span style={{ color: "var(--sun-gold)" }}>Sun</span>
            <span style={{ color: "var(--lobster-coral)" }}>Claw</span>
          </span>
        </a>
        <ul className="nav-links">
          <li><a href="/#features">Features</a></li>
          <li><a href="/marketplace">Marketplace</a></li>
          <li><a href="/agent">For Developers</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
        <a href="/#talk" className="nav-cta">Talk to SunClaw</a>
      </nav>

      {/* HERO */}
      <section className="mp-hero">
        <span className="mp-label">THE MARKETPLACE</span>
        <h1>Every conversation powers something.</h1>
        <p>
          SunClaw is building a multi-sided marketplace where every chat builds a profile,
          and every profile becomes a node in a matching network. Coming soon.
        </p>
        <div className="coming-soon-badge">Coming Soon — Join the Waitlist</div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mp-section">
        <span className="mp-label">HOW IT WORKS</span>
        <h2>Two sides. One conversation.</h2>
        <p className="mp-desc">
          Both sides build profiles through natural conversation. Both sides get matched.
          No forms, no dashboards, no cold outreach.
        </p>
        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">💬</div>
            <h3>Talk to SunClaw</h3>
            <p>
              Tell SunClaw what you're building or what you offer. As you chat,
              it builds a structured profile — your capabilities, your needs,
              your region, your specialization.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🔗</div>
            <h3>Get Matched</h3>
            <p>
              SunClaw anonymously matches supply to demand. Developers find installers.
              Installers find leads. Financiers find deal flow. Both parties consent
              before any introduction.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🤝</div>
            <h3>Close the Deal</h3>
            <p>
              SunClaw facilitates introductions, generates proposals, and tracks progress.
              The conversation doesn't stop at matching — it powers the entire transaction.
            </p>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mp-section">
        <span className="mp-label">WHO IT'S FOR</span>
        <h2>Every side of the table.</h2>
        <p className="mp-desc">
          Whether you're buying or selling renewable energy services, the marketplace speaks your language.
        </p>
        <div className="audience-cards">
          <div className="audience-card audience-card-seek">
            <div className="audience-card-icon">☀️</div>
            <h3>Looking for services</h3>
            <p>
              Project developers, asset owners, C&I clients, utilities, governments,
              and anyone building or financing a renewable energy project.
            </p>
            <div className="audience-card-quotes">
              <div className="audience-card-quote">"Find me an EPC in Lagos."</div>
              <div className="audience-card-quote">"Model this PPA."</div>
              <div className="audience-card-quote">"Who's financing mini-grids right now?"</div>
            </div>
          </div>
          <div className="audience-card audience-card-offer">
            <div className="audience-card-icon">🔧</div>
            <h3>Offering services</h3>
            <p>
              Installers, EPC contractors, financiers, DFIs, consultants, equipment suppliers,
              recruiters, and independent engineers.
            </p>
            <div className="audience-card-quotes">
              <div className="audience-card-quote">"Send me solar leads in West Africa."</div>
              <div className="audience-card-quote">"Match me with projects that need biomass expertise."</div>
              <div className="audience-card-quote">"I have surplus panels to move."</div>
            </div>
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section className="mp-section">
        <span className="mp-label">MARKETPLACE VERTICALS</span>
        <h2>Nine markets. One platform.</h2>
        <p className="mp-desc">
          Each vertical connects a specific supply to a specific demand.
          SunClaw handles the matching, introductions, and deal facilitation.
        </p>
        <div className="verticals-grid">
          {VERTICALS.map((v) => (
            <div key={v.title} className="vertical-card">
              <div className="vertical-card-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p className="vertical-card-desc">{v.desc}</p>
              <div className="vertical-card-sides">
                <div className="vertical-card-side">
                  <span className="vertical-card-side-label">Supply</span>
                  {v.supply}
                </div>
                <div className="vertical-card-side">
                  <span className="vertical-card-side-label demand">Demand</span>
                  {v.demand}
                </div>
              </div>
              <div className="vertical-card-example">"{v.example}"</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <span className="mp-label">EARLY ACCESS</span>
        <h2>The marketplace is coming.</h2>
        <p>
          Talk to SunClaw today to build your profile. When the marketplace launches,
          you'll be first in line.
        </p>
        <a href="/#talk" className="cta-btn">Talk to SunClaw →</a>
        <span className="cta-alt">
          Or <a href="/agent">deploy your own agent →</a>
        </span>
      </section>

      {/* FOOTER */}
      <footer className="sc-footer">
        <div className="footer-left">
          <FooterLogo />
          <span className="footer-wordmark">
            <span style={{ color: "var(--sun-gold)" }}>Sun</span>
            <span style={{ color: "var(--lobster-coral)" }}>Claw</span>
          </span>
          <span className="footer-copy">&copy; 2026 KIISHA Ltd. All rights reserved.</span>
        </div>
        <ul className="footer-links">
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/marketplace">Marketplace</a></li>
        </ul>
      </footer>
    </div>
  );
}
