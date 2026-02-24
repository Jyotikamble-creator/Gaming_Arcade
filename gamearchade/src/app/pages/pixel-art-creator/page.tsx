"use client"
import React, { useCallback, useMemo, useState } from 'react'
import PixelGrid from '@/components/games/pixelartcreator/PixelGrid'
import ColorPicker from '@/components/games/pixelartcreator/ColorPicker'
import Tools from '@/components/games/pixelartcreator/Tools'

const GRID_SIZE = 16

export default function PixelArtCreatorPage() {
  const emptyRow = useMemo(() => Array(GRID_SIZE).fill('#ffffff'), [])
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
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
    </div>
  )
}
