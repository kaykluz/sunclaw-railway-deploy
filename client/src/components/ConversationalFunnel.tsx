import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SunClawIcon } from "@/components/SunClawLogo";

type Step = "intent" | "role" | "region" | "form" | "complete";
type Intent = "need_services" | "offer_services" | "deploy" | null;

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const INTENT_OPTIONS = [
  { id: "need_services", icon: "☀️", label: "I need RE advisory / services" },
  { id: "offer_services", icon: "🔧", label: "I offer RE services" },
  { id: "deploy", icon: "🤖", label: "I want to deploy my own agent" },
] as const;

const ROLE_OPTIONS_NEED = [
  "Project Developer",
  "Asset Owner",
  "C&I Client",
  "Utility",
  "Government",
  "Other",
];

const ROLE_OPTIONS_OFFER = [
  "Installer / EPC",
  "Financier / Investor",
  "Consultant",
  "Equipment Supplier",
  "Recruiter",
  "Other",
];

const REGION_OPTIONS = [
  { id: "west_africa", label: "West Africa" },
  { id: "east_africa", label: "East Africa" },
  { id: "southern_africa", label: "Southern Africa" },
  { id: "north_africa_mena", label: "North Africa / MENA" },
  { id: "europe", label: "Europe" },
  { id: "asia_pacific", label: "Asia-Pacific" },
  { id: "americas", label: "Americas" },
  { id: "other", label: "Other" },
];

export default function ConversationalFunnel() {
  const [step, setStep] = useState<Step>("intent");
  const [intent, setIntent] = useState<Intent>(null);
  const [role, setRole] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  const joinMutation = trpc.waitlist.join.useMutation({
    onSuccess: (data) => {
      if (data.telegramDeepLink) {
        setTelegramLink(
          `https://t.me/sunclaw_KIISHA_bot?start=${data.telegramDeepLink}`
        );
      }
      setStep("complete");
      if (data.alreadyExists) {
        toast.info("Welcome back! You're already on the list.");
      } else {
        toast.success("You're in! SunClaw is ready to talk.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleIntentSelect = (selectedIntent: Intent) => {
    setIntent(selectedIntent);
    if (selectedIntent === "deploy") {
      setStep("region");
    } else {
      setStep("role");
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep("region");
  };

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    setStep("form");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    joinMutation.mutate({
      email: formData.email,
      name: formData.name || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      role: role || undefined,
      intent: intent || undefined,
      region: region || undefined,
      source: "funnel",
    });
  };

  const handleDeployRedirect = () => {
    window.location.href = "/agent/setup";
  };

  // Message components
  const BotMessage = ({
    children,
    animate = true,
  }: {
    children: React.ReactNode;
    animate?: boolean;
  }) => (
    <div
      className="sc-funnel-bot-row"
      style={animate ? { animation: "scFunnelFadeUp 0.3s ease forwards" } : {}}
    >
      <div className="sc-funnel-bot-avatar">
        <SunClawIcon size={24} />
      </div>
      <div className="sc-funnel-bot-bubble">{children}</div>
    </div>
  );

  const UserMessage = ({ children }: { children: React.ReactNode }) => (
    <div
      className="sc-funnel-user-row"
      style={{ animation: "scFunnelFadeUp 0.3s ease forwards" }}
    >
      <div className="sc-funnel-user-bubble">{children}</div>
    </div>
  );

  const ChoiceCard = ({
    icon,
    label,
    onClick,
    delay = 0,
  }: {
    icon?: string;
    label: string;
    onClick: () => void;
    delay?: number;
  }) => (
    <button
      type="button"
      className="sc-funnel-choice"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && <span className="sc-funnel-choice-icon">{icon}</span>}
      <span className="sc-funnel-choice-label">{label}</span>
    </button>
  );

  return (
    <div className="sc-funnel">
      {/* Step 1: Intent */}
      <BotMessage animate={false}>What brings you here today?</BotMessage>

      {step === "intent" && (
        <div className="sc-funnel-choices">
          {INTENT_OPTIONS.map((opt, i) => (
            <ChoiceCard
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              onClick={() => handleIntentSelect(opt.id as Intent)}
              delay={i * 50}
            />
          ))}
        </div>
      )}

      {/* Show user's intent selection */}
      {intent && step !== "intent" && (
        <UserMessage>
          {INTENT_OPTIONS.find((o) => o.id === intent)?.label}
        </UserMessage>
      )}

      {/* Step 2: Role (conditional) */}
      {step === "role" && intent && intent !== "deploy" && (
        <>
          <BotMessage>
            {intent === "need_services"
              ? "What best describes you?"
              : "What type of services do you offer?"}
          </BotMessage>
          <div className="sc-funnel-choices">
            {(intent === "need_services"
              ? ROLE_OPTIONS_NEED
              : ROLE_OPTIONS_OFFER
            ).map((r, i) => (
              <ChoiceCard
                key={r}
                label={r}
                onClick={() => handleRoleSelect(r)}
                delay={i * 50}
              />
            ))}
          </div>
        </>
      )}

      {/* Show user's role selection */}
      {role && (step === "region" || step === "form" || step === "complete") && (
        <UserMessage>{role}</UserMessage>
      )}

      {/* Step 3: Region */}
      {step === "region" && (
        <>
          <BotMessage>Where are you based?</BotMessage>
          <div className="sc-funnel-choices sc-funnel-choices-grid">
            {REGION_OPTIONS.map((r, i) => (
              <ChoiceCard
                key={r.id}
                icon="🌍"
                label={r.label}
                onClick={() => handleRegionSelect(r.id)}
                delay={i * 30}
              />
            ))}
          </div>
        </>
      )}

      {/* Show user's region selection */}
      {region && (step === "form" || step === "complete") && (
        <UserMessage>
          {REGION_OPTIONS.find((r) => r.id === region)?.label}
        </UserMessage>
      )}

      {/* Step 4: Form */}
      {step === "form" && (
        <>
          <BotMessage>Almost there. Let me know how to reach you.</BotMessage>
          <form className="sc-funnel-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="tel"
              placeholder="Phone / WhatsApp (optional)"
              value={formData.phone}
              onChange={(e) =>
                setFormData((f) => ({ ...f, phone: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <input
              type="text"
              placeholder="Company (optional)"
              value={formData.company}
              onChange={(e) =>
                setFormData((f) => ({ ...f, company: e.target.value }))
              }
              className="sc-funnel-input"
            />
            <button
              type="submit"
              disabled={joinMutation.isPending || !formData.email}
              className="sc-funnel-submit"
            >
              {joinMutation.isPending ? "Submitting..." : "Let's Go"}
            </button>
          </form>
        </>
      )}

      {/* Step 5: Completion */}
      {step === "complete" && (
        <>
          {intent === "deploy" ? (
            <>
              <BotMessage>
                Great choice. Let's set up your own SunClaw agent.
              </BotMessage>
              <div className="sc-funnel-cta-row">
                <button
                  type="button"
                  className="sc-funnel-submit"
                  onClick={handleDeployRedirect}
                >
                  Launch Setup Wizard
                </button>
              </div>
            </>
          ) : (
            <>
              <BotMessage>
                SunClaw is ready to talk. Message the bot to start your
                conversation.
              </BotMessage>
              <div className="sc-funnel-cta-row">
                <a
                  href={telegramLink || "https://t.me/sunclaw_KIISHA_bot"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sc-funnel-submit"
                >
                  Open Telegram
                </a>
              </div>
              <p className="sc-funnel-note">
                You're on the marketplace waitlist. We'll notify you when it
                launches.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
