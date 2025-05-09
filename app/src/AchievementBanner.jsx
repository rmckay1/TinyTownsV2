import React from 'react';

const achievementLabels = {
  perfectTown: "🏡 Perfect Town",
  masterBuilder: "🏗️ Master Builder",
  varietyPack: "🎲 Variety Pack",
  speedy: "⚡ Speed Builder",
  farmLife: "🌾 Farm Life"
};

export default function AchievementBanner({ unlocked }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 border border-yellow-500 px-6 py-2 rounded shadow z-50">
      <div className="font-bold text-sm mb-1">Unlocked Achievements:</div>
      <ul className="text-sm">
        {unlocked.map(id => (
          <li key={id}>{achievementLabels[id] || id}</li>
        ))}
      </ul>
    </div>
  );
}
