/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Editor from './Editor';
import { useStore } from './store';
import * as api from './api';
import '@testing-library/jest-dom';

describe('Editor', () => {
  beforeEach(() => {
    useStore.setState({
      isLoading: false,
      prompt: '',
      selectedModel: 'gemini-2.5-flash',
      provider: 'gemini',
      codeStyle: 'Default',
      generatedCode: 'cube(10);',
    });
    vi.clearAllMocks();
  });

  it('renders the editor component', () => {
    render(<Editor />);
    expect(screen.getByText('1. Describe Your Model')).toBeInTheDocument();
    expect(screen.getByText('2. Generated OpenSCAD Code')).toBeInTheDocument();
  });

  it('copies the generated code to the clipboard', async () => {
    const mockWriteText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    render(<Editor />);

    fireEvent.click(screen.getByText('Copy'));

    expect(mockWriteText).toHaveBeenCalledWith('cube(10);');
  });

  it('disables the Generate button while loading', () => {
    useStore.setState({ isLoading: true });
    render(<Editor />);
    expect(screen.getByText('Generating...')).toBeDisabled();
  });

  it('calls handleGenerate with the correct parameters on button click', async () => {
    const handleGenerateSpy = vi.spyOn(api, 'handleGenerate').mockImplementation(async () => {});
    useStore.setState({
      prompt: 'a test prompt',
      selectedModel: 'gemini-2.5-pro',
      codeStyle: 'Modular',
      isLoading: false,
    });

    render(<Editor />);
    await act(async () => {
      fireEvent.click(screen.getByText('Generate'));
    });

    expect(handleGenerateSpy).toHaveBeenCalledWith(
      'a test prompt',
      'gemini-2.5-pro',
      'gemini',
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      undefined,
      'Modular',
      null,
      expect.any(Function)
    );
  });

  it('calls handleGenerate on key down', async () => {
    const handleGenerateSpy = vi.spyOn(api, 'handleGenerate').mockImplementation(async () => {});
    useStore.setState({ prompt: 'a test prompt' });

    render(<Editor />);
    await act(async () => {
      fireEvent.keyDown(screen.getByPlaceholderText('e.g., a 20mm cube with a 5mm hole in the center'), { key: 'Enter', ctrlKey: true });
    });

    expect(handleGenerateSpy).toHaveBeenCalled();
  });

  it('updates the selected model when changed in the dropdown', async () => {
    render(<Editor />);
    // Find the second combobox (the first is for model, second for style if using labels, but here we can try to find by display value or role)
    // Since there are two selects, we should be specific. The model select has 'gemini-2.5-flash' as default value.
    const select = await screen.findByDisplayValue('gemini-2.5-flash'); 
    fireEvent.change(select, { target: { value: 'gemini-3-pro-preview' } });
    expect(useStore.getState().selectedModel).toBe('gemini-3-pro-preview');
  });

  it('updates the attachment state when a file is uploaded', async () => {
    render(<Editor />);
    const file = new File(['cylinder(10);'], 'test.scad', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Attach .scad file/i);

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: 'cylinder(10);',
    };
    window.FileReader = vi.fn().mockImplementation(function () {
      return mockFileReader;
    }) as any;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // manually trigger onload since we mocked it
      mockFileReader.onload?.({ target: { result: 'cylinder(10);' } } as any);
    });

    expect(useStore.getState().attachment).toBe('cylinder(10);');
  });

  it('adds to history on successful generation', async () => {
    vi.spyOn(api, 'handleGenerate').mockImplementation(async (
      _p, _m, _prov, _sil, _ssd, _sgc, _sgi, _ec, _s, _a, onSuccess
    ) => {
      if (onSuccess) onSuccess('generated code');
    });

    useStore.getState().clearHistory();

    render(<Editor />);
    await act(async () => {
      fireEvent.click(screen.getByText('Generate'));
    });

    expect(useStore.getState().history).toHaveLength(1);
    expect(useStore.getState().history[0].code).toBe('generated code');
  });

  it('switches to text input when Ollama is selected', async () => {
    render(<Editor />);
    
    // Find provider select
    // It has options "Gemini" and "Ollama (Local)"
    // We can find by role 'combobox' but there are multiple.
    // The provider select has value 'gemini' initially.
    const providerSelect = screen.getByDisplayValue('Gemini');
    
    await act(async () => {
        fireEvent.change(providerSelect, { target: { value: 'ollama' } });
    });

    expect(useStore.getState().provider).toBe('ollama');

    // Should see dropdown with models because we mock getModels response in handlers.ts
    // Wait for the dropdown to appear populated?
    // The default handler returns ['llama3', 'codellama']
    
    // We expect a combobox with value 'llama3' (default first one)
    // There are multiple comboboxes.
    
    // Let's find by display value
    const modelSelect = await screen.findByDisplayValue('llama3');
    expect(modelSelect).toBeInTheDocument();
    
    // Change to codellama
    await act(async () => {
        fireEvent.change(modelSelect, { target: { value: 'codellama' } });
    });

    expect(useStore.getState().selectedModel).toBe('codellama');
  });

  it('clears attachment when clear button is clicked', async () => {
    useStore.setState({ attachment: 'some data' });
    render(<Editor />);
    
    const clearButton = screen.getByText('Clear Attachment');
    fireEvent.click(clearButton);
    
    expect(useStore.getState().attachment).toBeNull();
  });

  it('resets editedCode when generatedCode changes', () => {
    render(<Editor />);
    
    // Simulate user editing code
    const editor = screen.getByRole('textbox', { name: 'Generated code' }); // The code editor
    fireEvent.change(editor, { target: { value: 'edited' } });
    
    // In real app, this state is local. How do we assert it?
    // We can check if "Regenerate" button appears.
    expect(screen.getByText('Regenerate')).toBeInTheDocument();

    // Now update generatedCode in store
    act(() => {
        useStore.setState({ generatedCode: 'new code' });
    });
    
    // Regenerate button should disappear because editedCode is reset to null
    expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();
  });
});
