import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, ExternalLink, Loader2, CheckCircle2, ArrowRight, Globe, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { buildDeployUrl, getPlatformById } from "@/lib/platforms";
import PlatformHeader from "./shared/PlatformHeader";
import EnvVarsPreview from "./shared/EnvVarsPreview";
import type { PlatformWizardProps } from "./types";

const platform = getPlatformById("railway")!;

/* ─── Deploy Status Panel (managed flow) ─── */
function DeployStatusPanel({
  deploymentDbId,
  domain,
  railwayProjectId,
  railwayUrl,
}: {
  deploymentDbId?: number;
  domain: string;
  railwayProjectId: string;
  railwayUrl: string;
}) {
  const [buildPhase, setBuildPhase] = useState<"building" | "deploying" | "success" | "failed">("building");

  const { data: pollData } = trpc.deploy.pollStatus.useQuery(
    { id: deploymentDbId! },
    {
      enabled: !!deploymentDbId && (buildPhase === "building" || buildPhase === "deploying"),
      refetchInterval: 8000,
    },
  );

  useEffect(() => {
    if (!pollData) return;
    const rs = pollData.railwayStatus;
    if (rs === "SUCCESS") setBuildPhase("success");
    else if (rs === "FAILED" || rs === "CRASHED") setBuildPhase("failed");
    else if (rs === "DEPLOYING") setBuildPhase("deploying");
    else if (rs === "BUILDING" || rs === "INITIALIZING") setBuildPhase("building");
    if (pollData.status === "success") setBuildPhase("success");
    if (pollData.status === "failed") setBuildPhase("failed");
  }, [pollData]);

  const phases = [
    { key: "building", label: "Building Docker image..." },
    { key: "deploying", label: "Deploying to Railway..." },
    { key: "success", label: "SunClaw is live!" },
  ];

  const currentIdx = buildPhase === "failed" ? -1 : phases.findIndex((p) => p.key === buildPhase);

  return (
    <div className="p-4 rounded-lg bg-card/30 border border-border/30">
      {buildPhase !== "failed" && (
        <div className="space-y-2.5 mb-4">
          {phases.map((phase, i) => (
            <div key={phase.key} className="flex items-center gap-3">
              {i < currentIdx ? (
                <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
              ) : i === currentIdx && buildPhase !== "success" ? (
                <Loader2 className="w-4 h-4 text-amber animate-spin shrink-0" />
              ) : i === currentIdx && buildPhase === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border/40 shrink-0" />
              )}
              <span className={`text-xs font-mono ${i <= currentIdx ? "text-foreground" : "text-muted-foreground"}`}>
                {phase.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {buildPhase === "failed" && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 mb-4">
          <p className="text-xs text-red-400 font-mono">Railway build failed. Check the Railway dashboard for details.</p>
        </div>
      )}

      <div className={`p-4 rounded-lg ${buildPhase === "success" ? "bg-emerald/10 border border-emerald/20" : "bg-background/40 border border-border/20"}`}>
        {buildPhase === "success" && (
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald" />
            <span className="font-semibold text-sm text-emerald">Deployment Successful</span>
          </div>
        )}
        {buildPhase !== "success" && buildPhase !== "failed" && (
          <p className="text-xs text-muted-foreground mb-3">
            SunClaw is being deployed on Railway. This typically takes 1-3 minutes.
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2">
            <span className="text-xs font-mono text-muted-foreground">Domain</span>
            <a href={railwayUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan hover:underline flex items-center gap-1">
              {domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2">
            <span className="text-xs font-mono text-muted-foreground">Railway Dashboard</span>
            <a href={`https://railway.com/project/${railwayProjectId}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-amber hover:underline flex items-center gap-1">
              Open Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {buildPhase === "success" && (
        <div className="mt-4 space-y-3">
          <a
            href={railwayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-emerald text-background font-semibold text-sm hover:bg-emerald/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Your SunClaw Instance
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://railway.com/project/${railwayProjectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-amber/30 bg-amber/5 text-amber text-xs font-semibold hover:bg-amber/10 transition-colors"
            >
              Railway Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/agent/account"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-cyan/30 bg-cyan/5 text-cyan text-xs font-semibold hover:bg-cyan/10 transition-colors"
            >
              Your Account
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Your SunClaw instance is deployed and running. It may take 1-2 minutes for the first request to respond.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Railway Wizard ─── */
export default function RailwayWizard({
  wizardState,
  buildEnvVars,
  envContent,
  userPlan,
}: PlatformWizardProps) {
  const canManagedDeploy = userPlan === "pro" || userPlan === "enterprise";
  const [subStep, setSubStep] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployResult, setDeployResult] = useState<{
    domain: string;
    railwayProjectId: string;
    railwayUrl: string;
    deploymentDbId?: number;
  } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const railwayProvision = trpc.deploy.provision.useMutation();

  const railwayDeploySteps = [
    "Creating Railway project...",
    "Connecting GitHub repository...",
    "Setting environment variables...",
    "Creating public domain...",
    "Triggering deployment...",
    "SunClaw is live!",
  ];

  const envVars = buildEnvVars();
  const templateUrl = buildDeployUrl("railway", envVars)!;

  const handleManagedDeploy = async () => {
    setDeploying(true);
    setDeployStep(0);
    setDeployError(null);
    setDeployResult(null);

    const stepInterval = setInterval(() => {
      setDeployStep((prev) => {
        if (prev >= railwayDeploySteps.length - 2) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    try {
      const result = await railwayProvision.mutateAsync({
        instanceName: wizardState.instanceName || "my-sunclaw",
        repo: "kaykluz/sunclaw",
        envVars,
      });

      clearInterval(stepInterval);
      setDeployStep(railwayDeploySteps.length - 1);
      setDeployResult({
        domain: result.domain,
        railwayProjectId: result.railwayProjectId,
        railwayUrl: result.railwayUrl,
        deploymentDbId: result.deploymentId,
      });
      toast.success("Deployed to Railway successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      setDeployError(err?.message || "Deployment failed. Please try again.");
      toast.error("Railway deployment failed");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(templateUrl);
    setUrlCopied(true);
    toast.success("Template URL copied!");
    setTimeout(() => setUrlCopied(false), 2000);
  };

  /* ─── Managed Deploy Flow (Pro/Enterprise) ─── */
  if (canManagedDeploy) {
    return (
      <div className="rounded-lg border border-amber/20 bg-card/30 p-5 space-y-4">
        <PlatformHeader platform={platform} />

        <div>
          <h4 className="font-semibold text-sm mb-2">Deploy to Railway — Zero-Touch</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Click the button below and we'll automatically create a Railway project, connect the GitHub repo, inject your environment variables, assign a public domain, and trigger the first deployment.
          </p>
        </div>

        {!deploying && !deployResult && !deployError && (
          <>
            <Button
              onClick={handleManagedDeploy}
              disabled={railwayProvision.isPending}
              className="w-full bg-amber text-background hover:bg-amber/90 font-semibold gap-2 h-12"
            >
              {railwayProvision.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              Deploy to Railway Now
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Uses the Railway API to auto-provision. Your config is injected as environment variables.
            </p>
          </>
        )}

        {deploying && (
          <div className="space-y-2.5 mt-4">
            {railwayDeploySteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < deployStep ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
                ) : i === deployStep ? (
                  <Loader2 className="w-4 h-4 text-amber animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border/40 shrink-0" />
                )}
                <span className={`text-xs font-mono ${i <= deployStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        {deployResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeployStatusPanel
              deploymentDbId={deployResult.deploymentDbId}
              domain={deployResult.domain}
              railwayProjectId={deployResult.railwayProjectId}
              railwayUrl={deployResult.railwayUrl}
            />
          </motion.div>
        )}

        {deployError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-mono mb-2">Deployment failed: {deployError}</p>
              <Button
                onClick={() => { setDeploying(false); setDeployError(null); }}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        <EnvVarsPreview envContent={envContent} />
      </div>
    );
  }

  /* ─── Free Tier: Template Copy Flow ─── */
  const freeSteps = [
    "Create a Railway Account",
    "Review Your Configuration",
    "Deploy from Template",
  ];

  return (
    <div className="rounded-lg border border-amber/20 bg-card/30 p-5 space-y-4">
      <PlatformHeader platform={platform} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {freeSteps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < subStep
                  ? "bg-emerald text-background"
                  : i === subStep
                    ? "bg-amber text-background"
                    : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              {i < subStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[11px] font-mono ${i === subStep ? "text-foreground" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i < freeSteps.length - 1 && (
              <div className="w-8 h-px bg-border/40" />
            )}
          </div>
        ))}
      </div>

      {/* Sub-step 1: Sign up */}
      {subStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">1. Create a Railway Account</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Railway offers a generous free tier with $5 of credits — enough to run SunClaw for several days. Sign up with your GitHub account for the fastest setup.
            </p>
            <a
              href="https://railway.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber/10 border border-amber/30 text-amber text-xs font-semibold hover:bg-amber/20 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Sign up on Railway
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button onClick={() => setSubStep(1)} className="w-full bg-amber text-background hover:bg-amber/90 gap-2">
            I have a Railway account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Sub-step 2: Review config */}
      {subStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">2. Review Your Configuration</h5>
            <p className="text-xs text-muted-foreground mb-3">
              These environment variables from your setup will be automatically pre-filled in the Railway template. You can adjust them on Railway's side if needed.
            </p>
          </div>
          <EnvVarsPreview envContent={envContent} />
          <div className="flex gap-2">
            <Button
              onClick={() => setSubStep(0)}
              variant="outline"
              className="border-border/40"
            >
              Back
            </Button>
            <Button onClick={() => setSubStep(2)} className="flex-1 bg-amber text-background hover:bg-amber/90 gap-2">
              Looks good — next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Sub-step 3: Deploy from template */}
      {subStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg bg-background/40 border border-border/30 p-4">
            <h5 className="text-sm font-semibold mb-2">3. Deploy from Template</h5>
            <p className="text-xs text-muted-foreground mb-3">
              Click the button below to open Railway with your configuration pre-filled. Just click "Deploy" on Railway's page and your SunClaw instance will be live in ~2 minutes.
            </p>
          </div>

          <a
            href={templateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-amber text-background font-semibold text-sm hover:bg-amber/90 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Deploy to Railway
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {urlCopied ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            {urlCopied ? "Copied!" : "Copy template URL"}
          </button>

          <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-3">
            <p className="text-[10px] text-muted-foreground">
              <strong className="text-cyan">Pro tip:</strong> Upgrade to Pro ($29/mo) for zero-touch managed deployments — we handle everything automatically.{" "}
              <a href="/pricing" className="text-cyan hover:underline">View plans</a>
            </p>
          </div>

          <Button
            onClick={() => setSubStep(1)}
            variant="outline"
            className="border-border/40"
          >
            Back
          </Button>
        </motion.div>
      )}
    </div>
  );
}
