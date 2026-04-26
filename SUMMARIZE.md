# Hljod — Summary

## Features
- React + TypeScript SPA for smart home device control via HermesScrypt
- **WizLight** support: power on/off, brightness, RGB colour, colour temperature, 32 scenes
- Per-device controls: rename, move to another room, remove from room (with confirmation step)
- Room cards with 30-second auto-refresh
- Network device discovery and room assignment via Discovery modal
- Manual device add by IP with optional name and room creation
- Settings modal for runtime API URL configuration
- Export config as JSON from the settings modal

## Architecture
Vite + React + Tailwind CSS. No global state management — local hooks and component state only.

```
src/
  api/
    types.ts                  # All TypeScript interfaces, scene/colour constants
    client.ts                 # Fetch wrapper — all HermesScrypt API calls
  hooks/
    useRooms.ts               # Room state polling (30 s interval)
    useRoomControl.ts         # Room-level write ops with pending/error state
    useDeviceControl.ts       # Per-device write ops with pending/error state
  components/
    RoomCard.tsx              # Top-level room card compositor
    RoomDetailModal.tsx       # Full room controls modal
    DeviceExpandedPanel.tsx   # Per-device controls: power, sliders, colour, scenes, rename, move, remove
    WizLightControls.tsx      # WizLight room-level controls
    BrightnessSlider.tsx      # Commits on mouseup/touchend only (avoids UDP flooding)
    TemperatureSlider.tsx     # Same commit-on-release pattern
    DiscoveryModal.tsx        # Network scan + assign/unassign devices
    AddDeviceModal.tsx        # Add device by IP
    ConnectionStatus.tsx      # Pulsing status dot + manual refresh
    SettingsModal.tsx         # API URL config + export
```

## Usage
```bash
npm install && npm run dev    # dev server at http://localhost:5173
docker compose up --build     # production at http://localhost:3080
```

Set `VITE_API_URL` at build time or configure the API URL at runtime via the settings modal (gear icon).
