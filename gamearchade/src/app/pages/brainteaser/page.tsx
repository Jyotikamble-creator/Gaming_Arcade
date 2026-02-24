// Brain Teaser page - Next.js App Router
"use client";

import BrainTeaserPage from "@/components/games/brainteaser/BrainTeaserPage";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BrainTeaser() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!user && !loading) {
      router.push("/pages/auth");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render page if user is not authenticated
  if (!user) {
    return null;
  }

  return <BrainTeaserPage user={user} />;
}