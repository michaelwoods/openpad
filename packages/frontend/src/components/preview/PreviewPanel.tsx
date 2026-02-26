import type { ReactNode } from "react";
import LoadingOverlay from "./LoadingOverlay";

interface PreviewPanelProps {
  children: ReactNode;
  color: string;
  onColorChange: (color: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function PreviewPanel({
  children,
  color,
  onColorChange,
  isLoading = false,
  loadingMessage = "Loading...",
}: PreviewPanelProps) {
  return (
    <div className="relative h-full w-full">
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {children}
    </div>
  );
}
