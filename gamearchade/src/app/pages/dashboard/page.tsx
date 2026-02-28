// Dashboard page - Next.js App Router
"use client";

import DashboardPage from "@/components/gamehub/DashboardPage";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!user && !isLoading) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }

  return <DashboardPage user={user} />;
}