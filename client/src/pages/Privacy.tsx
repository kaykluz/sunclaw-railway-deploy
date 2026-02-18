import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 11, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Who We Are</h2>
            <p>
              SunClaw is operated by KIISHA ("we", "us", "our"). SunClaw is an AI-powered agent
              for renewable energy professionals, delivered through messaging channels and a web
              dashboard. For questions about this policy, contact us at{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p><strong className="text-foreground">Account information:</strong> When you register, we collect your name, email address, and password (hashed). If you sign up via a third-party channel (Telegram, WhatsApp, etc.), we collect the identifiers provided by that platform.</p>
            <p><strong className="text-foreground">Usage data:</strong> We log interactions with SunClaw skills (queries, timestamps, channel used) to improve the service and provide analytics in your dashboard.</p>
            <p><strong className="text-foreground">Payment information:</strong> Payments are processed by Stripe. We do not store your full card number. Stripe's privacy policy applies to payment data.</p>
            <p><strong className="text-foreground">Technical data:</strong> IP address, browser type, and device information collected automatically through standard web server logs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve SunClaw services</li>
              <li>Process transactions and send related notices</li>
              <li>Send verification emails, security alerts, and support messages</li>
              <li>Monitor usage patterns to improve skill accuracy and performance</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share information only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Service providers:</strong> Stripe (payments), Resend (email), Railway (hosting), and AI model providers necessary to power SunClaw skills</li>
              <li><strong className="text-foreground">KIISHA platform:</strong> If you connect a KIISHA API token, queries to enterprise skills are routed through the KIISHA API under your organization's data policies</li>
              <li><strong className="text-foreground">Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. AI & Model Providers</h2>
            <p>
              SunClaw uses third-party AI models to process your queries. Conversation content is
              sent to the configured model provider (e.g., MiniMax, Anthropic, OpenAI) to generate
              responses. We recommend not sharing sensitive personal information in chat queries.
              Each provider's own privacy policy governs their handling of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
            <p>
              Account data is retained while your account is active. Conversation logs are retained
              for up to 90 days for service improvement, then automatically purged. You may request
              deletion of your account and associated data at any time by contacting{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
            <p>
              We use encryption in transit (TLS) and at rest for credentials and API keys.
              Self-hosted deployments inherit the security posture of your own infrastructure.
              Despite our efforts, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise these rights, email{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify registered users of
              material changes via email. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
            <p>
              For questions or concerns about this privacy policy, contact us at{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
