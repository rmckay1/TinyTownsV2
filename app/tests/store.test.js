import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import { gameStore } from '../src/store.js';

describe('gameStore (core logic)', () => {
  beforeEach(() => {
    // Force deterministic shuffling
    vi.spyOn(Math, 'random').mockReturnValue(0);
    gameStore.getState().resetGrid();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('resetGrid initializes grid and decks correctly', () => {
    const state = gameStore.getState();
    expect(state.grid).toHaveLength(16);
    expect(state.grid.every(c => c === null)).toBe(true);

    expect(state.visibleResources).toHaveLength(3);
    // fullDeck = 5 resources × 15 each = 75 cards
    expect(state.resourceDeck).toHaveLength(75 - 3);

    expect(state.selectedResourceIndex).toBeNull();
    expect(state.selectedTiles).toEqual([]);
    expect(state.activeRecipe).toBeNull();
    expect(typeof state.startedAt).toBe('string');
  });

  test('setSelectedResource sets the selected index', () => {
    gameStore.getState().setSelectedResource(2);
    expect(gameStore.getState().selectedResourceIndex).toBe(2);
  });

  test('placeResource places a resource and updates decks', () => {
    const initial = gameStore.getState();
    // choose the first visible card
    gameStore.getState().setSelectedResource(0);
    const firstCard = initial.visibleResources[0];
    const nextUp = initial.resourceDeck[0];

    gameStore.getState().placeResource(5);
    const state = gameStore.getState();

    // resource placed
    expect(state.grid[5]).toBe(firstCard);
    // selection cleared
    expect(state.selectedResourceIndex).toBeNull();
    // visible slot refilled from deck
    expect(state.visibleResources[0]).toBe(nextUp);
    // deck size unchanged
    expect(state.resourceDeck).toHaveLength(75 - 3);
  });
});

// tests/store.test.js
import { gameStore } from '../src/store.js';
import { wellRec } from '../src/recipes.js';

describe('gameStore (building placement flow)', () => {
  it('can select, match, place, and confirm a Well building', () => {
    // 1) Reset and force visible resources to [wood, stone, ...]
    gameStore.getState().resetGrid();
    gameStore.setState({
      visibleResources: ['wood', 'stone', 'brick'],
      resourceDeck: []
    });

    // 2) Pick wood and place it at index 0
    gameStore.getState().setSelectedResource(0);
    gameStore.getState().placeResource(0);
    // 3) Pick stone and place it at index 1
    gameStore.getState().setSelectedResource(1);
    gameStore.getState().placeResource(1);

    // 4) Select those two tiles for matching
    gameStore.getState().toggleTileSelection(0);
    gameStore.getState().toggleTileSelection(1);

    // Should now have wellRec as the active recipe
    expect(gameStore.getState().activeRecipe).toBe(wellRec);

    // 5) Enter placement mode
    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(true);

    // 6) Confirm placement at index 2
    gameStore.getState().confirmBuildingPlacement(2);
    const gridAfter = gameStore.getState().grid;
    expect(gridAfter[2]).toBe(wellRec.icon);

    // 7) After confirmation, selection and mode reset
    expect(gameStore.getState().selectedTiles).toHaveLength(0);
    expect(gameStore.getState().activeRecipe).toBeNull();
    expect(gameStore.getState().isPlacingBuilding).toBe(false);
  });
});

