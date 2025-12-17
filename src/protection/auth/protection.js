// ProtectedRoute
"use client";

// This component protects routes by checking authentication and authorization.
import { useEffect } from "react";
// Next.js router
import { useRouter } from "next/navigation";
// Custom hooks
import { useAppSelector } from "@/lib/hooks";
// Custom components
import { AppLayout } from "@/components/layout/AppLayout";

// ProtectedRoute
export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const { token, user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If no token, redirect to signup
    if (!token) {
      router.push("/");
      return;
    }

    // If we have a token but no user and we're not loading, try to fetch user
    if (token && !user && status !== "loading") {
      // User fetch will happen automatically in Providers component
      return;
    }

    // If user is loaded and we have role requirements, check them
    if (
      user &&
      requiredRole &&
      user.role !== requiredRole &&
      user.role !== "admin"
    ) {
      // Redirect to dashboard if user doesn't have required role
      router.push("/dashboard");
      return;
    }
  }, [token, user, status, router, requiredRole]);

  // Show loading state while checking auth
  // If there's no token, the effect above will redirect; show nothing briefly.
  if (!token) {
    return null;
  }

  // If we have a token but no user yet, show a loading state while the app fetches the current user.
  if (token && !user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // If user fetch failed, redirect to the home/login page
  if (status === "failed" && !user) {
    router.push("/");
    return null;
  }

  // At this point we have a token and a user
  if (!user) return null;

  return <AppLayout>{children}</AppLayout>;
}
