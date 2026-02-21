/*
  SunClaw Brand Landing Page
  Pixel-perfect React conversion of sunclaw-landing.html
  All CSS from the original preserved via <style> injection
*/

import { useEffect } from "react";

// The SVG inline components match the HTML file exactly
function NavLogo() {
  return (
    <svg viewBox="10 4 100 76" fill="none" width="32" height="24">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function HeroLogo() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="120" height="120">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <g className="claw-anim">
        <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="33" cy="11" r="3" fill="#E8664A"/>
        <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      </g>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="30" y1="60" x2="16" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="90" y1="60" x2="104" y2="64" stroke="#E8664A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <line x1="46" y1="78" x2="42" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="60" y1="80" x2="60" y2="96" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <line x1="74" y1="78" x2="78" y2="92" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function CtaLogo() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="72" height="72" style={{ marginBottom: 24 }}>
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <line x1="30" y1="50" x2="18" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="90" y1="50" x2="102" y2="45" stroke="#E8664A" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="52.2" cy="48.8" r="1.3" fill="#FFF"/>
      <circle cx="70.2" cy="48.8" r="1.3" fill="#FFF"/>
      <path d="M52 60 Q60 66 68 60" stroke="#1A1612" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function FooterLogo() {
  return (
    <svg viewBox="10 4 100 76" fill="none" width="24" height="18">
      <circle cx="60" cy="54" r="26" fill="#F5A623"/>
      <path d="M44 26 C42 18, 38 13, 33 12 C28 11, 26 15, 28 19 C30 23, 34 26, 38 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="33" cy="11" r="3" fill="#E8664A"/>
      <path d="M76 26 C78 18, 82 13, 87 12 C92 11, 94 15, 92 19 C90 23, 86 26, 82 28" stroke="#E8664A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="87" cy="11" r="3" fill="#E8664A"/>
      <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
      <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
    </svg>
  );
}

const chatBotIcon = (
  <svg viewBox="0 0 120 120" fill="none" width="16" height="16">
    <circle cx="60" cy="54" r="26" fill="#F5A623"/>
    <circle cx="51" cy="50" r="3.5" fill="#1A1612"/>
    <circle cx="69" cy="50" r="3.5" fill="#1A1612"/>
  </svg>
);

// All CSS from the original HTML, scoped under .sc-landing
const landingCSS = `
.sc-landing {
  --sun-gold: #F5A623;
  --lobster-coral: #E8664A;
  --deep-earth: #1A1612;
  --soft-cream: #FFF8F0;
  --charcoal: #2C2824;
  --text-primary: #F0EAE0;
  --text-secondary: #9E958B;
  --text-muted: #6B635B;
  font-family: 'DM Sans', sans-serif;
  background: var(--deep-earth);
  color: var(--text-primary);
  line-height: 1.7;
  overflow-x: hidden;
  min-height: 100vh;
}
.sc-landing * { margin: 0; padding: 0; box-sizing: border-box; }

/* NAV */
.sc-landing .sc-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 20px 40px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(26,22,18,0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(245,166,35,0.06);
}
.sc-landing .nav-logo { display: flex; align-items: center; gap: 6px; text-decoration: none; }
.sc-landing .nav-logo svg { margin: -4px 0; }
.sc-landing .nav-wordmark { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; }
.sc-landing .nav-wordmark .s { color: var(--sun-gold); }
.sc-landing .nav-wordmark .c { color: var(--lobster-coral); }
.sc-landing .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
.sc-landing .nav-links a { color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.3s; }
.sc-landing .nav-links a:hover { color: var(--sun-gold); }
.sc-landing .nav-cta { padding: 10px 24px; border-radius: 100px; background: var(--sun-gold); color: var(--deep-earth) !important; font-weight: 700 !important; font-size: 13px !important; transition: all 0.3s !important; }
.sc-landing .nav-cta:hover { background: #FFB840 !important; transform: translateY(-1px); }

/* HERO */
.sc-landing .hero {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 120px 40px 80px; position: relative; overflow: hidden;
}
.sc-landing .hero::before {
  content: ''; position: absolute; top: -200px; right: -200px; width: 900px; height: 900px;
  background: radial-gradient(circle, rgba(245,166,35,0.1) 0%, rgba(232,102,74,0.04) 40%, transparent 70%);
  border-radius: 50%; animation: heroGlow 10s ease-in-out infinite;
}
.sc-landing .hero::after {
  content: ''; position: absolute; bottom: -200px; left: -200px; width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(232,102,74,0.06) 0%, transparent 70%);
  border-radius: 50%; animation: heroGlow 10s ease-in-out infinite 5s;
}
@keyframes heroGlow { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
@keyframes clawWave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
.sc-landing .hero-logo { position: relative; z-index: 2; margin-bottom: 40px; opacity: 0; animation: fadeUp 0.8s ease forwards 0.2s; }
.sc-landing .hero-logo .claw-anim { animation: clawWave 3s ease-in-out infinite; transform-origin: 60px 26px; }
.sc-landing .hero h1 {
  font-family: 'Outfit', sans-serif; font-size: clamp(40px, 6vw, 72px); font-weight: 800;
  text-align: center; line-height: 1.1; max-width: 960px; position: relative; z-index: 2;
  opacity: 0; animation: fadeUp 0.8s ease forwards 0.4s;
}
.sc-landing .hero h1 .gold { color: var(--sun-gold); }
.sc-landing .hero h1 .coral { color: var(--lobster-coral); }
.sc-landing .hero-sub {
  font-size: 18px; color: var(--text-secondary); text-align: center; max-width: 620px; margin-top: 24px;
  position: relative; z-index: 2; opacity: 0; animation: fadeUp 0.8s ease forwards 0.6s;
}
.sc-landing .hero-ctas {
  display: flex; gap: 16px; margin-top: 40px; position: relative; z-index: 2;
  opacity: 0; animation: fadeUp 0.8s ease forwards 0.8s;
}
.sc-landing .btn-primary {
  padding: 16px 36px; border-radius: 100px; background: var(--sun-gold); color: var(--deep-earth);
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 16px; text-decoration: none;
  transition: all 0.3s; border: none; cursor: pointer;
}
.sc-landing .btn-primary:hover { background: #FFB840; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(245,166,35,0.3); }
.sc-landing .btn-secondary {
  padding: 16px 36px; border-radius: 100px; background: transparent; color: var(--text-primary);
  font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 16px; text-decoration: none;
  border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s; cursor: pointer;
}
.sc-landing .btn-secondary:hover { border-color: var(--sun-gold); color: var(--sun-gold); }
.sc-landing .hero-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px;
  background: rgba(232,102,74,0.1); border: 1px solid rgba(232,102,74,0.2);
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; color: var(--lobster-coral);
  margin-bottom: 24px; position: relative; z-index: 2; opacity: 0; animation: fadeUp 0.8s ease forwards 0.1s;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* SOCIAL PROOF */
.sc-landing .social-proof {
  padding: 40px; display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap;
  border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sc-landing .proof-item { text-align: center; }
.sc-landing .proof-number { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: var(--sun-gold); }
.sc-landing .proof-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.sc-landing .proof-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); }

/* SECTIONS */
.sc-landing .section-eyebrow { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--sun-gold); margin-bottom: 16px; }
.sc-landing .section-heading { font-family: 'Outfit', sans-serif; font-size: clamp(28px, 4vw, 42px); font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
.sc-landing .section-sub { font-size: 16px; color: var(--text-secondary); max-width: 600px; margin-bottom: 56px; }

/* HOW IT WORKS */
.sc-landing .how-section { padding: 120px 40px; max-width: 1280px; margin: 0 auto; }
.sc-landing .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.sc-landing .step-card {
  padding: 36px 28px; border-radius: 20px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s; position: relative; overflow: hidden;
}
.sc-landing .step-card:hover { border-color: rgba(245,166,35,0.2); background: rgba(255,255,255,0.04); transform: translateY(-4px); }
.sc-landing .step-number { font-family: 'Outfit', sans-serif; font-size: 56px; font-weight: 800; color: rgba(245,166,35,0.08); position: absolute; top: 12px; right: 20px; line-height: 1; }
.sc-landing .step-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(245,166,35,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 22px; }
.sc-landing .step-card h3 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.sc-landing .step-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

/* FEATURES */
.sc-landing .features-section { padding: 120px 40px; max-width: 1280px; margin: 0 auto; }
.sc-landing .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.sc-landing .feature-card {
  padding: 36px; border-radius: 20px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s;
}
.sc-landing .feature-card:hover { border-color: rgba(245,166,35,0.15); transform: translateY(-2px); }
.sc-landing .feature-card.highlight {
  grid-column: span 3; background: linear-gradient(135deg, rgba(245,166,35,0.06), rgba(232,102,74,0.04));
  border-color: rgba(245,166,35,0.15); display: flex; gap: 48px; align-items: center;
}
.sc-landing .feature-icon { font-size: 28px; margin-bottom: 16px; }
.sc-landing .feature-card h3 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.sc-landing .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
.sc-landing .feature-tag { display: inline-block; padding: 4px 12px; border-radius: 100px; background: rgba(245,166,35,0.1); font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--sun-gold); margin-bottom: 12px; }

/* CHAT PREVIEW */
.sc-landing .chat-preview { max-width: 420px; flex-shrink: 0; }
.sc-landing .chat-bubble { padding: 14px 18px; border-radius: 18px; font-size: 14px; line-height: 1.6; margin-bottom: 12px; max-width: 320px; }
.sc-landing .chat-user { background: rgba(245,166,35,0.15); color: var(--text-primary); margin-left: auto; border-bottom-right-radius: 6px; }
.sc-landing .chat-bot { background: rgba(255,255,255,0.06); color: var(--text-secondary); border-bottom-left-radius: 6px; }
.sc-landing .chat-bot-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: var(--sun-gold); }

/* MARKETPLACE */
.sc-landing .marketplace-section { padding: 120px 40px; background: linear-gradient(180deg, transparent, rgba(245,166,35,0.03), transparent); }
.sc-landing .marketplace-inner { max-width: 1280px; margin: 0 auto; }
.sc-landing .market-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
.sc-landing .market-card { padding: 32px 24px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: all 0.3s; }
.sc-landing .market-card:hover { border-color: rgba(245,166,35,0.2); transform: translateY(-3px); }
.sc-landing .market-icon { font-size: 36px; margin-bottom: 16px; }
.sc-landing .market-card h4 { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.sc-landing .market-card p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

/* CTA SECTION */
.sc-landing .cta-section { padding: 120px 40px; text-align: center; position: relative; overflow: hidden; }
.sc-landing .cta-section::before {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 600px; height: 600px; background: radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%); border-radius: 50%;
}
.sc-landing .cta-content { position: relative; z-index: 2; }
.sc-landing .cta-content h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
.sc-landing .cta-content p { font-size: 18px; color: var(--text-secondary); max-width: 560px; margin: 0 auto 40px; }

/* FOOTER */
.sc-landing .sc-footer {
  padding: 60px 40px; border-top: 1px solid rgba(255,255,255,0.04); max-width: 1280px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;
}
.sc-landing .footer-left { display: flex; align-items: center; gap: 10px; }
.sc-landing .footer-wordmark { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 18px; }
.sc-landing .footer-copy { font-size: 13px; color: var(--text-muted); margin-left: 16px; }
.sc-landing .footer-links { display: flex; gap: 24px; list-style: none; }
.sc-landing .footer-links a { color: var(--text-muted); text-decoration: none; font-size: 13px; transition: color 0.3s; }
.sc-landing .footer-links a:hover { color: var(--sun-gold); }
.sc-landing .footer-lobster { font-size: 12px; color: var(--text-muted); font-family: 'Space Mono', monospace; opacity: 0.5; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .sc-landing .sc-nav { padding: 16px 20px; }
  .sc-landing .nav-links { display: none; }
  .sc-landing .hero { padding: 100px 24px 60px; }
  .sc-landing .hero-ctas { flex-direction: column; width: 100%; max-width: 320px; }
  .sc-landing .btn-primary, .sc-landing .btn-secondary { text-align: center; }
  .sc-landing .steps-grid { grid-template-columns: 1fr; }
  .sc-landing .features-grid { grid-template-columns: 1fr; }
  .sc-landing .feature-card.highlight { grid-column: span 1; flex-direction: column; }
  .sc-landing .market-cards { grid-template-columns: 1fr; }
  .sc-landing .audience-section div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  .sc-landing section > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  .sc-landing .how-section, .sc-landing .features-section, .sc-landing .marketplace-section, .sc-landing .cta-section { padding: 80px 24px; }
  .sc-landing .social-proof { gap: 24px; }
  .sc-landing .proof-divider { display: none; }
}

/* CONVERSATIONAL FUNNEL */
.sc-landing .sc-funnel {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sc-landing .sc-funnel-bot-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sc-landing .sc-funnel-bot-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.sc-landing .sc-funnel-bot-bubble {
  background: rgba(255,255,255,0.06);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 380px;
}

.sc-landing .sc-funnel-user-row {
  display: flex;
  justify-content: flex-end;
}

.sc-landing .sc-funnel-user-bubble {
  background: rgba(245,166,35,0.15);
  border-radius: 18px;
  border-bottom-right-radius: 6px;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  max-width: 320px;
}

.sc-landing .sc-funnel-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 36px;
}

.sc-landing .sc-funnel-choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.sc-landing .sc-funnel-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  opacity: 0;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-choice:hover {
  border-color: rgba(245,166,35,0.2);
  background: rgba(255,255,255,0.04);
  transform: translateY(-2px);
}

.sc-landing .sc-funnel-choice-icon {
  font-size: 20px;
}

.sc-landing .sc-funnel-choice-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-primary);
}

.sc-landing .sc-funnel-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 36px;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.sc-landing .sc-funnel-input::placeholder {
  color: var(--text-muted);
}

.sc-landing .sc-funnel-input:focus {
  border-color: rgba(245,166,35,0.4);
}

.sc-landing .sc-funnel-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 100px;
  background: var(--sun-gold);
  color: var(--deep-earth);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.sc-landing .sc-funnel-submit:hover {
  background: #FFB840;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(245,166,35,0.3);
}

.sc-landing .sc-funnel-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.sc-landing .sc-funnel-cta-row {
  margin-left: 36px;
  animation: scFunnelFadeUp 0.3s ease forwards;
}

.sc-landing .sc-funnel-note {
  margin-left: 36px;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

@keyframes scFunnelFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .sc-landing .sc-funnel { max-width: 100%; }
  .sc-landing .sc-funnel-choices { margin-left: 0; }
  .sc-landing .sc-funnel-choices-grid { grid-template-columns: 1fr; }
  .sc-landing .sc-funnel-form { margin-left: 0; }
  .sc-landing .sc-funnel-cta-row { margin-left: 0; }
  .sc-landing .sc-funnel-note { margin-left: 0; }
  .sc-landing .sc-funnel-bot-bubble { max-width: 280px; }
  .sc-landing .sc-funnel-user-bubble { max-width: 260px; }
}
`;

export default function LandingPage() {
  useEffect(() => {
    // Inject scoped CSS
    const style = document.createElement("style");
    style.textContent = landingCSS;
    style.setAttribute("data-landing", "true");
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  return (
    <div className="sc-landing">
      {/* NAV */}
      <nav className="sc-nav">
        <a href="/" className="nav-logo">
          <NavLogo />
          <span className="nav-wordmark"><span className="s">Sun</span><span className="c">Claw</span></span>
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="/marketplace">Marketplace</a></li>
          <li><a href="/agent">For Developers</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/marketplace" className="nav-cta">Get Early Access</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">🦞 Born in the reef. Built for the sun.</div>
        <div className="hero-logo"><HeroLogo /></div>
        <h1>The <span className="gold">energy conversation</span> the world's been waiting for.</h1>
        <p className="hero-sub">SunClaw is your AI-powered advisor for renewable energy. Whether you're developing a project or providing the services to build one, SunClaw matches you to the right people through conversation.</p>
        <div className="hero-ctas">
          <a href="/marketplace" className="btn-primary">Get Early Access</a>
          <a href="/agent/setup" className="btn-secondary">Deploy Your Own Agent</a>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="social-proof">
        <div className="proof-item"><div className="proof-number">91+</div><div className="proof-label">Features</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">18</div><div className="proof-label">Categories</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">15+</div><div className="proof-label">Channels</div></div>
        <div className="proof-divider" />
        <div className="proof-item"><div className="proof-number">15+</div><div className="proof-label">Languages</div></div>
      </div>

      {/* WHO IT'S FOR */}
      <section className="audience-section" style={{ padding: "100px 40px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-eyebrow">Who It's For</div>
        <h2 className="section-heading">Two sides. One conversation.</h2>
        <p className="section-sub">SunClaw is a two-sided marketplace. Both sides build profiles through conversation, and both sides get matched.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 40 }}>
          <div style={{ padding: 36, borderRadius: 20, background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.15)" }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>☀️</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#F5A623" }}>Looking for services</h3>
            <p style={{ fontSize: 14, color: "#9E958B", lineHeight: 1.7, marginBottom: 16 }}>Project developers, asset owners, C&I clients, utilities, governments, and anyone building or financing a renewable energy project.</p>
            <p style={{ fontSize: 13, color: "#6B635B", lineHeight: 1.7, fontStyle: "italic" }}>"Find me an EPC in Lagos." "Model this PPA." "Who's financing mini-grids right now?"</p>
          </div>
          <div style={{ padding: 36, borderRadius: 20, background: "rgba(232,102,74,0.05)", border: "1px solid rgba(232,102,74,0.15)" }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>🔧</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#E8664A" }}>Offering services</h3>
            <p style={{ fontSize: 14, color: "#9E958B", lineHeight: 1.7, marginBottom: 16 }}>Installers, EPC contractors, financiers, DFIs, consultants, equipment suppliers, recruiters, and independent engineers.</p>
            <p style={{ fontSize: 13, color: "#6B635B", lineHeight: 1.7, fontStyle: "italic" }}>"Send me solar leads in West Africa." "Match me with projects that need biomass expertise." "I have surplus panels to move."</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-eyebrow">How It Works</div>
        <h2 className="section-heading">Three steps. No forms. No dashboards.</h2>
        <p className="section-sub">SunClaw builds your profile through natural conversation, then connects you to exactly what you need.</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">💬</div>
            <h3>Start a Conversation</h3>
            <p>Message SunClaw on Telegram, WhatsApp, Signal, Discord, Slack, Teams, Google Chat, iMessage, Matrix, or WebChat. Tell it what you're building or what you offer. No sign-up forms. Just talk.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🧠</div>
            <h3>SunClaw Learns</h3>
            <p>Every conversation builds a structured profile. Whether you're a developer describing a project or an installer listing your capabilities, SunClaw captures it naturally as you talk.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🤝</div>
            <h3>Both Sides Get Matched</h3>
            <p>SunClaw anonymously matches supply to demand. Developers find installers. Installers find leads. Financiers find deal flow. Both parties consent before any introduction is made.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-eyebrow">Platform Features</div>
        <h2 className="section-heading">91 features. 18 categories. One conversation.</h2>
        <p className="section-sub">From feasibility to financing, from hiring to hardware. SunClaw covers the full lifecycle of renewable energy projects.</p>
        <div className="features-grid">
          <div className="feature-card highlight">
            <div style={{ flex: 1 }}>
              <div className="feature-tag">Live Chat Preview</div>
              <h3>Conversational-First Design</h3>
              <p>No dashboards to learn. No forms to fill. SunClaw meets you where you already are. Just message it and start talking about your energy project. It handles the structure, you provide the context.</p>
            </div>
            <div className="chat-preview">
              <div className="chat-bubble chat-user">I'm looking at a 5MW solar farm in Kaduna State. What do I need to get started?</div>
              <div className="chat-bubble chat-bot">
                <div className="chat-bot-header">{chatBotIcon} SunClaw</div>
                Great location. Strong irradiance at 5.4 kWh/m²/day. For a 5MW solar farm, you'll need generation licensing, land (roughly 4-5 hectares), and an ESIA. I've built a development checklist for you. Want me to walk through each stage?
              </div>
              <div className="chat-bubble chat-user">Yes, and can you find me EPC contractors in the region?</div>
            </div>
          </div>

          {[
            { icon: "📊", title: "Financial Modeling", desc: "LCOE, IRR, NPV, payback period. Run sensitivity analyses through conversation. Compare financing structures (lease vs PPA vs direct purchase). Generate investor-ready projections." },
            { icon: "📋", title: "Project Development Tracker", desc: "From land acquisition to commissioning. Country-specific checklists, progress tracking, dependency flags, and proactive nudges on next steps." },
            { icon: "🔧", title: "Field Diagnostics", desc: "Send a photo of a fault, wiring issue, or error code. SunClaw identifies the problem and walks technicians through the fix, step by step. Safety guidance included." },
            { icon: "📄", title: "Document Engine", desc: "Generate proposals, RFQ documents, due diligence packages, and impact reports. Upload PDFs and SunClaw extracts and structures the data." },
            { icon: "🧠", title: "Knowledge Hub", desc: "Personalized industry feed, active grant and tender listings, market intelligence, and a best practices library tailored to your role and region." },
            { icon: "🗓️", title: "Communication & Productivity", desc: "Meeting transcription, email drafting, reminders, calendar integration. The daily productivity layer that keeps you coming back." },
            { icon: "🌍", title: "Multilingual Support", desc: "Auto language detection, code-switching between languages mid-conversation, cross-party translation for multi-stakeholder deals, and cultural context awareness." },
            { icon: "⚡", title: "EV & Emerging Tech", desc: "EV charging infrastructure advisory, green hydrogen, advanced energy storage, and mini-grid/microgrid design. Forward-looking from day one." },
            { icon: "📈", title: "Data & Analytics", desc: "Every conversation generates data. Aggregated and anonymized, it becomes market intelligence no one else has. Analytics products for subscribers." },
            { icon: "👥", title: "Community & Network Effects", desc: "Peer networking, mentorship matching, virtual events, and user-generated content. The platform gets more valuable with every new user." },
            { icon: "🔒", title: "Security, Privacy & Trust", desc: "Per-user data isolation, GDPR compliance, verification systems, fraud prevention, and ethical AI practices. Trust is the currency of a marketplace." },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="marketplace-section">
        <div className="marketplace-inner">
          <div className="section-eyebrow">The Marketplace</div>
          <h2 className="section-heading">Every conversation powers something.</h2>
          <p className="section-sub">SunClaw is a multi-sided marketplace where every chat builds a profile, and every profile becomes a node in a matching network.</p>
          <div className="market-cards">
            {[
              { icon: "💰", title: "Project-to-Finance", desc: "Developers find capital. Investors find deal flow. Anonymous matching, consent-based introductions." },
              { icon: "🔨", title: "Developer-to-Installer", desc: "Developers find verified installers. Installers receive qualified leads by region and specialization." },
              { icon: "👷", title: "Developer-to-EPC", desc: "Projects find contractors. EPCs, engineers, and consultants find new mandates." },
              { icon: "🌱", title: "Carbon Credits", desc: "Project owners assess eligibility and estimate volumes. Buyers find verified carbon credit supply." },
              { icon: "👥", title: "Talent Matching", desc: "Job seekers build profiles through conversation. Employers search by skills, not keywords." },
              { icon: "⚡", title: "Equipment Market", desc: "Buyers find panels, inverters, and batteries. Distributors and OEMs reach verified demand." },
              { icon: "🏗️", title: "Startup-to-Funder", desc: "RE startups find VCs, grants, and accelerators. Funders find vetted early-stage pipeline." },
              { icon: "🗺️", title: "Land-to-Developer", desc: "Landowners list suitable parcels. Developers find sites for utility-scale and mini-grid projects." },
              { icon: "🛡️", title: "Insurance Marketplace", desc: "Projects find brokers and underwriters. Insurers access a pipeline of RE risk they can price." },
            ].map((m, i) => (
              <div className="market-card" key={i}>
                <div className="market-icon">{m.icon}</div>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOY YOUR OWN */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div className="section-eyebrow">For Developers</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 700, color: "#FFF8F0", lineHeight: 1.2, marginBottom: 16 }}>Want your own<br/>standalone agent?</h2>
              <p style={{ fontSize: 16, color: "#9E958B", lineHeight: 1.7, marginBottom: 24 }}>
                SunClaw is also the easiest way to deploy OpenClaw for renewable energy. Get a personal AI agent pre-loaded with 11 RE skills, running on your own infrastructure or ours. No ecosystem, no marketplace, just your own bot on your own terms.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Free tier: guided self-setup, BYO keys + infrastructure",
                  "Pro ($29/mo): managed hosting, up to 3 bots, live logs",
                  "Enterprise ($99/mo): dedicated infra, managed keys, KIISHA integration",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#F5A623", fontSize: 14 }}>✓</span>
                    <span style={{ color: "#C4B9AB", fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/agent/setup" className="btn-primary" style={{ display: "inline-block" }}>Launch Setup Wizard</a>
            </div>
            <div style={{ padding: 32, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#6B635B", lineHeight: 2 }}>
              <span style={{ color: "#F5A623" }}>$</span> <span style={{ color: "#C4B9AB" }}>npx sunclaw setup</span><br/><br/>
              <span style={{ color: "#6B635B" }}>  ☞ Configuring OpenClaw Gateway...</span><br/>
              <span style={{ color: "#6B635B" }}>  ☞ Loading 11 RE skills...</span><br/>
              {["Solar Irradiance", "LCOE Calculator", "PV Design", "BESS Sizing", "Financial Model", "PPA Analyzer", "O&M Diagnostics", "Wind Turbine Specs", "Grid Status", "IRENA Search", "Carbon Calculator"].map((skill, i) => (
                <span key={i}><span style={{ color: "#6B635B" }}>  ☞ {skill} ✓</span><br/></span>
              ))}
              <br/>
              <span style={{ color: "#F5A623" }}>✓</span> <span style={{ color: "#C4B9AB" }}>SunClaw ready. Connect your first channel.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <CtaLogo />
          <h2>Clean energy starts<br/>with a <span style={{ color: "var(--sun-gold)" }}>message</span>.</h2>
          <p>Whether you're building projects or providing the services to build them, join the waitlist for the conversational operating system for renewable energy.</p>
          <a href="/marketplace" className="btn-primary" style={{ display: "inline-block" }}>Get Early Access</a>
          <a href="/agent/setup" className="btn-secondary" style={{ display: "inline-block", marginLeft: 12 }}>Deploy Your Own Agent</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sc-footer">
        <div className="footer-left">
          <FooterLogo />
          <span className="footer-wordmark"><span style={{ color: "var(--sun-gold)" }}>Sun</span><span style={{ color: "var(--lobster-coral)" }}>Claw</span></span>
          <span className="footer-copy">&copy; 2026 KIISHA Ltd. All rights reserved.</span>
        </div>
        <ul className="footer-links">
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="mailto:hello@sunclaw.ai">Contact</a></li>
        </ul>
        <span className="footer-lobster">🦞 the lobster way</span>
      </footer>
    </div>
  );
}
