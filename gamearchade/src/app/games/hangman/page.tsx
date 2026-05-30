'use client';

import React from 'react';
import HangmanPage from "@/components/games/hangman/HangmanPage";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';

export default function Hangman() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/pages/auth');
    }
  }, [isAuthenticated, loading, router]);

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
    return null;
  }

  return (
    <DashboardLayout>
      <HangmanPage 
        user={user} 
        onBackToDashboard={handleBackToDashboard}
      />
    </DashboardLayout>
  );
}