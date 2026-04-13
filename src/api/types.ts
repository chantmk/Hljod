export interface LightColor {
  r: number;
  g: number;
  b: number;
}

export interface DeviceState {
  ip: string;
  state: boolean;
  brightness: number;
  color: LightColor;
  temperature: number;
  mode: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  devices: DeviceState[];
}

export interface RoomListItem {
  id: string;
  name: string;
}

export interface HealthResponse {
  status: string;
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

export interface ConfigRoom {
  room_id: string;
  name: string;
  device_type: string;
  devices: string[]; // list of IP strings
}

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
