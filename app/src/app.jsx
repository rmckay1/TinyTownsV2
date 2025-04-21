import React from 'react';
import { TownGrid } from './towngrid';
import { ResourceDeck } from './ResourceDeck';
import { BuildingCards } from './BuildingCards';
import { useGameStore } from './store';

export function App() {
  const resetGrid = useGameStore(state => state.resetGrid);

  return (
    <div className="text-center py-6">
      <h1 className="text-3xl font-bold mb-4">Tiny Towns</h1>
      <ResourceDeck />
      <TownGrid />
      <BuildingCards />
      <button
        onClick={resetGrid}
        className="mt-6 bg-green-500 px-4 py-2 rounded"
      >
        Restart
      </button>
    </div>
  );
}
