import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Undo the UI-suite mock so we get the real Zustand store
vi.unmock('../src/store');
import { useGameStore } from '../src/store.js';
import { wellRec, cathedralRec, factoryRec } from '../src/recipes.js';

// Helper to reset the minimal state
function resetMinimal() {
  useGameStore.setState({
    grid: Array(16).fill(null),
    selectedTiles: [],
    activeRecipe: null,
    isPlacingBuilding: false,
    factoryOverrides: [],
    showFactoryAssignPopup: false,
    factoryBuildingPlaced: false,
    pendingFactoryOverride: null
  });
}

describe('gameStore (core logic)', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    useGameStore.getState().resetGrid();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resetGrid initializes grid and decks correctly', () => {
    const state = useGameStore.getState();
    expect(state.grid).toHaveLength(16);
    expect(state.grid.every(c => c === null)).toBe(true);
    expect(state.visibleResources).toHaveLength(3);
    expect(state.resourceDeck).toHaveLength(12); // 5 resources × 3 copies minus 3 drawn
    expect(state.selectedResourceIndex).toBeNull();
    expect(state.selectedTiles).toEqual([]);
    expect(state.activeRecipe).toBeNull();
    expect(typeof state.startedAt).toBe('string');
  });

  it('setSelectedResource sets the selected index', () => {
    useGameStore.getState().setSelectedResource(2);
    expect(useGameStore.getState().selectedResourceIndex).toBe(2);
  });

  it('placeResource places a resource and updates decks', () => {
    const initial = useGameStore.getState();
    useGameStore.getState().setSelectedResource(0);
    const firstCard = initial.visibleResources[0];
    const nextUp = initial.resourceDeck[0];

    useGameStore.getState().placeResource(5);
    const state = useGameStore.getState();
    expect(state.grid[5]).toBe(firstCard);
    expect(state.selectedResourceIndex).toBeNull();
    expect(state.visibleResources[0]).toBe(nextUp);
    expect(state.resourceDeck).toHaveLength(initial.resourceDeck.length);
  });
});

describe('gameStore (building placement flow)', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    useGameStore.getState().resetGrid();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can select, match, place, and confirm a Well building', () => {
    useGameStore.setState({ visibleResources: ['wood','stone','brick'], resourceDeck: [] });
    useGameStore.getState().setSelectedResource(0);
    useGameStore.getState().placeResource(0);
    useGameStore.getState().setSelectedResource(1);
    useGameStore.getState().placeResource(1);
    useGameStore.getState().toggleTileSelection(0);
    useGameStore.getState().toggleTileSelection(1);
    expect(useGameStore.getState().activeRecipe).toBe(wellRec);

    useGameStore.getState().placeBuilding();
    expect(useGameStore.getState().isPlacingBuilding).toBe(true);

    useGameStore.getState().confirmBuildingPlacement(2);
    expect(useGameStore.getState().grid[2]).toBe(wellRec.icon);
    expect(useGameStore.getState().selectedTiles).toHaveLength(0);
    expect(useGameStore.getState().activeRecipe).toBeNull();
    expect(useGameStore.getState().isPlacingBuilding).toBe(false);
  });
});

describe('gameStore (Cathedral restriction)', () => {
  beforeEach(() => { resetMinimal(); });

  it('allows placing a Cathedral once', () => {
    useGameStore.setState({ selectedTiles: [{ index: 3 }], activeRecipe: cathedralRec });
    useGameStore.getState().placeBuilding();
    expect(useGameStore.getState().isPlacingBuilding).toBe(true);

    useGameStore.getState().confirmBuildingPlacement(3);
    expect(useGameStore.getState().grid[3]).toBe(cathedralRec.icon);
    expect(useGameStore.getState().isPlacingBuilding).toBe(false);
  });

  it('blocks placing a second Cathedral', () => {
    useGameStore.setState({ selectedTiles: [{ index: 4 }], activeRecipe: cathedralRec });
    useGameStore.getState().placeBuilding();
    useGameStore.getState().confirmBuildingPlacement(4);
    expect(useGameStore.getState().grid[4]).toBe(cathedralRec.icon);

    useGameStore.setState({ selectedTiles: [{ index: 5 }], activeRecipe: cathedralRec, isPlacingBuilding: false });
    useGameStore.getState().placeBuilding();
    expect(useGameStore.getState().isPlacingBuilding).toBe(false);
  });

  it('allows placing other buildings multiple times', () => {
    useGameStore.setState({ selectedTiles: [{ index: 6 }], activeRecipe: factoryRec });
    useGameStore.getState().placeBuilding();
    expect(useGameStore.getState().isPlacingBuilding).toBe(true);

    useGameStore.getState().confirmBuildingPlacement(6);
    useGameStore.setState({ selectedTiles: [{ index: 7 }], activeRecipe: factoryRec, isPlacingBuilding: false });
    useGameStore.getState().placeBuilding();
    expect(useGameStore.getState().isPlacingBuilding).toBe(true);
  });
});
