import { useState } from "react";
import Viewer from "./Viewer";
import { useStore } from "./store";
import { handleDownload } from "./api";
import PreviewPanel from "./components/preview/PreviewPanel";
import ColorPicker from "./components/preview/ColorPicker";

const Preview: React.FC = () => {
  const { stlData, prompt, previewColor, setPreviewColor, isLoading } =
    useStore();
  const [format, setFormat] = useState("stl");

  const onDownload = () => {
    handleDownload(prompt, stlData, format);
  };

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

          <div className="flex items-center gap-3">
            <ColorPicker color={previewColor} onChange={setPreviewColor} />

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="stl">STL</option>
              <option value="amf">AMF (color)</option>
              <option value="3mf">3MF (color)</option>
            </select>

            <button
              onClick={onDownload}
              disabled={!stlData}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Viewer stl={stlData} format={format} color={previewColor} />
        </div>
      </div>
    </PreviewPanel>
  );
};

export default Preview;
