import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Viewer from './Viewer';
import '@testing-library/jest-dom';

describe('Viewer', () => {
  it('renders the viewer component', () => {
    render(<Viewer stl={null} format="stl" />);
    // The canvas is mocked, so we can't assert on its content.
    // We can only check that the component renders without crashing.
  });
});
