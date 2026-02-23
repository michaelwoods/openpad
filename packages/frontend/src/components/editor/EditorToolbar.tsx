import type { ReactNode } from "react";

interface EditorPanelProps {
  children: ReactNode;
}

export default function EditorPanel({ children }: EditorPanelProps) {
  return <div className="h-full flex flex-col">{children}</div>;
}

interface EditorToolbarProps {
  onCopy: () => void;
  onFormat: () => void;
  errorCount?: number;
  isReadOnly?: boolean;
}

export function EditorToolbar({
  onCopy,
  onFormat,
  errorCount = 0,
  isReadOnly = false,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-800/50">
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          disabled={isReadOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copy
        </button>

        <button
          onClick={onFormat}
          disabled={isReadOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Format code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 16 4-4-4-4" />
            <path d="m6 8-4 4 4 4" />
            <path d="m14.5 4-5 16" />
          </svg>
          Format
        </button>
      </div>

      <div className="flex items-center gap-2">
        {errorCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {errorCount} error{errorCount !== 1 ? "s" : ""}
          </span>
        )}

        {isReadOnly && <span className="text-xs text-zinc-500">Read-only</span>}
      </div>
    </div>
  );
}
