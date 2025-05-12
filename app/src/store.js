import create from 'zustand';
import {
  cathedralRec, cottageRec, factoryRec, farmRec,
  chapelRec, tavernRec, theatreRec, wellRec
} from './recipes';

export const useGameStore = create((set, get) => ({
  grid: Array(16).fill(null),
  factoryOverrides: [], // stored resource types that trigger substitution
  factoryBuildingPlaced: false, // triggers the popup for assigning override
  pendingOverrideResource: null, // used for substitution prompt
  selectedResourceIndex: null,
  selectedTiles: [],
  showFactoryAssignPopup: false,
  isPlacingBuilding: false,
  activeRecipe: null,
  resourceDeck: [],
  visibleResources: [],
  bannerAchievements: [],
  startedAt: new Date().toISOString(),
  availableRecipes: [
    wellRec, theatreRec, factoryRec, cottageRec,
    chapelRec, farmRec, tavernRec, cathedralRec
  ],

  resetGrid: () => {
    const resources = ['wood', 'brick', 'wheat', 'glass', 'stone'];
    const fullDeck = resources.flatMap(res => Array(3).fill(res));
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
      factoryOverrides: [],
      showFactoryAssignPopup: false,
      pendingFactoryOverride: null, // holds the selectedResource if override is available
      pendingOverrideResource: null,
      startedAt: new Date().toISOString()
    });
  },

  setSelectedResource: (index) => set({ selectedResourceIndex: index }),

placeResource: (index) => {
  const {
    grid,
    selectedResourceIndex,
    visibleResources,
    resourceDeck,
    factoryOverrides,
    pendingFactoryOverride // add pendingOverride check
  } = get();

  if (grid[index] || selectedResourceIndex === null) return;

  const selectedResource = visibleResources[selectedResourceIndex];

  // If there's a pending factory override, handle the substitution
  if (factoryOverrides.includes(selectedResource) && !pendingFactoryOverride) {
    set({ pendingFactoryOverride: selectedResource });
    return;
  }

  // If there's a pending override, finalize the resource placement with the override
  if (pendingFactoryOverride) {
    get().resolveFactoryOverride(selectedResource);  // Resolve the override
    return; // We don't need to reset the index here yet, the resolve will handle it
  }

  // Otherwise, place the resource normally
  get().finalizeResourcePlacement(selectedResource, index);
},



finalizeResourcePlacement: (resource, index) => {
  const {
    grid,
    selectedResourceIndex,
    visibleResources,
    resourceDeck
  } = get();

  const newGrid = [...grid];
  newGrid[index] = resource;

  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];
  const newDeck = [...resourceDeck.slice(1), resource];

  set({
    grid: newGrid,
    selectedResourceIndex: null,  // Clear the selected resource index
    visibleResources: newVisible,
    resourceDeck: newDeck,
    pendingFactoryOverride: null // Clear override mode
  });
},


resolveFactoryOverride: (overrideResource) => {
  const {
    grid,
    selectedResourceIndex,
    visibleResources,
    resourceDeck,
    pendingFactoryOverride
  } = get();

  if (!pendingFactoryOverride || selectedResourceIndex === null) return;

  const selectedResource = overrideResource;

  const newGrid = [...grid];
  newGrid[selectedResourceIndex] = selectedResource;

  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];
  const newDeck = [...resourceDeck.slice(1), pendingFactoryOverride];

  set({
    grid: newGrid,
    selectedResourceIndex: null,  // Clear the selected resource index
    visibleResources: newVisible,
    resourceDeck: newDeck,
    pendingFactoryOverride: null // Clear the pending override
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
    const { activeRecipe, selectedTiles, grid } = get();
    if (activeRecipe?.name === 'Cathedral' && grid.includes(activeRecipe.icon)) return;
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

  // trigger popup after building Factory
  if (activeRecipe?.name === 'Factory') {
    console.log("✅ Factory built! Showing popup.");
  set({ factoryBuildingPlaced: true, showFactoryAssignPopup: true });
  }

  set({
    grid: newGrid,
    selectedTiles: [],
    activeRecipe: null,
    isPlacingBuilding: false
  });
},

assignFactoryResource: (resource) =>
  set((state) => ({
    factoryOverrides: [...state.factoryOverrides, resource],
    showFactoryAssignPopup: false, // Hide popup once resource is assigned
    factoryBuildingPlaced: false, // Reset the factory placement flag
  })),

  confirmOverrideSubstitution: (newResource) => {
    const index = get().selectedResourceIndex;
    if (index !== null) {
      get().finalizeResourcePlacement(newResource, index);
    }
  },

  setBannerAchievements: (achievements) => {
    set({ bannerAchievements: achievements });
  },

  resolveFactoryOverride: (overrideResource) => {
  const {
    grid,
    selectedResourceIndex,
    visibleResources,
    resourceDeck,
    pendingFactoryOverride
  } = get();

  if (!pendingFactoryOverride || selectedResourceIndex === null) return;

  const selectedResource = overrideResource;

  const newGrid = [...grid];
  newGrid[selectedResourceIndex] = selectedResource;

  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];
  const newDeck = [...resourceDeck.slice(1), pendingFactoryOverride];

  set({
    grid: newGrid,
    selectedResourceIndex: null,
    visibleResources: newVisible,
    resourceDeck: newDeck,
    pendingFactoryOverride: null
  });
}

}));
