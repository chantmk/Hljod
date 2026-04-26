import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { RoomState, DeviceState, PresetDeviceEntry } from "../api/types";

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  rooms: RoomState[];
}

function deviceToPresetEntry(device: DeviceState): PresetDeviceEntry | null {
  if (!device.device_id) return null;
  const entry: PresetDeviceEntry = { device_id: device.device_id };
  if (device.is_on !== undefined) entry.is_on = device.is_on;
  if (device.brightness !== undefined) entry.brightness = device.brightness;
  if (device.r !== undefined) entry.r = device.r;
  if (device.g !== undefined) entry.g = device.g;
  if (device.b !== undefined) entry.b = device.b;
  if (device.color_temp !== undefined) entry.color_temp = device.color_temp;
  if (device.scene_id !== undefined) entry.scene_id = device.scene_id;
  return entry;
}

export function SavePresetModal({ isOpen, onClose, onSaved, rooms }: SavePresetModalProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelected(new Set());
      setError(null);
    }
  }, [isOpen]);

  const toggle = (deviceId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Preset name is required."); return; }
    if (selected.size === 0) { setError("Select at least one device."); return; }

    const devices: PresetDeviceEntry[] = [];
    for (const room of rooms) {
      for (const device of room.devices) {
        if (device.device_id && selected.has(device.device_id)) {
          const entry = deviceToPresetEntry(device);
          if (entry) devices.push(entry);
        }
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createPreset({ name: name.trim(), devices });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preset.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-preset-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="save-preset-title" className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save Preset
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Preset name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">
              Preset Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Movie Night"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Device selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">
              Devices to include <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-zinc-600">Current state will be captured for each selected device.</p>
            <div className="space-y-3 mt-2">
              {rooms.map((room) => (
                <div key={room.room_id}>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{room.name}</p>
                  <div className="space-y-1">
                    {room.devices.map((device) => {
                      if (!device.device_id) return null;
                      const isChecked = selected.has(device.device_id);
                      const label = device.display_name || device.ip;
                      return (
                        <label
                          key={device.device_id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(device.device_id!)}
                            className="w-4 h-4 rounded accent-amber-400"
                          />
                          <span className="flex-1 text-sm text-zinc-300">{label}</span>
                          {!device.reachable && (
                            <span className="text-xs text-zinc-600">unreachable</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {rooms.length === 0 && (
                <p className="text-xs text-zinc-600 py-2">No rooms available.</p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <span className="text-xs text-zinc-600">{selected.size} device{selected.size !== 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium bg-amber-500 text-zinc-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && (
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {submitting ? "Saving…" : "Save Preset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
