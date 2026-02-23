import type { ReactNode } from "react";
import { useStore } from "../../store";

interface LayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  rightPanel: ReactNode;
}

export default function Layout({ sidebar, editor, rightPanel }: LayoutProps) {
  const { mode, sidebarOpen } = useStore();

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-0"} 
          transition-all duration-300 ease-in-out
          border-r border-white/10 overflow-hidden
          flex-shrink-0
        `}
      >
        {sidebar}
      </aside>

      <main className="flex-1 flex min-w-0">
        <div className="flex-1 min-w-0 border-r border-white/10">{editor}</div>

        <div className="flex flex-col w-[40%] min-w-[320px]">
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${mode === "agent" ? "flex-[6]" : "flex-[4]"}
            `}
          >
            {rightPanel}
          </div>
        </div>
      </main>
    </div>
  );
}
