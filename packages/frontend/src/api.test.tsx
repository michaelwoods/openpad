import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { handleGenerate, handleDownloadStl } from './api';
import toast from 'react-hot-toast';



describe('API functions', () => {
  it('handleGenerate calls fetch with the correct parameters', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ code: 'test code', stl: 'test stl', generationInfo: {} }),
      })
    ) as any;

    const setIsLoading = vi.fn();
    const setStlData = vi.fn();
    const setGeneratedCode = vi.fn();
    const setGenerationInfo = vi.fn();

    await handleGenerate(
      'test prompt',
      'test model',
      setIsLoading,
      setStlData,
      setGeneratedCode,
      setGenerationInfo
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.any(Object));
    expect(setIsLoading).toHaveBeenCalledWith(true);
  });

  it('handleDownloadStl calls fetch with the correct parameters', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ filename: 'test.stl' }),
      })
    ) as any;

    const link = document.createElement('a');
    const clickSpy = vi.spyOn(link, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(link);

    await handleDownloadStl('test prompt', 'test stl');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/filename', expect.any(Object));
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
