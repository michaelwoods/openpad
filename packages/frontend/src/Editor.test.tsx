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
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      undefined,
      'Modular'
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

  it('updates the selected model when changed in the dropdown', () => {
    render(<Editor />);
    // Find the second combobox (the first is for model, second for style if using labels, but here we can try to find by display value or role)
    // Since there are two selects, we should be specific. The model select has 'gemini-2.5-flash' as default value.
    const select = screen.getByDisplayValue('Gemini 2.5 Flash'); 
    fireEvent.change(select, { target: { value: 'gemini-3-pro-preview' } });
    expect(useStore.getState().selectedModel).toBe('gemini-3-pro-preview');
  });
});
