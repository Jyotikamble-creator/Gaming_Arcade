"use client"
import React from 'react'
import ReactionTime from '@/components/games/reactiontime/ReactionTime'
import Instructions from '@/components/shared/Instructions'
import DashboardLayout from '@/components/shared/DashboardLayout'

export default function ReactionTimePage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Reaction Time Challenge</h1>
          
          <div className="mb-6">
            <Instructions gameType="reaction-time" />
          </div>

          <ReactionTime />
        </div>
      </div>
    </DashboardLayout>
  )
}
