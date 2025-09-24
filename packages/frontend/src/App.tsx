import { useState } from 'react';
import './App.css';
import Viewer from './Viewer';

function App() {
  const [prompt, setPrompt] = useState('a 20mm cube with a 5mm hole in the center');
  const [generatedCode, setGeneratedCode] = useState('// OpenSCAD code will appear here');
  const [stlData, setStlData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setStlData(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = data.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorDetails);
      }

      setGeneratedCode(data.code);
      setStlData(data.stl);

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      setGeneratedCode('// Error generating code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>OpenPAD (Open Prompt Aided Design)</h1>
      </header>
      <main className="main-content">
        <section className="editor-pane">
          <h2>1. Describe Your Model</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a 20mm cube with a 5mm hole in the center"
          />
          <button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          <h2 style={{ marginTop: '2rem' }}>2. Generated OpenSCAD Code</h2>
          <pre>
            <code>{generatedCode}</code>
          </pre>
        </section>
        <section className="viewer-pane">
          <Viewer stl={stlData} />
        </section>
      </main>
    </div>
  );
}

export default App;
