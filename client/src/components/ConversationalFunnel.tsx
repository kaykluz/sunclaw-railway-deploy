import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SunClawIcon } from "@/components/SunClawLogo";

// Telegram brand icon
const TelegramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

type Step = "role" | "region" | "form" | "complete";
type Role =
  | "energy_buyer"
  | "developer"
  | "service_provider"
  | "investor"
  | "talent"
  | "supplier"
  | "researcher"
  | "curious"
  | null;

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const ROLE_OPTIONS = [
  {
    id: "energy_buyer",
    icon: "☀️",
    label: "I need solar or clean energy",
    descriptor: "Homes, businesses, communities, public buildings",
  },
  {
    id: "developer",
    icon: "🏗️",
    label: "I'm developing an energy project",
    descriptor: "Developers, asset owners, IPPs, startups",
  },
  {
    id: "service_provider",
    icon: "🔧",
    label: "I provide RE services",
    descriptor: "Installers, EPCs, O&M, consultants, engineers",
  },
  {
    id: "investor",
    icon: "💰",
    label: "I invest in or finance energy",
    descriptor: "DFIs, VCs, banks, carbon buyers, insurance",
  },
  {
    id: "talent",
    icon: "👤",
    label: "I'm hiring or job hunting in RE",
    descriptor: "Job seekers, recruiters, HR teams",
  },
  {
    id: "supplier",
    icon: "⚡",
    label: "I sell equipment or technology",
    descriptor: "Suppliers, OEMs, distributors",
  },
  {
    id: "researcher",
    icon: "🎓",
    label: "I'm researching or studying RE",
    descriptor: "Students, academics, journalists, educators",
  },
  {
    id: "curious",
    icon: "💬",
    label: "Just show me what SunClaw can do",
    descriptor: null,
  },
] as const;

const REGION_OPTIONS = [
  { id: "west_africa", label: "West Africa" },
  { id: "east_africa", label: "East Africa" },
  { id: "southern_africa", label: "Southern Africa" },
  { id: "north_africa_mena", label: "North Africa / MENA" },
  { id: "europe", label: "Europe" },
  { id: "asia_pacific", label: "Asia-Pacific" },
  { id: "americas", label: "Americas" },
  { id: "global", label: "Global / Multiple Regions" },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Typing indicator component
const TypingIndicator = () => (
  <div className="sc-funnel-bot-row">
    <div className="sc-funnel-bot-avatar">
      <SunClawIcon size={24} />
    </div>
    <div className="sc-funnel-typing">
      <span className="sc-funnel-typing-dot" />
      <span className="sc-funnel-typing-dot" />
      <span className="sc-funnel-typing-dot" />
    </div>
  </div>
);

interface ConversationalFunnelProps {
  onBack?: () => void;
}

export default function ConversationalFunnel({ onBack }: ConversationalFunnelProps) {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string>("You're in. Let's get our claws into this.");

  // Animation states
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [userBubbles, setUserBubbles] = useState<Array<{ key: string; text: string; entering: boolean }>>([]);
  const [stepEntering, setStepEntering] = useState(true);

  const joinMutation = trpc.waitlist.join.useMutation({
    onSuccess: async (data) => {
      if (data.telegramDeepLink) {
        setTelegramLink(
          `https://t.me/sunclaw_KIISHA_bot?start=${data.telegramDeepLink}`
        );
      }
      // Set completion message based on returning user status
      if (data.alreadyExists) {
        setCompletionMessage("Welcome back! Your details have been updated.");
      } else {
        setCompletionMessage("You're in. Let's get our claws into this.");
      }
      // Show typing before completion
      setShowTyping(true);
      await delay(500);
      setShowTyping(false);
      setStepEntering(true);
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

  const addUserBubble = useCallback((key: string, text: string) => {
    setUserBubbles((prev) => [...prev, { key, text, entering: true }]);
    // Remove entering class after animation
    setTimeout(() => {
      setUserBubbles((prev) =>
        prev.map((b) => (b.key === key ? { ...b, entering: false } : b))
      );
    }, 300);
  }, []);

  const handleRoleSelect = useCallback(async (selectedRole: Role) => {
    const roleLabel = ROLE_OPTIONS.find((o) => o.id === selectedRole)?.label || "";

    // 1. Flash selected
    setSelectedCard(selectedRole);
    setStepEntering(false);
    await delay(200);

    // 2. Add user bubble
    addUserBubble(`role-${selectedRole}`, roleLabel);
    setRole(selectedRole);
    await delay(300);

    // 3. Show typing indicator
    setShowTyping(true);
    await delay(500);

    // 4. Hide typing, show next step
    setShowTyping(false);
    setSelectedCard(null);
    setStepEntering(true);

    if (selectedRole === "curious") {
      setStep("form");
    } else {
      setStep("region");
    }
  }, [addUserBubble]);

  const handleRegionSelect = useCallback(async (selectedRegion: string) => {
    const regionLabel = REGION_OPTIONS.find((r) => r.id === selectedRegion)?.label || "";

    // 1. Flash selected
    setSelectedCard(selectedRegion);
    setStepEntering(false);
    await delay(200);

    // 2. Add user bubble
    addUserBubble(`region-${selectedRegion}`, regionLabel);
    setRegion(selectedRegion);
    await delay(300);

    // 3. Show typing
    setShowTyping(true);
    await delay(500);

    // 4. Show form
    setShowTyping(false);
    setSelectedCard(null);
    setStepEntering(true);
    setStep("form");
  }, [addUserBubble]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    joinMutation.mutate({
      email: formData.email,
      name: formData.name || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      role: role || undefined,
      intent: role || undefined,
      region: region || undefined,
      source: "funnel",
    });
  };

  const isCuriousFastPath = role === "curious";

  // Message components
  const BotMessage = ({
    children,
    animate = true,
    isComplete = false,
  }: {
    children: React.ReactNode;
    animate?: boolean;
    isComplete?: boolean;
  }) => (
    <div
      className={`sc-funnel-bot-row ${stepEntering && animate ? "sc-funnel-step-enter" : ""}`}
    >
      <div className="sc-funnel-bot-avatar">
        <SunClawIcon size={24} />
      </div>
      <div className={`sc-funnel-bot-bubble ${isComplete ? "sc-funnel-complete-bubble" : ""}`}>
        {children}
      </div>
    </div>
  );

  const ChoiceCard = ({
    id,
    icon,
    label,
    descriptor,
    onClick,
    delay: delayMs = 0,
  }: {
    id: string;
    icon: string;
    label: string;
    descriptor?: string | null;
    onClick: () => void;
    delay?: number;
  }) => (
    <button
      type="button"
      className={`sc-funnel-choice ${selectedCard === id ? "selected" : ""}`}
      onClick={onClick}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="sc-funnel-choice-icon">{icon}</div>
      <div>
        <div className="sc-funnel-choice-label">{label}</div>
        {descriptor && (
          <div className="sc-funnel-choice-desc">{descriptor}</div>
        )}
      </div>
    </button>
  );

  const RegionCard = ({
    id,
    icon,
    label,
    onClick,
    delay: delayMs = 0,
  }: {
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    delay?: number;
  }) => (
    <button
      type="button"
      className={`sc-funnel-region ${selectedCard === id ? "selected" : ""}`}
      onClick={onClick}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="sc-funnel-region-icon">{icon}</span>
      <span className="sc-funnel-region-label">{label}</span>
    </button>
  );

  return (
    <div className="sc-funnel">
      {/* Back button */}
      {onBack && (
        <button type="button" className="sc-funnel-back" onClick={onBack}>
          <span>←</span> Back
        </button>
      )}

      {/* Step 1: Role Selection */}
      <BotMessage animate={false}>What can I help you with?</BotMessage>

      {step === "role" && (
        <div className={`sc-funnel-choices-grid ${stepEntering ? "sc-funnel-step-enter" : ""}`}>
          {ROLE_OPTIONS.map((opt, i) => (
            <ChoiceCard
              key={opt.id}
              id={opt.id}
              icon={opt.icon}
              label={opt.label}
              descriptor={opt.descriptor}
              onClick={() => handleRoleSelect(opt.id as Role)}
              delay={100 + i * 80}
            />
          ))}
        </div>
      )}

      {/* User bubbles */}
      {userBubbles.map((bubble) => (
        <div
          key={bubble.key}
          className={`sc-funnel-user-row ${bubble.entering ? "entering" : ""}`}
        >
          <div className="sc-funnel-user-bubble">{bubble.text}</div>
        </div>
      ))}

      {/* Typing indicator */}
      {showTyping && <TypingIndicator />}

      {/* Step 2: Region */}
      {step === "region" && !showTyping && (
        <>
          <BotMessage>Where in the world are you?</BotMessage>
          <div className={`sc-funnel-regions ${stepEntering ? "sc-funnel-step-enter" : ""}`}>
            {REGION_OPTIONS.map((r, i) => (
              <RegionCard
                key={r.id}
                id={r.id}
                icon="🌍"
                label={r.label}
                onClick={() => handleRegionSelect(r.id)}
                delay={i * 30}
              />
            ))}
          </div>
        </>
      )}

      {/* Step 3: Form */}
      {step === "form" && !showTyping && (
        <>
          <BotMessage>
            {isCuriousFastPath
              ? "Say less. Name and email, and I'll show you everything."
              : "Almost there. Drop your details and I'll take it from here."}
          </BotMessage>
          <form className={`sc-funnel-form ${stepEntering ? "sc-funnel-step-enter" : ""}`} onSubmit={handleFormSubmit}>
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
            {!isCuriousFastPath && (
              <>
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
              </>
            )}
            <button
              type="submit"
              disabled={joinMutation.isPending || !formData.email}
              className="sc-funnel-submit"
            >
              {joinMutation.isPending ? "Submitting..." : "Let's Go 🦞"}
            </button>
          </form>
        </>
      )}

      {/* Step 4: Completion */}
      {step === "complete" && !showTyping && (
        <>
          <BotMessage isComplete>
            {completionMessage}
          </BotMessage>
          <div className={`sc-funnel-cta-row ${stepEntering ? "sc-funnel-step-enter" : ""}`} style={{ animationDelay: "200ms" }}>
            <a
              href={telegramLink || "https://t.me/sunclaw_KIISHA_bot"}
              target="_blank"
              rel="noopener noreferrer"
              className="sc-funnel-telegram-cta"
            >
              <TelegramIcon size={20} />
              <span>
                Message SunClaw on <span className="sc-funnel-tg-brand">Telegram</span>
              </span>
              <span className="sc-funnel-telegram-arrow">→</span>
            </a>
          </div>
          <p className={`sc-funnel-note ${stepEntering ? "sc-funnel-step-enter" : ""}`} style={{ animationDelay: "400ms" }}>
            Want to deploy your own agent?{" "}
            <a href="#deploy" className="sc-funnel-link">
              Set up an OpenClaw instance →
            </a>
          </p>
        </>
      )}
    </div>
  );
}
