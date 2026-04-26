import { useState, useRef, useEffect, useCallback } from "react";
import type { DeviceState, ConfigRoom } from "../api/types";
import { api } from "../api/client";
import { PRESET_COLORS, SCENES } from "../api/types";
import { useDeviceControl } from "../hooks/useDeviceControl";
import { BrightnessSlider } from "./BrightnessSlider";
import { TemperatureSlider } from "./TemperatureSlider";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 255, g: 255, b: 255 };
}

interface Props {
  device: DeviceState;
  roomId: string;
  onRefresh: () => void;
}

export function DeviceExpandedPanel({ device, roomId, onRefresh }: Props) {
  const deviceId = device.device_id ?? "";
  const {
    pending, error,
    turnOn, turnOff,
    setBrightness, setColor, setTemperature, setScene,
    clearError,
  } = useDeviceControl(deviceId, onRefresh);

  // Remove state
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removePending, setRemovePending] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Move state
  const [showMove, setShowMove] = useState(false);
  const [moveRooms, setMoveRooms] = useState<ConfigRoom[] | null>(null);
  const [movePending, setMovePending] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  const handleRemove = useCallback(async () => {
    setRemovePending(true);
    setRemoveError(null);
    try {
      await api.removeDevice(roomId, device.ip);
      onRefresh();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove device");
      setConfirmRemove(false);
    } finally {
      setRemovePending(false);
    }
  }, [roomId, device.ip, onRefresh]);

  const openMove = useCallback(async () => {
    setShowMove(true);
    if (moveRooms === null) {
      try {
        const rooms = await api.getConfigRooms();
        setMoveRooms(rooms.filter((r) => r.room_id !== roomId));
      } catch {
        setMoveError("Failed to load rooms");
      }
    }
  }, [moveRooms, roomId]);

  const handleMove = useCallback(async (toRoomId: string) => {
    setMovePending(true);
    setMoveError(null);
    try {
      await api.moveDevice(roomId, device.ip, toRoomId);
      onRefresh();
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : "Failed to move device");
      setMovePending(false);
      setShowMove(false);
    }
  }, [roomId, device.ip, onRefresh]);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(device.display_name ?? "");
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      setNameDraft(device.display_name ?? "");
      setTimeout(() => nameInputRef.current?.select(), 0);
    }
  }, [editingName, device.display_name]);

  const submitName = useCallback(
    async (value: string) => {
      setEditingName(false);
      const trimmed = value.trim();
      const current = device.display_name ?? null;
      const next = trimmed === "" ? null : trimmed;
      if (next === current) return;
      setSavingName(true);
      try {
        await api.setDeviceName(roomId, device.ip, next);
        onRefresh();
      } finally {
        setSavingName(false);
      }
    },
    [device.display_name, device.ip, roomId, onRefresh]
  );

  const isOn = device.is_on ?? false;
  const isDisabled = !device.reachable || !deviceId || pending;

  const hasColor = device.r != null && device.g != null && device.b != null;
  const colorHex = hasColor ? rgbToHex(device.r!, device.g!, device.b!) : "#ffffff";

  // Local color for picker display while dragging
  const [pickerColor, setPickerColor] = useState(colorHex);
  useEffect(() => { setPickerColor(colorHex); }, [colorHex]);

  return (
    <div className="px-3 pt-2 pb-3 space-y-3 border-t border-zinc-700/40">

      {/* ── Info ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {/* Name (editable) */}
        <div className="flex items-center gap-1.5 min-w-0">
          {editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitName(nameDraft);
                if (e.key === "Escape") setEditingName(false);
              }}
              onBlur={() => submitName(nameDraft)}
              disabled={savingName}
              placeholder="Enter name…"
              className="bg-zinc-700 border border-zinc-500 rounded px-1.5 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 w-32 disabled:opacity-50"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              title="Click to rename"
              className="font-medium text-zinc-100 hover:text-white transition-colors truncate max-w-[160px] text-left"
            >
              {device.display_name
                ? device.display_name
                : <span className="font-mono text-zinc-500">{device.device_id ?? device.ip}</span>}
            </button>
          )}
          {savingName && (
            <svg className="animate-spin text-zinc-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </div>

        {/* IP */}
        <span className="font-mono text-zinc-600 shrink-0 select-all">{device.ip}</span>

        {/* Status */}
        <span className={`shrink-0 font-medium ${!device.reachable ? "text-zinc-600" : isOn ? "text-emerald-400" : "text-zinc-500"}`}>
          {!device.reachable ? "Unreachable" : isOn ? "On" : "Off"}
        </span>

        {/* Brightness */}
        {device.brightness != null && isOn && (
          <span className="text-zinc-500 shrink-0">{device.brightness}%</span>
        )}

        {/* Color swatch */}
        {hasColor && isOn && (
          <span
            className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0"
            style={{ backgroundColor: colorHex }}
          />
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-2.5 py-1.5 text-xs">
          <span className="text-red-300 flex-1">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-300 transition-colors text-base leading-none">×</button>
        </div>
      )}

      {/* ── On / Off ── */}
      <button
        onClick={isOn ? turnOff : turnOn}
        disabled={!device.reachable || !deviceId || pending}
        className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
          isOn
            ? "bg-amber-400 text-zinc-900 hover:bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
            : "bg-zinc-700/80 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:text-zinc-100"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {pending ? (
          <span className="flex items-center justify-center gap-1.5">
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Working…
          </span>
        ) : isOn ? "Turn Off" : "Turn On"}
      </button>

      {/* ── Brightness ── */}
      <BrightnessSlider
        value={device.brightness ?? 50}
        disabled={isDisabled || !isOn}
        onChange={setBrightness}
      />

      {/* ── Temperature ── */}
      <TemperatureSlider
        value={device.color_temp ?? 4000}
        disabled={isDisabled || !isOn}
        onChange={setTemperature}
      />

      {/* ── Color ── */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">Color</p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Color-wheel circle */}
          <label
            title="Pick custom color"
            className={`relative w-7 h-7 rounded-full border-2 shrink-0 transition-all cursor-pointer overflow-hidden ${
              isDisabled || !isOn
                ? "opacity-40 cursor-not-allowed border-zinc-600"
                : "border-zinc-500 hover:border-zinc-300"
            }`}
            style={{
              background: isDisabled || !isOn
                ? "#444"
                : `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
            }}
          >
            <input
              type="color"
              value={pickerColor}
              disabled={isDisabled || !isOn}
              onChange={(e) => {
                const hex = e.target.value;
                setPickerColor(hex);
                setColor(hexToRgb(hex));
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            />
          </label>

          {/* Preset swatches */}
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              title={preset.name}
              disabled={isDisabled || !isOn}
              onClick={() => setColor(preset.color)}
              className="w-6 h-6 rounded-full border-2 border-transparent hover:border-zinc-200 active:scale-90 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: `rgb(${preset.color.r},${preset.color.g},${preset.color.b})`,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scenes ── */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">Scenes</p>
        <div className="flex flex-wrap gap-1">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              disabled={isDisabled || !isOn}
              onClick={() => setScene(scene.id)}
              className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 hover:border-zinc-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Manage ── */}
      <div className="space-y-2 pt-1 border-t border-zinc-700/40">
        <p className="text-xs font-medium text-zinc-500">Manage</p>

        {/* Move to room */}
        <div className="space-y-1">
          {!showMove ? (
            <button
              onClick={openMove}
              disabled={movePending}
              className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium text-left bg-zinc-700/60 text-zinc-400 border border-zinc-600/60 hover:bg-zinc-700 hover:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Move to room…
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {moveRooms === null ? (
                <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Loading rooms…
                </span>
              ) : moveRooms.length === 0 ? (
                <span className="text-xs text-zinc-500">No other rooms available.</span>
              ) : (
                <select
                  autoFocus
                  disabled={movePending}
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) handleMove(e.target.value); }}
                  className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 disabled:opacity-50"
                >
                  <option value="" disabled>Move to…</option>
                  {moveRooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>{r.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowMove(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          )}
          {moveError && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-red-300 flex-1">{moveError}</span>
              <button onClick={() => setMoveError(null)} className="text-red-500 hover:text-red-300 transition-colors text-base leading-none">×</button>
            </div>
          )}
        </div>

        {/* Remove from room */}
        <div className="space-y-1">
          {!confirmRemove ? (
            <button
              onClick={() => setConfirmRemove(true)}
              disabled={removePending}
              className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium text-left bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-950/70 hover:text-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Remove from room
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Remove this device?</span>
              <button
                onClick={handleRemove}
                disabled={removePending}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-900/70 border border-red-700 text-red-200 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {removePending && (
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                )}
                Confirm
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          {removeError && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-red-300 flex-1">{removeError}</span>
              <button onClick={() => setRemoveError(null)} className="text-red-500 hover:text-red-300 transition-colors text-base leading-none">×</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
