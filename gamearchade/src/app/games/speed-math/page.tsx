"use client"
import React from 'react'
import SpeedMathComponent from '@/components/games/speedmath/SpeedMath'
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout'

export default function SpeedMathPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <SpeedMathComponent user={user} />
    </DashboardLayout>
  )
}
