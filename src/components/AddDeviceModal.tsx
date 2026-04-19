import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { ConfigRoom } from "../api/types";
import { DEVICE_TYPES } from "../api/types";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const NEW_ROOM = "__new__";

export function AddDeviceModal({ isOpen, onClose, onRefresh }: AddDeviceModalProps) {
  const [ip, setIp] = useState("");
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState<string>(DEVICE_TYPES[0]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [configRooms, setConfigRooms] = useState<ConfigRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      setConfigRooms(await api.getConfigRooms());
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIp("");
      setName("");
      setDeviceType(DEVICE_TYPES[0]);
      setSelectedRoom("");
      setNewRoomName("");
      setError(null);
      fetchRooms();
    }
  }, [isOpen, fetchRooms]);

  // Reset room selection when device type changes
  useEffect(() => {
    setSelectedRoom("");
  }, [deviceType]);

  const roomsOfType = configRooms.filter((r) => r.device_type === deviceType);
  // If no matching rooms exist, force the "create new room" path
  const effectiveRoom = roomsOfType.length === 0 ? NEW_ROOM : selectedRoom;
  const isNewRoom = effectiveRoom === NEW_ROOM;

  const handleSubmit = async () => {
    if (!ip.trim()) { setError("IP address is required."); return; }
    if (isNewRoom && !newRoomName.trim()) { setError("Room name is required."); return; }
    if (!isNewRoom && !selectedRoom) { setError("Please select a room."); return; }

    setSubmitting(true);
    setError(null);
    try {
      let roomId = selectedRoom;
      if (isNewRoom) {
        const created = await api.createRoom(newRoomName.trim(), deviceType);
        roomId = created.room_id;
      }
      await api.addDevice(roomId, ip.trim(), name.trim() || undefined);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add device.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-device-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="add-device-title" className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Device
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* IP */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">
              IP Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="192.168.1.100"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">
              Display Name{" "}
              <span className="text-zinc-600 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Desk lamp"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Device type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">Device Type</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400"
            >
              {DEVICE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">Room</label>
            {loadingRooms ? (
              <p className="text-xs text-zinc-500 py-2">Loading rooms…</p>
            ) : (
              <select
                value={effectiveRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400"
              >
                {roomsOfType.length === 0 ? (
                  <option value={NEW_ROOM}>Create new room…</option>
                ) : (
                  <>
                    <option value="" disabled>Select a room</option>
                    {roomsOfType.map((r) => (
                      <option key={r.room_id} value={r.room_id}>{r.name}</option>
                    ))}
                    <option value={NEW_ROOM}>Create new room…</option>
                  </>
                )}
              </select>
            )}
          </div>

          {/* New room name — shown when "Create new room…" is selected */}
          {isNewRoom && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-400">
                Room Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Living room"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
              />
            </div>
          )}

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
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {submitting ? "Adding…" : "Add Device"}
          </button>
        </div>
      </div>
    </div>
  );
}
