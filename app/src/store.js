import create from 'zustand';
import {
  cathedralRec, cottageRec, factoryRec, farmRec,
  chapelRec, tavernRec, theatreRec, wellRec
} from './recipes';

export const gameStore = create((set, get) => ({
  grid: Array(16).fill(null),
  startedAt: new Date().toISOString(),
  selectedResourceIndex: null,
  selectedTiles: [],
  isPlacingBuilding: false,
  activeRecipe: null,
  resourceDeck: [],
  visibleResources: [],
  bannerAchievements: [],
  availableRecipes: [
    wellRec, theatreRec, factoryRec, cottageRec,
    chapelRec, farmRec, tavernRec, cathedralRec
  ],

  resetGrid: () => {
    const resources = ['wood', 'brick', 'wheat', 'glass', 'stone'];
    const fullDeck = resources.flatMap(res => Array(15).fill(res));
    const shuffled = fullDeck
      .map(r => ({ val: r, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(r => r.val);

    set({
      grid: Array(16).fill(null),
      selectedResourceIndex: null,
      selectedTiles: [],
      activeRecipe: null,
      isPlacingBuilding: false,
      resourceDeck: shuffled.slice(3),
      visibleResources: shuffled.slice(0, 3),
      startedAt: new Date().toISOString()
    });
  },

  setSelectedResource: (index) => set({ selectedResourceIndex: index }),

  placeResource: (index) => {
    const { grid, selectedResourceIndex, visibleResources, resourceDeck } = get();
    if (grid[index] || selectedResourceIndex === null) return;

    const selectedResource = visibleResources[selectedResourceIndex];
    const newGrid = [...grid];
    newGrid[index] = selectedResource;

    const newVisible = [...visibleResources];
    newVisible[selectedResourceIndex] = resourceDeck[0];
    const newDeck = [...resourceDeck.slice(1), selectedResource];

    set({
      grid: newGrid,
      selectedResourceIndex: null,
      visibleResources: newVisible,
      resourceDeck: newDeck
    });
  },

  toggleTileSelection: (index) => {
    const state = get();
    const resource = state.grid[index];
    if (!resource || state.isPlacingBuilding) return;

    const alreadySelected = state.selectedTiles.find(t => t.index === index);
    const newSelected = alreadySelected
      ? state.selectedTiles.filter(t => t.index !== index)
      : [...state.selectedTiles, { index, resource }];

    let matchedRecipe = null;
    for (const rec of state.availableRecipes) {
      if (rec.matches(newSelected)) {
        matchedRecipe = rec;
        break;
      }
    }

    set({
      selectedTiles: newSelected,
      activeRecipe: matchedRecipe
    });
  },

  placeBuilding: () => {
    const { activeRecipe, selectedTiles } = get();
    if (!activeRecipe || selectedTiles.length === 0) return;
    set({ isPlacingBuilding: true });
  },

  confirmBuildingPlacement: (buildIndex) => {
    const { selectedTiles, grid, activeRecipe } = get();

    const newGrid = [...grid];
    for (const tile of selectedTiles) {
      newGrid[tile.index] = null;
    }
    newGrid[buildIndex] = activeRecipe.icon;

    set({
      grid: newGrid,
      selectedTiles: [],
      activeRecipe: null,
      isPlacingBuilding: false
    });
  },

  setBannerAchievements: (achievements) => {
    set({ bannerAchievements: achievements });
  }
}));

export const useGameStore = (selector) => gameStore(selector);
