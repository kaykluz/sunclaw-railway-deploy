import { useState, useEffect, useRef } from "react";

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

// SunClaw mascot with badge for vertical icons
const VerticalIcon = ({ badge }: { badge: string }) => (
  <div className="mp-vertical-icon">
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="url(#scGradV)" />
      <ellipse cx="14" cy="17" rx="3" ry="4" fill="#1A1612" />
      <ellipse cx="26" cy="17" rx="3" ry="4" fill="#1A1612" />
      <ellipse cx="14.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
      <ellipse cx="26.5" cy="16.5" rx="1" ry="1.5" fill="#FFF" />
      <path d="M12 26c1.5 3 4 4.5 8 4.5s6.5-1.5 8-4.5" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 10c-3-4-2-7 1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 10c3-4 2-7-1-8" stroke="#E8664A" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="scGradV" x1="4" y1="4" x2="36" y2="36">
          <stop stopColor="#F5A623" />
          <stop offset="1" stopColor="#E8664A" />
        </linearGradient>
      </defs>
    </svg>
    <span className="mp-vertical-badge">{badge}</span>
  </div>
);

// Marketplace verticals data with keys
const VERTICALS = [
  {
    key: "project-finance",
    badge: "💰",
    title: "Project-to-Finance",
    desc: "Developers find capital. Investors find deal flow. Anonymous matching with consent-based introductions.",
    supply: "DFIs, VCs, PE funds, impact investors, commercial banks, green bond issuers",
    demand: "Project developers, IPPs, asset owners, mini-grid operators",
    example: "I have a 12MW solar project in Kenya at PPA stage. Who's financing?"
  },
  {
    key: "dev-installer",
    badge: "🔨",
    title: "Developer-to-Installer",
    desc: "Developers find verified installers. Installers receive qualified leads by region and specialization.",
    supply: "Solar installers, electrical contractors, rooftop specialists",
    demand: "C&I clients, homeowners, developers, facility managers",
    example: "Find me a certified installer for a 200kW rooftop in Accra."
  },
  {
    key: "dev-epc",
    badge: "👷",
    title: "Developer-to-EPC",
    desc: "Projects find full-service contractors. EPCs, engineers, and consultants find new mandates.",
    supply: "EPC contractors, civil engineers, structural consultants, grid specialists",
    demand: "Utility-scale developers, government agencies, large C&I",
    example: "I need an EPC with West African experience for a 50MW ground-mount."
  },
  {
    key: "carbon",
    badge: "🌱",
    title: "Carbon Credits",
    desc: "Project owners assess eligibility and estimate volumes. Buyers find verified carbon credit supply.",
    supply: "Carbon-eligible project owners, verification bodies",
    demand: "Corporate offsetters, carbon traders, compliance buyers",
    example: "Estimate the carbon credit yield for my 8MW biomass plant."
  },
  {
    key: "talent",
    badge: "👥",
    title: "Talent Matching",
    desc: "Job seekers build profiles through conversation. Employers search by skills, not keywords.",
    supply: "Engineers, technicians, project managers, sales professionals, analysts",
    demand: "RE companies, EPCs, utilities, startups, DFIs",
    example: "I'm a solar PV engineer with 5 years in East Africa. What's available?"
  },
  {
    key: "equipment",
    badge: "⚡",
    title: "Equipment Market",
    desc: "Buyers find panels, inverters, batteries, and balance-of-system. Distributors and OEMs reach verified demand.",
    supply: "Panel manufacturers, inverter OEMs, battery distributors, BoS suppliers",
    demand: "Installers, EPCs, developers, procurement teams",
    example: "I need 500 Tier-1 monocrystalline panels delivered to Lagos."
  },
  {
    key: "startup-funder",
    badge: "🏗️",
    title: "Startup-to-Funder",
    desc: "RE startups find VCs, grants, and accelerators. Funders find vetted early-stage pipeline.",
    supply: "VCs, angel investors, grant programs, accelerators, impact funds",
    demand: "Clean energy startups, climate tech founders",
    example: "We're a pre-seed mini-grid SaaS. Who funds this space?"
  },
  {
    key: "land-dev",
    badge: "🗺️",
    title: "Land-to-Developer",
    desc: "Landowners list suitable parcels. Developers find sites for utility-scale and mini-grid projects.",
    supply: "Landowners, government land agencies, lease brokers",
    demand: "Utility-scale developers, mini-grid operators, EV charging networks",
    example: "I have 50 hectares in northern Nigeria. Is it suitable for solar?"
  },
  {
    key: "insurance",
    badge: "🛡️",
    title: "Insurance Marketplace",
    desc: "Projects find brokers and underwriters. Insurers access a pipeline of RE risk they can price.",
    supply: "Insurance brokers, underwriters, risk assessors",
    demand: "Project developers, asset owners, O&M providers, lenders",
    example: "I need construction all-risk insurance for a 20MW project."
  }
];

const SIDE_OPTIONS = [
  { value: "seeking", label: "I'm looking for services" },
  { value: "offering", label: "I'm offering services" },
  { value: "both", label: "Both" },
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

/* WAITLIST FORM */
.sc-marketplace .mp-waitlist-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.sc-marketplace .mp-waitlist-input {
  flex: 1;
  min-width: 200px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
}

.sc-marketplace .mp-waitlist-input::placeholder {
  color: var(--text-muted);
}

.sc-marketplace .mp-waitlist-input:focus {
  border-color: var(--sun-gold);
  background: rgba(255,255,255,0.06);
}

.sc-marketplace .mp-waitlist-select {
  padding: 14px 20px;
  padding-right: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4BAA8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  transition: all 0.3s;
}

.sc-marketplace .mp-waitlist-select:focus {
  border-color: var(--sun-gold);
  background-color: rgba(255,255,255,0.06);
}

.sc-marketplace .mp-waitlist-select option {
  background: #1A1612;
  color: var(--text-primary);
}

.sc-marketplace .mp-waitlist-submit {
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  background: var(--sun-gold);
  color: #1A1612;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.sc-marketplace .mp-waitlist-submit:hover:not(:disabled) {
  background: #FFB840;
  transform: translateY(-2px);
}

.sc-marketplace .mp-waitlist-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sc-marketplace .mp-waitlist-success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #81C784;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  animation: mpFadeIn 0.3s ease;
}

@keyframes mpFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
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

/* VERTICAL CARD — Redesigned */
.sc-marketplace .vertical-card {
  padding: 32px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(30px);
}

.sc-marketplace .vertical-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.sc-marketplace .vertical-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, rgba(245,166,35,0.03) 0%, rgba(232,102,74,0.02) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.sc-marketplace .vertical-card:hover {
  border-color: rgba(245,166,35,0.25);
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
}

.sc-marketplace .vertical-card:hover::before {
  opacity: 1;
}

/* Vertical Icon + Badge */
.sc-marketplace .mp-vertical-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.sc-marketplace .mp-vertical-badge {
  position: absolute;
  bottom: -4px;
  right: -8px;
  font-size: 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 2px 6px;
  backdrop-filter: blur(4px);
}

/* Coming Soon Status */
.sc-marketplace .mp-vertical-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(245,166,35,0.08);
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--sun-gold);
  margin-bottom: 12px;
}

.sc-marketplace .mp-vertical-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sun-gold);
  animation: mpPulseDot 2s ease-in-out infinite;
}

@keyframes mpPulseDot {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
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
  max-width: 700px;
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

.sc-marketplace .cta-alt {
  display: block;
  margin-top: 20px;
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

  .sc-marketplace .mp-waitlist-form {
    flex-direction: column;
  }

  .sc-marketplace .mp-waitlist-input,
  .sc-marketplace .mp-waitlist-select,
  .sc-marketplace .mp-waitlist-submit {
    width: 100%;
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

/* Waitlist form light mode */
[data-theme="light"] .sc-marketplace .mp-waitlist-input,
[data-theme="light"] .sc-marketplace .mp-waitlist-select {
  background: rgba(26,22,18,0.03);
  border-color: rgba(26,22,18,0.1);
  color: #1A1612;
}

[data-theme="light"] .sc-marketplace .mp-waitlist-input::placeholder {
  color: #8B8279;
}

[data-theme="light"] .sc-marketplace .mp-waitlist-input:focus,
[data-theme="light"] .sc-marketplace .mp-waitlist-select:focus {
  border-color: #F5A623;
  background: #FFFFFF;
}

[data-theme="light"] .sc-marketplace .mp-waitlist-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A4540' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
}

[data-theme="light"] .sc-marketplace .mp-waitlist-select option {
  background: #FFFFFF;
  color: #1A1612;
}

[data-theme="light"] .sc-marketplace .mp-waitlist-submit {
  background: #F5A623;
}

[data-theme="light"] .sc-marketplace .mp-waitlist-submit:hover:not(:disabled) {
  background: #FFB840;
}

/* Vertical card light mode */
[data-theme="light"] .sc-marketplace .mp-vertical-badge {
  background: rgba(26,22,18,0.06);
}

[data-theme="light"] .sc-marketplace .mp-vertical-status {
  background: rgba(245,166,35,0.1);
  color: #B8891E;
}

[data-theme="light"] .sc-marketplace .mp-vertical-status-dot {
  background: #B8891E;
}

[data-theme="light"] .sc-marketplace .vertical-card::before {
  background: linear-gradient(135deg, rgba(245,166,35,0.04) 0%, rgba(232,102,74,0.03) 100%);
}

/* Footer — ALWAYS dark */
[data-theme="light"] .sc-marketplace .sc-footer {
  background: #1A1612;
  border-top-color: transparent;
}
`;

export default function Marketplace() {
  // Waitlist form state
  const [email, setEmail] = useState("");
  const [side, setSide] = useState("seeking");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Bottom CTA form state (separate)
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaSide, setCtaSide] = useState("seeking");
  const [ctaSubmitting, setCtaSubmitting] = useState(false);
  const [ctaSubmitted, setCtaSubmitted] = useState(false);

  // Intersection Observer for vertical cards
  const verticalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject CSS
    const style = document.createElement("style");
    style.textContent = marketplaceCSS;
    document.head.appendChild(style);

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Intersection Observer for vertical cards staggered entrance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.vertical-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, index * 100); // 100ms stagger
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (verticalsRef.current) {
      observer.observe(verticalsRef.current);
    }

    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent, isBottomCta = false) => {
    e.preventDefault();
    const currentEmail = isBottomCta ? ctaEmail : email;
    const currentSide = isBottomCta ? ctaSide : side;
    const setCurrentSubmitting = isBottomCta ? setCtaSubmitting : setSubmitting;
    const setCurrentSubmitted = isBottomCta ? setCtaSubmitted : setSubmitted;

    if (!currentEmail) return;

    setCurrentSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentEmail,
          source: "marketplace",
          intent: currentSide,
        }),
      });

      if (response.ok) {
        setCurrentSubmitted(true);
      }
    } catch {
      // Silent fail - could add error handling
    } finally {
      setCurrentSubmitting(false);
    }
  };

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
        {submitted ? (
          <div className="mp-waitlist-success">
            <span>✓</span> You're on the list. We'll be in touch.
          </div>
        ) : (
          <form className="mp-waitlist-form" onSubmit={(e) => handleSubmit(e, false)}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mp-waitlist-input"
              required
            />
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="mp-waitlist-select"
            >
              {SIDE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting || !email}
              className="mp-waitlist-submit"
            >
              {submitting ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
        )}
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
        <div className="verticals-grid" ref={verticalsRef}>
          {VERTICALS.map((v) => (
            <div key={v.key} className="vertical-card">
              <VerticalIcon badge={v.badge} />
              <div className="mp-vertical-status">
                <span className="mp-vertical-status-dot" />
                Coming Soon
              </div>
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
          Join the waitlist to be first in line when the marketplace launches.
          Tell us which side of the table you're on.
        </p>
        {ctaSubmitted ? (
          <div className="mp-waitlist-success">
            <span>✓</span> You're on the list. We'll be in touch.
          </div>
        ) : (
          <form className="mp-waitlist-form" onSubmit={(e) => handleSubmit(e, true)}>
            <input
              type="email"
              placeholder="your@email.com"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              className="mp-waitlist-input"
              required
            />
            <select
              value={ctaSide}
              onChange={(e) => setCtaSide(e.target.value)}
              className="mp-waitlist-select"
            >
              {SIDE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={ctaSubmitting || !ctaEmail}
              className="mp-waitlist-submit"
            >
              {ctaSubmitting ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
        )}
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
