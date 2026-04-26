# Hljod

Hljod is a React + TypeScript single-page application that provides visualization and control for smart home devices managed by [HermesScrypt](https://github.com/Tenmado/HermesScrypt). It is served from an nginx container and communicates exclusively through the HermesScrypt REST API.

The name *hljód* is Icelandic for *sound* — a nod to the NAS-hosted stack this runs on.

## Supported devices

| Device type | Controls |
|-------------|----------|
| WizLight    | Power on/off, brightness (10–100 %), colour (8 presets + custom picker), colour temperature (2200–6500 K), 32 scenes |

## Screenshots

<!-- screenshots here -->

---

## Running locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

To preview a production build:

```bash
npm run build
npm run preview
```

## Configuration

### API base URL

Hljod resolves the HermesScrypt base URL in this order:

1. **Build-time env var** — set `VITE_API_URL` before building (bakes the value into the JS bundle).
2. **localStorage** — the in-app settings modal (gear icon) writes the URL under the key `hljod_api_url`.
3. **Hard-coded fallback** — `http://nas.local:8000`.

For local development, create a `.env.local` file:

```
VITE_API_URL=http://192.168.1.100:8000
```

### Rooms

Rooms are fetched dynamically from HermesScrypt on load and every 30 seconds. To add or remove a room, edit HermesScrypt's `config.json` — no frontend code change is needed.

---

## Docker deployment

The image is built in two stages: `node:20-alpine` compiles the React app, then `nginx:alpine` serves it.

```bash
docker compose up --build   # build image and start at http://localhost:3080
```

The container exposes port 80 internally; `docker-compose.yml` maps it to **3080** on the host.

### Runtime environment variables

| Variable  | Default                   | Purpose |
|-----------|---------------------------|---------|
| `API_URL` | `http://nas.local:8000`   | nginx proxy target for `/api/` and `/health` requests. Override this when HermesScrypt runs on a different host or port. |

Example override:

```bash
API_URL=http://192.168.1.100:8000 docker compose up --build
```

### Build-time argument

| Argument        | Default | Purpose |
|-----------------|---------|---------|
| `VITE_API_URL`  | *(empty)* | Bakes the API URL into the JS bundle. When empty the app uses localStorage or the fallback at runtime. |

---

## HermesScrypt API dependency

Hljod is a pure frontend; all device state and control goes through **HermesScrypt**. Point `API_URL` (or `VITE_API_URL`) at a running HermesScrypt instance.

Key endpoints used:

| Method   | Path | Purpose |
|----------|------|---------|
| `GET`    | `/health` | Connection health check |
| `GET`    | `/api/v1/rooms` | List all rooms with live device state |
| `GET`    | `/api/v1/rooms/{id}` | Fetch single room state |
| `POST`   | `/api/v1/rooms/{id}/on` | Turn room on |
| `POST`   | `/api/v1/rooms/{id}/off` | Turn room off |
| `POST`   | `/api/v1/rooms/{id}/brightness` | Set brightness `{ value: number }` |
| `POST`   | `/api/v1/rooms/{id}/color` | Set colour `{ r, g, b }` |
| `POST`   | `/api/v1/rooms/{id}/temperature` | Set colour temperature `{ value: number }` |
| `POST`   | `/api/v1/rooms/{id}/scene` | Activate scene `{ scene_id: number }` |
| `GET`    | `/api/v1/config/rooms` | List all rooms from config |
| `POST`   | `/api/v1/config/rooms` | Create a new room |
| `POST`   | `/api/v1/config/rooms/{id}/devices` | Add a device to a room `{ ip, name? }` |
| `DELETE` | `/api/v1/config/rooms/{id}/devices` | Remove a device from a room `{ ip }` |
| `PATCH`  | `/api/v1/config/rooms/{id}/devices/{ip}` | Rename a device `{ name }` |
| `POST`   | `/api/v1/config/rooms/{id}/devices/{ip}/move` | Move device to another room `{ to_room_id }` |
| `GET`    | `/api/v1/lights/discover` | Discover devices on the network |

---

## Adding a new device type

The component architecture is designed to make this straightforward.

### 1. Add type definitions

In `src/api/types.ts`, add payload interfaces for the new device's write operations (follow the existing `BrightnessPayload`, `ColorPayload` pattern).

### 2. Add API client methods

In `src/api/client.ts`, add methods to the `api` object for each new operation, pointing at the appropriate HermesScrypt endpoint.

### 3. Add hook operations (optional)

If the new device has write operations, add corresponding callbacks to `src/hooks/useRoomControl.ts` following the existing `run()` wrapper pattern. This gives you consistent pending/error state for free.

### 4. Create a device control component

Create `src/components/<DeviceName>Controls.tsx`. It should accept:

```ts
interface <DeviceName>ControlsProps {
  roomId: string;
  devices: DeviceState[];
  onRefresh: () => void;
}
```

Call `useRoomControl(roomId, onRefresh)` inside the component and render the device-specific controls. Keep all device logic here — do not let it leak into `RoomCard`.

### 5. Wire it into RoomCard

In `src/components/RoomCard.tsx`, add a `case` to the `switch (room.type)` block:

```tsx
case "your-device-type":
  return (
    <YourDeviceControls
      roomId={roomId}
      devices={room.devices}
      onRefresh={onRefresh}
    />
  );
```

That is all. The card header (room name, power toggle, online indicator) is universal and requires no changes.

---

## Project structure

```
src/
  api/
    types.ts                  # TypeScript interfaces + payload types + scene/colour constants
    client.ts                 # fetch wrapper (api.*) + API URL resolution
  hooks/
    useRooms.ts               # fetches all room states; auto-refreshes every 30 s
    useRoomControl.ts         # wraps room write ops with pending/error state + post-success refresh
    useDeviceControl.ts       # wraps per-device write ops with pending/error state
  components/
    RoomCard.tsx              # top-level room card — composes device control components
    RoomDetailModal.tsx       # full room controls modal
    DeviceExpandedPanel.tsx   # per-device controls: power, brightness, colour, temp, scenes, rename, move, remove
    WizLightControls.tsx      # WizLight-specific room-level controls
    BrightnessSlider.tsx      # commits on mouseup/touchend only
    TemperatureSlider.tsx     # warm-to-cool gradient track; same commit-on-release pattern
    ColorPicker.tsx           # 8 preset swatches + native colour input + hex field
    SceneSelector.tsx         # dropdown of 32 scenes
    DiscoveryModal.tsx        # network discovery + assign/unassign devices to rooms
    AddDeviceModal.tsx        # add device to room by IP
    ConnectionStatus.tsx      # pulsing status dot + manual refresh button
    SettingsModal.tsx         # modal for editing API base URL (saved to localStorage)
  pages/
    DebugPage.tsx             # debug UI for all API endpoints
  App.tsx                     # layout, header, room grid
  main.tsx
  index.css
```
