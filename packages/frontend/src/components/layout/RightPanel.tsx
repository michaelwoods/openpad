import type { ReactNode } from "react";
import { useStore } from "../../store";

interface RightPanelProps {
  preview: ReactNode;
  chat: ReactNode;
}

export default function RightPanel({ preview, chat }: RightPanelProps) {
  const { mode } = useStore();

  return (
    <div className="h-full flex flex-col">
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${mode === "agent" ? "flex-[4]" : "flex-[7]"}
        `}
      >
        {preview}
      </div>

      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden border-t border-white/10
          ${mode === "agent" ? "flex-[6]" : "flex-[3]"}
        `}
      >
        {chat}
      </div>
    </div>
  );
}
