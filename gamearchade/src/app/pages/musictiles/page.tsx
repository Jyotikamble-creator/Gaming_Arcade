"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from '@/components/shared/DashboardLayout';
import MusicTilesPage from '@/components/games/musictiles/MusicTilesPage';

export default function MusicTiles() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth if not authenticated after loading completes
    if (!loading && !isAuthenticated) {
      router.push("/pages/auth");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render page if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-pink-900 to-indigo-900 p-8">
        <MusicTilesPage />
      </div>
    </DashboardLayout>
  );
}
