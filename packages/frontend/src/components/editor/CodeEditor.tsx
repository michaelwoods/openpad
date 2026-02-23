import { useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { EditorToolbar } from "./EditorToolbar";

interface CodeEditorProps {
  code: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
}

export default function CodeEditor({
  code,
  onChange,
  isReadOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleEditorChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <EditorToolbar onCopy={handleCopy} isReadOnly={isReadOnly} />

      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage="cpp"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: isReadOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "line",
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            wordWrap: "on",
          }}
        />
      </div>

      {copied && (
        <div className="absolute top-2 right-2 px-3 py-1 text-xs bg-green-600 text-white rounded-md animate-fade-in">
          Copied!
        </div>
      )}
    </div>
  );
}
