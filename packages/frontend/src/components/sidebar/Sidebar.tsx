import { useStore } from "../../store";
import { handleDownload } from "../../api";

const MAX_HISTORY_ITEMS = 10;

export default function Sidebar() {
  const {
    provider,
    setProvider,
    selectedModel,
    setSelectedModel,
    codeStyle,
    setCodeStyle,
    exportFormat,
    setExportFormat,
    history,
    loadHistoryItem,
    clearHistory,
    resetProject,
    prompt,
    stlData,
    availableProviders,
  } = useStore();

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/80 backdrop-blur-md">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          AI Configuration
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const newProviderId = e.target.value;
                setProvider(newProviderId);
                const newProvider = availableProviders.find(
                  (p) => p.id === newProviderId,
                );
                if (newProvider && newProvider.models.length > 0) {
                  setSelectedModel(newProvider.models[0]);
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              {availableProviders
                .filter((p) => p.configured)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={
                !availableProviders.find((p) => p.id === provider)?.configured
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {availableProviders
                .find((p) => p.id === provider)
                ?.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                )) || <option value="">No provider configured</option>}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500">Modular Code</label>
            <button
              onClick={() =>
                setCodeStyle(codeStyle === "Default" ? "Modular" : "Default")
              }
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${codeStyle === "Modular" ? "bg-blue-600" : "bg-zinc-700"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${codeStyle === "Modular" ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            History
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-zinc-600">No history yet</p>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, MAX_HISTORY_ITEMS).map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
                >
                  <p className="text-sm text-zinc-400 truncate">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Export
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Format</label>
            <select
              value={exportFormat}
              onChange={(e) =>
                setExportFormat(e.target.value as "stl" | "amf" | "3mf")
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="stl">STL ⬜</option>
              <option value="3mf">3MF 🎨</option>
              <option value="amf">AMF 🎨</option>
            </select>
          </div>

          <button
            onClick={() => handleDownload(prompt, stlData, exportFormat)}
            disabled={!stlData}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Download Model
          </button>

          <button
            onClick={resetProject}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-medium py-2 px-4 rounded-md transition-colors"
          >
            New Project
          </button>
        </div>
      </div>
    </div>
  );
}
