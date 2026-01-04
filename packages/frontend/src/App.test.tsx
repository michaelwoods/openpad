import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { useStore } from './store';
import '@testing-library/jest-dom';

describe('App', () => {
  beforeEach(() => {
    useStore.setState({
      showAbout: false,
      showHistory: false,
      prompt: '',
      generatedCode: '// OpenSCAD code will appear here',
    });
  });

  it('renders the main page with the editor and preview', () => {
    render(<App />);
    expect(screen.getByText('1. Describe Your Model')).toBeInTheDocument();
    expect(screen.getByText('2. Generated OpenSCAD Code')).toBeInTheDocument();
    expect(screen.getByText('3. 3D Preview')).toBeInTheDocument();
  });

  it('shows and hides the About page', () => {
    render(<App />);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('About OpenPAD')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back to Editor'));
    expect(screen.queryByText('About OpenPAD')).not.toBeInTheDocument();
  });

  it('shows and hides the History page', () => {
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('Back to Editor')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back to Editor'));
    expect(screen.queryByRole('heading', { name: 'History' })).not.toBeInTheDocument();
  });

  it('generates code when the Generate button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText('cube(10);')).toBeInTheDocument();
    });
  });
});
