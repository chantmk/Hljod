import React, { useState } from "react";
import { SCENES } from "../api/types";

interface SceneSelectorProps {
  disabled?: boolean;
  onSceneSelect: (sceneId: number) => void;
}

export function SceneSelector({ disabled = false, onSceneSelect }: SceneSelectorProps) {
  const [selected, setSelected] = useState<number | "">("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") return;
    const id = Number(val);
    setSelected(id);
    onSceneSelect(id);
  };

  return (
    <div className="space-y-2">
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
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Scene
      </label>
      <div className="relative">
        <select
          value={selected}
          disabled={disabled}
          onChange={handleChange}
          className="w-full appearance-none bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8"
        >
          <option value="">Select a scene…</option>
          {SCENES.map((scene) => (
            <option key={scene.id} value={scene.id}>
              {scene.id}. {scene.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}
