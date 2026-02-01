import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from './store';
import { handleGenerate, getModels } from './api';

const Editor: React.FC = () => {
  const {
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    provider,
    setProvider,
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
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  useEffect(() => {
    setEditedCode(null);
  }, [generatedCode]);

  useEffect(() => {
    if (provider === 'ollama') {
      getModels().then((models) => {
        setOllamaModels(models);
        // If current selected model is not in list (or is a gemini one), select first available
        if (models.length > 0 && (!selectedModel || selectedModel.startsWith('gemini'))) {
          setSelectedModel(models[0]);
        } else if (models.length === 0) {
           // Fallback if no models found or connection failed
           // Keep input as text or maybe show error? 
           // For now, we will handle empty list in render
        }
      });
    }
  }, [provider, setSelectedModel, selectedModel]);

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
      }
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
        aria-label="Model description"
      />
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Attach .scad file (optional):</label>
        <input id="file-upload" type="file" accept=".scad" onChange={handleFileUpload} />
        {attachment && (
            <button onClick={() => setAttachment(null)} style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Clear Attachment</button>
        )}
      </div>
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <button 
          onClick={() => onGenerate()} 
          disabled={isLoading}
          className={isLoading ? 'loading-pulse' : ''}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <select value={provider} onChange={(e) => setProvider(e.target.value as 'gemini' | 'ollama')} disabled={isLoading}>
          <option value="gemini">Gemini</option>
          <option value="ollama">Ollama (Local)</option>
        </select>
        {provider === 'gemini' ? (
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoading}>
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
          </select>
        ) : (
          ollamaModels.length > 0 ? (
             <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoading}>
               {ollamaModels.map((model) => (
                 <option key={model} value={model}>{model}</option>
               ))}
             </select>
          ) : (
            <input 
                type="text" 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)} 
                placeholder="Model name (e.g. codellama)"
                disabled={isLoading}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          )
        )}
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
      <div className="code-editor-container" style={{ height: '400px', border: '1px solid #ccc' }}>
        <MonacoEditor
          height="100%"
          defaultLanguage="cpp" 
          value={editedCode ?? generatedCode}
          onChange={handleEditorChange}
          theme="light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            ariaLabel: "Generated code" 
          }}
        />
      </div>
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