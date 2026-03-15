"use client"
import React from 'react'
import SpeedMath from '@/app/pages/speed-math/SpeedMath'
import DashboardLayout from '@/components/shared/DashboardLayout'

export default function SpeedMathPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <SpeedMath />
      </div>
    </DashboardLayout>
  )
}
