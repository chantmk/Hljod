import { useState, useCallback } from "react";
import { api } from "../api/client";
import type { LightColor } from "../api/types";

interface UseRoomControlReturn {
  pending: boolean;
  error: string | null;
  turnOn: () => Promise<void>;
  turnOff: () => Promise<void>;
  setBrightness: (value: number) => Promise<void>;
  setColor: (color: LightColor) => Promise<void>;
  setTemperature: (value: number) => Promise<void>;
  setScene: (sceneId: number) => Promise<void>;
  clearError: () => void;
}

export function useRoomControl(
  roomId: string,
  onSuccess?: () => void
): UseRoomControlReturn {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setPending(true);
      setError(null);
      try {
        await action();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [onSuccess]
  );

  const turnOn = useCallback(() => run(() => api.turnOn(roomId)), [run, roomId]);
  const turnOff = useCallback(() => run(() => api.turnOff(roomId)), [run, roomId]);

  const setBrightness = useCallback(
    (value: number) => run(() => api.setBrightness(roomId, { value })),
    [run, roomId]
  );

  const setColor = useCallback(
    (color: LightColor) => run(() => api.setColor(roomId, color)),
    [run, roomId]
  );

  const setTemperature = useCallback(
    (value: number) => run(() => api.setTemperature(roomId, { value })),
    [run, roomId]
  );

  const setScene = useCallback(
    (sceneId: number) => run(() => api.setScene(roomId, { scene_id: sceneId })),
    [run, roomId]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    pending,
    error,
    turnOn,
    turnOff,
    setBrightness,
    setColor,
    setTemperature,
    setScene,
    clearError,
  };
}
