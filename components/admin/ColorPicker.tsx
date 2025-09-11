'use client'

import React from 'react'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  label?: string
}

// Palette de 20 couleurs distinctes et accessibles
const COLOR_PALETTE = [
  '#EF4444', // Rouge
  '#F97316', // Orange
  '#EAB308', // Jaune
  '#22C55E', // Vert
  '#10B981', // Émeraude
  '#06B6D4', // Cyan
  '#3B82F6', // Bleu
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Pourpre
  '#EC4899', // Rose
  '#F43F5E', // Rose rouge
  '#84CC16', // Lime
  '#06D6A0', // Turquoise
  '#0EA5E9', // Bleu ciel
  '#7C3AED', // Violet profond
  '#DB2777', // Rose fuchsia
  '#DC2626', // Rouge foncé
  '#CA8A04', // Jaune moutarde
  '#059669'  // Vert sapin
]

export default function ColorPicker({ selectedColor, onColorChange, label = "Couleur" }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2 max-w-xs">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
              selectedColor === color 
                ? 'border-gray-800 shadow-lg' 
                : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: color }}
            title={`Sélectionner la couleur ${color}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div 
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-600">Couleur sélectionnée: {selectedColor}</span>
      </div>
    </div>
  )
}