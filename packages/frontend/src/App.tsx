import { useState } from 'react';
import './App.css';
import Viewer from './Viewer';
import About from './About';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [prompt, setPrompt] = useState('a 20mm cube with a 5mm hole in the center');
  const [generatedCode, setGeneratedCode] = useState('// OpenSCAD code will appear here');
  const [stlData, setStlData] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStlData(null);
    setGenerationInfo(null);

    const promise = fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        const errorDetails = data.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorDetails);
      }
      return data;
    });

    toast.promise(promise, {
      loading: 'Generating model...',
      success: (data) => {
        setGeneratedCode(data.code);
        setStlData(data.stl);
        setGenerationInfo(data.generationInfo);
        return 'Successfully generated!';
      },
      error: (err) => {
        setGeneratedCode(`// Error generating code.\n\n${err.message}`);
        return `Error: ${err.message}`;
      },
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // prevent newline in textarea
      handleGenerate();
    }
  };

  return (
    <div className="app">
      <Toaster position="bottom-center" />
      <header>
        <h1>OpenPAD (Open Prompt Aided Design)</h1>
        <button onClick={() => setShowAbout(true)}>About</button>
      </header>
      {showAbout ? (
        <About onClose={() => setShowAbout(false)} />
      ) : (
        <main className="main-content">
          <section className="editor-pane">
            <h2>1. Describe Your Model</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., a 20mm cube with a 5mm hole in the center"
            />
            <button 
              onClick={handleGenerate} 
              disabled={isLoading}
              className={isLoading ? 'loading-pulse' : ''}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>

            <h2 style={{ marginTop: '2rem' }}>2. Generated OpenSCAD Code</h2>
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
          <section className="viewer-pane">
            <Viewer stl={stlData} />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
