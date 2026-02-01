import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  provider: 'gemini' | 'ollama';
  codeStyle: string;
  attachment: string | null;
  history: HistoryItem[];
  previewColor: string;
  setPrompt: (prompt: string) => void;
  setGeneratedCode: (generatedCode: string) => void;
  setStlData: (stlData: string | null) => void;
  setGenerationInfo: (generationInfo: Record<string, unknown> | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowAbout: (showAbout: boolean) => void;
  setShowHistory: (showHistory: boolean) => void;
  setSelectedModel: (selectedModel: string) => void;
  setProvider: (provider: 'gemini' | 'ollama') => void;
  setCodeStyle: (codeStyle: string) => void;
  setAttachment: (attachment: string | null) => void;
  setPreviewColor: (previewColor: string) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  loadHistoryItem: (item: HistoryItem) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      prompt: 'a 20mm cube with a 5mm hole in the center',
      generatedCode: '// OpenSCAD code will appear here',
      stlData: null,
      generationInfo: null,
      isLoading: false,
      showAbout: false,
      showHistory: false,
      selectedModel: 'gemini-2.5-flash',
      provider: 'gemini',
      codeStyle: 'Default',
      attachment: null,
      history: [],
      previewColor: '#ffaa00',
      setPrompt: (prompt) => set({ prompt }),
      setGeneratedCode: (generatedCode) => set({ generatedCode }),
      setStlData: (stlData) => set({ stlData }),
      setGenerationInfo: (generationInfo) => set({ generationInfo }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setShowAbout: (showAbout) => set({ showAbout }),
      setShowHistory: (showHistory) => set({ showHistory }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setProvider: (provider) => set({ provider }),
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
          // We don't restore stlData as it would be heavy to store; user can re-generate/render
          stlData: null,
          generationInfo: null,
        }),
    }),
    {
      name: 'openpad-storage',
      partialize: (state) => ({ history: state.history, prompt: state.prompt, selectedModel: state.selectedModel, provider: state.provider, codeStyle: state.codeStyle, previewColor: state.previewColor }), // Only persist history and current form state
    }
  )
);
