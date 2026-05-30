// Memory Card game page - Next.js App Router
"use client";

import MemoryCardPage from "@/components/games/memorycard/MemoryCardPage";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from '@/components/shared/DashboardLayout';

export default function MemoryCard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/pages/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <MemoryCardPage user={user} />
    </DashboardLayout>
  );
}