import React from 'react';

interface EditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
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
          onClick={handleGenerate} 
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
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem' }}>
        <h2>2. Generated OpenSCAD Code</h2>
        <button onClick={handleCopyCode} title="Copy code" style={{ marginTop: 0 }}>Copy</button>
      </div>
      <pre>
        <code>{generatedCode}</code>
      </pre>
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
