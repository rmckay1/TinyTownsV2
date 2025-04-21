import React from 'react';
import { useGameStore } from './store';

const RESOURCE_COLORS = {
  wood: 'bg-green-600',
  brick: 'bg-red-500',
  wheat: 'bg-yellow-400',
  glass: 'bg-blue-300',
  stone: 'bg-gray-500'
};

export function ResourceDeck() {
  const { visibleResources, selectedResource, setSelectedResource } = useGameStore(state => ({
    visibleResources: state.visibleResources,
    selectedResource: state.selectedResource,
    setSelectedResource: state.setSelectedResource
  }));

  return (
    <div className="flex justify-center gap-2 mb-4">
      {visibleResources.map((res, i) => (
        <button
          key={i}
          onClick={() => setSelectedResource(i)}
          className={`w-12 h-12 border-2 rounded ${
            RESOURCE_COLORS[res]
          } ${selectedResource === res ? 'ring-4 ring-black' : ''}`}
        />
      ))}
    </div>
  );
}
