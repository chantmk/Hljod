import { useState, useCallback } from "react";
import { api } from "../api/client";
import type { LightColor } from "../api/types";

interface UseDeviceControlReturn {
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

export function useDeviceControl(
  deviceId: string,
  onSuccess?: () => void
): UseDeviceControlReturn {
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
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setPending(false);
      }
    },
    [onSuccess]
  );

  const turnOn = useCallback(() => run(() => api.turnLightOn(deviceId)), [run, deviceId]);
  const turnOff = useCallback(() => run(() => api.turnLightOff(deviceId)), [run, deviceId]);
  const setBrightness = useCallback(
    (value: number) => run(() => api.setLightBrightness(deviceId, { value })),
    [run, deviceId]
  );
  const setColor = useCallback(
    (color: LightColor) => run(() => api.setLightColor(deviceId, color)),
    [run, deviceId]
  );
  const setTemperature = useCallback(
    (value: number) => run(() => api.setLightTemperature(deviceId, { value })),
    [run, deviceId]
  );
  const setScene = useCallback(
    (sceneId: number) => run(() => api.setLightScene(deviceId, { scene_id: sceneId })),
    [run, deviceId]
  );
  const clearError = useCallback(() => setError(null), []);

  return { pending, error, turnOn, turnOff, setBrightness, setColor, setTemperature, setScene, clearError };
}
