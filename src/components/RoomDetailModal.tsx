import type { RoomState } from "../api/types";
import { useRoomControl } from "../hooks/useRoomControl";
import { WizLightControls } from "./WizLightControls";

interface RoomDetailModalProps {
  room: RoomState;
  onClose: () => void;
  onRefresh: () => void;
}

export function RoomDetailModal({ room, onClose, onRefresh }: RoomDetailModalProps) {
  const { pending, error, turnOn, turnOff, clearError } = useRoomControl(
    room.room_id,
    onRefresh
  );

  const isOn = room.devices.some((d) => d.is_on);

  const handleToggle = () => {
    if (isOn) turnOff();
    else turnOn();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full sm:max-w-lg mx-0 sm:mx-4 bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <h2
              id="room-detail-title"
              className="text-base font-semibold text-zinc-100"
            >
              {room.name}
            </h2>
            <span className="text-xs text-zinc-600">
              {room.devices.length} light{room.devices.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Power toggle */}
            <button
              onClick={handleToggle}
              disabled={pending}
              title={isOn ? "Turn off" : "Turn on"}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isOn
                  ? "bg-amber-400 text-zinc-900 hover:bg-amber-300"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {pending ? (
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                isOn ? "On" : "Off"
              )}
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-5 mt-4 flex items-start gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2.5 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-red-300 flex-1">{error}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-300 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable controls */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          <WizLightControls
            roomId={room.room_id}
            devices={room.devices}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  );
}
