import type { ReactNode } from "react";
import ColorPicker from "./ColorPicker";
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
      <div className="absolute top-3 right-3 z-10">
        <ColorPicker color={color} onChange={onColorChange} />
      </div>

      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {children}
    </div>
  );
}
