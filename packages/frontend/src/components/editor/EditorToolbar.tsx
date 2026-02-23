interface EditorToolbarProps {
  onCopy: () => void;
  isReadOnly?: boolean;
}

export function EditorToolbar({
  onCopy,
  isReadOnly = false,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-800/50">
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          disabled={isReadOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy code to clipboard"
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
      </div>

      <div className="flex items-center gap-2">
        {isReadOnly && <span className="text-xs text-zinc-500">Read-only</span>}
      </div>
    </div>
  );
}
