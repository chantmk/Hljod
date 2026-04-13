# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hljod is a React + TypeScript SPA (Vite + Tailwind CSS) that provides visualization and control for smart home devices managed by HermesScrypt. It is served from an nginx container on a NAS. The first use case is light control (WizLight); the component architecture is designed to accommodate additional device types and rooms.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build locally

# Docker
docker compose up --build    # build + serve at http://localhost:3080
```

## Architecture

```
src/
  api/
    types.ts       # TypeScript interfaces for all HermesScrypt API shapes + device-specific payloads
    client.ts      # fetch wrapper (api.*) + API URL resolution (getApiBaseUrl / setApiBaseUrl)
  hooks/
    useRooms.ts       # fetches all room states; auto-refreshes every 30 s
    useRoomControl.ts # wraps all write ops with pending/error state and post-success refresh
  components/
    RoomCard.tsx          # top-level room card — composes device control components
    BrightnessSlider.tsx  # commits on mouseup/touchend only (avoids API flooding)
    TemperatureSlider.tsx # same commit-on-release pattern; warm→cool CSS gradient track
    ColorPicker.tsx       # 8 preset swatches + native color input + hex text, kept in sync
    SceneSelector.tsx     # dropdown of scenes (scene list defined in api/types.ts)
    ConnectionStatus.tsx  # pulsing dot + manual refresh button
    SettingsModal.tsx     # modal for editing API base URL, saved to localStorage
  App.tsx          # layout, header, room grid; ROOM_IDS drives which rooms are rendered
  main.tsx
  index.css
```

**API URL resolution** (in `api/client.ts`): `VITE_API_URL` build-time env var → `localStorage["hljod_api_url"]` → `http://nas.local:8000`. The settings modal writes to localStorage.

**Room list:** `ROOM_IDS` in `App.tsx` must match the room keys in HermesScrypt's `config.json`. Update both when adding a room.

**Slider commit pattern:** Brightness and temperature sliders track value in local state on every `onChange` but only call the API on `onMouseUp` / `onTouchEnd`. Do not change this — it prevents flooding the device UDP layer.

## Adding a new device type

Device-specific controls live in `src/components/`. `RoomCard` is the composition point.

1. Add new control components for the device (e.g. `ThermostatControl.tsx`, `LockControl.tsx`).
2. Add the device's API payload types to `api/types.ts` and new `api.*` methods to `api/client.ts`.
3. Add new operations to `useRoomControl.ts`.
4. Update `RoomCard.tsx` to conditionally render the new controls based on device type returned by HermesScrypt (e.g. a `type` field on the room or device object).

Keep device-specific logic inside its own component; `RoomCard` should remain a thin compositor.

## Adding a new room

1. Add the room key to `ROOM_IDS` in `App.tsx`.
2. Add the room to HermesScrypt's `config.json` and reload.

## Docker / nginx

The `Dockerfile` is two-stage: `node:20-alpine` builds, `nginx:alpine` serves. The nginx config:
- Serves the SPA with `try_files` fallback for client-side routing
- Proxies `/api/` and `/health` to `${API_URL}` (runtime env var via `envsubst`)
- Aggressively caches static assets (`/assets/`)

`docker-compose.yml` exposes port `3080` and sets `API_URL=http://nas.local:8000`. Override `API_URL` when deploying if HermesScrypt runs on a different host/port.
