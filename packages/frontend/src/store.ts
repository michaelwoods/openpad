import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Provider } from "./api";

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  code: string;
  model: string;
  style: string;
  attachment: string | null;
}

interface AppState {
  prompt: string;
  generatedCode: string;
  stlData: string | null;
  generationInfo: Record<string, unknown> | null;
  isLoading: boolean;
  showAbout: boolean;
  showHistory: boolean;
  selectedModel: string;
  provider: string;
  availableProviders: Provider[];
  codeStyle: string;
  attachment: string | null;
  history: HistoryItem[];
  previewColor: string;
  mode: "agent" | "editor";
  sidebarOpen: boolean;
  mobileTab: "chat" | "preview" | "code";
  chatMessages: ChatMessage[];
  exportFormat: "stl" | "amf" | "3mf";
  setPrompt: (prompt: string) => void;
  setGeneratedCode: (generatedCode: string) => void;
  setStlData: (stlData: string | null) => void;
  setGenerationInfo: (generationInfo: Record<string, unknown> | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowAbout: (showAbout: boolean) => void;
  setShowHistory: (showHistory: boolean) => void;
  setSelectedModel: (selectedModel: string) => void;
  setProvider: (provider: string) => void;
  setAvailableProviders: (availableProviders: Provider[]) => void;
  setCodeStyle: (codeStyle: string) => void;
  setAttachment: (attachment: string | null) => void;
  setPreviewColor: (previewColor: string) => void;
  addToHistory: (item: Omit<HistoryItem, "id" | "timestamp">) => void;
  clearHistory: () => void;
  loadHistoryItem: (item: HistoryItem) => void;
  setMode: (mode: "agent" | "editor") => void;
  toggleSidebar: () => void;
  setMobileTab: (tab: "chat" | "preview" | "code") => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatMessages: () => void;
  setExportFormat: (format: "stl" | "amf" | "3mf") => void;
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  code?: string;
  isThinking?: boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      prompt: "a 20mm cube with a 5mm hole in the center",
      generatedCode: "// OpenSCAD code will appear here",
      stlData: null,
      generationInfo: null,
      isLoading: false,
      showAbout: false,
      showHistory: false,
      selectedModel: "gemini-2.5-flash",
      provider: "gemini",
      availableProviders: [],
      codeStyle: "Default",
      attachment: null,
      history: [],
      previewColor: "#ffaa00",
      mode: "agent",
      sidebarOpen: true,
      mobileTab: "chat",
      chatMessages: [],
      exportFormat: "stl",
      setPrompt: (prompt) => set({ prompt }),
      setGeneratedCode: (generatedCode) => set({ generatedCode }),
      setStlData: (stlData) => set({ stlData }),
      setGenerationInfo: (generationInfo) => set({ generationInfo }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setShowAbout: (showAbout) => set({ showAbout }),
      setShowHistory: (showHistory) => set({ showHistory }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setProvider: (provider) => set({ provider }),
      setAvailableProviders: (availableProviders) =>
        set({ availableProviders }),
      setCodeStyle: (codeStyle) => set({ codeStyle }),
      setAttachment: (attachment) => set({ attachment }),
      setPreviewColor: (previewColor) => set({ previewColor }),
      addToHistory: (item) =>
        set((state) => ({
          history: [
            {
              ...item,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
            ...state.history,
          ],
        })),
      clearHistory: () => set({ history: [] }),
      loadHistoryItem: (item) =>
        set({
          prompt: item.prompt,
          generatedCode: item.code,
          selectedModel: item.model,
          codeStyle: item.style,
          attachment: item.attachment,
          stlData: null,
          generationInfo: null,
        }),
      setMode: (mode) => set({ mode }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setMobileTab: (mobileTab) => set({ mobileTab }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
    }),
    {
      name: "openpad-storage",
      partialize: (state) => ({
        history: state.history,
        prompt: state.prompt,
        selectedModel: state.selectedModel,
        provider: state.provider,
        codeStyle: state.codeStyle,
        previewColor: state.previewColor,
      }),
    },
  ),
);
