import React, { useState, useCallback } from "react";

interface TemperatureSliderProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const MIN_TEMP = 2200;
const MAX_TEMP = 6500;

function formatTemp(k: number): string {
  return `${k.toLocaleString()}K`;
}

function getTempLabel(k: number): string {
  if (k <= 2700) return "Candlelight";
  if (k <= 3000) return "Warm White";
  if (k <= 3500) return "Soft White";
  if (k <= 4000) return "Cool White";
  if (k <= 5000) return "Daylight";
  if (k <= 5500) return "Bright Daylight";
  return "Cool Daylight";
}

export function TemperatureSlider({ value, disabled = false, onChange }: TemperatureSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

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

  const percent = ((localValue - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
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
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
          Color Temp
        </label>
        <div className="text-right">
          <span className="text-sm font-mono text-zinc-300">{formatTemp(localValue)}</span>
          <span className="text-xs text-zinc-500 ml-2">{getTempLabel(localValue)}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden">
        {/* Gradient background: warm orange to cool blue */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #ff8c00, #ffd580, #fff5e0, #ffffff, #e8f0ff, #b3d4ff, #7ab8ff)",
          }}
        />
        {/* Thumb indicator overlay */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-lg rounded-full"
          style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
        />
        <input
          type="range"
          min={MIN_TEMP}
          max={MAX_TEMP}
          step={100}
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
      <div className="flex justify-between text-xs text-zinc-600">
        <span>Warm 2200K</span>
        <span>Cool 6500K</span>
      </div>
    </div>
  );
}
