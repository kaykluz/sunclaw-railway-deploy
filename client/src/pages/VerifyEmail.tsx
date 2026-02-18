/**
 * Email verification page — handles the verification token from email links.
 * After successful verification, auto-redirects to the setup wizard.
 */
import { useEffect, useRef, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyState = "verifying" | "success" | "error" | "no-token";

export default function VerifyEmail() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(search).get("token");
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "no-token");
  const [errorMessage, setErrorMessage] = useState("");
  const hasFired = useRef(false);

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setState("success");
      // Auto-redirect after 2 seconds
      setTimeout(() => setLocation("/agent/setup"), 2000);
    },
    onError: (err) => {
      setState("error");
      setErrorMessage(err.message || "Verification failed");
    },
  });

  useEffect(() => {
    if (token && state === "verifying" && !hasFired.current) {
      hasFired.current = true;
      verifyMutation.mutate({ token });
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background grid-overlay flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-amber flex items-center justify-center shadow-lg shadow-cyan/20">
              <span className="text-background font-bold text-xl">SC</span>
            </div>
          </a>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-8 shadow-2xl shadow-black/20 text-center">
          {state === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 text-cyan animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
              <p className="text-muted-foreground">Please wait while we verify your email address...</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email has been verified and you're now logged in. Redirecting to the setup wizard...
              </p>
              <Button
                onClick={() => setLocation("/agent/setup")}
                className="bg-cyan text-background hover:bg-cyan/90 font-semibold"
              >
                Go to Setup Wizard
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "The verification link is invalid or has expired."}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/auth")}
                  className="w-full bg-cyan text-background hover:bg-cyan/90 font-semibold"
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}

          {state === "no-token" && (
            <>
              <Mail className="w-16 h-16 text-amber mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">
                We sent a verification link to your email. Click the link to verify your account and get started.
              </p>
              <Button
                onClick={() => setLocation("/auth")}
                variant="outline"
                className="border-border/60 hover:border-cyan/40"
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
