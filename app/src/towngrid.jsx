import React from 'react';
import { useGameStore } from './store';

const RESOURCE_COLORS = {
  wood: 'bg-green-600',
  brick: 'bg-red-500',
  wheat: 'bg-yellow-400',
  glass: 'bg-blue-300',
  stone: 'bg-gray-500'
};

export function TownGrid() {
  const {
    grid,
    selectedTiles,
    placeResource,
    toggleTileSelection,
    isPlacingBuilding,
    confirmBuildingPlacement
  } = useGameStore(state => ({
    grid: state.grid,
    selectedTiles: state.selectedTiles,
    placeResource: state.placeResource,
    toggleTileSelection: state.toggleTileSelection,
    isPlacingBuilding: state.isPlacingBuilding,
    confirmBuildingPlacement: state.confirmBuildingPlacement
  }));

  const isSelected = (i) => selectedTiles.some(t => t.index === i);

  const handleClick = (i) => {
    if (isPlacingBuilding) {
      if (isSelected(i)) confirmBuildingPlacement(i);
    } else {
      if (grid[i]) toggleTileSelection(i);
      else placeResource(i);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-4 gap-2">
        {grid.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`
              w-16 h-16 border flex items-center justify-center
              ${RESOURCE_COLORS[tile] || 'bg-gray-100'}
              ${isSelected(i) ? 'ring-4 ring-yellow-400' : ''}
            `}
          >
            {!RESOURCE_COLORS[tile] ? tile : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
