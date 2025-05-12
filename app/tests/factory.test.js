// tests/factory.test.js
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---- Store tests ----
import { useGameStore } from '../src/store.js';
import { factoryRec } from '../src/recipes.js';

describe('Factory logic in the store', () => {
  beforeEach(() => {
    // reset all relevant pieces of state
    useGameStore.setState({
      grid: Array(16).fill(null),
      selectedTiles: [],
      activeRecipe: null,
      isPlacingBuilding: false,
      factoryOverrides: [],
      factoryBuildingPlaced: false,
      showFactoryAssignPopup: false,
      pendingFactoryOverride: null,
      selectedResourceIndex: null,
      visibleResources: [],
      resourceDeck: []
    });
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('confirmBuildingPlacement on Factory shows the assign popup', () => {
    // place a Factory building at index 7
    useGameStore.setState({
      selectedTiles: [{ index: 7 }],
      activeRecipe: factoryRec
    });
    useGameStore.getState().placeBuilding();
    useGameStore.getState().confirmBuildingPlacement(7);

    const s = useGameStore.getState();
    expect(s.grid[7]).toBe(factoryRec.icon);
    expect(s.factoryBuildingPlaced).toBe(true);
    expect(s.showFactoryAssignPopup).toBe(true);
  });

  it('assignFactoryResource adds an override and hides the popup', () => {
    // simulate after building factory
    useGameStore.setState({
      factoryBuildingPlaced: true,
      showFactoryAssignPopup: true
    });
    useGameStore.getState().assignFactoryResource('glass');

    const s = useGameStore.getState();
    expect(s.factoryOverrides).toContain('glass');
    expect(s.factoryBuildingPlaced).toBe(false);
    expect(s.showFactoryAssignPopup).toBe(false);
  });

  it('finalizeResourcePlacement places the chosen resource correctly', () => {
    // prepare a small deck
    useGameStore.setState({
      grid: Array(16).fill(null),
      selectedResourceIndex: 0,
      visibleResources: ['brick'],
      resourceDeck: ['stone', 'wood'],
      pendingFactoryOverride: 'brick'
    });
    useGameStore.getState().finalizeResourcePlacement('glass', 3);

    const s = useGameStore.getState();
    expect(s.grid[3]).toBe('glass');
    // visibleResources[0] should now be the next-up deck item
    expect(s.visibleResources[0]).toBe('stone');
    expect(s.pendingFactoryOverride).toBeNull();
  });

  it('resolveFactoryOverride replaces the pending tile and triggers animation', () => {
    // prepare state for override
    useGameStore.setState({
      grid: Array(16).fill(null),
      selectedTileIndex: 5,
      selectedResourceIndex: 0,
      visibleResources: ['wheat'],
      resourceDeck: ['stone', 'brick'],
      pendingFactoryOverride: 'wheat',
      showFactoryAssignPopup: true
    });
    useGameStore.getState().resolveFactoryOverride('glass');

    let s = useGameStore.getState();
    // grid updated
    expect(s.grid[5]).toBe('glass');
    // replacement in visible
    expect(s.visibleResources[0]).toBe('stone');
    // deck updated: drop 'stone', append pendingOverride ('wheat')
    expect(s.resourceDeck).toEqual(['brick', 'wheat']);
    expect(s.pendingFactoryOverride).toBeNull();
    expect(s.showFactoryAssignPopup).toBe(false);
    expect(s.animationTrigger).toBe('factory-override');

    // after timeout, animationTrigger resets
    vi.advanceTimersByTime(1000);
    s = useGameStore.getState();
    expect(s.animationTrigger).toBeNull();
  });
});

