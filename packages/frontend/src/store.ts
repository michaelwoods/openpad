import { create } from 'zustand';

interface AppState {
  prompt: string;
  generatedCode: string;
  stlData: string | null;
  generationInfo: any;
  isLoading: boolean;
  showAbout: boolean;
  selectedModel: string;
  codeStyle: string;
  setPrompt: (prompt: string) => void;
  setGeneratedCode: (generatedCode: string) => void;
  setStlData: (stlData: string | null) => void;
  setGenerationInfo: (generationInfo: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowAbout: (showAbout: boolean) => void;
  setSelectedModel: (selectedModel: string) => void;
  setCodeStyle: (codeStyle: string) => void;
}

export const useStore = create<AppState>((set) => ({
  prompt: 'a 20mm cube with a 5mm hole in the center',
  generatedCode: '// OpenSCAD code will appear here',
  stlData: null,
  generationInfo: null,
  isLoading: false,
  showAbout: false,
  selectedModel: 'gemini-2.5-flash',
  codeStyle: 'Default',
  setPrompt: (prompt) => set({ prompt }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  setStlData: (stlData) => set({ stlData }),
  setGenerationInfo: (generationInfo) => set({ generationInfo }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setShowAbout: (showAbout) => set({ showAbout }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setCodeStyle: (codeStyle) => set({ codeStyle }),
}));
