import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from './store';
import { handleGenerate, getProviders } from './api';

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
      
      const configuredProviders = providers.filter(p => p.configured);
      
      if (configuredProviders.length === 0) return;

      const currentProviderConfigured = configuredProviders.find(p => p.id === provider);
      
      // If current provider is not configured or not set, switch to first available
      if (!currentProviderConfigured) {
        const firstProvider = configuredProviders[0];
        setProvider(firstProvider.id);
        if (firstProvider.models.length > 0) {
           setSelectedModel(firstProvider.models[0]);
        }
      } else {
        // Ensure selected model belongs to current provider
        if (currentProviderConfigured.models.length > 0 && !currentProviderConfigured.models.includes(selectedModel)) {
             setSelectedModel(currentProviderConfigured.models[0]);
        }
      }
    });
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    setProvider(newProviderId);
    const newProvider = availableProviders.find(p => p.id === newProviderId);
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
    // Cast provider to expected type for now, or update handleGenerate signature
    handleGenerate(
      prompt,
      selectedModel,
      provider as 'gemini' | 'ollama', 
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

  const currentProvider = availableProviders.find(p => p.id === provider);
  const configuredProviders = availableProviders.filter(p => p.configured);

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
          disabled={isLoading || configuredProviders.length === 0}
          className={isLoading ? 'loading-pulse' : ''}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        
        {configuredProviders.length > 0 ? (
          <>
            <select value={provider} onChange={handleProviderChange} disabled={isLoading}>
              {configuredProviders.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            {currentProvider && (
              currentProvider.models.length > 0 ? (
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoading}>
                  {currentProvider.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <input 
                    type="text" 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)} 
                    placeholder="Model name"
                    disabled={isLoading}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              )
            )}
          </>
        ) : (
          <span style={{ color: 'red', fontSize: '0.9rem' }}>No AI providers configured. Check .env or TODO.md</span>
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