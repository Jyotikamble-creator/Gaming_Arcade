"use client"
import React from 'react'
import TowerDisplay from '@/components/games/towerstacker/TowerDisplay'
import TowerStats from '@/components/games/towerstacker/TowerStats'
import { useTowerStacker } from '@/hooks/games/useTowerStacker'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Instructions from '@/components/shared/Instructions'

export default function TowerStackerPage() {
  const {
    gameState,
    tower,
    currentBlock,
    score,
    level,
    perfectDrops,
    highestLevel,
    startGame,
    dropBlock
  } = useTowerStacker()

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Tower Stacker</h1>
          <p className="text-center text-gray-300 mb-8">Stack blocks perfectly to build the tallest tower!</p>

          {/* Instructions Card - Below Stats */}
          <div className="mb-2">
            <Instructions gameType="tower-stacker" />
          </div>
          {/* Game Container */}
          <div className="mb-6">
            <TowerDisplay
              tower={tower}
              currentBlock={currentBlock}
              containerWidth={400}
              blockHeight={30}
              gameState={gameState}
              onStart={startGame}
              onDrop={dropBlock}
            />
          </div>

          {/* Stats Card - Below Game */}
          <div className="mb-2">
            <TowerStats score={score} level={level} perfectDrops={perfectDrops} highestLevel={highestLevel} />
          </div>


        </div>
      </div>
    </DashboardLayout>
  )
}
