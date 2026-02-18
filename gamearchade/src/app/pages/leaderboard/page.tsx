"use client"
import React from 'react'
import Leaderboard from '@/components/leaderboard/Leaderboard'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>
        <Leaderboard gameType="all" limit={20} />
      </div>
    </div>
  )
}
