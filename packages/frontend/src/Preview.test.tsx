import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Preview from './Preview';
import '@testing-library/jest-dom';

// Mock Viewer component
vi.mock('./Viewer', () => ({
  default: vi.fn(() => <div data-testid="viewer-mock" />),
}));

describe('Preview', () => {
  const mockProps = {
    stlData: 'base64stl',
    handleDownloadStl: vi.fn(),
  };

  it('renders the 3D preview title', () => {
    render(<Preview {...mockProps} />);
    expect(screen.getByText('3. 3D Preview')).toBeInTheDocument();
  });

  it('calls handleDownloadStl when Download button is clicked', () => {
    render(<Preview {...mockProps} />);
    fireEvent.click(screen.getByText('Download'));
    expect(mockProps.handleDownloadStl).toHaveBeenCalled();
  });

  it('disables Download button when no STL data is available', () => {
    render(<Preview {...mockProps} stlData={null} />);
    expect(screen.getByText('Download')).toBeDisabled();
  });

  it('renders the Viewer component', () => {
    render(<Preview {...mockProps} />);
    expect(screen.getByTestId('viewer-mock')).toBeInTheDocument();
  });
});
