# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hljod is a React + TypeScript SPA (Vite + Tailwind CSS) for controlling WizLight smart bulbs. It talks to the HermesScrypt REST API and is served from an nginx container on a NAS.

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
    types.ts       # TypeScript interfaces for all HermesScrypt API shapes
    client.ts      # fetch wrapper (api.*) + API URL resolution (getApiBaseUrl / setApiBaseUrl)
  hooks/
    useRooms.ts       # fetches office + gaming_room state; auto-refreshes every 30 s
    useRoomControl.ts # wraps all write ops (toggle, brightness, color, temp, scene) with pending/error state
  components/
    RoomCard.tsx          # top-level room UI — composes all control components
    BrightnessSlider.tsx  # commits on mouseup/touchend only (avoids API flooding)
    TemperatureSlider.tsx # same commit-on-release pattern; warm→cool CSS gradient track
    ColorPicker.tsx       # 8 preset swatches + native color input + hex text, kept in sync
    SceneSelector.tsx     # dropdown of 32 WizLight scenes (defined in api/types.ts)
    ConnectionStatus.tsx  # pulsing dot + manual refresh button
    SettingsModal.tsx     # modal for editing API base URL, saved to localStorage
  App.tsx          # layout, header, room grid; ROOM_IDS constant defines which rooms appear
  main.tsx
  index.css
```

**API URL resolution** (in `api/client.ts`): `VITE_API_URL` build-time env var → `localStorage["hljod_api_url"]` → `http://nas.local:8000`. The settings modal writes to localStorage.

**Room list** is hardcoded as `ROOM_IDS = ["office", "gaming_room"]` in `App.tsx`. Adding a new room requires updating that array and the HermesScrypt `config.json`.

**Slider commit pattern:** Brightness and temperature sliders track value in local state on every `onChange` but only call the API on `onMouseUp` / `onTouchEnd`. Do not change this — it prevents flooding the WizLight UDP layer.

## Docker / nginx

The `Dockerfile` is two-stage: `node:20-alpine` builds, `nginx:alpine` serves. The nginx config:
- Serves the SPA with `try_files` fallback for client-side routing
- Proxies `/api/` and `/health` to `${API_URL}` (runtime env var via `envsubst`)
- Aggressively caches static assets (`/assets/`)

`docker-compose.yml` exposes port `3080` and sets `API_URL=http://nas.local:8000`. Override `API_URL` when deploying if HermesScrypt runs on a different host/port.
