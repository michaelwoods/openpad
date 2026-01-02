import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import '@testing-library/jest-dom';

describe('Header', () => {
  it('renders the title', () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByText('OpenPAD (Open Prompt Aided Design)')).toBeInTheDocument();
  });

  it('renders the "About" button', () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
  });

  it('calls onShowAbout when the "About" button is clicked', () => {
    const mockOnShowAbout = vi.fn();
    render(<Header onShowAbout={mockOnShowAbout} />);
    fireEvent.click(screen.getByRole('button', { name: 'About' }));
    expect(mockOnShowAbout).toHaveBeenCalledTimes(1);
  });
});
