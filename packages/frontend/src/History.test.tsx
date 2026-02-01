import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import History from './History';
import { useStore, HistoryItem } from './store';
import '@testing-library/jest-dom';

describe('History', () => {
  const mockHistoryItem: HistoryItem = {
    id: '123',
    timestamp: 1672531200000, // Jan 1 2023
    prompt: 'a test prompt',
    code: 'cube(10);',
    model: 'gemini-2.5-flash',
    style: 'Default',
    attachment: null,
  };

  beforeEach(() => {
    useStore.setState({
      history: [],
      prompt: '',
      generatedCode: '',
      showHistory: true,
    });
  });

  it('renders "No history yet" when history is empty', () => {
    render(<History onClose={() => {}} />);
    expect(screen.getByText('No history yet.')).toBeInTheDocument();
  });

  it('renders history items', () => {
    useStore.setState({ history: [mockHistoryItem] });
    render(<History onClose={() => {}} />);
    expect(screen.getByText('a test prompt')).toBeInTheDocument();
    expect(screen.getByText('gemini-2.5-flash')).toBeInTheDocument();
  });

  it('calls onClose and loads item when Load is clicked', () => {
    useStore.setState({ history: [mockHistoryItem] });
    const mockOnClose = vi.fn();
    render(<History onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Load'));

    expect(useStore.getState().prompt).toBe('a test prompt');
    expect(useStore.getState().generatedCode).toBe('cube(10);');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears history when Clear History is clicked', () => {
    useStore.setState({ history: [mockHistoryItem] });
    render(<History onClose={() => {}} />);

    fireEvent.click(screen.getByText('Clear History'));

    expect(useStore.getState().history).toHaveLength(0);
    expect(screen.getByText('No history yet.')).toBeInTheDocument();
  });
});
