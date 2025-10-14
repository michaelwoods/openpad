import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { handleGenerate } from './api';

const Editor: React.FC = () => {
  const {
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    isLoading,
    setIsLoading,
    setStlData,
    setGeneratedCode,
    setGenerationInfo,
    generatedCode,
    generationInfo,
    codeStyle,
    setCodeStyle,
  } = useStore();
  const [editedCode, setEditedCode] = useState<string | null>(null);

  useEffect(() => {
    setEditedCode(null);
  }, [generatedCode]);

  const onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(e.target.value);
  };

  const onGenerate = () => {
    handleGenerate(
      prompt,
      selectedModel,
      setIsLoading,
      setStlData,
      setGeneratedCode,
      setGenerationInfo,
      editedCode ?? undefined,
      codeStyle
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // prevent newline in textarea
      onGenerate();
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode || generatedCode.startsWith('//')) return;
    navigator.clipboard.writeText(generatedCode);
    // toast.success('Code copied to clipboard!');
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
          onClick={() => onGenerate()} 
          disabled={isLoading}
          className={isLoading ? 'loading-pulse' : ''}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoading}>
          <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
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
            <button onClick={() => onGenerate()} style={{ marginTop: 0, marginRight: '1rem' }}>Regenerate</button>
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