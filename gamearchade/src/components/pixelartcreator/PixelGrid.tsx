"use client"
import React, { useState } from 'react'

interface PixelGridProps {
  grid: string[][]
  onPixelClick: (row: number, col: number) => void
}

export default function PixelGrid({ grid, onPixelClick }: PixelGridProps) {
  const [isDrawing, setIsDrawing] = useState(false)

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true)
    onPixelClick(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) onPixelClick(row, col)
  }

  const handleMouseUp = () => setIsDrawing(false)

  return (
    <div
      className="grid grid-cols-16 gap-0 bg-white p-2 rounded select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {grid.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-6 h-6 cursor-pointer hover:opacity-80"
            style={{ backgroundColor: color }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  )
}
