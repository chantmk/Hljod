import { useState, useEffect } from "react";
import { getApiBaseUrl, setApiBaseUrl, api } from "../api/client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiBaseUrl());
      setSaved(false);
      setExportError(null);
    }
  }, [isOpen]);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await api.downloadConfig();
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = url.trim().replace(/\/$/, "");
    setApiBaseUrl(trimmed);
    setSaved(true);
    setTimeout(() => {
      onSave();
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setUrl("");
    setApiBaseUrl("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="settings-title"
            className="text-lg font-semibold text-zinc-100 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-400"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="api-url"
              className="block text-sm font-medium text-zinc-400"
            >
              HermesScrypt API Base URL
            </label>
            <input
              id="api-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onClose();
              }}
              placeholder="http://nas.local:8000"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
            />
            <p className="text-xs text-zinc-600">
              Override with <code className="text-zinc-500">VITE_API_URL</code>{" "}
              environment variable for build-time configuration.
            </p>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
            <p className="font-medium text-zinc-400">Priority order:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>
                <code>VITE_API_URL</code> env variable (build-time)
              </li>
              <li>localStorage (this setting)</li>
              <li>Default: same origin (nginx proxy)</li>
            </ol>
          </div>
        </div>

        <p className="mt-5 text-xs text-zinc-600 text-center">
          Hljod v{__APP_VERSION__}
        </p>

        <div className="flex items-center justify-between mt-3 pt-4 border-t border-zinc-800">
          <div className="flex flex-col gap-1">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Reset to default
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {exporting ? "Exporting…" : "Export config"}
              </button>
            </div>
            {exportError && (
              <p className="text-xs text-red-400">{exportError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-900 hover:bg-white"
              }`}
            >
              {saved ? "Saved!" : "Save & Reconnect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
