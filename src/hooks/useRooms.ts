import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import type { Room } from "../api/types";

const REFRESH_INTERVAL_MS = 30_000;
const KNOWN_ROOM_IDS = ["office", "gaming_room"];

interface RoomState {
  room: Room | null;
  loading: boolean;
  error: string | null;
}

interface UseRoomsReturn {
  rooms: Record<string, RoomState>;
  refresh: () => void;
  isOnline: boolean;
}

export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<Record<string, RoomState>>(() =>
    Object.fromEntries(
      KNOWN_ROOM_IDS.map((id) => [id, { room: null, loading: true, error: null }])
    )
  );
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRoom = useCallback(async (roomId: string) => {
    setRooms((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], loading: true, error: null },
    }));
    try {
      const room = await api.getRoom(roomId);
      setRooms((prev) => ({
        ...prev,
        [roomId]: { room, loading: false, error: null },
      }));
      setIsOnline(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setRooms((prev) => ({
        ...prev,
        [roomId]: { ...prev[roomId], loading: false, error: message },
      }));
      setIsOnline(false);
    }
  }, []);

  const refresh = useCallback(() => {
    KNOWN_ROOM_IDS.forEach((id) => fetchRoom(id));
  }, [fetchRoom]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh]);

  return { rooms, refresh, isOnline };
}
