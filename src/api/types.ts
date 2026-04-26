export interface LightColor {
  r: number;
  g: number;
  b: number;
}

export interface DeviceState {
  device_id?: string;
  display_name?: string | null;
  ip: string;
  is_on?: boolean;
  brightness?: number;
  r?: number;
  g?: number;
  b?: number;
  color_temp?: number;
  scene_id?: number;
  reachable: boolean;
  error?: string;
}

export interface RoomState {
  room_id: string;
  name: string;
  devices: DeviceState[];
}

export interface RoomsResponse {
  rooms: RoomState[];
}

export interface HealthResponse {
  status: string;
  version: string;
  rooms_configured: number;
}

export interface ActionResponse {
  room_id: string;
  action: string;
  results: DeviceState[];
  success_count: number;
  failure_count: number;
}

export interface LightInfo {
  device_id: string;
  ip: string;
  room_id: string;
  room_name: string;
  device_type: string;
  is_on?: boolean;
  brightness?: number;
  r?: number;
  g?: number;
  b?: number;
  color_temp?: number;
  scene_id?: number;
  reachable: boolean;
  error?: string;
}

export interface LightsListResponse {
  lights: LightInfo[];
}

export interface LightActionResponse {
  device_id: string;
  ip: string;
  room_id: string;
  action: string;
  result: DeviceState;
}

export interface BrightnessPayload {
  value: number;
}

export interface ColorPayload {
  r: number;
  g: number;
  b: number;
}

export interface TemperaturePayload {
  value: number;
}

export interface ScenePayload {
  scene_id: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface DiscoveredDevice {
  ip: string;
  mac: string | null;
  module_name: string | null;
  firmware_version: string | null;
}

export interface DiscoverResponse {
  discovered: DiscoveredDevice[];
}

export interface DeviceEntry {
  ip: string;
  name: string | null;
}

export interface ConfigRoom {
  room_id: string;
  name: string;
  device_type: string;
  devices: DeviceEntry[];
}

export const DEVICE_TYPES = ["wizlight"] as const;
export type DeviceType = typeof DEVICE_TYPES[number];

export interface Scene {
  id: number;
  name: string;
}

export const SCENES: Scene[] = [
  { id: 1, name: "Ocean" },
  { id: 2, name: "Romance" },
  { id: 3, name: "Sunset" },
  { id: 4, name: "Party" },
  { id: 5, name: "Fireplace" },
  { id: 6, name: "Cozy" },
  { id: 7, name: "Forest" },
  { id: 8, name: "Pastel Colors" },
  { id: 9, name: "Wake Up" },
  { id: 10, name: "Bedtime" },
  { id: 11, name: "Warm White" },
  { id: 12, name: "Daylight" },
  { id: 13, name: "Cool White" },
  { id: 14, name: "Night Light" },
  { id: 15, name: "Focus" },
  { id: 16, name: "Relax" },
  { id: 17, name: "True Colors" },
  { id: 18, name: "TV Time" },
  { id: 19, name: "Plantgrowth" },
  { id: 20, name: "Spring" },
  { id: 21, name: "Summer" },
  { id: 22, name: "Fall" },
  { id: 23, name: "Deepdive" },
  { id: 24, name: "Jungle" },
  { id: 25, name: "Mojito" },
  { id: 26, name: "Club" },
  { id: 27, name: "Christmas" },
  { id: 28, name: "Halloween" },
  { id: 29, name: "Candlelight" },
  { id: 30, name: "Golden White" },
  { id: 31, name: "Pulse" },
  { id: 32, name: "Steampunk" },
];

// ---------------------------------------------------------------------------
// Preset types
// ---------------------------------------------------------------------------

export interface PresetDeviceEntry {
  device_id: string;
  is_on?: boolean;
  brightness?: number;
  r?: number;
  g?: number;
  b?: number;
  color_temp?: number;
  scene_id?: number;
}

export interface Preset {
  preset_id: string;
  name: string;
  devices: PresetDeviceEntry[];
}

export interface CreatePresetPayload {
  name: string;
  devices: PresetDeviceEntry[];
}

export interface ApplyPresetResponse {
  preset_id: string;
  name: string;
  results: DeviceState[];
  success_count: number;
  failure_count: number;
}

export const PRESET_COLORS: { name: string; color: LightColor }[] = [
  { name: "White", color: { r: 255, g: 255, b: 255 } },
  { name: "Red", color: { r: 255, g: 0, b: 0 } },
  { name: "Green", color: { r: 0, g: 255, b: 0 } },
  { name: "Blue", color: { r: 0, g: 0, b: 255 } },
  { name: "Yellow", color: { r: 255, g: 255, b: 0 } },
  { name: "Magenta", color: { r: 255, g: 0, b: 255 } },
  { name: "Cyan", color: { r: 0, g: 255, b: 255 } },
  { name: "Orange", color: { r: 255, g: 128, b: 0 } },
];
