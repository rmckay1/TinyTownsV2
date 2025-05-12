// tests/resourceSelector.test.jsx
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the Zustand store before importing the component
vi.mock('../src/store', () => ({
  useGameStore: vi.fn()
}));
import { useGameStore } from '../src/store.js';
import { ResourceSelector } from '../src/resourceSelector.jsx';

describe('ResourceSelector component', () => {
  const resources = ['wood', 'brick', 'wheat', 'glass', 'stone'];
  let mockState;

  beforeEach(() => {
    // default mock state: 'wood' is selected
    mockState = {
      selectedResource: 'wood',
      setSelectedResource: vi.fn()
    };
    useGameStore.mockImplementation(selector => selector(mockState));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });


  it('calls setSelectedResource with the resource name when clicked', () => {
    render(<ResourceSelector />);
    const buttons = screen.getAllByRole('button');
    // click the third button ('wheat')
    fireEvent.click(buttons[2]);
    expect(mockState.setSelectedResource).toHaveBeenCalledWith('wheat');
  });
});
