import { useState } from "react";
import { useRooms } from "./hooks/useRooms";
import { RoomCard } from "./components/RoomCard";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { SettingsModal } from "./components/SettingsModal";
import { DiscoveryModal } from "./components/DiscoveryModal";
import { AddDeviceModal } from "./components/AddDeviceModal";
import { SavePresetModal } from "./components/SavePresetModal";
import { PresetsPanel } from "./components/PresetsPanel";
import { getApiBaseUrl } from "./api/client";

export default function App() {
  const { rooms, roomIds, refresh, isOnline } = useRooms();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetRefreshTrigger, setPresetRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header — general info bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
            {roomIds.length > 0 && (
              <span className="text-xs text-zinc-600">
                {roomIds.length} room{roomIds.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ConnectionStatus isOnline={isOnline} onRefresh={refresh} />
            <button
              onClick={() => setSavePresetOpen(true)}
              title="Save Preset"
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <a
              href="#/debug"
              title="Debug"
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors text-xs font-mono"
            >
              /debug
            </a>
            <button
              onClick={() => setAddDeviceOpen(true)}
              title="Add Device"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={() => setDiscoveryOpen(true)}
              title="Discover Devices"
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
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6a6 6 0 1 0 6 6" />
                <path d="M12 10a2 2 0 1 0 2 2" />
                <line x1="12" y1="12" x2="22" y2="2" />
              </svg>
            </button>
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
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <PresetsPanel
          onRefreshRooms={refresh}
          refreshTrigger={presetRefreshTrigger}
        />

        {/* Room grid — auto-fill columns, min 260px each */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {roomIds.map((roomId) => {
            const entry = rooms[roomId];
            return (
              <RoomCard
                key={roomId}
                room={entry?.room ?? null}
                loading={entry?.loading ?? true}
                error={entry?.error ?? null}
                onRefresh={refresh}
              />
            );
          })}

          {/* Empty state while first load with no rooms yet */}
          {roomIds.length === 0 && !Object.values(rooms).some((r) => r.loading) && (
            <p className="col-span-full text-center text-sm text-zinc-600 py-16">
              No rooms found. Check your HermesScrypt configuration.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-10">
          Hljod · HermesScrypt smart home controller
        </p>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={refresh}
      />

      <DiscoveryModal
        isOpen={discoveryOpen}
        onClose={() => setDiscoveryOpen(false)}
        onRefresh={refresh}
      />

      <AddDeviceModal
        isOpen={addDeviceOpen}
        onClose={() => setAddDeviceOpen(false)}
        onRefresh={refresh}
      />

      <SavePresetModal
        isOpen={savePresetOpen}
        onClose={() => setSavePresetOpen(false)}
        onSaved={() => setPresetRefreshTrigger((n) => n + 1)}
        rooms={roomIds.map((id) => rooms[id]?.room).filter((r): r is NonNullable<typeof r> => r !== null && r !== undefined)}
      />
    </div>
  );
}
