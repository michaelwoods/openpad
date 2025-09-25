import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Editor from './Editor';
import '@testing-library/jest-dom';

describe('Editor', () => {
  const mockProps = {
    prompt: 'a 20mm cube',
    setPrompt: vi.fn(),
    handleGenerate: vi.fn(),
    handleKeyDown: vi.fn(),
    isLoading: false,
    selectedModel: 'gemini-2.5-flash',
    setSelectedModel: vi.fn(),
    generatedCode: 'cube(20);',
    handleCopyCode: vi.fn(),
    generationInfo: { model: 'gemini-2.5-flash' },
  };

  it('renders the prompt textarea', () => {
    render(<Editor {...mockProps} />);
    expect(screen.getByPlaceholderText('e.g., a 20mm cube with a 5mm hole in the center')).toBeInTheDocument();
  });

  it('calls setPrompt on textarea change', () => {
    render(<Editor {...mockProps} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'a 10mm sphere' } });
    expect(mockProps.setPrompt).toHaveBeenCalledWith('a 10mm sphere');
  });

  it('calls handleGenerate when Generate button is clicked', () => {
    render(<Editor {...mockProps} />);
    fireEvent.click(screen.getByText('Generate'));
    expect(mockProps.handleGenerate).toHaveBeenCalled();
  });

  it('renders the generated code', () => {
    render(<Editor {...mockProps} />);
    expect(screen.getByText('cube(20);')).toBeInTheDocument();
  });

  it('calls handleCopyCode when Copy button is clicked', () => {
    render(<Editor {...mockProps} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(mockProps.handleCopyCode).toHaveBeenCalled();
  });

  it('renders generation info when available', () => {
    render(<Editor {...mockProps} />);
    expect(screen.getByText('Show Generation Info')).toBeInTheDocument();
  });
});
