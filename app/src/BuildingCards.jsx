import React from 'react';
import { useGameStore } from './store';

const RESOURCE_COLORS = {
  wood: 'bg-green-600',
  brick: 'bg-red-500',
  wheat: 'bg-yellow-400',
  glass: 'bg-blue-300',
  stone: 'bg-gray-500'
};

export function BuildingCards() {
  const {
    availableRecipes,
    activeRecipe,
    placeBuilding,
    isPlacingBuilding
  } = useGameStore(state => ({
    availableRecipes: state.availableRecipes,
    activeRecipe: state.activeRecipe,
    placeBuilding: state.placeBuilding,
    isPlacingBuilding: state.isPlacingBuilding
  }));

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {availableRecipes.map((rec) => {
        const pattern = rec.patterns[0];
        const numCols = pattern[0].length;

        return (
          <div
            key={rec.name}
            className={`w-36 h-60 border rounded-lg shadow-md p-2 bg-white 
              flex flex-col justify-start items-center border-gray-300 ${
                activeRecipe?.name === rec.name ? 'bg-yellow-100 border-yellow-500' : ''
              }`}
          >
            {/* Building Name + Icon */}
            <div className="w-full text-center mb-2">
              <div className="text-sm font-bold text-gray-800">{rec.name}</div>
              <div className="text-2xl">{rec.icon}</div>
            </div>

            {/* Recipe Grid */}
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
            >
              {pattern.flat().map((cell, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-sm border 
                    ${cell ? RESOURCE_COLORS[cell] : 'bg-gray-200 border-gray-300'}`}
                />
              ))}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-2 mt-auto">
              {{
                Well:      `1💎 for each adjacent 🏠.`,
                Theatre:   `1💎 for each other unique building type in the same row or column as 🎭.`,
                Factory:   `When constructed, place 1 of the 5 resources on 🏭.`,
                Cottage:   `3💎 if this building is fed.`,
                Chapel:    `1💎 for each fed 🏠.`,
                Farm:      `Feeds 4 🏠 buildings anywhere in your town.`,
                Tavern:    `💎 based on your constructed 🍺.`,
                Cathedral: `2💎. Empty squares in your town are worth 0💎 (instead of -1💎).`
              }[rec.name]}
            </p>
            {rec.name === 'Tavern' && (
            <table className="text-xs text-gray-600 text-center mb-2 w-full border-collapse">
              <thead>
                <tr>🍺
                  {[1, 2, 4, 4, 5].map((count, i) => (
                    <th key={i} className="border px-1">{count}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>💎
                  {[2, 4, 9, 14, 20].map((pts, i) => (
                    <td key={i} className="border px-1">{pts}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}

            {/* Action */}
            {activeRecipe?.name === rec.name && !isPlacingBuilding && (
              <button
                className="mt-2 text-xs px-2 py-1 bg-blue-500 text-white rounded w-full"
                onClick={() => placeBuilding(rec.name)}
              >
                Build {rec.icon}
              </button>
            )}
            {activeRecipe?.name === rec.name && isPlacingBuilding && (
              <div className="mt-2 text-xs text-blue-600 text-center">
                Select a tile to place it
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
