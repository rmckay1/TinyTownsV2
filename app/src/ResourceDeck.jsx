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
  const { visibleResources, selectedResourceIndex, setSelectedResource } = useGameStore(state => ({
    visibleResources: state.visibleResources,
    selectedResourceIndex: state.selectedResourceIndex,
    setSelectedResource: state.setSelectedResource
  }));

  return (
    <div className="flex justify-center gap-2 mb-4">
      {visibleResources.map((res, i) => {
        const isSelected = selectedResourceIndex === i;
        return (
          <button
            key={i}
            onClick={() => setSelectedResource(i)}
            className={`w-14 h-14 border-4 rounded transition-all duration-200
              ${RESOURCE_COLORS[res]} 
              ${isSelected ? 'ring-4 ring-black scale-105 shadow-md' : 'opacity-90'}
            `}
          />
        );
      })}
    </div>
  );
}
