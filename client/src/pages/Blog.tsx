import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

const posts = [
  {
    slug: "setup-openclaw-with-sunclaw-kiisha",
    title: "How to Set Up OpenClaw the KIISHA Way",
    excerpt: "No CLI. No terminal. 4 steps. 8 deployment platforms. 11 renewable energy AI skills. Here's how KIISHA does it.",
    date: "2025-12-15",
    readTime: "12 min",
    tags: ["Tutorial", "OpenClaw", "Setup"],
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#1A1612] text-[#F0EAE0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <LandingNavbar />

      <section className="max-w-[800px] mx-auto px-6 md:px-10 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono text-[11px] tracking-[4px] uppercase text-[#F5A623] mb-4">Blog</div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.1] mb-4">
            From the <span className="text-[#F5A623]">reef</span>.
          </h1>
          <p className="text-lg text-[#9E958B] mb-16">
            Product updates, RE industry insights, and deployment guides from the SunClaw team.
          </p>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              className="block p-8 rounded-[20px] bg-white/2 border border-white/6 hover:border-[#F5A623]/20 hover:bg-white/4 transition-all no-underline group"
            >
              <div className="flex items-center gap-4 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-block px-3 py-1 rounded-full bg-[#F5A623]/10 font-mono text-[10px] tracking-[1px] uppercase text-[#F5A623]">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-2xl font-bold mb-3 text-[#F0EAE0] group-hover:text-[#F5A623] transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-[#9E958B] leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-6 text-xs text-[#6B635B]">
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{post.readTime}</span>
                <span className="ml-auto flex items-center gap-1 text-[#F5A623] font-medium group-hover:gap-2 transition-all">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6B635B]">No posts yet. Check back soon.</p>
          </div>
        )}
      </section>

      <LandingFooter />
    </div>
  );
}
