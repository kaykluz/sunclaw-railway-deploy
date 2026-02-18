import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const joinMutation = trpc.waitlist.join.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.alreadyExists) {
        toast.info("You're already on the waitlist! We'll be in touch.");
      } else {
        toast.success("You're on the list! We'll notify you when SunClaw launches.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const { data: countData } = trpc.waitlist.count.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    joinMutation.mutate({ email, source: "hero" });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#3D3630] bg-[#1E1A16]/60">
        <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">You're on the list!</p>
          <p className="text-xs text-[#6B635B]">We'll email you when SunClaw is ready for early access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B635B]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#3D3630] bg-[#1E1A16]/60 text-sm text-white focus:outline-none focus:border-[#4D4640] focus:ring-1 focus:ring-[#4D4640]/20 placeholder:text-[#6B635B]"
          />
        </div>
        <Button
          type="submit"
          disabled={joinMutation.isPending || !email}
          className="bg-cyan text-[#1A1612] hover:bg-cyan/90 font-medium gap-2 h-auto px-5 shrink-0"
        >
          {joinMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
      {countData && countData.count > 0 && (
        <p className="text-xs text-[#6B635B] font-mono">
          <span className="text-cyan font-medium">{countData.count}</span> energy professional{countData.count !== 1 ? "s" : ""} already on the waitlist
        </p>
      )}
    </div>
  );
}
