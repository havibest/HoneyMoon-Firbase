import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Public pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";

// Dashboard pages (require auth + subscription)
import Discover from "@/pages/dashboard/Discover";
import Messages from "@/pages/dashboard/Messages";
import Profile from "@/pages/dashboard/Profile";
import Dashboard from "@/pages/dashboard/Dashboard";
import Earnings from "@/pages/dashboard/Earnings";
import Notifications from "@/pages/dashboard/Notifications";
import Settings from "@/pages/dashboard/Settings";
import Opportunities from "@/pages/dashboard/Opportunities";
import CompleteProfile from "@/pages/dashboard/CompleteProfile";
import Referrals from "@/pages/dashboard/Referrals";

// Subscription/Payment pages
import Subscription from "@/pages/subscription/Subscription";
import Checkout from "@/pages/subscription/Checkout";

// Admin pages (require admin role)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminReports from "@/pages/admin/AdminReports";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminAI from "@/pages/admin/AdminAI";
import AdminSettings from "@/pages/admin/AdminSettings";

// ============================================================
// Loading Spinner
// ============================================================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// ============================================================
// Route Guard Components
// ============================================================

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // If user is admin, redirect to admin dashboard
      if (profile.admin) {
        setLocation("/admin");
      } else {
        // Regular user: redirect to subscription gate
        setLocation("/subscription");
      }
    }
  }, [user, loading, profile.admin, setLocation]);

  if (loading) return <LoadingSpinner />;
  if (user) return <LoadingSpinner />;

  return <Component />;
}

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoadingSpinner />;

  return <Component />;
}

function SubscriptionRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, isSubscribed, profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // Admin bypasses subscription gate
      if (profile.admin) {
        setLocation("/admin");
        return;
      }
      // Regular user must be subscribed
      if (!isSubscribed) {
        setLocation("/subscription");
      }
    } else if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, isSubscribed, profile.admin, setLocation]);

  if (loading) return <LoadingSpinner />;
  if (!user || !isSubscribed) return <LoadingSpinner />;

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || !profile.admin)) {
      setLocation("/");
    }
  }, [user, loading, profile.admin, setLocation]);

  if (loading) return <LoadingSpinner />;
  if (!user || !profile.admin) return <LoadingSpinner />;

  return <Component />;
}

// ============================================================
// Router
// ============================================================

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path={"/"} component={() => <GuestRoute component={Landing} />} />
      <Route path={"/login"} component={() => <GuestRoute component={Login} />} />
      <Route path={"/register"} component={() => <GuestRoute component={Register} />} />
      <Route path={"/forgot-password"} component={() => <GuestRoute component={ForgotPassword} />} />
      <Route path={"/verify-email"} component={() => <GuestRoute component={VerifyEmail} />} />

      {/* Subscription/Payment gate */}
      <Route path={"/subscription"} component={() => <PrivateRoute component={Subscription} />} />
      <Route path={"/checkout"} component={() => <PrivateRoute component={Checkout} />} />

      {/* Dashboard pages (require subscription) */}
      <Route path={"/discover"} component={() => <SubscriptionRoute component={Discover} />} />
      <Route path={"/messages/:conversationId?"} component={() => <SubscriptionRoute component={Messages} />} />
      <Route path={"/profile/:userId?"} component={() => <SubscriptionRoute component={Profile} />} />
      <Route path={"/dashboard"} component={() => <SubscriptionRoute component={Dashboard} />} />
      <Route path={"/earnings"} component={() => <SubscriptionRoute component={Earnings} />} />
      <Route path={"/notifications"} component={() => <SubscriptionRoute component={Notifications} />} />
      <Route path={"/settings"} component={() => <SubscriptionRoute component={Settings} />} />
      <Route path={"/opportunities"} component={() => <SubscriptionRoute component={Opportunities} />} />
      <Route path={"/complete-profile"} component={() => <SubscriptionRoute component={CompleteProfile} />} />
      <Route path={"/referrals"} component={() => <SubscriptionRoute component={Referrals} />} />

      {/* Admin pages (require admin role) */}
      <Route path={"/admin"} component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path={"/admin/users"} component={() => <AdminRoute component={AdminUsers} />} />
      <Route path={"/admin/payments"} component={() => <AdminRoute component={AdminPayments} />} />
      <Route path={"/admin/referrals"} component={() => <AdminRoute component={AdminReferrals} />} />
      <Route path={"/admin/reports"} component={() => <AdminRoute component={AdminReports} />} />
      <Route path={"/admin/withdrawals"} component={() => <AdminRoute component={AdminWithdrawals} />} />
      <Route path={"/admin/ai"} component={() => <AdminRoute component={AdminAI} />} />
      <Route path={"/admin/settings"} component={() => <AdminRoute component={AdminSettings} />} />

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ============================================================
// App
// ============================================================

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
