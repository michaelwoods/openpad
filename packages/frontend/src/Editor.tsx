import React, { useState, useEffect } from 'react';

interface EditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: (editedCode?: string, style?: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  generatedCode: string;
  handleCopyCode: () => void;
  generationInfo: any;
}

const Editor: React.FC<EditorProps> = ({
  prompt,
  setPrompt,
  handleGenerate,
  handleKeyDown,
  isLoading,
  selectedModel,
  setSelectedModel,
  generatedCode,
  handleCopyCode,
  generationInfo,
}) => {
  const [editedCode, setEditedCode] = useState<string | null>(null);
  const [codeStyle, setCodeStyle] = useState('Default');

  useEffect(() => {
    setEditedCode(null);
  }, [generatedCode]);

  const onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(e.target.value);
  };

  return (
    <section className="editor-pane">
      <h2>1. Describe Your Model</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., a 20mm cube with a 5mm hole in the center"
      />
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <button 
          onClick={() => handleGenerate(undefined, codeStyle)} 
          disabled={isLoading}
          className={isLoading ? 'loading-pulse' : ''}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoading}>
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
          <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Style:</label>
          <select value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} disabled={isLoading}>
            <option value="Default">Default</option>
            <option value="Modular">Modular</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem' }}>
        <h2>2. Generated OpenSCAD Code</h2>
        <div>
          {editedCode !== null && (
            <button onClick={() => handleGenerate(editedCode)} style={{ marginTop: 0, marginRight: '1rem' }}>Regenerate</button>
          )}
          <button onClick={handleCopyCode} title="Copy code" style={{ marginTop: 0 }}>Copy</button>
        </div>
      </div>
      <textarea
        value={editedCode ?? generatedCode}
        onChange={onCodeChange}
        className="code-editor"
      />
      {generationInfo && (
        <details style={{ marginTop: '1rem' }}>
          <summary>Show Generation Info</summary>
          <pre>
            <code>{JSON.stringify(generationInfo, null, 2)}</code>
          </pre>
        </details>
      )}
    </section>
  );
};

export default Editor;
