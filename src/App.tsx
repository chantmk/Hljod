import React, { useState } from "react";
import { useRooms } from "./hooks/useRooms";
import { RoomCard } from "./components/RoomCard";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { SettingsModal } from "./components/SettingsModal";
import { getApiBaseUrl } from "./api/client";

const ROOM_IDS = ["office", "gaming_room"];

export default function App() {
  const { rooms, refresh, isOnline } = useRooms();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-400"
              >
                <line x1="9" y1="18" x2="15" y2="18" />
                <line x1="10" y1="22" x2="14" y2="22" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              </svg>
              <h1 className="text-base font-semibold tracking-tight text-zinc-100">
                Hljod
              </h1>
            </div>
            <span className="hidden sm:block text-xs text-zinc-600 font-mono border border-zinc-800 rounded px-1.5 py-0.5">
              {getApiBaseUrl()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ConnectionStatus isOnline={isOnline} onRefresh={refresh} />
            <button
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Rooms</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Control your WizLights · Auto-refreshes every 30s
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ROOM_IDS.map((roomId) => {
            const state = rooms[roomId];
            return (
              <RoomCard
                key={roomId}
                roomId={roomId}
                room={state?.room ?? null}
                loading={state?.loading ?? true}
                error={state?.error ?? null}
                onRefresh={refresh}
              />
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-10">
          Hljod · HermesScrypt light controller
        </p>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={refresh}
      />
    </div>
  );
}
