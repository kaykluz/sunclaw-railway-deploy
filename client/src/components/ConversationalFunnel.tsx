import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SunClawIcon } from "@/components/SunClawLogo";

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
    label: "I need renewable energy",
    descriptor: "C&I, utility, government",
  },
  {
    id: "developer",
    icon: "🏗️",
    label: "I develop RE projects",
    descriptor: "IPP, mini-grid, rooftop",
  },
  {
    id: "service_provider",
    icon: "🔧",
    label: "I provide RE services",
    descriptor: "EPC, O&M, consultant",
  },
  {
    id: "investor",
    icon: "💰",
    label: "I finance RE projects",
    descriptor: "DFI, PE, VC, bank",
  },
  {
    id: "talent",
    icon: "👤",
    label: "I'm looking for work",
    descriptor: "Job seeker, freelancer",
  },
  {
    id: "supplier",
    icon: "📦",
    label: "I supply RE equipment",
    descriptor: "OEM, distributor, trader",
  },
  {
    id: "researcher",
    icon: "📊",
    label: "I research the sector",
    descriptor: "Academic, analyst, journalist",
  },
  {
    id: "curious",
    icon: "🌱",
    label: "Just curious",
    descriptor: "Exploring options",
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
  { id: "other", label: "Other" },
];

export default function ConversationalFunnel() {
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

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    // "Curious" fast path: skip region, go straight to form
    if (selectedRole === "curious") {
      setStep("form");
    } else {
      setStep("region");
    }
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
      intent: undefined, // deprecated field
      region: region || undefined,
      source: "funnel",
    });
  };

  // Check if this is the "curious" fast path (minimal form)
  const isCuriousFastPath = role === "curious";

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

  const RoleCard = ({
    icon,
    label,
    descriptor,
    onClick,
    delay = 0,
  }: {
    icon: string;
    label: string;
    descriptor: string;
    onClick: () => void;
    delay?: number;
  }) => (
    <button
      type="button"
      className="sc-funnel-role"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="sc-funnel-role-icon">{icon}</span>
      <div className="sc-funnel-role-text">
        <span className="sc-funnel-role-label">{label}</span>
        <span className="sc-funnel-role-descriptor">{descriptor}</span>
      </div>
    </button>
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
      {/* Step 1: Role Selection */}
      <BotMessage animate={false}>What brings you here today?</BotMessage>

      {step === "role" && (
        <div className="sc-funnel-roles">
          {ROLE_OPTIONS.map((opt, i) => (
            <RoleCard
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              descriptor={opt.descriptor}
              onClick={() => handleRoleSelect(opt.id as Role)}
              delay={i * 40}
            />
          ))}
        </div>
      )}

      {/* Show user's role selection */}
      {role && step !== "role" && (
        <UserMessage>
          {ROLE_OPTIONS.find((o) => o.id === role)?.label}
        </UserMessage>
      )}

      {/* Step 2: Region (skipped for "curious") */}
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

      {/* Step 3: Form */}
      {step === "form" && (
        <>
          <BotMessage>
            {isCuriousFastPath
              ? "Great! Just your name and email to get started."
              : "Almost there. Let me know how to reach you."}
          </BotMessage>
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
            {/* Only show phone and company for non-curious users */}
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
              {joinMutation.isPending ? "Submitting..." : "Let's Go"}
            </button>
          </form>
        </>
      )}

      {/* Step 4: Completion */}
      {step === "complete" && (
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
    </div>
  );
}
