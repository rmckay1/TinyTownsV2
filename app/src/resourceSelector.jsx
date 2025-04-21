import React from 'react';
import { useGameStore } from './store';

const resources = ['wood', 'brick', 'wheat', 'glass', 'stone'];

export function ResourceSelector() {
  const { selectedResource, setSelectedResource } = useGameStore(state => ({
    selectedResource: state.selectedResource,
    setSelectedResource: state.setSelectedResource
  }));

  return (
    <div className="flex justify-center space-x-2 my-4">
      {resources.map((res) => (
        <button
          key={res}
          onClick={() => setSelectedResource(res)}
          className={`px-3 py-1 rounded text-white capitalize ${
            selectedResource === res ? 'bg-black' : 'bg-gray-600'
          }`}
        >
          {res}
        </button>
      ))}
    </div>
  );
}
