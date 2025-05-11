import { beforeEach, afterEach, describe, expect, test, it, vi } from 'vitest';
import { gameStore } from '../src/store.js';
import { wellRec, cathedralRec, factoryRec } from '../src/recipes.js';

// Helper to reset the store to default minimal state
function resetMinimal() {
  gameStore.setState({
    grid: Array(16).fill(null),
    selectedTiles: [],
    activeRecipe: null,
    isPlacingBuilding: false,
  });
}

describe('gameStore (core logic)', () => {
  beforeEach(() => {
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
    gameStore.getState().setSelectedResource(0);
    const firstCard = initial.visibleResources[0];
    const nextUp = initial.resourceDeck[0];

    gameStore.getState().placeResource(5);
    const state = gameStore.getState();

    expect(state.grid[5]).toBe(firstCard);
    expect(state.selectedResourceIndex).toBeNull();
    expect(state.visibleResources[0]).toBe(nextUp);
    expect(state.resourceDeck).toHaveLength(75 - 3);
  });
});

// Building placement flow
describe('gameStore (building placement flow)', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    gameStore.getState().resetGrid();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can select, match, place, and confirm a Well building', () => {
    gameStore.getState().resetGrid();
    gameStore.setState({ visibleResources: ['wood', 'stone', 'brick'], resourceDeck: [] });

    gameStore.getState().setSelectedResource(0);
    gameStore.getState().placeResource(0);
    gameStore.getState().setSelectedResource(1);
    gameStore.getState().placeResource(1);

    gameStore.getState().toggleTileSelection(0);
    gameStore.getState().toggleTileSelection(1);
    expect(gameStore.getState().activeRecipe).toBe(wellRec);

    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(true);

    gameStore.getState().confirmBuildingPlacement(2);
    const gridAfter = gameStore.getState().grid;
    expect(gridAfter[2]).toBe(wellRec.icon);

    expect(gameStore.getState().selectedTiles).toHaveLength(0);
    expect(gameStore.getState().activeRecipe).toBeNull();
    expect(gameStore.getState().isPlacingBuilding).toBe(false);
  });
});

// Cathedral restriction tests
describe('gameStore (Cathedral restriction)', () => {
  beforeEach(() => {
    resetMinimal();
  });

  it('allows placing a Cathedral once', () => {
    gameStore.setState({ selectedTiles: [{ index: 3 }], activeRecipe: cathedralRec });
    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(true);

    gameStore.getState().confirmBuildingPlacement(3);
    expect(gameStore.getState().grid[3]).toBe(cathedralRec.icon);
    expect(gameStore.getState().isPlacingBuilding).toBe(false);
  });

  it('blocks placing a second Cathedral', () => {
    // First placement
    gameStore.setState({ selectedTiles: [{ index: 4 }], activeRecipe: cathedralRec });
    gameStore.getState().placeBuilding();
    gameStore.getState().confirmBuildingPlacement(4);
    expect(gameStore.getState().grid[4]).toBe(cathedralRec.icon);

    // Attempt second
    gameStore.setState({ selectedTiles: [{ index: 5 }], activeRecipe: cathedralRec, isPlacingBuilding: false });
    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(false);
  });

  it('allows placing other buildings multiple times', () => {
    gameStore.setState({ selectedTiles: [{ index: 6 }], activeRecipe: factoryRec });
    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(true);

    gameStore.getState().confirmBuildingPlacement(6);
    expect(gameStore.getState().grid[6]).toBe(factoryRec.icon);

    // Reset
    gameStore.setState({ selectedTiles: [{ index: 7 }], activeRecipe: factoryRec, isPlacingBuilding: false });
    gameStore.getState().placeBuilding();
    expect(gameStore.getState().isPlacingBuilding).toBe(true);
  });
});
