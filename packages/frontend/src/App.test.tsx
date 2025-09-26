import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';
import * as api from './api';

vi.mock('./api');

vi.mock('./Header', () => ({
  default: ({ onShowAbout }: { onShowAbout: () => void }) => <button onClick={onShowAbout}>About</button>,
}));

vi.mock('./About', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      <h2>About OpenPAD</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('./Editor', () => ({
  default: ({ handleGenerate }: { handleGenerate: () => void }) => <button onClick={handleGenerate}>Generate</button>,
}));

vi.mock('./Preview', () => ({
  default: ({ handleDownloadStl }: { handleDownloadStl: () => void }) => <button onClick={handleDownloadStl}>Download</button>,
}));


describe('App', () => {
  it('shows and hides the About component', () => {
    render(<App />);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('About OpenPAD')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('About OpenPAD')).not.toBeInTheDocument();
  });

  it('calls handleGenerate when the Generate button is clicked', () => {
    const handleGenerateSpy = vi.spyOn(api, 'handleGenerate');
    render(<App />);
    fireEvent.click(screen.getByText('Generate'));
    expect(handleGenerateSpy).toHaveBeenCalled();
  });

  it('calls handleDownloadStl when the Download button is clicked', () => {
    const handleDownloadStlSpy = vi.spyOn(api, 'handleDownloadStl');
    render(<App />);
    fireEvent.click(screen.getByText('Download'));
    expect(handleDownloadStlSpy).toHaveBeenCalled();
  });
});
