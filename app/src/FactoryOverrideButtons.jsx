import React from 'react';
import { useGameStore } from './store';

const allResources = ['wood', 'brick', 'glass', 'wheat', 'stone'];

export function FactoryResourceSelection() {
  const assignFactoryResource = useGameStore(s => s.assignFactoryResource);
  const factoryBuildingPlaced = useGameStore(s => s.factoryBuildingPlaced);

  if (!factoryBuildingPlaced) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">Assign a Resource to the Factory</h2>
        <p className="mb-2">Choose one resource. When it's drawn later, you can override it.</p>
        <div className="grid grid-cols-3 gap-2">
          {allResources.map(res => (
            <button
              key={res}
              onClick={() => assignFactoryResource(res)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              {res}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
