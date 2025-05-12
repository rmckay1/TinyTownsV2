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
    factoryOverrides
  } = get();

  // Early return if the tile is already filled or no resource is selected
  if (grid[index] !== null || selectedResourceIndex === null) return;

  const selectedResource = visibleResources[selectedResourceIndex];

  // Check if this resource can be overridden by factory
  if (factoryOverrides.includes(selectedResource)) {
    // Set pending factory override and show selection UI
    set({ 
      pendingFactoryOverride: selectedResource,
      selectedTileIndex: index, // Store the grid index where we want to place
      showFactoryAssignPopup: true  // Show the resource selection popup
    });
    return;
  }

  // Otherwise, place the resource normally
  const newGrid = [...grid];
  newGrid[index] = selectedResource;

  // Update the visible resources and move the selected resource to the bottom of the deck
  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];
  const newDeck = [...resourceDeck.slice(1), selectedResource]; // Add resource to bottom of deck
  
  // Update the state
  set({
    grid: newGrid,
    selectedResourceIndex: null,
    visibleResources: newVisible,
    resourceDeck: newDeck
  });
},

finalizeResourcePlacement: (resource, index) => {
  const {
    grid,
    selectedResourceIndex,
    visibleResources,
    resourceDeck
  } = get();

  // Create a new grid with the resource placed
  const newGrid = [...grid];
  newGrid[index] = resource;

  // Update the visible resources and resource deck
  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];  // Get the next visible resource
  const newDeck = [...resourceDeck.slice(1), resource];  // Update the deck by removing the placed resource

  // Update the state
  set({
    grid: newGrid,
    selectedResourceIndex: null,  // Reset the selected resource index
    visibleResources: newVisible,
    resourceDeck: newDeck,
    pendingFactoryOverride: null, // Clear pending override
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

  setBannerAchievements: (achievements) => {
    set({ bannerAchievements: achievements });
  },

resolveFactoryOverride: (overrideResource) => {
  const {
    grid,
    selectedTileIndex,
    selectedResourceIndex,
    visibleResources,
    resourceDeck,
    pendingFactoryOverride
  } = get();

  if (!pendingFactoryOverride || selectedTileIndex === null || selectedResourceIndex === null) return;

  const newGrid = [...grid];
  newGrid[selectedTileIndex] = overrideResource;

  const newVisible = [...visibleResources];
  newVisible[selectedResourceIndex] = resourceDeck[0];

  const newDeck = [...resourceDeck.slice(1), pendingFactoryOverride];

  set({
    grid: newGrid,
    selectedTileIndex: null,
    selectedResourceIndex: null,
    visibleResources: newVisible,
    resourceDeck: newDeck,
    pendingFactoryOverride: null,
    showFactoryAssignPopup: false
  });
}



}));
