import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Preview from './Preview';
import { useStore } from './store';
import * as api from './api';
import '@testing-library/jest-dom';

describe('Preview', () => {
  beforeEach(() => {
    useStore.setState({ stlData: null, prompt: '' });
    vi.clearAllMocks();
  });

  it('renders the preview component', () => {
    render(<Preview />);
    expect(screen.getByText('3. 3D Preview')).toBeInTheDocument();
  });

  it('disables the download button when stlData is null', () => {
    render(<Preview />);
    expect(screen.getByText('Download')).toBeDisabled();
  });

  it('enables the download button when stlData is available', () => {
    useStore.setState({ stlData: 'some-stl-data' });
    render(<Preview />);
    expect(screen.getByText('Download')).toBeEnabled();
  });

  it('updates the format on change', () => {
    render(<Preview />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'amf' } });
    expect(select.value).toBe('amf');
  });

  it('calls handleDownload with the correct parameters on button click', () => {
    const handleDownloadSpy = vi.spyOn(api, 'handleDownload');
    useStore.setState({ stlData: 'some-stl-data', prompt: 'a test prompt' });

    render(<Preview />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3mf' } });
    fireEvent.click(screen.getByText('Download'));

    expect(handleDownloadSpy).toHaveBeenCalledWith('a test prompt', 'some-stl-data', '3mf');
  });

  it('updates the preview color', () => {
    render(<Preview />);
    const colorInput = screen.getByTitle('Change Model Color');
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });
    expect(useStore.getState().previewColor).toBe('#00ff00');
  });
});
