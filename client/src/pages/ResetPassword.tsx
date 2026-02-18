import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetState = "form" | "submitting" | "success" | "error" | "no-token";

export default function ResetPassword() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(search).get("token");
  const [state, setState] = useState<ResetState>(token ? "form" : "no-token");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setState("success");
      setTimeout(() => setLocation("/auth"), 2000);
    },
    onError: (err) => {
      setState("error");
      setErrorMessage(err.message || "Password reset failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    if (!token) return;

    setState("submitting");
    resetMutation.mutate({ token, newPassword: password });
  };

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
          {state === "form" && (
            <>
              <KeyRound className="w-16 h-16 text-cyan mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
              <p className="text-muted-foreground mb-6">Enter your new password below.</p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-[#6B635B]">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 pr-10 h-11 bg-[#1E1A16]/80 border-[#3D3630] focus:border-[#4D4640] text-white placeholder-[#4D4640]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B635B] hover:text-[#C4B9AB]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-[#6B635B]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 h-11 bg-[#1E1A16]/80 border-[#3D3630] focus:border-[#4D4640] text-white placeholder-[#4D4640]"
                    />
                  </div>
                </div>
                {validationError && (
                  <p className="text-red-500 text-sm">{validationError}</p>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-cyan text-background hover:bg-cyan/90 font-semibold"
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}

          {state === "submitting" && (
            <>
              <Loader2 className="w-16 h-16 text-cyan animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Resetting Password</h2>
              <p className="text-muted-foreground">Please wait...</p>
            </>
          )}

          {state === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been updated. Redirecting to sign in...
              </p>
              <Button
                onClick={() => setLocation("/auth")}
                className="bg-cyan text-background hover:bg-cyan/90 font-semibold"
              >
                Go to Sign In
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Reset Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "The reset link is invalid or has expired."}
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
                We sent a password reset link to your email. Click the link to choose a new password.
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
