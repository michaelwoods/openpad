import { useState, useCallback, useEffect, useRef } from "react";
import MonacoEditor, { type Monaco } from "@monaco-editor/react";
import { EditorToolbar } from "./EditorToolbar";
import type { OpenSCADError } from "../../../store";

interface CodeEditorProps {
  code: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  errors?: OpenSCADError[];
}

export default function CodeEditor({
  code,
  onChange,
  isReadOnly = false,
  errors = [],
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const monacoRef = useRef<Monaco | null>(null);

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

  const handleEditorMount = (editor: unknown, monaco: Monaco) => {
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.editor.getModels()[0];
      if (model) {
        const markers = errors.map((error) => ({
          severity: monacoRef.current!.MarkerSeverity.Error,
          message: error.message,
          startLineNumber: error.line || 1,
          startColumn: error.column || 1,
          endLineNumber: error.line || 1,
          endColumn: (error.column || 1) + 10,
        }));
        monacoRef.current.editor.setModelMarkers(model, "openscad", markers);
      }
    }
  }, [errors]);

  return (
    <div className="relative flex flex-col h-full">
      <EditorToolbar onCopy={handleCopy} isReadOnly={isReadOnly} />

      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage="cpp"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
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
