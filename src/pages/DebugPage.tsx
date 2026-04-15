import React, { useState, useCallback } from "react";
import { getApiBaseUrl } from "../api/client";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type Method = "GET" | "POST" | "DELETE";

interface SendResult {
  status: number | null;
  body: unknown;
  error: string | null;
  durationMs: number | null;
}

async function sendRequest(
  method: Method,
  path: string,
  body?: unknown
): Promise<SendResult> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const url = `${base}${path}`;
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const durationMs = Math.round(performance.now() - t0);
    let parsed: unknown;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      parsed = await res.json();
    } else {
      parsed = await res.text();
    }
    return { status: res.status, body: parsed, error: null, durationMs };
  } catch (err) {
    return {
      status: null,
      body: null,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Math.round(performance.now() - t0),
    };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MethodBadge({ method }: { method: Method }) {
  const colors: Record<Method, string> = {
    GET: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
    POST: "bg-blue-900/60 text-blue-300 border-blue-700/50",
    DELETE: "bg-red-900/60 text-red-300 border-red-700/50",
  };
  return (
    <span
      className={`inline-block text-xs font-mono font-semibold px-1.5 py-0.5 rounded border ${colors[method]}`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  return (
    <span
      className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded border ${
        ok
          ? "bg-emerald-900/60 text-emerald-300 border-emerald-700/50"
          : "bg-red-900/60 text-red-300 border-red-700/50"
      }`}
    >
      {status}
    </span>
  );
}

function ResponseBox({ result }: { result: SendResult | null }) {
  if (!result) {
    return (
      <p className="text-xs text-zinc-600 italic">No response yet. Press Send.</p>
    );
  }

  const formatted =
    result.body !== null
      ? typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body, null, 2)
      : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {result.status !== null && <StatusBadge status={result.status} />}
        {result.durationMs !== null && (
          <span className="text-xs text-zinc-500">{result.durationMs} ms</span>
        )}
        {result.error && (
          <span className="text-xs text-red-400">{result.error}</span>
        )}
      </div>
      {formatted && (
        <pre className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-3 overflow-x-auto max-h-64 border border-zinc-800 whitespace-pre-wrap break-all">
          {formatted}
        </pre>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-zinc-500 shrink-0 w-24 text-right">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
      />
    </div>
  );
}

interface EndpointCardProps {
  method: Method;
  path: string;
  description: string;
  fields?: React.ReactNode;
  onSend: () => Promise<SendResult>;
}

function EndpointCard({ method, path, description, fields, onSend }: EndpointCardProps) {
  const [result, setResult] = useState<SendResult | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    setSending(true);
    const r = await onSend();
    setResult(r);
    setSending(false);
  }, [onSend]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <MethodBadge method={method} />
            <code className="text-xs text-zinc-300 font-mono break-all">{path}</code>
          </div>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          Send
        </button>
      </div>

      {/* Input fields */}
      {fields && <div className="space-y-2 pt-1">{fields}</div>}

      {/* Response */}
      <div className="border-t border-zinc-800 pt-3">
        <ResponseBox result={result} />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pt-2">
      {title}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function DebugPage() {
  // Shared param state
  const [roomId, setRoomId] = useState("office");
  const [lightId, setLightId] = useState("");
  const [brightness, setBrightness] = useState("50");
  const [colorR, setColorR] = useState("255");
  const [colorG, setColorG] = useState("255");
  const [colorB, setColorB] = useState("255");
  const [temperature, setTemperature] = useState("4000");
  const [sceneId, setSceneId] = useState("1");
  const [deviceIp, setDeviceIp] = useState("");

  const roomFields = (
    <Field label="room_id" value={roomId} onChange={setRoomId} placeholder="office" />
  );

  const lightFields = (
    <Field label="light_id" value={lightId} onChange={setLightId} placeholder="a1b2c3d4" />
  );

  const brightnessFields = (
    <>
      {roomFields}
      <Field label="value (10-100)" value={brightness} onChange={setBrightness} type="number" placeholder="50" />
    </>
  );

  const colorFields = (
    <>
      {roomFields}
      <Field label="r (0-255)" value={colorR} onChange={setColorR} type="number" placeholder="255" />
      <Field label="g (0-255)" value={colorG} onChange={setColorG} type="number" placeholder="255" />
      <Field label="b (0-255)" value={colorB} onChange={setColorB} type="number" placeholder="255" />
    </>
  );

  const temperatureFields = (
    <>
      {roomFields}
      <Field label="value (K)" value={temperature} onChange={setTemperature} type="number" placeholder="4000" />
    </>
  );

  const sceneFields = (
    <>
      {roomFields}
      <Field label="scene_id (1-32)" value={sceneId} onChange={setSceneId} type="number" placeholder="1" />
    </>
  );

  const lightBrightnessFields = (
    <>
      {lightFields}
      <Field label="value (10-100)" value={brightness} onChange={setBrightness} type="number" placeholder="50" />
    </>
  );

  const lightColorFields = (
    <>
      {lightFields}
      <Field label="r (0-255)" value={colorR} onChange={setColorR} type="number" placeholder="255" />
      <Field label="g (0-255)" value={colorG} onChange={setColorG} type="number" placeholder="255" />
      <Field label="b (0-255)" value={colorB} onChange={setColorB} type="number" placeholder="255" />
    </>
  );

  const lightTemperatureFields = (
    <>
      {lightFields}
      <Field label="value (K)" value={temperature} onChange={setTemperature} type="number" placeholder="4000" />
    </>
  );

  const lightSceneFields = (
    <>
      {lightFields}
      <Field label="scene_id (1-32)" value={sceneId} onChange={setSceneId} type="number" placeholder="1" />
    </>
  );

  const deviceFields = (
    <>
      {roomFields}
      <Field label="device ip" value={deviceIp} onChange={setDeviceIp} placeholder="192.168.1.100" />
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="text-sm">Back</span>
            </a>
            <span className="text-zinc-700">/</span>
            <h1 className="text-base font-semibold tracking-tight text-zinc-100">
              Debug
            </h1>
            <span className="text-xs text-zinc-600 font-mono border border-zinc-800 rounded px-1.5 py-0.5 hidden sm:block">
              {getApiBaseUrl()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Meta" />
        <div className="grid gap-4 sm:grid-cols-2">

          <EndpointCard
            method="GET"
            path="/health"
            description="Server health check — returns status, version, and room count."
            onSend={() => sendRequest("GET", "/health")}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/config/reload"
            description="Reload config.json from disk without restarting the server."
            onSend={() => sendRequest("POST", "/api/v1/config/reload")}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Rooms" />
        <div className="grid gap-4 sm:grid-cols-2">

          <EndpointCard
            method="GET"
            path="/api/v1/rooms"
            description="List all rooms with live device state."
            onSend={() => sendRequest("GET", "/api/v1/rooms")}
          />

          <EndpointCard
            method="GET"
            path="/api/v1/rooms/{room_id}"
            description="Get live state of a single room."
            fields={roomFields}
            onSend={() => sendRequest("GET", `/api/v1/rooms/${roomId}`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/on"
            description="Turn on all devices in the room."
            fields={roomFields}
            onSend={() => sendRequest("POST", `/api/v1/rooms/${roomId}/on`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/off"
            description="Turn off all devices in the room."
            fields={roomFields}
            onSend={() => sendRequest("POST", `/api/v1/rooms/${roomId}/off`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/brightness"
            description="Set brightness (10–100) for all devices in the room."
            fields={brightnessFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/rooms/${roomId}/brightness`, {
                value: Number(brightness),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/color"
            description="Set RGB color for all devices in the room."
            fields={colorFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/rooms/${roomId}/color`, {
                r: Number(colorR),
                g: Number(colorG),
                b: Number(colorB),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/temperature"
            description="Set color temperature (2200–6500 K) for all devices in the room."
            fields={temperatureFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/rooms/${roomId}/temperature`, {
                value: Number(temperature),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/rooms/{room_id}/scene"
            description="Set a scene (1–32) for all devices in the room."
            fields={sceneFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/rooms/${roomId}/scene`, {
                scene_id: Number(sceneId),
              })
            }
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Lights (per-device)" />
        <div className="grid gap-4 sm:grid-cols-2">

          <EndpointCard
            method="GET"
            path="/api/v1/lights"
            description="List all configured lights with room context and live state."
            onSend={() => sendRequest("GET", "/api/v1/lights")}
          />

          <EndpointCard
            method="GET"
            path="/api/v1/lights/discover"
            description="UDP broadcast discovery — finds WizLight bulbs on the network (~5 s)."
            onSend={() => sendRequest("GET", "/api/v1/lights/discover?type=wizlight")}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/on"
            description="Turn on a single light by its stable device ID."
            fields={lightFields}
            onSend={() => sendRequest("POST", `/api/v1/lights/${lightId}/on`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/off"
            description="Turn off a single light by its stable device ID."
            fields={lightFields}
            onSend={() => sendRequest("POST", `/api/v1/lights/${lightId}/off`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/brightness"
            description="Set brightness on a single light (10–100)."
            fields={lightBrightnessFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/lights/${lightId}/brightness`, {
                value: Number(brightness),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/color"
            description="Set RGB color on a single light."
            fields={lightColorFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/lights/${lightId}/color`, {
                r: Number(colorR),
                g: Number(colorG),
                b: Number(colorB),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/temperature"
            description="Set color temperature on a single light (2200–6500 K)."
            fields={lightTemperatureFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/lights/${lightId}/temperature`, {
                value: Number(temperature),
              })
            }
          />

          <EndpointCard
            method="POST"
            path="/api/v1/lights/{light_id}/scene"
            description="Set a scene on a single light (1–32)."
            fields={lightSceneFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/lights/${lightId}/scene`, {
                scene_id: Number(sceneId),
              })
            }
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        <SectionHeader title="Config" />
        <div className="grid gap-4 sm:grid-cols-2">

          <EndpointCard
            method="GET"
            path="/api/v1/config/rooms"
            description="List all rooms from config (static config view, not live state)."
            onSend={() => sendRequest("GET", "/api/v1/config/rooms")}
          />

          <EndpointCard
            method="GET"
            path="/api/v1/config/rooms/{room_id}"
            description="Get a single room from config (static config view)."
            fields={roomFields}
            onSend={() => sendRequest("GET", `/api/v1/config/rooms/${roomId}`)}
          />

          <EndpointCard
            method="POST"
            path="/api/v1/config/rooms/{room_id}/devices"
            description="Add a device IP to a room and persist to config."
            fields={deviceFields}
            onSend={() =>
              sendRequest("POST", `/api/v1/config/rooms/${roomId}/devices`, {
                ip: deviceIp,
              })
            }
          />

          <EndpointCard
            method="DELETE"
            path="/api/v1/config/rooms/{room_id}/devices"
            description="Remove a device IP from a room and persist to config."
            fields={deviceFields}
            onSend={() =>
              sendRequest("DELETE", `/api/v1/config/rooms/${roomId}/devices`, {
                ip: deviceIp,
              })
            }
          />
        </div>

        <p className="text-center text-xs text-zinc-700 pb-8">
          Hljod · Debug · HermesScrypt REST API
        </p>
      </main>
    </div>
  );
}
