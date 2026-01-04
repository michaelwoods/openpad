import './App.css';
import About from './About';
import History from './History';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Editor from './Editor';
import Preview from './Preview';
import { useStore } from './store';

function App() {
  const {
    showAbout,
    setShowAbout,
    showHistory,
    setShowHistory,
  } = useStore();

  const renderContent = () => {
    if (showAbout) {
      return <About onClose={() => setShowAbout(false)} />;
    }
    if (showHistory) {
      return <History onClose={() => setShowHistory(false)} />;
    }
    return (
      <main className="main-content">
        <Editor />
        <Preview />
      </main>
    );
  };

  return (
    <div className="app">
      <Toaster position="bottom-center" />
      <Header 
        onShowAbout={() => setShowAbout(true)} 
        onShowHistory={() => setShowHistory(true)} 
      />
      {renderContent()}
    </div>
  );
}

export default App;