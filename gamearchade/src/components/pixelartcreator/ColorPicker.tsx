"use client"
import React from 'react'

const colors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080'
]

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">Colors</h3>
      <div className="grid grid-cols-4 gap-2">
        {colors.map(color => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 ${selectedColor === color ? 'border-black' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  )
}
