import { CheckCircle2, Loader2 } from "lucide-react";

interface WizardStepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function WizardStepIndicator({
  steps,
  currentStep,
}: WizardStepIndicatorProps) {
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          {i < currentStep ? (
            <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
          ) : i === currentStep ? (
            <Loader2 className="w-4 h-4 text-amber animate-spin shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-border/40 shrink-0" />
          )}
          <span
            className={`text-xs font-mono ${
              i <= currentStep ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
