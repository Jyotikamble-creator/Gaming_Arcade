// Emoji Guess page - Next.js App Router
"use client";

import EmojiGuessPage from "@/components/games/emojiguess/EmojiGuessPage";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from '@/components/shared/DashboardLayout';

export default function EmojiGuess() {
  const { user, loading } = useAuth();
  const router = useRouter();


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/pages/auth");
    return null;
  }

  return (
    <DashboardLayout>
      <EmojiGuessPage user={user} />
    </DashboardLayout>
  );
}