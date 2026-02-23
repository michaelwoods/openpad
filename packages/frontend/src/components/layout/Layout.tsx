import type { ReactNode } from "react";
import { useStore } from "../../store";

interface LayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  rightPanel: ReactNode;
  mobileTab: "chat" | "preview" | "code";
  onMobileTabChange?: (tab: "chat" | "preview" | "code") => void;
}

export default function Layout({
  sidebar,
  editor,
  rightPanel,
  mobileTab,
}: LayoutProps) {
  const { mode, sidebarOpen, toggleSidebar } = useStore();

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Mobile hamburger - always visible on mobile */}
      <div className="md:hidden">
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
      </div>

      {/* Sidebar - desktop: collapsible, mobile: off-canvas drawer */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-0"} 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-all duration-300 ease-in-out
          border-r border-white/10 overflow-hidden
          flex-shrink-0
          fixed md:relative inset-y-0 left-0 z-40
          bg-zinc-900
        `}
      >
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop: show both editor and right panel */}
        {/* Mobile: show only active tab content */}
        <div className="hidden md:flex flex-1 min-w-0">
          <div className="flex-1 min-w-0 border-r border-white/10">
            {editor}
          </div>

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
        </div>

        {/* Mobile: tabbed content */}
        <div className="flex-1 md:hidden overflow-hidden">
          {mobileTab === "code" && <div className="h-full">{editor}</div>}
          {mobileTab === "preview" && (
            <div className="h-full">{rightPanel}</div>
          )}
          {mobileTab === "chat" && <div className="h-full">{rightPanel}</div>}
        </div>
      </main>
    </div>
  );
}
