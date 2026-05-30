"use client"
import React from 'react'
import SpeedMathComponent from '@/components/games/speedmath/SpeedMath'
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout'

export default function SpeedMathPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
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

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <SpeedMathComponent user={user} />
    </DashboardLayout>
  )
}
