"use client"
import React from 'react'
import Leaderboard from '@/components/leaderboard/Leaderboard'

export default function ScoresPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Scores</h1>
        <p className="text-gray-300 mb-4">Recent top scores across games</p>
        <Leaderboard gameType="all" limit={50} />
      </div>
    </div>
  )
}
