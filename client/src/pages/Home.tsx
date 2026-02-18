/*
  SunClaw Agent — Product Page
  DESIGN: SunClaw Brand System — Outfit display, DM Sans body, Space Mono mono
  PALETTE: Sun Gold #F5A623, Lobster Coral #E8664A, Deep Earth #1A1612
*/

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sun, Wind, Zap, BarChart3, FileCheck, Wrench, Bell, CreditCard, Globe, ArrowRight, ChevronRight, ExternalLink, Shield, Lock, Eye, Server, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { BorderBeam } from "@/components/ui/border-beam";
import Navbar from "@/components/Navbar";
import ChatDemo from "@/components/ChatDemo";
import SkillCard from "@/components/SkillCard";
import ChannelBadge from "@/components/ChannelBadge";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import DeploySection from "@/components/DeploySection";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

const HERO_BG = "https://pub-4ba7299b0f084cdab3e1978ef2856fa3.r2.dev/images/sunclaw-hero-bg.jpg";
const SOLAR_IMG = "https://pub-4ba7299b0f084cdab3e1978ef2856fa3.r2.dev/images/sunclaw-solar-panel.jpg";
const WIND_IMG = "https://pub-4ba7299b0f084cdab3e1978ef2856fa3.r2.dev/images/sunclaw-wind-farm.jpg";
const DASHBOARD_IMG = "https://pub-4ba7299b0f084cdab3e1978ef2856fa3.r2.dev/images/sunclaw-dashboard.jpg";

const standaloneSkills = [
  { id: "solar.irradiance_lookup", name: "Solar Irradiance", description: "GHI/DNI/DHI for any location worldwide via EU PVGIS and NREL APIs", icon: Sun, color: "amber" as const },
  { id: "solar.pv_design", name: "Solar PV Design", description: "Module selection, string sizing, tilt/azimuth optimization, DC:AC ratio design", icon: Sun, color: "amber" as const },
  { id: "finance.lcoe_calculator", name: "LCOE Calculator", description: "Levelized Cost of Energy with IRENA benchmark comparison", icon: BarChart3, color: "cyan" as const },
  { id: "finance.financial_model", name: "Financial Model", description: "IRR/NPV modeling, sensitivity analysis, debt sizing, DSCR calculation", icon: BarChart3, color: "cyan" as const },
  { id: "bess.sizing", name: "BESS Sizing", description: "Battery storage sizing — AC/DC coupling, capacity modeling, degradation curves", icon: Zap, color: "emerald" as const },
  { id: "wind.turbine_specs", name: "Wind Turbine Specs", description: "Technical database of 10+ major turbine models and specifications", icon: Wind, color: "cyan" as const },
  { id: "grid.status", name: "Grid Status", description: "Installed capacity, renewable share, and market data for 10+ countries", icon: Zap, color: "emerald" as const },
  { id: "ppa.analyzer", name: "PPA Analyzer", description: "Tariff structure analysis, bankability assessment, DSCR waterfall modeling", icon: FileCheck, color: "cyan" as const },
  { id: "om.diagnostics", name: "O&M Diagnostics", description: "Performance ratio analysis, fault detection, inverter error codes", icon: Wrench, color: "amber" as const },
  { id: "research.irena_search", name: "IRENA Search", description: "Curated index of key IRENA publications and policy documents", icon: FileCheck, color: "cyan" as const },
  { id: "carbon.emissions_calculator", name: "Carbon Calculator", description: "Avoided CO\u2082 emissions and carbon credit value estimation", icon: Globe, color: "emerald" as const },
];

const enterpriseSkills = [
  { id: "kiisha.portfolio.summary", name: "Portfolio Summary", description: "Real-time overview of renewable energy asset portfolios", icon: BarChart3, color: "amber" as const },
  { id: "kiisha.documents.status", name: "Document Compliance", description: "VATR-enforced document status and gap analysis", icon: FileCheck, color: "amber" as const },
  { id: "kiisha.ticket.create", name: "Work Orders", description: "Create and track maintenance tickets and work orders", icon: Wrench, color: "amber" as const },
  { id: "kiisha.alerts.list", name: "Alert Management", description: "View and acknowledge operational alerts in real-time", icon: Bell, color: "amber" as const },
  { id: "kiisha.payment.initiate", name: "Payments", description: "Initiate and track payments through KIISHA", icon: CreditCard, color: "amber" as const },
];

const channels = [
  { name: "Telegram", status: "active" as const },
  { name: "WhatsApp", status: "active" as const },
  { name: "Slack", status: "active" as const },
  { name: "Discord", status: "active" as const },
  { name: "Web Chat", status: "active" as const },
  { name: "Signal", status: "coming" as const },
  { name: "Teams", status: "coming" as const },
  { name: "Email", status: "coming" as const },
];

const securityRules = [
  { icon: Server, title: "Self-Hosted Gateway", desc: "Your OpenClaw Gateway runs on your own instance — data stays under your control" },
  { icon: Lock, title: "Authenticated Calls", desc: "All enterprise API calls require valid, scoped API keys" },
  { icon: Shield, title: "Encrypted Credentials", desc: "Channel tokens and API keys encrypted at rest" },
  { icon: Eye, title: "Full Audit Trail", desc: "Every interaction logged through the telemetry pipeline" },
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(8px)" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1612]">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1612]/60 via-[#1A1612]/80 to-[#1A1612]" />
        </div>
        <div className="container relative z-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#3D3630] bg-[#1E1A16]/60 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald pulse-green" />
                  <span className="text-[10px] font-mono text-[#9E958B] uppercase tracking-widest">Powered by OpenClaw</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.05] tracking-tight">
                  <TextGenerateEffect
                    words="The AI Agent for Renewable Energy"
                    className="text-white"
                    staggerValue={0.1}
                    duration={0.5}
                  />
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#6B635B] max-w-xl leading-relaxed">
                  Solar PV design, BESS sizing, financial modeling, PPA analysis, O&M diagnostics — across Telegram, WhatsApp, Slack, Discord, and Web Chat.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" className="bg-[#F5A623] text-[#1A1612] hover:bg-[#FFB840] font-medium gap-2 h-12 px-6" asChild>
                    <a href="/agent/setup">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#3D3630] hover:border-[#4D4640] hover:bg-[#2C2824]/50 gap-2 h-12 px-6 text-[#C4B9AB]" asChild>
                    <a href="#demo">
                      <Terminal className="w-5 h-5" />
                      Live Demo
                    </a>
                  </Button>
                </div>

                <div className="mt-8 max-w-md">
                  <WaitlistForm />
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:block"
            >
              <div className="relative rounded-2xl border border-[#3D3630] overflow-hidden">
                <img src={DASHBOARD_IMG} alt="SunClaw Dashboard" className="w-full rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-[#3D3630]/60 bg-[#1E1A16]/30 backdrop-blur-sm">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 11, label: "Energy Skills", suffix: "" },
              { value: 5, label: "Channels", suffix: "" },
              { value: 12, label: "Countries", suffix: "+" },
              { value: 10, label: "Turbine Models", suffix: "+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight"
                />
                <div className="text-[#6B635B] mt-2 text-[10px] uppercase tracking-widest font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 md:py-32">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">Two Modes. One Agent.</h2>
              <p className="text-[#6B635B] mt-4 max-w-2xl mx-auto text-base">SunClaw works out of the box with free renewable energy skills. Connect to <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="text-[#C4B9AB] hover:text-white transition-colors">KIISHA</a> to unlock enterprise portfolio management.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <div className="relative rounded-2xl border border-[#3D3630] bg-[#1E1A16]/50 p-8 h-full hover:border-[#4D4640] transition-colors group">
                <BorderBeam size={200} duration={10} borderWidth={1} colorVia="rgba(0, 212, 255, 0.3)" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C2824] border border-[#4D4640] mb-6">
                    <span className="font-mono text-[10px] text-[#C4B9AB] uppercase tracking-wider">Free</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">Standalone Mode</h3>
                  <p className="text-[#6B635B] text-sm mb-6">Deploy and immediately get a fully functional AI assistant with 6 purpose-built renewable energy skills.</p>
                  <div className="space-y-3">
                    {["Solar irradiance for any location (PVGIS API)", "LCOE calculations with IRENA benchmarks", "Wind turbine technical database (10+ models)", "Grid status for 12+ countries (Ember API)", "Carbon emissions calculator with credit estimates"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <ChevronRight className="w-4 h-4 text-[#6B635B] shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <span className="text-sm text-[#C4B9AB]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative rounded-2xl border border-[#3D3630] bg-[#1E1A16]/50 p-8 h-full hover:border-[#4D4640] transition-colors group">
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C2824] border border-[#4D4640] mb-6">
                    <span className="font-mono text-[10px] text-[#C4B9AB] uppercase tracking-wider">Enterprise</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight"><a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4B9AB] transition-colors">KIISHA</a>-Connected</h3>
                  <p className="text-[#6B635B] text-sm mb-6">Paste your <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="text-[#C4B9AB] hover:text-white transition-colors">KIISHA</a> API token and unlock enterprise portfolio management.</p>
                  <div className="space-y-3">
                    {["Real-time portfolio summaries", "VATR document compliance checks", "Create maintenance work orders", "Operational alert management", "Payment processing via KIISHA"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <ChevronRight className="w-4 h-4 text-[#6B635B] shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <span className="text-sm text-[#C4B9AB]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">Skills</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">Pre-Loaded Skills</h2>
              <p className="text-[#6B635B] mt-4 max-w-2xl mx-auto text-base">Purpose-built for renewable energy. Every skill works out of the box.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h3 className="font-mono text-[10px] text-[#6B635B] uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
              Standalone — Free
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {standaloneSkills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <SkillCard {...skill} />
                </motion.div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h3 className="font-mono text-[10px] text-[#6B635B] uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              Enterprise — <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="text-[#9E958B] hover:text-white transition-colors">KIISHA</a>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enterpriseSkills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <SkillCard {...skill} locked />
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== LIVE DEMO ===== */}
      <section id="demo" className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div>
                <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">Demo</span>
                <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">See It In Action</h2>
                <p className="text-[#6B635B] mt-4 text-base leading-relaxed">
                  Real renewable energy queries. This is what your users see across WhatsApp, Telegram, or any connected channel.
                </p>
                <div className="mt-8 relative rounded-2xl overflow-hidden border border-[#3D3630]">
                  <img src={SOLAR_IMG} alt="Solar farm" className="w-full aspect-video object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm text-[#C4B9AB] font-mono">"What's the solar irradiance for this site in Lagos?"</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <ChatDemo />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== CHANNELS ===== */}
      <section id="channels" className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">Channels</span>
                <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">Every Channel.<br />One Agent.</h2>
                <p className="text-[#6B635B] mt-4 text-base leading-relaxed">
                  Your team uses WhatsApp. Your investors check Slack. Your field engineers prefer Telegram. SunClaw speaks to all of them.
                </p>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {channels.map((ch, i) => (
                    <motion.div
                      key={ch.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <ChannelBadge {...ch} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden border border-[#3D3630]">
                <img src={WIND_IMG} alt="Wind farm" className="w-full aspect-video object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/60 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section id="architecture" className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">Architecture</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white tracking-tight">Built for Security</h2>
              <p className="text-[#6B635B] mt-4 max-w-2xl mx-auto text-base">SunClaw is the door. <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer" className="text-[#C4B9AB] hover:text-white transition-colors">KIISHA</a> is the vault.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ArchitectureDiagram />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {securityRules.map((rule, i) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="rounded-xl border border-[#3D3630] bg-[#1E1A16]/50 p-5 hover:border-[#4D4640] transition-colors group">
                  <rule.icon className="w-5 h-5 text-[#F5A623] mb-3 group-hover:text-[#FFB840] transition-colors" />
                  <h4 className="font-medium text-sm text-white mb-1">{rule.title}</h4>
                  <p className="text-xs text-[#6B635B] leading-relaxed">{rule.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEPLOY ===== */}
      <section id="deploy" className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <DeploySection />
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 md:py-32 border-t border-[#3D3630]/60">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Ready to Power Up?</h2>
            <p className="text-[#6B635B] mt-4 max-w-xl mx-auto text-base">
              Join the renewable energy professionals already using SunClaw.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#F5A623] text-[#1A1612] hover:bg-[#FFB840] font-medium gap-2 h-12 px-8" asChild>
                <a href="/agent/setup">
                  Launch Setup Wizard
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-[#3D3630] hover:border-[#4D4640] hover:bg-[#2C2824]/50 gap-2 h-12 px-8 text-[#C4B9AB]" asChild>
                <a href="https://kiisha.io" target="_blank" rel="noopener noreferrer">
                  Learn About KIISHA
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
