import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) return null;

  if (!user?.admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}