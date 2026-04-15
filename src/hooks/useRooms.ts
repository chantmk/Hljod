import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import type { RoomState } from "../api/types";

const REFRESH_INTERVAL_MS = 30_000;

interface RoomEntry {
  room: RoomState | null;
  loading: boolean;
  error: string | null;
}

interface UseRoomsReturn {
  rooms: Record<string, RoomEntry>;
  roomIds: string[];
  refresh: () => void;
  isOnline: boolean;
}

export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<Record<string, RoomEntry>>({});
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    // Mark all existing rooms as loading
    setRooms((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, entry]) => [
          id,
          { ...entry, loading: true, error: null },
        ])
      )
    );
    try {
      const response = await api.getRooms();
      const newRooms: Record<string, RoomEntry> = {};
      const ids: string[] = [];
      for (const room of response.rooms) {
        newRooms[room.room_id] = { room, loading: false, error: null };
        ids.push(room.room_id);
      }
      setRooms(newRooms);
      setRoomIds(ids);
      setIsOnline(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setRooms((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        return Object.fromEntries(
          Object.entries(prev).map(([id, entry]) => [
            id,
            { ...entry, loading: false, error: message },
          ])
        );
      });
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh]);

  return { rooms, roomIds, refresh, isOnline };
}
