import About from "./About";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Editor from "./Editor";
import Preview from "./Preview";
import { useStore } from "./store";
import Layout from "./components/layout/Layout";
import Panel from "./components/layout/Panel";
import RightPanel from "./components/layout/RightPanel";
import Sidebar from "./components/sidebar/Sidebar";
import ChatPanel from "./components/chat/ChatPanel";

function App() {
  const { showAbout, setShowAbout } = useStore();

  if (showAbout) {
    return (
      <div className="app">
        <Toaster position="bottom-center" />
        <Header onShowAbout={() => setShowAbout(true)} />
        <About onClose={() => setShowAbout(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Toaster position="bottom-center" />
      <Header onShowAbout={() => setShowAbout(true)} />
      <Layout
        sidebar={<Sidebar />}
        editor={
          <Panel className="h-full">
            <Editor />
          </Panel>
        }
        rightPanel={
          <RightPanel
            preview={
              <Panel className="h-full">
                <Preview />
              </Panel>
            }
            chat={<ChatPanel />}
          />
        }
      />
    </div>
  );
}

export default App;
