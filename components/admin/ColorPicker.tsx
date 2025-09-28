"use client";

import React from "react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

const COLOR_PALETTE = [
  "#882d17",
  "#f99379",
  "#e25822",
  "#654522",
  "#f38400",
  "#f6a600",
  "#c2b280",
  "#f3c300",
  "#dcd300",
  "#848482",
  "#8db600",
  "#2b3d26",
  "#008856",
  "#0067a5",
  "#a1caf1",
  "#604e97",
  "#875692",
  "#b3446c",
  "#e68fac",
  "#be0032",
];

export default function ColorPicker({
  selectedColor,
  onColorChange,
  label = "Couleur",
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex max-w-xs flex-wrap gap-2">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              selectedColor === color
                ? "border-gray-800 shadow-lg"
                : "border-gray-300 hover:border-gray-500"
            }`}
            style={{ backgroundColor: color }}
            title={`Sélectionner la couleur ${color}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-4 w-4 rounded border border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-600">
          Couleur sélectionnée: {selectedColor}
        </span>
      </div>
    </div>
  );
}
