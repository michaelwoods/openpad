import { useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#ffaa00", // Orange (default)
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
  "#ffffff", // White
  "#808080", // Gray
  "#000000", // Black
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent, presetColor?: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (presetColor) {
        onChange(presetColor);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => handleKeyDown(e)}
        className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors cursor-pointer"
        style={{ backgroundColor: color }}
        title="Change Model Color"
        aria-label="Open color picker"
        aria-expanded={isOpen}
      />

      {isOpen && (
        <div
          className="absolute right-0 top-10 z-20 p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-5 gap-2 mb-3">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(presetColor);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, presetColor)}
                tabIndex={0}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  color === presetColor ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: presetColor }}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                e.stopPropagation();
                onChange(e.target.value);
              }}
              className="w-full h-8 cursor-pointer rounded"
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
