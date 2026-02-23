import React, { useState, useEffect } from "react";
import { useStore } from "./store";
import { handleGenerate, getProviders } from "./api";
import CodeEditor from "./components/editor/CodeEditor";

const Editor: React.FC = () => {
  const {
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    provider,
    setProvider,
    availableProviders,
    setAvailableProviders,
    isLoading,
    setIsLoading,
    setStlData,
    setGeneratedCode,
    setGenerationInfo,
    generatedCode,
    generationInfo,
    codeStyle,
    setCodeStyle,
    attachment,
    setAttachment,
    addToHistory,
  } = useStore();

  const [editedCode, setEditedCode] = useState<string | null>(null);

  useEffect(() => {
    setEditedCode(null);
  }, [generatedCode]);

  useEffect(() => {
    getProviders().then((providers) => {
      setAvailableProviders(providers);

      const configuredProviders = providers.filter((p) => p.configured);

      if (configuredProviders.length === 0) return;

      const currentProviderConfigured = configuredProviders.find(
        (p) => p.id === provider,
      );

      if (!currentProviderConfigured) {
        const firstProvider = configuredProviders[0];
        setProvider(firstProvider.id);
        if (firstProvider.models.length > 0) {
          setSelectedModel(firstProvider.models[0]);
        }
      } else {
        if (
          currentProviderConfigured.models.length > 0 &&
          !currentProviderConfigured.models.includes(selectedModel)
        ) {
          setSelectedModel(currentProviderConfigured.models[0]);
        }
      }
    });
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    setProvider(newProviderId);
    const newProvider = availableProviders.find((p) => p.id === newProviderId);
    if (newProvider && newProvider.models.length > 0) {
      setSelectedModel(newProvider.models[0]);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditedCode(value);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setAttachment(null);
    }
  };

  const onGenerate = () => {
    handleGenerate(
      prompt,
      selectedModel,
      provider,
      setIsLoading,
      setStlData,
      setGeneratedCode,
      setGenerationInfo,
      editedCode ?? undefined,
      codeStyle,
      attachment,
      (code) => {
        addToHistory({
          prompt,
          code,
          model: selectedModel,
          style: codeStyle,
          attachment,
        });
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const currentProvider = availableProviders.find((p) => p.id === provider);
  const configuredProviders = availableProviders.filter((p) => p.configured);

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">
          1. Describe Your Model
        </h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., a 20mm cube with a 5mm hole in the center"
          className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
          aria-label="Model description"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="block text-sm text-zinc-400 mb-2"
        >
          Attach .scad file (optional):
        </label>
        <div className="flex items-center gap-3">
          <input
            id="file-upload"
            type="file"
            accept=".scad"
            onChange={handleFileUpload}
            className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
          />
          {attachment && (
            <button
              onClick={() => setAttachment(null)}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || configuredProviders.length === 0}
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors ${isLoading ? "animate-pulse" : ""}`}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>

        {configuredProviders.length > 0 ? (
          <>
            <select
              value={provider}
              onChange={handleProviderChange}
              disabled={isLoading}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {configuredProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {currentProvider &&
              (currentProvider.models.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  {currentProvider.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="Model name"
                  disabled={isLoading}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              ))}

            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-400">Style:</label>
              <select
                value={codeStyle}
                onChange={(e) => setCodeStyle(e.target.value)}
                disabled={isLoading}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="Default">Default</option>
                <option value="Modular">Modular</option>
              </select>
            </div>
          </>
        ) : (
          <span className="text-sm text-red-400">
            No AI providers configured. Check .env
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-zinc-200">
            2. Generated OpenSCAD Code
          </h2>
          {editedCode !== null && (
            <button
              onClick={onGenerate}
              className="px-3 py-1 text-sm text-zinc-300 hover:text-white bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
            >
              Regenerate
            </button>
          )}
        </div>

        <div className="flex-1 min-h-[300px] border border-zinc-700 rounded-lg overflow-hidden">
          <CodeEditor
            code={editedCode ?? generatedCode}
            onChange={handleEditorChange}
            isReadOnly={isLoading}
          />
        </div>
      </div>

      {generationInfo && (
        <details className="mt-4">
          <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300">
            Show Generation Info
          </summary>
          <pre className="mt-2 p-3 bg-zinc-800 rounded-md text-xs text-zinc-400 overflow-x-auto">
            <code>{JSON.stringify(generationInfo, null, 2)}</code>
          </pre>
        </details>
      )}
    </div>
  );
};

export default Editor;
