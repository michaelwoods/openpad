import type { ReactNode } from "react";
import LoadingOverlay from "./LoadingOverlay";

interface PreviewPanelProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function PreviewPanel({
  children,
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
