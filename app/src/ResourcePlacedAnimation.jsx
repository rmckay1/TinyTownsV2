import React from 'react';
import { useGameStore } from './store';

export function ResourcePlacedAnimation() {
  const animationTrigger = useGameStore(s => s.animationTrigger);

  if (animationTrigger !== 'factory-override') return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl text-2xl font-semibold animate-bounce">
        Resource Substituted!
      </div>
    </div>
  );
}