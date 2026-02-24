"use client"
import React from 'react'
import TowerDisplay from '@/components/games/towerstacker/TowerDisplay'
import TowerStats from '@/components/games/towerstacker/TowerStats'
import { useTowerStacker } from '@/hooks/useTowerStacker'

export default function TowerStackerPage() {
  const {
    gameState,
    tower,
    currentBlock,
    score,
    level,
    perfectDrops,
    startGame,
    dropBlock
  } = useTowerStacker()

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Tower Stacker</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
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

          <div className="md:col-span-1">
            <TowerStats score={score} level={level} perfectDrops={perfectDrops} />
          </div>
        </div>
      </div>
    </div>
  )
}
