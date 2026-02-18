import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Rocket,
  Building2,
  Loader2,
  ExternalLink,
  Server,
  Key,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

const planMeta: Record<
  string,
  {
    icon: React.ReactNode;
    infra: string;
    keys: string;
  }
> = {
  free: {
    icon: <Zap className="w-6 h-6" />,
    infra: "Your own Railway",
    keys: "Your own API keys",
  },
  pro: {
    icon: <Rocket className="w-6 h-6" />,
    infra: "Our managed Railway",
    keys: "BYO keys (or add-on)",
  },
  enterprise: {
    icon: <Building2 className="w-6 h-6" />,
    infra: "Dedicated infrastructure",
    keys: "Managed keys included",
  },
};

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingAddOn, setLoadingAddOn] = useState<string | null>(null);

  const { data: plans } = trpc.billing.plans.useQuery();
  const { data: billingStatus } = trpc.billing.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const checkout = trpc.billing.checkout.useMutation();
  const checkoutAddOn = trpc.billing.checkoutAddOn.useMutation();
  const checkoutBundle = trpc.billing.checkoutBundle.useMutation();
  const portal = trpc.billing.portal.useMutation();
  const selectPlan = trpc.auth.selectPlan.useMutation();
  const utils = trpc.useUtils();

  const currentPlan = billingStatus?.plan ?? "free";
  const managedKeysActive = billingStatus?.managedKeysActive ?? false;

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (planId === "free") {
      try {
        await selectPlan.mutateAsync({ plan: "free" });
        await utils.auth.me.invalidate();
        navigate("/agent/setup");
      } catch (error: any) {
        toast.error(error.message ?? "Failed to select plan");
      }
      return;
    }

    if (planId === currentPlan) {
      try {
        setLoadingPlan(planId);
        const result = await portal.mutateAsync({
          origin: window.location.origin,
        });
        window.open(result.url, "_blank");
        toast.info("Opening billing portal...");
      } catch (error: any) {
        toast.error(error.message ?? "Failed to open billing portal");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    try {
      setLoadingPlan(planId);
      const result = await checkout.mutateAsync({
        planId: planId as "pro" | "enterprise",
        origin: window.location.origin,
      });
      window.open(result.url, "_blank");
      toast.info("Redirecting to checkout...");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create checkout session");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleAddOnCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      setLoadingAddOn("managed_keys");
      const result = await checkoutAddOn.mutateAsync({
        addOnId: "managed_keys",
        origin: window.location.origin,
      });
      window.open(result.url, "_blank");
      toast.info("Redirecting to add-on checkout...");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create add-on checkout");
    } finally {
      setLoadingAddOn(null);
    }
  };

  const handleBundleCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      setLoadingAddOn("bundle");
      const result = await checkoutBundle.mutateAsync({
        planId: "pro",
        addOnId: "managed_keys",
        origin: window.location.origin,
      });
      window.open(result.url, "_blank");
      toast.info("Redirecting to checkout...");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create bundle checkout");
    } finally {
      setLoadingAddOn(null);
    }
  };

  const searchParams = new URLSearchParams(window.location.search);
  const paymentCancelled = searchParams.get("payment") === "cancelled";

  return (
    <div className="min-h-screen bg-[#1A1612]">
      <Navbar />

      <section className="py-24 md:py-32">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] text-[#6B635B] uppercase tracking-widest">
              Pricing
            </span>
            <h1 className="text-3xl md:text-5xl font-light mt-4 text-white tracking-tight">
              Your Infrastructure. Your Rules.
            </h1>
            <p className="text-[#6B635B] mt-4 max-w-2xl mx-auto text-base">
              Start free with guided self-setup. Upgrade for managed hosting
              and enterprise features.
            </p>
            {paymentCancelled && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1A16]/60 border border-[#3D3630] text-[#9E958B] text-sm">
                Payment was cancelled. You can try again anytime.
              </div>
            )}
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(plans ?? []).map((plan, index) => {
              const meta = planMeta[plan.id] ?? planMeta.free;
              const isCurrent = currentPlan === plan.id;
              const isPopular = plan.id === "pro";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-2xl border p-8 flex flex-col ${
                    isPopular
                      ? "border-[#4D4640] bg-[#1E1A16]/80"
                      : "border-[#3D3630] bg-[#1E1A16]/50"
                  } ${isCurrent ? "ring-1 ring-[#4D4640]" : ""}`}
                >
                  {isPopular && (
                    <>
                      <BorderBeam size={200} duration={8} borderWidth={1} colorVia="rgba(0, 212, 255, 0.3)" />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-mono uppercase tracking-wider">
                          Popular
                        </span>
                      </div>
                    </>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="px-3 py-1 rounded-full bg-[#2C2824] border border-[#4D4640] text-[#C4B9AB] text-[10px] font-mono uppercase tracking-wider">
                        Current
                      </span>
                    </div>
                  )}

                  <div className="text-[#9E958B] mb-4">{meta.icon}</div>

                  <h3 className="text-xl font-medium text-white">{plan.name}</h3>
                  <p className="text-[#6B635B] text-sm mt-1 mb-4">
                    {plan.description}
                  </p>

                  <div className="flex flex-col gap-1.5 mb-5">
                    <div className="flex items-center gap-2 text-xs text-[#6B635B]">
                      <Server className="w-3.5 h-3.5 shrink-0" />
                      <span>{meta.infra}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B635B]">
                      <Key className="w-3.5 h-3.5 shrink-0" />
                      <span>{meta.keys}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-light text-white tracking-tight">
                      ${(plan.monthlyPriceCents / 100).toFixed(0)}
                    </span>
                    <span className="text-[#6B635B] text-sm">/month</span>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature, i) => {
                      const isAddOn = feature.startsWith("Optional:");
                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isAddOn ? "text-[#6B635B]" : "text-[#C4B9AB]"
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isAddOn ? "text-[#4D4640]" : "text-emerald"
                            }`}
                          />
                          <span>
                            {isAddOn ? (
                              <>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] mr-1 border-[#4D4640] text-[#6B635B] px-1 py-0"
                                >
                                  Add-on
                                </Badge>
                                {feature.replace("Optional: ", "")}
                              </>
                            ) : (
                              feature
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan !== null || loadingAddOn !== null}
                    variant={isPopular ? "default" : "outline"}
                    className={`w-full gap-2 ${
                      isPopular
                        ? "bg-cyan text-[#1A1612] hover:bg-cyan/90"
                        : "border-[#3D3630] text-[#C4B9AB] hover:border-[#4D4640] hover:bg-[#2C2824]/50"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {isCurrent ? (
                      "Manage Plan"
                    ) : plan.monthlyPriceCents === 0 ? (
                      <>
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Managed LLM Keys Add-On */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-[#3D3630] bg-[#1E1A16]/60 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-[#9E958B]" />
                    <h3 className="text-lg font-medium text-white">Managed LLM Keys</h3>
                    <Badge variant="outline" className="text-[9px] border-[#4D4640] text-[#9E958B] px-1.5 py-0">
                      +$19/mo
                    </Badge>
                  </div>
                  <p className="text-[#6B635B] text-sm max-w-xl">
                    We provide and manage LLM keys so you can focus on building.
                  </p>
                  {managedKeysActive && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2C2824] border border-[#4D4640] text-[#C4B9AB] text-xs font-mono">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {currentPlan === "pro" && !managedKeysActive && (
                    <Button
                      onClick={handleAddOnCheckout}
                      disabled={loadingAddOn !== null}
                      className="bg-[#2C2824] border border-[#4D4640] text-white hover:bg-[#4D4640] gap-2"
                    >
                      {loadingAddOn === "managed_keys" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      Add Managed Keys — $19/mo
                    </Button>
                  )}

                  {currentPlan === "free" && (
                    <>
                      <Button
                        onClick={handleBundleCheckout}
                        disabled={loadingAddOn !== null || loadingPlan !== null}
                        className="bg-[#2C2824] border border-[#4D4640] text-white hover:bg-[#4D4640] gap-2"
                      >
                        {loadingAddOn === "bundle" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Rocket className="w-4 h-4" />
                        )}
                        Pro + Managed Keys — $48/mo
                      </Button>
                      <p className="text-[10px] text-[#6B635B] text-center">
                        Managed hosting ($29) + managed LLM keys ($19)
                      </p>
                    </>
                  )}

                  {currentPlan === "enterprise" && (
                    <span className="text-xs text-[#9E958B] font-mono flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Included in Enterprise
                    </span>
                  )}

                  {currentPlan === "pro" && managedKeysActive && (
                    <span className="text-xs text-[#9E958B] font-mono flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Active on your account
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-lg font-medium text-white text-center mb-8">
              What's Included
            </h2>
            <div className="rounded-2xl border border-[#3D3630] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3D3630] bg-[#1E1A16]/50">
                    <th className="text-left p-4 font-medium text-[#6B635B] text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="text-center p-4 font-medium text-[#9E958B] text-xs uppercase tracking-wider">
                      Free
                    </th>
                    <th className="text-center p-4 font-medium text-[#C4B9AB] text-xs uppercase tracking-wider">
                      Pro
                    </th>
                    <th className="text-center p-4 font-medium text-[#C4B9AB] text-xs uppercase tracking-wider">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3D3630]/50">
                  {[
                    ["RE AI Skills (11)", true, true, true],
                    ["OpenClaw Skills (50+)", true, true, true],
                    ["Guided Setup Wizard", true, true, true],
                    ["Telegram BotFather Wizard", true, true, true],
                    ["All Channel Templates", true, true, true],
                    ["Managed Railway Hosting", false, true, true],
                    ["Telegram Click-and-Go", false, true, true],
                    ["Live Logs Dashboard", false, true, true],
                    ["Persistent Memory", false, true, true],
                    ["Managed LLM Keys", false, "+$19/mo", true],
                    ["KIISHA Enterprise Skills", false, false, true],
                    ["VATR Compliance", false, false, true],
                    ["Dedicated Infrastructure", false, false, true],
                    ["Bot Instances", "Self-hosted", "Up to 3", "Unlimited"],
                    ["Support", "Community", "Priority Email", "Dedicated"],
                  ].map(([feature, free, pro, enterprise], i) => (
                    <tr key={i} className="hover:bg-[#1E1A16]/30 transition-colors">
                      <td className="p-4 text-[#9E958B]">{feature}</td>
                      {[free, pro, enterprise].map((val, j) => (
                        <td key={j} className="text-center p-4">
                          {val === true ? (
                            <Check className="w-4 h-4 text-emerald mx-auto" />
                          ) : val === false ? (
                            <span className="text-[#4D4640]">—</span>
                          ) : (
                            <span className="text-xs font-medium text-[#C4B9AB]">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing portal */}
          {billingStatus?.stripeCustomerId && (
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                className="text-[#6B635B] hover:text-white gap-2"
                onClick={async () => {
                  try {
                    const result = await portal.mutateAsync({
                      origin: window.location.origin,
                    });
                    window.open(result.url, "_blank");
                  } catch (error: any) {
                    toast.error(
                      error.message ?? "Failed to open billing portal"
                    );
                  }
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
