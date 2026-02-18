/*
  Account Page — User dashboard for plan management, deployment history, and settings.
  DESIGN: "Command Center" — Mission Control Aesthetic
  PALETTE: Deep navy #0a0f1a, electric cyan #00d4ff, amber #f59e0b, green #10b981
*/

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, CreditCard, Rocket, ExternalLink, Loader2,
  CheckCircle2, XCircle, Clock, Globe, Server,
  ArrowRight, Zap, Building2, LogOut, Settings,
  Activity, BarChart3, Shield, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const planColors: Record<string, string> = {
  free: "cyan",
  pro: "amber",
  enterprise: "emerald",
};

const planIcons: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  pro: <Rocket className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  success: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald", label: "Running" },
  deploying: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-amber", label: "Deploying" },
  pending: { icon: <Clock className="w-4 h-4" />, color: "text-muted-foreground", label: "Pending" },
  failed: { icon: <XCircle className="w-4 h-4" />, color: "text-red-400", label: "Failed" },
};

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Account() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: billingStatus, isLoading: billingLoading } = trpc.billing.status.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: deploymentsList, isLoading: deploymentsLoading } = trpc.deploy.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: plans } = trpc.billing.plans.useQuery();

  const portal = trpc.billing.portal.useMutation();

  const currentPlan = billingStatus?.plan ?? "free";
  const currentPlanDef = plans?.find((p) => p.id === currentPlan);
  const color = planColors[currentPlan] ?? "cyan";

  const handleManageBilling = async () => {
    if (!billingStatus?.stripeCustomerId) {
      navigate("/pricing");
      return;
    }
    try {
      setPortalLoading(true);
      const result = await portal.mutateAsync({
        origin: window.location.origin,
      });
      window.open(result.url, "_blank");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const successDeployments = deploymentsList?.filter((d) => d.status === "success") ?? [];
  const activeDeployments = deploymentsList?.filter((d) => d.status === "deploying") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="container max-w-5xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Account</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your plan, deployments, and settings.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ─── Left Column: Profile + Plan ─── */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/50 bg-card/30 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-amber flex items-center justify-center">
                    <User className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name || "User"}</h3>
                    <p className="text-xs text-muted-foreground">{user.email || user.openId}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className={`font-mono ${user.role === "admin" ? "text-amber" : "text-foreground"}`}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-mono">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Plan Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl border border-${color}/30 bg-card/30 p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`text-${color}`}>{planIcons[currentPlan]}</div>
                    <h3 className="font-semibold">Current Plan</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-${color}/10 border border-${color}/20 text-${color}`}>
                    {currentPlan}
                  </span>
                </div>

                {billingLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">
                        ${currentPlanDef ? (currentPlanDef.monthlyPriceCents / 100).toFixed(0) : "0"}
                        <span className="text-sm text-muted-foreground font-normal">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentPlanDef?.description ?? "Free plan with standalone skills"}
                      </p>
                    </div>

                    {/* Plan features */}
                    <div className="space-y-1.5 mb-4">
                      {(currentPlanDef?.features ?? []).slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3 h-3 text-${color} shrink-0`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Plan stats */}
                    <div className="rounded-lg bg-background/40 p-3 mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Deployments used</span>
                        <span className="font-mono">
                          {successDeployments.length}
                          {currentPlanDef && currentPlanDef.maxDeployments > 0
                            ? ` / ${currentPlanDef.maxDeployments}`
                            : currentPlanDef?.maxDeployments === -1
                            ? " / ∞"
                            : " / 0"}
                        </span>
                      </div>
                      {currentPlanDef && currentPlanDef.maxDeployments > 0 && (
                        <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-${color}`}
                            style={{
                              width: `${Math.min(100, (successDeployments.length / currentPlanDef.maxDeployments) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {currentPlan === "free" ? (
                        <Button
                          onClick={() => navigate("/pricing")}
                          className="w-full bg-amber text-background hover:bg-amber/90 gap-2"
                          size="sm"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          Upgrade Plan
                        </Button>
                      ) : (
                        <Button
                          onClick={handleManageBilling}
                          disabled={portalLoading}
                          variant="outline"
                          className="w-full gap-2 border-border/60"
                          size="sm"
                        >
                          {portalLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          Manage Billing
                        </Button>
                      )}
                    </div>

                    {billingStatus?.subscription && (
                      <div className="mt-3 text-[10px] text-muted-foreground">
                        <span>Status: </span>
                        <span className="text-emerald font-mono">{billingStatus.subscription.status}</span>
                        {billingStatus.subscription.startDate && (
                          <>
                            <span className="mx-1">·</span>
                            <span>Since {new Date(billingStatus.subscription.startDate * 1000).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Managed Keys Add-On Status */}
                    {(currentPlan === "pro" || currentPlan === "enterprise") && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <Key className="w-3 h-3 text-amber" />
                            <span className="text-muted-foreground">Managed LLM Keys</span>
                          </div>
                          {billingStatus?.managedKeysActive || currentPlan === "enterprise" ? (
                            <span className="text-[10px] font-mono text-emerald flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {currentPlan === "enterprise" ? "Included" : "Active"}
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate("/pricing")}
                              className="text-[10px] font-mono text-amber hover:underline"
                            >
                              Add for $19/mo
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border/50 bg-card/30 p-6"
              >
                <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/agent/setup")}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/30 hover:border-cyan/30 hover:bg-cyan/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-cyan" />
                      <span className="text-sm">Setup Wizard</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan transition-colors" />
                  </button>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/30 hover:border-amber/30 hover:bg-amber/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber" />
                      <span className="text-sm">View Plans</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber transition-colors" />
                  </button>
                  {user.role === "admin" && (
                    <button
                      onClick={() => navigate("/agent/admin")}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/30 hover:border-emerald/30 hover:bg-emerald/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald" />
                        <span className="text-sm">Admin Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald transition-colors" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ─── Right Column: Deployments ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Deployments */}
              {activeDeployments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-amber/30 bg-card/30 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-amber" />
                    <h3 className="font-semibold text-sm">Active Deployments</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber/10 text-amber text-[10px] font-mono">
                      {activeDeployments.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {activeDeployments.map((d) => (
                      <DeploymentCard key={d.id} deployment={d} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Deployment History */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-border/50 bg-card/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan" />
                    <h3 className="font-semibold text-sm">Deployment History</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/60 gap-2 text-xs"
                    onClick={() => navigate("/agent/setup")}
                  >
                    <Zap className="w-3 h-3" />
                    New Deploy
                  </Button>
                </div>

                {deploymentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  </div>
                ) : !deploymentsList || deploymentsList.length === 0 ? (
                  <div className="text-center py-12">
                    <Server className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-1">No deployments yet</p>
                    <p className="text-muted-foreground/60 text-xs mb-4">
                      Use the Setup Wizard to deploy SunClaw to Railway or your own server.
                    </p>
                    <Button
                      onClick={() => navigate("/agent/setup")}
                      size="sm"
                      className="bg-cyan text-background hover:bg-cyan/90 gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Launch Setup Wizard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deploymentsList.map((d) => (
                      <DeploymentCard key={d.id} deployment={d} />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DeploymentCard({ deployment }: { deployment: any }) {
  const status = statusConfig[deployment.status] ?? statusConfig.pending;
  const metadata = deployment.metadata as Record<string, any> | null;
  const domain = deployment.externalUrl || (metadata?.domain ? `https://${metadata.domain}` : null);
  const railwayProjectId = metadata?.railwayProjectId || deployment.externalId;

  return (
    <div className="rounded-lg border border-border/30 bg-background/30 p-4 hover:border-border/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${status.color}`}>{status.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {deployment.instanceName || `Deployment #${deployment.id}`}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${status.color} bg-current/10`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                {deployment.method === "railway" ? (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Railway
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3" /> Docker
                  </span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatDate(deployment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {domain && (
            <a
              href={domain}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-cyan hover:bg-cyan/5 border border-cyan/20 transition-colors"
            >
              <Globe className="w-3 h-3" />
              Visit
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
          {railwayProjectId && (
            <a
              href={`https://railway.com/project/${railwayProjectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-amber hover:bg-amber/5 border border-amber/20 transition-colors"
            >
              Dashboard
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {metadata?.error && (
        <div className="mt-2 px-3 py-2 rounded-md bg-red-500/5 border border-red-500/10">
          <p className="text-[10px] text-red-400 font-mono">{metadata.error}</p>
        </div>
      )}
    </div>
  );
}
