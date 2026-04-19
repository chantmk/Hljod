interface ConnectionStatusProps {
  isOnline: boolean;
  onRefresh: () => void;
}

export function ConnectionStatus({ isOnline, onRefresh }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRefresh}
        title="Refresh"
        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
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
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            isOnline ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : "bg-red-500"
          }`}
        />
        <span className={`text-sm font-medium ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
          {isOnline ? "Connected" : "Offline"}
        </span>
      </div>
    </div>
  );
}
