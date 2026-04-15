import React, { useState, useCallback, useRef, useEffect } from "react";
import type { RoomState, DeviceState } from "../api/types";
import { api } from "../api/client";
import { useRoomControl } from "../hooks/useRoomControl";
import { RoomDetailModal } from "./RoomDetailModal";

interface RoomCardProps {
  room: RoomState | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function LightBulbIcon({ on }: { on: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function ExpandIcon() {
  return (
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
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Inline name editor inside a device row
// ---------------------------------------------------------------------------

interface DeviceRowProps {
  device: DeviceState;
  isEditing: boolean;
  saving: boolean;
  onStartEdit: () => void;
  onSubmitName: (name: string) => void;
  onCancelEdit: () => void;
}

function DeviceRow({
  device,
  isEditing,
  saving,
  onStartEdit,
  onSubmitName,
  onCancelEdit,
}: DeviceRowProps) {
  const [draft, setDraft] = useState(device.display_name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset draft when editing starts
  useEffect(() => {
    if (isEditing) {
      setDraft(device.display_name ?? "");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isEditing, device.display_name]);

  const hasColor = device.r != null || device.g != null || device.b != null;
  const colorBg = hasColor
    ? `rgb(${device.r ?? 255},${device.g ?? 255},${device.b ?? 255})`
    : undefined;

  const label = device.display_name
    ? device.display_name
    : `(${device.device_id ?? device.ip})`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-xs group">
      {/* Status dot */}
      <span
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${
          !device.reachable
            ? "bg-zinc-600"
            : device.is_on
            ? "bg-emerald-400"
            : "bg-zinc-600"
        }`}
      />

      {/* Name / inline editor */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitName(draft);
              if (e.key === "Escape") onCancelEdit();
            }}
            onBlur={() => onSubmitName(draft)}
            disabled={saving}
            placeholder="Enter light name…"
            className="w-full bg-zinc-700 border border-zinc-500 rounded px-1.5 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 disabled:opacity-50"
          />
        ) : (
          <button
            onClick={onStartEdit}
            title="Click to rename"
            className={`truncate text-left w-full transition-colors ${
              device.display_name
                ? "text-zinc-300 hover:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            {label}
          </button>
        )}
      </div>

      {/* Saving spinner */}
      {saving && (
        <svg className="animate-spin shrink-0 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}

      {/* Brightness */}
      {!isEditing && device.brightness != null && device.is_on && (
        <span className="text-zinc-500 shrink-0">{device.brightness}%</span>
      )}

      {/* Color swatch */}
      {!isEditing && hasColor && device.is_on && (
        <span
          className="shrink-0 w-3 h-3 rounded-full border border-zinc-600"
          style={{ backgroundColor: colorBg }}
        />
      )}

      {!device.reachable && !isEditing && (
        <span className="text-zinc-600 shrink-0">—</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RoomCard
// ---------------------------------------------------------------------------

export function RoomCard({ room, loading, error, onRefresh }: RoomCardProps) {
  const roomId = room?.room_id ?? "";
  const { pending, error: controlError, turnOn, turnOff, clearError } =
    useRoomControl(roomId, onRefresh);
  const [detailOpen, setDetailOpen] = useState(false);

  // Rename state: which IP is being edited, and which is currently saving
  const [editingIp, setEditingIp] = useState<string | null>(null);
  const [savingIp, setSavingIp] = useState<string | null>(null);

  const isOn = room ? room.devices.some((d) => d.is_on) : false;
  const isDisabled = loading || pending || !room;

  const handleToggle = useCallback(() => {
    if (isOn) turnOff();
    else turnOn();
  }, [isOn, turnOn, turnOff]);

  const handleSubmitName = useCallback(
    async (ip: string, name: string) => {
      setEditingIp(null);
      const trimmed = name.trim();
      // Find current name to skip no-op saves
      const current = room?.devices.find((d) => d.ip === ip)?.display_name ?? null;
      const next = trimmed === "" ? null : trimmed;
      if (next === current) return;

      setSavingIp(ip);
      try {
        await api.setDeviceName(roomId, ip, next);
        onRefresh();
      } finally {
        setSavingIp(null);
      }
    },
    [roomId, room, onRefresh]
  );

  const displayError = error ?? controlError;

  return (
    <>
      <div
        className={`flex flex-col bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
          isOn
            ? "border-zinc-600 shadow-[0_0_24px_rgba(251,191,36,0.07)]"
            : "border-zinc-800"
        }`}
      >
        {/* Card header */}
        <div
          className={`px-4 py-3 flex items-center justify-between gap-2 ${
            isOn ? "bg-zinc-800/50" : "bg-zinc-800/20"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${
                error
                  ? "bg-red-500"
                  : loading
                  ? "bg-yellow-400 animate-pulse"
                  : isOn
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            />
            <h2 className="font-semibold text-sm text-zinc-100 truncate">
              {room?.name ?? "—"}
            </h2>
            {room && (
              <span className="text-xs text-zinc-600 shrink-0">
                {room.devices.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setDetailOpen(true)}
              disabled={!room}
              title="Details & Controls"
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ExpandIcon />
              <span className="hidden sm:inline">Details</span>
            </button>

            <button
              onClick={handleToggle}
              disabled={isDisabled}
              title={isOn ? "Turn off" : "Turn on"}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isOn
                  ? "bg-amber-400 text-zinc-900 shadow-[0_0_14px_rgba(251,191,36,0.35)] hover:bg-amber-300"
                  : "bg-zinc-700/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
              } disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}
            >
              {pending ? (
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <LightBulbIcon on={isOn} />
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {displayError && (
          <div className="mx-4 mt-3 flex items-start gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-red-300 flex-1">{displayError}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-300 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Light list */}
        <div className="px-4 py-3 space-y-1.5 overflow-y-auto max-h-48">
          {loading && !room && (
            <div className="space-y-1.5 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-zinc-800/60 rounded-lg" />
              ))}
            </div>
          )}

          {room && room.devices.length === 0 && (
            <p className="text-xs text-zinc-600 py-2 text-center">No lights configured</p>
          )}

          {room &&
            room.devices.map((device) => (
              <DeviceRow
                key={device.ip}
                device={device}
                isEditing={editingIp === device.ip}
                saving={savingIp === device.ip}
                onStartEdit={() => setEditingIp(device.ip)}
                onSubmitName={(name) => handleSubmitName(device.ip, name)}
                onCancelEdit={() => setEditingIp(null)}
              />
            ))}
        </div>
      </div>

      {detailOpen && room && (
        <RoomDetailModal
          room={room}
          onClose={() => setDetailOpen(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
