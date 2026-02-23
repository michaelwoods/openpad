import type { ReactNode } from "react";

interface EditorPanelProps {
  children: ReactNode;
}

export default function EditorPanel({ children }: EditorPanelProps) {
  return <div className="h-full flex flex-col">{children}</div>;
}
