import React, { useCallback } from "react";
import type { Room } from "../api/types";
import { useRoomControl } from "../hooks/useRoomControl";
import { WizLightControls } from "./WizLightControls";

interface RoomCardProps {
  roomId: string;
  room: Room | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function LightBulbIcon({ on }: { on: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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

function getRoomDisplayName(roomId: string): string {
  const names: Record<string, string> = {
    office: "Office",
    gaming_room: "Gaming Room",
  };
  return names[roomId] ?? roomId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRoomIcon(roomId: string): React.ReactNode {
  if (roomId === "office") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

export function RoomCard({ roomId, room, loading, error, onRefresh }: RoomCardProps) {
  const { pending, error: controlError, turnOn, turnOff, clearError } = useRoomControl(roomId, onRefresh);

  const isOn = room ? room.devices.some((d) => d.state) : false;
  const isDisabled = loading || pending || !room;

  const handleToggle = useCallback(() => {
    if (isOn) {
      turnOff();
    } else {
      turnOn();
    }
  }, [isOn, turnOn, turnOff]);

  const displayError = error ?? controlError;

  return (
    <div className={`relative bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
      isOn
        ? "border-zinc-600 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
        : "border-zinc-800"
    }`}>
      {/* Card header */}
      <div className={`px-5 py-4 flex items-center justify-between ${
        isOn ? "bg-gradient-to-r from-zinc-800/80 to-zinc-900/80" : "bg-zinc-800/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isOn ? "bg-amber-400/10 text-amber-300" : "bg-zinc-700/50 text-zinc-500"}`}>
            {getRoomIcon(roomId)}
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">{getRoomDisplayName(roomId)}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  error
                    ? "bg-red-500"
                    : loading
                    ? "bg-yellow-400 animate-pulse"
                    : isOn
                    ? "bg-emerald-400"
                    : "bg-zinc-600"
                }`}
              />
              <span className={`text-xs ${
                error ? "text-red-400" : loading ? "text-yellow-400" : isOn ? "text-emerald-400" : "text-zinc-500"
              }`}>
                {error ? "Error" : loading ? "Loading…" : isOn ? "On" : "Off"}
              </span>
              {room && (
                <span className="text-xs text-zinc-600 ml-1">
                  · {room.devices.length} device{room.devices.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Power toggle */}
        <button
          onClick={handleToggle}
          disabled={isDisabled}
          title={isOn ? "Turn off" : "Turn on"}
          className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isOn
              ? "bg-amber-400 text-zinc-900 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
              : "bg-zinc-700/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
          } disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}
        >
          {pending ? (
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <LightBulbIcon on={isOn} />
          )}
        </button>
      </div>

      {/* Error banner */}
      {displayError && (
        <div className="mx-5 mt-4 flex items-start gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-red-300 flex-1">{displayError}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-300 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="px-5 py-4 space-y-5">
        {/* Loading skeleton */}
        {loading && !room && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-2 bg-zinc-800 rounded" />
            <div className="h-4 bg-zinc-800 rounded w-1/3 mt-4" />
            <div className="h-2 bg-zinc-800 rounded" />
            <div className="h-4 bg-zinc-800 rounded w-1/3 mt-4" />
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-zinc-800 rounded-full" />
              ))}
            </div>
          </div>
        )}

        {/* Device-type-specific controls */}
        {room && (() => {
          switch (room.type) {
            case "wizlight":
              return (
                <WizLightControls
                  roomId={roomId}
                  devices={room.devices}
                  onRefresh={onRefresh}
                />
              );
            default:
              return (
                <p className="text-zinc-500 text-sm">
                  Device type "{room.type}" has no controls yet.
                </p>
              );
          }
        })()}
      </div>
    </div>
  );
}
