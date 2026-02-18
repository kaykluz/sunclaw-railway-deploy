import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Blog from "./pages/Blog";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({
  component: Component,
  skipPlanCheck = false,
}: {
  component: React.ComponentType;
  skipPlanCheck?: boolean;
}) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1612] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (!skipPlanCheck && user && !user.planSelected) {
    return <Redirect to="/pricing" />;
  }

  return <Component />;
}

function PricingRoute() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1612] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  return <Pricing />;
}

const pageTransition = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(5px)" },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as number[] },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        {/* === ROOT: Brand Landing === */}
        <Route path={"/"}>
          <AnimatedPage><LandingPage /></AnimatedPage>
        </Route>

        {/* === ECOSYSTEM PAGES === */}
        <Route path={"/marketplace"}>
          <AnimatedPage><Marketplace /></AnimatedPage>
        </Route>
        <Route path={"/blog"}>
          <AnimatedPage><Blog /></AnimatedPage>
        </Route>

        {/* === AGENT PRODUCT (prefixed) === */}
        <Route path={"/agent"}>
          <AnimatedPage><Home /></AnimatedPage>
        </Route>
        <Route path={"/agent/setup"}>
          <AnimatedPage><ProtectedRoute component={Setup} /></AnimatedPage>
        </Route>
        <Route path={"/agent/dashboard"}>
          <AnimatedPage><ProtectedRoute component={Dashboard} /></AnimatedPage>
        </Route>
        <Route path={"/agent/account"}>
          <AnimatedPage><ProtectedRoute component={Account} /></AnimatedPage>
        </Route>
        <Route path={"/agent/admin"}>
          <AnimatedPage><ProtectedRoute component={Admin} /></AnimatedPage>
        </Route>

        {/* === SHARED (root-level) === */}
        <Route path={"/auth"}>
          <AnimatedPage><Auth /></AnimatedPage>
        </Route>
        <Route path={"/auth/login"}>
          <AnimatedPage><Auth /></AnimatedPage>
        </Route>
        <Route path={"/auth/register"}>
          <AnimatedPage><Auth /></AnimatedPage>
        </Route>
        <Route path={"/verify-email"}>
          <AnimatedPage><VerifyEmail /></AnimatedPage>
        </Route>
        <Route path={"/reset-password"}>
          <AnimatedPage><ResetPassword /></AnimatedPage>
        </Route>
        <Route path={"/privacy"}>
          <AnimatedPage><Privacy /></AnimatedPage>
        </Route>
        <Route path={"/terms"}>
          <AnimatedPage><Terms /></AnimatedPage>
        </Route>
        <Route path={"/pricing"}>
          <AnimatedPage><PricingRoute /></AnimatedPage>
        </Route>

        {/* === LEGACY REDIRECTS (old URLs → new prefixed URLs) === */}
        <Route path={"/setup"}>
          <Redirect to="/agent/setup" />
        </Route>
        <Route path={"/dashboard"}>
          <Redirect to="/agent/dashboard" />
        </Route>
        <Route path={"/account"}>
          <Redirect to="/agent/account" />
        </Route>
        <Route path={"/admin"}>
          <Redirect to="/agent/admin" />
        </Route>

        {/* === 404 === */}
        <Route path={"/404"}>
          <AnimatedPage><NotFound /></AnimatedPage>
        </Route>
        <Route>
          <AnimatedPage><NotFound /></AnimatedPage>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
