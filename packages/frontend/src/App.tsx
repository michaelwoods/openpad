import './App.css';
import About from './About';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Editor from './Editor';
import Preview from './Preview';
import { useStore } from './store';

function App() {
  const {
    showAbout,
    setShowAbout,
  } = useStore();

  return (
    <div className="app">
      <Toaster position="bottom-center" />
      <Header onShowAbout={() => setShowAbout(true)} />
      {showAbout ? (
        <About onClose={() => setShowAbout(false)} />
      ) : (
        <main className="main-content">
          <Editor />
          <Preview />
        </main>
      )}
    </div>
  );
}

export default App;