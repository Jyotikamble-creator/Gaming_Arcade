"use client"
import React, { useCallback, useMemo, useState } from 'react'
import PixelGrid from '@/components/games/pixelartcreator/PixelGrid'
import ColorPicker from '@/components/games/pixelartcreator/ColorPicker'
import Tools from '@/components/games/pixelartcreator/Tools'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import { PixelArtDifficulty, DIFFICULTY_CONFIG } from '@/types/games/pixel-art-creator'

export default function PixelArtCreatorPage() {
  const [difficulty, setDifficulty] = useState<PixelArtDifficulty>('medium')
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  
  const GRID_SIZE = gameStarted ? DIFFICULTY_CONFIG[difficulty].gridSize : 16
  const emptyRow = useMemo(() => Array(GRID_SIZE).fill('#ffffff'), [GRID_SIZE])
  const [grid, setGrid] = useState<string[][]>(() => Array.from({ length: GRID_SIZE }, () => [...emptyRow]))
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState<'paint'|'erase'>('paint')

  const onPixelClick = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = tool === 'paint' ? selectedColor : '#ffffff'
      return next
    })
  }, [selectedColor, tool])

  const clearCanvas = useCallback(() => {
    setGrid(Array.from({ length: GRID_SIZE }, () => [...emptyRow]))
  }, [emptyRow])

  const saveArt = useCallback(() => {
    // Render to canvas and download PNG
    const scale = 16
    const canvas = document.createElement('canvas')
    canvas.width = GRID_SIZE * scale
    canvas.height = GRID_SIZE * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        ctx.fillStyle = grid[r][c] || '#ffffff'
        ctx.fillRect(c * scale, r * scale, scale, scale)
      }
    }

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pixel-art-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [grid])

  const handleDifficultySelect = (selectedDifficulty: PixelArtDifficulty): void => {
    setDifficulty(selectedDifficulty)
    setGameStarted(true)
  }

  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🎨 Pixel Art Creator
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Create beautiful pixel art designs!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Easy */}
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 8x8 Grid</li>
                      <li>✓ Great for Beginners</li>
                      <li>✓ Quick Creation</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => handleDifficultySelect('medium')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 16x16 Grid</li>
                      <li>✓ More Detail</li>
                      <li>✓ Balanced Challenge</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => handleDifficultySelect('hard')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 24x24 Grid</li>
                      <li>✓ Maximum Detail</li>
                      <li>✓ Professional Level</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>🎨 Click pixels to paint them</p>
                    <p>✅ Choose from a vibrant color palette</p>
                  </div>
                  <div className="space-y-2">
                    <p>🔧 Use tools to erase and create</p>
                    <p>💾 Save your artwork as PNG!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">Pixel Art Creator</h1>
            <div className="bg-gray-900/60 p-6 rounded">
              <PixelGrid grid={grid} onPixelClick={onPixelClick} />
            </div>
          </div>

          <div>
            <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
            <div className="my-4" />
            <Tools tool={tool} onToolChange={setTool} onClear={clearCanvas} onSave={saveArt} />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="pixel-art-creator" />
        </div>
      </div>
    </DashboardLayout>
  )
}
