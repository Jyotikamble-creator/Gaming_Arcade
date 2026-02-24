"use client"
import React from 'react'
import ReactionTime from '@/components/games/reactiontime/ReactionTime'

export default function ReactionTimePage() {
  return (
    <div className="min-h-screen p-8 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <ReactionTime />
      </div>
    </div>
  )
}
