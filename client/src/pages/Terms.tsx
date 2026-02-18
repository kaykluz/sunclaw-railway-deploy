import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 11, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Agreement</h2>
            <p>
              By accessing or using SunClaw (the "Service"), operated by KIISHA ("we", "us", "our"),
              you agree to be bound by these Terms of Service. If you do not agree, do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              SunClaw is an AI-powered agent that provides renewable energy analysis tools including
              solar PV design, financial modeling, BESS sizing, and related skills. The Service is
              delivered through messaging channels (Telegram, WhatsApp, Slack, Discord, Web Chat)
              and a web dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Accounts</h2>
            <p>
              You must provide accurate information when creating an account. You are responsible for
              maintaining the security of your account credentials and for all activity under your
              account. Notify us immediately at{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>{" "}
              if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use automated means to access the Service beyond normal API usage</li>
              <li>Resell or redistribute the Service without written permission</li>
              <li>Use the Service to generate spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. AI-Generated Content</h2>
            <p>
              SunClaw uses AI models to generate responses. While we strive for accuracy, AI outputs
              may contain errors. <strong className="text-foreground">SunClaw is not a substitute for
              professional engineering judgment.</strong> You are solely responsible for verifying any
              technical data, calculations, or recommendations before relying on them for
              engineering, financial, or legal decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Payments & Subscriptions</h2>
            <p>
              Paid plans are billed through Stripe. Prices are listed on our pricing page and may
              change with 30 days' notice. Subscriptions renew automatically unless cancelled.
              Refunds are handled on a case-by-case basis — contact{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Self-Hosted Deployments</h2>
            <p>
              If you self-host SunClaw using our open-source components, you are responsible for
              your own infrastructure, security, backups, and compliance. Our support and SLA
              obligations apply only to the managed service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. KIISHA Integration</h2>
            <p>
              Enterprise features require a valid KIISHA API token. Use of KIISHA-connected skills
              is also subject to the KIISHA Platform Terms of Service. Data exchanged with KIISHA
              is governed by your organization's agreement with KIISHA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Intellectual Property</h2>
            <p>
              The SunClaw name, logo, and dashboard design are the property of KIISHA. The
              underlying OpenClaw framework is open source under its own license. Your data remains
              yours — we claim no ownership of content you provide through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, KIISHA shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits,
              data, or business opportunities, arising from your use of the Service. Our total
              liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind,
              whether express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation of
              these Terms or for any reason with reasonable notice. You may cancel your account at
              any time through the dashboard or by contacting{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
              Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify registered
              users of material changes via email. Continued use of the Service after changes are
              posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">14. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any
              disputes shall be resolved through good-faith negotiation before pursuing formal
              proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">15. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:info@kiisha.io" className="text-cyan hover:underline">info@kiisha.io</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
