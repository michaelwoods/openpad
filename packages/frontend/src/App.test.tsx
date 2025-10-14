import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
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

  it('generates code when the Generate button is clicked', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText('cube(10);')).toBeInTheDocument();
    });
  });
});
