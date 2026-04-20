# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working style

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

**IMPORTANT — follow this order on every coding task, no exceptions:**

1. **Propose a plan first.** Before touching any file, write out: what you will change, which files are affected, and your approach. Ask any clarifying questions you need answered before starting.
2. **Stop and wait.** Do not write, edit, or create any code or files until the user has explicitly said to proceed. A plan alone is not permission to start.
3. **Then implement.** Only after receiving explicit confirmation (e.g. "go ahead", "looks good", "proceed") may you write code.

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

- **Commits allowed, pushes are not.** You may create git commits after completing work, but never run `git push` — the user handles all pushes.

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
  App.tsx          # layout, header, auto-fill room grid; rooms fetched dynamically from HermesScrypt
  main.tsx
  index.css
```

**API URL resolution** (in `api/client.ts`): `VITE_API_URL` build-time env var → `localStorage["hljod_api_url"]` → `http://nas.local:8000`. The settings modal writes to localStorage.

**Room list:** Rooms are fetched dynamically via `GET /api/v1/rooms` on load and every 30 s. No hardcoded room IDs in the frontend — adding a room only requires editing HermesScrypt's `config.json`.

**Slider commit pattern:** Brightness and temperature sliders track value in local state on every `onChange` but only call the API on `onMouseUp` / `onTouchEnd`. Do not change this — it prevents flooding the device UDP layer.

## Adding a new device type

Device-specific controls live in `src/components/`. `RoomCard` is the composition point.

1. Add new control components for the device (e.g. `ThermostatControl.tsx`, `LockControl.tsx`).
2. Add the device's API payload types to `api/types.ts` and new `api.*` methods to `api/client.ts`.
3. Add new operations to `useRoomControl.ts`.
4. Update `RoomCard.tsx` to conditionally render the new controls based on device type returned by HermesScrypt (e.g. a `type` field on the room or device object).

Keep device-specific logic inside its own component; `RoomCard` should remain a thin compositor.

## Adding a new room

Edit HermesScrypt's `config.json` and hot-reload via `POST /api/v1/config/reload`. No frontend code change needed — rooms are discovered dynamically.

## Docker / nginx

The `Dockerfile` is two-stage: `node:20-alpine` builds, `nginx:alpine` serves. The nginx config:
- Serves the SPA with `try_files` fallback for client-side routing
- Proxies `/api/` and `/health` to `${API_URL}` (runtime env var via `envsubst`)
- Aggressively caches static assets (`/assets/`)

`docker-compose.yml` exposes port `3080` and sets `API_URL=http://nas.local:8000`. Override `API_URL` when deploying if HermesScrypt runs on a different host/port.
