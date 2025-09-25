import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(() => {
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'canvas-mock');
    return div;
  }),
  useThree: vi.fn(() => ({})),
  extend: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});