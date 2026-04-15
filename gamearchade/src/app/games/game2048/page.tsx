'use client';

import React, { useEffect } from 'react';
import Game2048Page from "@/components/games/game2048/Game2048Page";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';

export default function Game2048() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // BYPASSING AUTH - ALLOW ALL USERS
  // if (!isAuthenticated) {
  //   router.push('/auth');
  //   return null;
  // }

  return (
    <DashboardLayout>
      <Game2048Page 
        user={user} 
      />
    </DashboardLayout>
  );
}