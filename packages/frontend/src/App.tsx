import { useState, useEffect } from 'react';
import './App.css';
import About from './About';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header';
import Editor from './Editor';
import Preview from './Preview';
import { handleGenerate, handleDownloadStl } from './api';

function App() {
  const [prompt, setPrompt] = useState('a 20mm cube with a 5mm hole in the center');
  const [generatedCode, setGeneratedCode] = useState('// OpenSCAD code will appear here');
  const [stlData, setStlData] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const onGenerate = (editedCode?: string) => {
    handleGenerate(
      prompt,
      selectedModel,
      setIsLoading,
      setStlData,
      setGeneratedCode,
      setGenerationInfo,
      editedCode
    );
  };

  const onDownloadStl = () => {
    handleDownloadStl(prompt, stlData);
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
    toast.success('Code copied to clipboard!');
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            handleGenerate={onGenerate}
            handleKeyDown={handleKeyDown}
            isLoading={isLoading}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            generatedCode={generatedCode}
            handleCopyCode={handleCopyCode}
            generationInfo={generationInfo}
          />
          {isMounted && <Preview stlData={stlData} handleDownloadStl={onDownloadStl} />}
        </main>
      )}
    </div>
  );
}

export default App;
