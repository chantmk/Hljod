import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { DiscoveredDevice, ConfigRoom } from "../api/types";

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CloseIcon() {
  return (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ErrorIcon() {
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
      className="text-red-400 mt-0.5 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400"
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 6a6 6 0 1 0 6 6" />
      <path d="M12 10a2 2 0 1 0 2 2" />
      <line x1="12" y1="12" x2="22" y2="2" />
    </svg>
  );
}

interface DeviceActionState {
  pending: boolean;
  error: string | null;
}

export function DiscoveryModal({ isOpen, onClose, onRefresh }: DiscoveryModalProps) {
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredDevice[]>([]);
  const [configRooms, setConfigRooms] = useState<ConfigRoom[]>([]);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  // Map: ip -> roomId -> DeviceActionState
  const [actionState, setActionState] = useState<Record<string, Record<string, DeviceActionState>>>({});

  const runDiscovery = useCallback(async () => {
    setDiscovering(true);
    setDiscoveryError(null);

    try {
      const [discoverResult, configResult] = await Promise.all([
        api.discover("wizlight"),
        api.getConfigRooms(),
      ]);
      setDiscovered(discoverResult.discovered);
      setConfigRooms(configResult);
    } catch (err) {
      setDiscoveryError(err instanceof Error ? err.message : "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  }, []);

  // Run discovery whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setDiscovered([]);
      setConfigRooms([]);
      setDiscoveryError(null);
      setActionState({});
      runDiscovery();
    }
  }, [isOpen, runDiscovery]);

  const setDeviceActionState = (ip: string, roomId: string, state: Partial<DeviceActionState>) => {
    setActionState((prev) => ({
      ...prev,
      [ip]: {
        ...prev[ip],
        [roomId]: {
          pending: false,
          error: null,
          ...prev[ip]?.[roomId],
          ...state,
        },
      },
    }));
  };

  const handleAdd = async (ip: string, roomId: string) => {
    setDeviceActionState(ip, roomId, { pending: true, error: null });
    try {
      const updated = await api.addDevice(roomId, ip);
      setConfigRooms((prev) =>
        prev.map((r) => (r.room_id === roomId ? updated : r))
      );
      setDeviceActionState(ip, roomId, { pending: false, error: null });
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add device";
      setDeviceActionState(ip, roomId, { pending: false, error: msg });
    }
  };

  const handleRemove = async (ip: string, roomId: string) => {
    setDeviceActionState(ip, roomId, { pending: true, error: null });
    try {
      const updated = await api.removeDevice(roomId, ip);
      setConfigRooms((prev) =>
        prev.map((r) => (r.room_id === roomId ? updated : r))
      );
      setDeviceActionState(ip, roomId, { pending: false, error: null });
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove device";
      setDeviceActionState(ip, roomId, { pending: false, error: msg });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <h2
            id="discovery-title"
            className="text-lg font-semibold text-zinc-100 flex items-center gap-2"
          >
            <RadarIcon />
            Discover Devices
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={runDiscovery}
              disabled={discovering}
              title="Re-scan"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {discovering ? <SpinnerIcon /> : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              )}
              Re-scan
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Discovery error */}
          {discoveryError && (
            <div className="flex items-start gap-2 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2.5">
              <ErrorIcon />
              <p className="text-xs text-red-300 flex-1">{discoveryError}</p>
              <button
                onClick={() => setDiscoveryError(null)}
                className="text-red-500 hover:text-red-300 transition-colors shrink-0"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          {/* Loading state */}
          {discovering && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-600 animate-pulse"
                >
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 6a6 6 0 1 0 6 6" />
                  <path d="M12 10a2 2 0 1 0 2 2" />
                  <line x1="12" y1="12" x2="22" y2="2" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">Scanning network…</p>
                <p className="text-xs text-zinc-600 mt-1">Broadcasting UDP — this takes ~5 seconds</p>
              </div>
            </div>
          )}

          {/* Empty state after scan */}
          {!discovering && !discoveryError && discovered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-700"
              >
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6a6 6 0 1 0 6 6" />
                <path d="M12 10a2 2 0 1 0 2 2" />
                <line x1="12" y1="12" x2="22" y2="2" />
              </svg>
              <p className="text-sm text-zinc-500">No devices found on the network.</p>
            </div>
          )}

          {/* Discovered device list */}
          {!discovering && discovered.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {discovered.length} device{discovered.length !== 1 ? "s" : ""} found
              </p>
              {discovered.map((device) => {
                const assignedRooms = configRooms.filter((r) =>
                  r.devices.includes(device.ip)
                );
                const unassignedRooms = configRooms.filter(
                  (r) => !r.devices.includes(device.ip)
                );

                return (
                  <div
                    key={device.ip}
                    className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3"
                  >
                    {/* Device info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-zinc-100 font-mono">
                          {device.ip}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {device.mac && (
                            <span className="text-xs text-zinc-500 font-mono">{device.mac}</span>
                          )}
                          {device.module_name && (
                            <span className="text-xs text-zinc-500">{device.module_name}</span>
                          )}
                          {device.firmware_version && (
                            <span className="text-xs text-zinc-600">fw {device.firmware_version}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assigned rooms */}
                    {assignedRooms.length > 0 && (
                      <div className="space-y-1.5">
                        {assignedRooms.map((room) => {
                          const state = actionState[device.ip]?.[room.room_id];
                          return (
                            <div key={room.room_id} className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="text-xs text-emerald-400 font-medium">
                                    {room.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemove(device.ip, room.room_id)}
                                  disabled={state?.pending}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-950/60 border border-red-800/50 text-red-400 hover:bg-red-900/60 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {state?.pending ? <SpinnerIcon /> : null}
                                  Remove
                                </button>
                              </div>
                              {state?.error && (
                                <div className="flex items-start gap-1.5 bg-red-950/40 border border-red-800/40 rounded-lg px-2.5 py-1.5">
                                  <ErrorIcon />
                                  <p className="text-xs text-red-300">{state.error}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Unassigned rooms — add buttons */}
                    {unassignedRooms.length > 0 && (
                      <div className="space-y-1.5">
                        {unassignedRooms.map((room) => {
                          const state = actionState[device.ip]?.[room.room_id];
                          return (
                            <div key={room.room_id} className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-zinc-500">{room.name}</span>
                                <button
                                  onClick={() => handleAdd(device.ip, room.room_id)}
                                  disabled={state?.pending}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-700 border border-zinc-600 text-zinc-300 hover:bg-zinc-600 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {state?.pending ? <SpinnerIcon /> : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="12" y1="5" x2="12" y2="19" />
                                      <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                  )}
                                  Add to {room.name}
                                </button>
                              </div>
                              {state?.error && (
                                <div className="flex items-start gap-1.5 bg-red-950/40 border border-red-800/40 rounded-lg px-2.5 py-1.5">
                                  <ErrorIcon />
                                  <p className="text-xs text-red-300">{state.error}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* No rooms configured at all */}
                    {configRooms.length === 0 && (
                      <p className="text-xs text-zinc-600">No rooms configured in HermesScrypt.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
