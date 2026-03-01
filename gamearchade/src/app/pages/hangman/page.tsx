'use client';

import React from 'react';
import HangmanPage from "@/components/games/hangman/HangmanPage";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from 'next/navigation';

export default function Hangman() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth');
    return null;
  }

  return (
    <HangmanPage 
      user={user} 
      onBackToDashboard={handleBackToDashboard}
    />
  );
}