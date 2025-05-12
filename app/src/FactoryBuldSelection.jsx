// src/FactoryBuildSelection.jsx
import React from 'react';
import { useGameStore } from './store';

const RESOURCES = ['wood', 'brick', 'glass', 'wheat', 'stone'];

export function FactoryBuildSelection() {
  const assignFactoryResource = useGameStore(s => s.assignFactoryResource);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Factory built!</h2>
        <p className="mb-4 text-sm text-gray-600">
          Choose a resource that this Factory will override when drawn.
          <br />
          You cannot change this later.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {RESOURCES.map((res) => (
            <button
              key={res}
              onClick={() => assignFactoryResource(res)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {res}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
