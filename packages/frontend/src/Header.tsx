import { useStore } from "./store";

interface HeaderProps {
  onShowAbout: () => void;
}

export default function Header({ onShowAbout }: HeaderProps) {
  const { mode, setMode, toggleSidebar } = useStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 backdrop-blur-md bg-zinc-900/80 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">OpenPAD</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setMode("agent")}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                mode === "agent"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-300"
              }
            `}
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
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            Agent
          </button>
          <button
            onClick={() => setMode("editor")}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                mode === "editor"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-300"
              }
            `}
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
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Editor
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 bg-green-500 rounded-full"
            title="Connected"
          />
          <button
            onClick={onShowAbout}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="About"
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
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </button>
          <a
            href="https://github.com/michaelwoods/openpad"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
