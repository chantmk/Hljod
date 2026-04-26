import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { Preset } from "../api/types";

interface PresetsPanelProps {
  onRefreshRooms: () => void;
  refreshTrigger: number;
}

export function PresetsPanel({ onRefreshRooms, refreshTrigger }: PresetsPanelProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    try {
      setPresets(await api.getPresets());
    } catch {
      // silently ignore — server may not be reachable yet
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets, refreshTrigger]);

  const handleApply = async (presetId: string) => {
    setApplying(presetId);
    setError(null);
    try {
      await api.applyPreset(presetId);
      onRefreshRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply preset.");
    } finally {
      setApplying(null);
    }
  };

  const handleDelete = async (presetId: string) => {
    setDeleting(presetId);
    setError(null);
    try {
      await api.deletePreset(presetId);
      setPresets((prev) => prev.filter((p) => p.preset_id !== presetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preset.");
    } finally {
      setDeleting(null);
    }
  };

  if (presets.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Presets</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isApplying = applying === preset.preset_id;
          const isDeleting = deleting === preset.preset_id;
          return (
            <div key={preset.preset_id} className="flex items-center rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
              <button
                onClick={() => handleApply(preset.preset_id)}
                disabled={isApplying || isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={`Apply "${preset.name}" (${preset.devices.length} device${preset.devices.length !== 1 ? "s" : ""})`}
              >
                {isApplying ? (
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
                {preset.name}
              </button>
              <button
                onClick={() => handleDelete(preset.preset_id)}
                disabled={isApplying || isDeleting}
                className="px-2 py-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-zinc-700"
                title={`Delete "${preset.name}"`}
              >
                {isDeleting ? (
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
