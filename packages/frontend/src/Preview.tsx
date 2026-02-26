import Viewer from "./Viewer";
import { useStore } from "./store";
import PreviewPanel from "./components/preview/PreviewPanel";

const Preview: React.FC = () => {
  const { stlData, previewColor, setPreviewColor, isLoading } = useStore();

  return (
    <PreviewPanel
      color={previewColor}
      onColorChange={setPreviewColor}
      isLoading={isLoading}
      loadingMessage="Loading..."
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-zinc-300">3D Preview</h2>
        </div>

        <div className="flex-1 min-h-0">
          <Viewer stl={stlData} format="stl" color={previewColor} />
        </div>
      </div>
    </PreviewPanel>
  );
};

export default Preview;
