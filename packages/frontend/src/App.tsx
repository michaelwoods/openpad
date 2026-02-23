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
import MobileNav from "./components/layout/MobileNav";

function App() {
  const { showAbout, setShowAbout, mobileTab, setMobileTab, setMode } =
    useStore();

  const handleMobileTabChange = (tab: "chat" | "preview" | "code") => {
    setMobileTab(tab);
    if (tab === "code") {
      setMode("editor");
    } else {
      setMode("agent");
    }
  };

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
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
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
        mobileTab={mobileTab}
        onMobileTabChange={handleMobileTabChange}
      />
    </div>
  );
}

export default App;
