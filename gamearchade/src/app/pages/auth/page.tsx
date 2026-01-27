// Auth page - Next.js App Router
"use client";

import AuthPage from "@/components/auth/AuthPage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useEffect } from "react";

export default function Auth() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render auth page if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <AuthPage 
      onSuccess={(user) => {
        console.log("Authentication successful:", user);
        router.push("/dashboard");
      }}
    />
  );
}