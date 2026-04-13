import type {
  Room,
  RoomListItem,
  HealthResponse,
  BrightnessPayload,
  ColorPayload,
  TemperaturePayload,
  ScenePayload,
} from "./types";

const STORAGE_KEY = "hljod_api_url";
const DEFAULT_API_URL = "http://nas.local:8000";

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // localStorage not available
  }
  return DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, url);
  } catch {
    // localStorage not available
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const url = `${base}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  // Some endpoints may return empty body
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}

export const api = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },

  getRooms(): Promise<RoomListItem[]> {
    return request<RoomListItem[]>("/api/v1/rooms");
  },

  getRoom(roomId: string): Promise<Room> {
    return request<Room>(`/api/v1/rooms/${roomId}`);
  },

  turnOn(roomId: string): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/on`, { method: "POST" });
  },

  turnOff(roomId: string): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/off`, { method: "POST" });
  },

  setBrightness(roomId: string, payload: BrightnessPayload): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/brightness`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setColor(roomId: string, payload: ColorPayload): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/color`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setTemperature(roomId: string, payload: TemperaturePayload): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/temperature`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setScene(roomId: string, payload: ScenePayload): Promise<void> {
    return request<void>(`/api/v1/rooms/${roomId}/scene`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
