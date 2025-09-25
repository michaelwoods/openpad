import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import '@testing-library/jest-dom';

describe('Header', () => {
  it('renders the title', () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByText('OpenPAD (Open Prompt Aided Design)')).toBeInTheDocument();
  });

  it('calls onShowAbout when the About button is clicked', () => {
    const onShowAbout = vi.fn();
    render(<Header onShowAbout={onShowAbout} />);
    fireEvent.click(screen.getByText('About'));
    expect(onShowAbout).toHaveBeenCalled();
  });
});
