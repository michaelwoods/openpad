import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';

// Mock child components
vi.mock('./Header', () => ({
  default: vi.fn(({ onShowAbout }) => (
    <header>
      <h1>OpenPAD</h1>
      <button onClick={onShowAbout}>About</button>
    </header>
  )),
}));

vi.mock('./About', () => ({
  default: vi.fn(({ onClose }) => (
    <div>
      <h2>About OpenPAD</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )),
}));

vi.mock('./Editor', () => ({
  default: vi.fn(({ handleGenerate }) => (
    <div>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  )),
}));

vi.mock('./Preview', () => ({
  default: vi.fn(({ handleDownloadStl }) => (
    <div>
      <button onClick={handleDownloadStl}>Download</button>
    </div>
  )),
}));

describe('App', () => {
  it('shows and hides the About component', () => {
    render(<App />);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('About OpenPAD')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('About OpenPAD')).not.toBeInTheDocument();
  });

  it('calls handleGenerate when the Generate button is clicked', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ code: 'test code', stl: 'test stl', generationInfo: {} }),
      })
    ) as any;

    render(<App />);
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.any(Object));
    });
  });

  it('calls handleDownloadStl when the Download button is clicked', async () => {
    global.fetch = vi.fn((url) => {
      switch (url) {
        case '/api/generate':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ code: 'test code', stl: 'test stl', generationInfo: {} }),
          });
        case '/api/filename':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ filename: 'test.stl' }),
          });
        default:
          return Promise.reject(new Error('unknown url'));
      }
    }) as any;

    const createElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const link = createElement.call(document, 'a');
        vi.spyOn(link, 'click').mockImplementation(() => {});
        return link;
      }
      return createElement.call(document, tag);
    });

    render(<App />);
    // First, generate some STL data
    fireEvent.click(screen.getByText('Generate'));

    // Wait for the download button to be enabled
    await waitFor(() => {
      expect(screen.getByText('Download')).not.toBeDisabled();
    });

    // Now, click the download button
    fireEvent.click(screen.getByText('Download'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/filename', expect.any(Object));
    });
  });
});
