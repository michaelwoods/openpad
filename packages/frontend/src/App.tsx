import { useState } from 'react';
import './App.css';
import About from './About';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header';
import Editor from './Editor';
import Preview from './Preview';

function App() {
  const [prompt, setPrompt] = useState('a 20mm cube with a 5mm hole in the center');
  const [generatedCode, setGeneratedCode] = useState('// OpenSCAD code will appear here');
  const [stlData, setStlData] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

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
      body: JSON.stringify({ prompt, model: selectedModel }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        const errorDetails = data.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorDetails);
      }
      return data;
    });

    toast.promise(promise, {
      loading: `Generating model with ${selectedModel}...`,
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

  const handleCopyCode = () => {
    if (!generatedCode || generatedCode.startsWith('//')) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleDownloadStl = async () => {
    if (!stlData) return;

    const promise = fetch('/api/filename', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.filename) throw new Error('Could not generate filename.');
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${stlData}`;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

    toast.promise(promise, {
      loading: 'Generating filename...', 
      success: 'Download started!',
      error: 'Could not generate filename.',
    });
  };

  return (
    <div className="app">
      <Toaster position="bottom-center" />
      <Header onShowAbout={() => setShowAbout(true)} />
      {showAbout ? (
        <About onClose={() => setShowAbout(false)} />
      ) : (
        <main className="main-content">
          <Editor
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            handleKeyDown={handleKeyDown}
            isLoading={isLoading}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            generatedCode={generatedCode}
            handleCopyCode={handleCopyCode}
            generationInfo={generationInfo}
          />
          <Preview stlData={stlData} handleDownloadStl={handleDownloadStl} />
        </main>
      )}
    </div>
  );
}

export default App;