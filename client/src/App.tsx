import { Route, Switch } from "wouter";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";

import CompleteProfile from "@/pages/CompleteProfile";
import Dashboard from "@/pages/dashboard/Dashboard";
import Discover from "@/pages/dashboard/Discover";
import Messages from "@/pages/dashboard/Messages";
import Notifications from "@/pages/dashboard/Notifications";
import Earnings from "@/pages/dashboard/Earnings";

import Subscription from "@/pages/subscription/Subscription";
import Referrals from "@/pages/subscription/Referrals";
import Checkout from "@/pages/checkout/Checkout";

import Profile from "@/pages/dashboard/Profile";
import Opportunities from "@/pages/dashboard/Opportunities";
import Settings from "@/pages/dashboard/Settings";
import DashboardReferrals from "@/pages/dashboard/Referrals";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminReports from "@/pages/admin/AdminReports";
import AdminAI from "@/pages/admin/AdminAI";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";

import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/home" component={Home} />

      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />

      <Route path="/complete-profile" component={CompleteProfile} />

      <Route path="/dashboard" component={Dashboard} />
      <Route path="/discover" component={Discover} />
      <Route path="/messages/:id?" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/earnings" component={Earnings} />

      <Route path="/subscription" component={Subscription} />
      <Route path="/subscription/referrals" component={Referrals} />
      <Route path="/subscription/checkout" component={Checkout} />
      <Route path="/checkout" component={Checkout} />

      <Route path="/profile" component={Profile} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/settings" component={Settings} />
      <Route path="/referrals" component={DashboardReferrals} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/ai" component={AdminAI} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/referrals" component={AdminReferrals} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />

      <Route component={NotFound} />
    </Switch>
  );
}
