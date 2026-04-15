import type {
  RoomState,
  RoomsResponse,
  HealthResponse,
  ActionResponse,
  LightsListResponse,
  LightActionResponse,
  BrightnessPayload,
  ColorPayload,
  TemperaturePayload,
  ScenePayload,
  DiscoverResponse,
  ConfigRoom,
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

  getRooms(): Promise<RoomsResponse> {
    return request<RoomsResponse>("/api/v1/rooms");
  },

  getRoom(roomId: string): Promise<RoomState> {
    return request<RoomState>(`/api/v1/rooms/${roomId}`);
  },

  turnOn(roomId: string): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/on`, { method: "POST" });
  },

  turnOff(roomId: string): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/off`, { method: "POST" });
  },

  setBrightness(roomId: string, payload: BrightnessPayload): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/brightness`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setColor(roomId: string, payload: ColorPayload): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/color`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setTemperature(roomId: string, payload: TemperaturePayload): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/temperature`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setScene(roomId: string, payload: ScenePayload): Promise<ActionResponse> {
    return request<ActionResponse>(`/api/v1/rooms/${roomId}/scene`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getLights(): Promise<LightsListResponse> {
    return request<LightsListResponse>("/api/v1/lights");
  },

  turnLightOn(lightId: string): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/on`, { method: "POST" });
  },

  turnLightOff(lightId: string): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/off`, { method: "POST" });
  },

  setLightBrightness(lightId: string, payload: BrightnessPayload): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/brightness`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setLightColor(lightId: string, payload: ColorPayload): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/color`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setLightTemperature(lightId: string, payload: TemperaturePayload): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/temperature`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setLightScene(lightId: string, payload: ScenePayload): Promise<LightActionResponse> {
    return request<LightActionResponse>(`/api/v1/lights/${lightId}/scene`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  discover(type = "wizlight"): Promise<DiscoverResponse> {
    return request<DiscoverResponse>(`/api/v1/lights/discover?type=${encodeURIComponent(type)}`);
  },

  getConfigRooms(): Promise<ConfigRoom[]> {
    return request<ConfigRoom[]>("/api/v1/config/rooms");
  },

  addDevice(roomId: string, ip: string): Promise<ConfigRoom> {
    return request<ConfigRoom>(`/api/v1/config/rooms/${roomId}/devices`, {
      method: "POST",
      body: JSON.stringify({ ip }),
    });
  },

  removeDevice(roomId: string, ip: string): Promise<ConfigRoom> {
    return request<ConfigRoom>(`/api/v1/config/rooms/${roomId}/devices`, {
      method: "DELETE",
      body: JSON.stringify({ ip }),
    });
  },
};
