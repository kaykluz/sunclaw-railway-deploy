import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { SunClawFullIcon } from "@/components/SunClawLogo";

export default function Marketplace() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to backend waitlist endpoint
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#1A1612] text-[#F0EAE0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <LandingNavbar />

      <section className="min-h-screen flex flex-col justify-center items-center px-6 md:px-10 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.06)_0%,transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mb-8"
        >
          <SunClawFullIcon size={80} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 font-mono text-[11px] tracking-[1px] text-[#F5A623] mb-6"
        >
          COMING SOON
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 font-display font-extrabold text-center leading-[1.1] max-w-[700px] mb-6"
          style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
        >
          The <span className="text-[#F5A623]">Marketplace</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-lg text-[#9E958B] text-center max-w-[520px] mb-12"
        >
          A two-sided marketplace connecting renewable energy professionals through conversation. Developers find services. Providers find leads. Every conversation powers something.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 w-full max-w-[460px]"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-5 py-3.5 rounded-xl bg-white/4 border border-white/10 text-[#F0EAE0] placeholder-[#6B635B] text-sm outline-none focus:border-[#F5A623]/40 transition-colors"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-white/4 border border-white/10 text-[#9E958B] text-sm outline-none focus:border-[#F5A623]/40 transition-colors appearance-none"
              >
                <option value="">I am a...</option>
                <option value="developer">Project Developer</option>
                <option value="installer">Installer / EPC</option>
                <option value="financier">Financier / Investor</option>
                <option value="consultant">Consultant / Engineer</option>
                <option value="supplier">Equipment Supplier</option>
                <option value="government">Government / DFI</option>
                <option value="other">Other</option>
              </select>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F5A623] text-[#1A1612] font-display font-bold text-sm hover:bg-[#FFB840] transition-all"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center p-8 rounded-xl bg-white/4 border border-[#2D5A3D]/30">
              <CheckCircle2 className="w-12 h-12 text-[#2D5A3D] mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Welcome to the reef.</h3>
              <p className="text-sm text-[#9E958B]">We'll notify you when the marketplace opens. In the meantime, you can <a href="/agent/setup" className="text-[#F5A623] hover:underline">deploy your own SunClaw agent</a> today.</p>
            </div>
          )}
        </motion.div>

        {/* Marketplace features preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 mt-16 grid sm:grid-cols-3 gap-6 max-w-[700px] w-full"
        >
          {[
            { icon: "💬", title: "Conversational Profiles", desc: "No forms. Just talk. SunClaw builds your profile as you chat." },
            { icon: "🤝", title: "Anonymous Matching", desc: "Get matched to opportunities. Both parties consent before introductions." },
            { icon: "🌍", title: "Africa-First", desc: "Built for the markets where renewable energy growth is fastest." },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-white/2 border border-white/6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h4 className="font-display text-sm font-bold mb-1">{item.title}</h4>
              <p className="text-xs text-[#6B635B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
