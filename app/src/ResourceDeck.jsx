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
  const { visibleResources, selectedResourceIndex, setSelectedResource, factoryOverrides } = useGameStore(state => ({
    visibleResources: state.visibleResources,
    selectedResourceIndex: state.selectedResourceIndex,
    setSelectedResource: state.setSelectedResource,
    factoryOverrides: state.factoryOverrides // Make sure to get the factoryOverrides
  }));

  return (
    <div className="flex justify-center gap-2 mb-4">
      {visibleResources.map((res, i) => {
        const isSelected = selectedResourceIndex === i;
        const isFactoryOverride = factoryOverrides.includes(res); // Check if the resource is overridden by a Factory

        return (
          <button
            key={i}
            onClick={() => setSelectedResource(i)}
            className={`
              w-12 h-12 border-2 rounded transition-all duration-200
              ${RESOURCE_COLORS[res]}
              ${isSelected ? 'ring-4 ring-black scale-105' : 'opacity-90'}
              ${isFactoryOverride ? 'ring-4 ring-yellow-400' : ''} // Add ring for factory overrides
            `}
          />
        );
      })}
    </div>
  );
}
