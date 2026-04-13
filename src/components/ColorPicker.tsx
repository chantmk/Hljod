import React, { useState, useCallback } from "react";
import { PRESET_COLORS } from "../api/types";
import type { LightColor } from "../api/types";

interface ColorPickerProps {
  currentColor: LightColor;
  disabled?: boolean;
  onColorChange: (color: LightColor) => void;
}

function colorToHex(color: LightColor): string {
  return (
    "#" +
    [color.r, color.g, color.b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToColor(hex: string): LightColor {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function colorsMatch(a: LightColor, b: LightColor): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

export function ColorPicker({ currentColor, disabled = false, onColorChange }: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(colorToHex(currentColor));

  React.useEffect(() => {
    setCustomHex(colorToHex(currentColor));
  }, [currentColor]);

  const handlePreset = useCallback(
    (color: LightColor) => {
      if (!disabled) {
        setCustomHex(colorToHex(color));
        onColorChange(color);
      }
    },
    [disabled, onColorChange]
  );

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
  }, []);

  const handleCustomCommit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onColorChange(hexToColor(e.target.value));
      }
    },
    [disabled, onColorChange]
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
        Color
      </label>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(({ name, color }) => {
          const isActive = colorsMatch(color, currentColor);
          return (
            <button
              key={name}
              title={name}
              disabled={disabled}
              onClick={() => handlePreset(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                isActive
                  ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  : "border-zinc-600 hover:border-zinc-400 hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                backgroundColor: colorToHex(color),
              }}
            />
          );
        })}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={customHex}
            disabled={disabled}
            onChange={handleCustomChange}
            onBlur={handleCustomCommit}
            className="w-10 h-10 rounded-lg border border-zinc-600 cursor-pointer bg-transparent p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Custom color"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={customHex}
            disabled={disabled}
            onChange={handleCustomChange}
            onBlur={() => {
              if (!disabled) onColorChange(hexToColor(customHex));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !disabled) {
                onColorChange(hexToColor(customHex));
              }
            }}
            maxLength={7}
            placeholder="#ffffff"
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm font-mono text-zinc-300 focus:outline-none focus:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div
          className="w-8 h-8 rounded-lg border border-zinc-600"
          style={{ backgroundColor: customHex }}
        />
      </div>
    </div>
  );
}
