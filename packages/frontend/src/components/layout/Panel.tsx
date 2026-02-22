import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export default function Panel({ children, className = "" }: PanelProps) {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
