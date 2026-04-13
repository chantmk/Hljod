import React, { useState, useCallback } from "react";

interface BrightnessSliderProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function BrightnessSlider({ value, disabled = false, onChange }: BrightnessSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sync external value when not dragging
  React.useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(Number(e.target.value));
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onChange(localValue);
  }, [localValue, onChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    onChange(localValue);
  }, [localValue, onChange]);

  const percent = ((localValue - 10) / 90) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Brightness
        </label>
        <span className="text-sm font-mono text-zinc-300">{localValue}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-zinc-700">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-zinc-500 to-amber-300 transition-all"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={10}
          max={100}
          value={localValue}
          disabled={disabled}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed h-full"
        />
      </div>
    </div>
  );
}
