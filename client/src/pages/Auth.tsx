import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sun, Wind, Zap, Shield, LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";

type AuthMode = "login" | "register" | "forgot";

export default function Auth() {
  const { isAuthenticated, loading: authLoading, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const returnTo = new URLSearchParams(search).get("returnTo") || "/agent/setup";

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation(returnTo);
    }
  }, [authLoading, isAuthenticated, setLocation, returnTo]);

  const [showResendVerification, setShowResendVerification] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Welcome back!");
      await refresh();
      setLocation(returnTo);
    },
    onError: (err) => {
      if (err.message?.includes("verify your email")) {
        setShowResendVerification(true);
        toast.error(err.message, { duration: 8000 });
      } else {
        toast.error(err.message || "Login failed");
      }
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.requiresVerification) {
        toast.success(data.message || "Check your email to verify your account.");
        setLocation("/verify-email");
      } else {
        toast.success("Account created!");
        setLocation(returnTo);
      }
    },
    onError: (err) => {
      if (err.message?.includes("verify your email")) {
        toast.error(err.message, { duration: 8000 });
      } else {
        toast.error(err.message || "Registration failed");
      }
    },
  });

  const resendVerification = trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      toast.success("Verification email resent. Check your inbox.");
    },
    onError: () => {
      toast.error("Failed to resend verification email.");
    },
  });

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast.success("If an account exists with that email, a reset link has been sent.");
      setMode("login");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send reset email");
    },
  });

  const isSubmitting = loginMutation.isPending || registerMutation.isPending || resetMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password, rememberMe });
    } else if (mode === "register") {
      registerMutation.mutate({ email, password, name: name || undefined, origin: window.location.origin });
    } else if (mode === "forgot") {
      resetMutation.mutate({ email, origin: window.location.origin });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1612] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan to-emerald flex items-center justify-center">
              <span className="text-[#1A1612] font-medium text-xl">SC</span>
            </div>
            <div className="text-left">
              <span className="font-medium text-2xl tracking-tight text-white block">SunClaw</span>
              <span className="text-[10px] font-mono text-[#6B635B] uppercase tracking-widest">AI Agent for Renewable Energy</span>
            </div>
          </a>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl border border-[#3D3630] bg-[#1E1A16]/60 backdrop-blur-xl p-8"
        >
          {/* Mode tabs */}
          {mode !== "forgot" && (
            <div className="flex rounded-full border border-[#3D3630] bg-[#1E1A16]/60 p-1 mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-cyan/10 text-cyan"
                    : "text-[#6B635B] hover:text-[#C4B9AB]"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                  mode === "register"
                    ? "bg-cyan/10 text-cyan"
                    : "text-[#6B635B] hover:text-[#C4B9AB]"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-white mb-2">
              {mode === "login" && "Welcome Back"}
              {mode === "register" && "Create Your Account"}
              {mode === "forgot" && "Reset Password"}
            </h2>
            <p className="text-sm text-[#6B635B]">
              {mode === "login" && "Sign in to access your dashboard."}
              {mode === "register" && "Get started with SunClaw."}
              {mode === "forgot" && "Enter your email for a reset link."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-[#6B635B]">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 bg-[#1E1A16]/80 border-[#3D3630] focus:border-[#4D4640] text-white placeholder-[#4D4640]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-[#6B635B]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 bg-[#1E1A16]/80 border-[#3D3630] focus:border-[#4D4640] text-white placeholder-[#4D4640]"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-[#6B635B]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Min 8 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "register" ? 8 : undefined}
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
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#4D4640] bg-[#1E1A16] text-[#6B635B] focus:ring-[#4D4640]"
                  />
                  <span className="text-xs text-[#6B635B]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-[#6B635B] hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan text-[#1A1612] hover:bg-cyan/90 font-medium gap-2 h-12 text-base"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" && <><LogIn className="w-5 h-5" /> Sign In</>}
                  {mode === "register" && <><UserPlus className="w-5 h-5" /> Create Account</>}
                  {mode === "forgot" && <><Mail className="w-5 h-5" /> Send Reset Link</>}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {showResendVerification && mode === "login" && (
            <button
              onClick={() => {
                if (email) {
                  resendVerification.mutate({ email, origin: window.location.origin });
                } else {
                  toast.error("Please enter your email address first.");
                }
              }}
              disabled={resendVerification.isPending}
              className="w-full mt-3 text-sm text-[#9E958B] hover:text-white transition-colors text-center"
            >
              {resendVerification.isPending ? "Sending..." : "Resend verification email"}
            </button>
          )}

          {mode === "forgot" && (
            <button
              onClick={() => setMode("login")}
              className="w-full mt-4 text-sm text-[#6B635B] hover:text-white transition-colors text-center"
            >
              Back to Sign In
            </button>
          )}

          {/* Features preview */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "16+ AI Providers", icon: Zap },
              { label: "5 Channel Types", icon: Shield },
              { label: "Zero CLI Setup", icon: Sun },
              { label: "One-Click Deploy", icon: Wind },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1E1A16]/40 border border-[#3D3630]/40">
                <Icon className="w-3.5 h-3.5 text-cyan/60 shrink-0" />
                <span className="text-[11px] font-mono text-[#6B635B]">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, label: "Secure" },
            { icon: Sun, label: "Solar" },
            { icon: Wind, label: "Wind" },
            { icon: Zap, label: "Fast" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[#6B635B]">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
