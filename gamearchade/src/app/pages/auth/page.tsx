"use client";

import AuthPage from "@/components/auth/AuthPage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { me as meApi } from "@/lib/auth/client";
import { useEffect, useState } from "react";

export default function Auth() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Validate stored session with backend before redirecting.
    const validate = async () => {
      if (!loading && isAuthenticated) {
        try {
          // Short-circuit demo token: our client uses 'demo-jwt-token' for local demo accounts.
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (storedToken === 'demo-jwt-token') {
            router.push('/dashboard');
            return;
          }

          const resp = await meApi();
          if (resp && resp.success && resp.data?.user) {
            // Valid session, go to dashboard
            router.push('/dashboard');
            return;
          }
        } catch (err) {
          // Invalid session — ensure local state is cleared
          try { logout(); } catch {}
        }
      }

      setChecking(false);
    };

    void validate();
  }, [isAuthenticated, loading, router, logout]);

  // Show loading state while checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render auth page if user is already authenticated
  if (isAuthenticated) {
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