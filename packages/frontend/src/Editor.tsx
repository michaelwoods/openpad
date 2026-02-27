import React, { useState, useEffect } from "react";
import { useStore } from "./store";
import CodeEditor from "./components/editor/CodeEditor";

const Editor: React.FC = () => {
  const { generatedCode, generationInfo, isLoading, setGeneratedCode } =
    useStore();

  const [editedCode, setEditedCode] = useState<string | null>(null);

  useEffect(() => {
    setEditedCode(null);
  }, [generatedCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditedCode(value);
    }
  };

  const handleSave = () => {
    if (editedCode) {
      setGeneratedCode(editedCode);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">Code Editor</h2>
        {editedCode && (
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
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
