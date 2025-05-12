// src/AchievementBanner.jsx
import React, { useState, useEffect, useRef } from 'react';

const achievementLabels = {
  perfectTown: "🏡 Perfect Town",
  masterBuilder: "🏗️ Master Builder",
  varietyPack: "🎲 Variety Pack",
  speedy: "⚡ Speed Builder",
  farmLife: "🌾 Farm Life",
  wellFed: "🍽️ Well Fed",
  pious: "🛐 Pious",
  hammered: "🔨 Hammered"
};

export default function AchievementBanner({ unlocked }) {
  const [visible, setVisible] = useState(false);
  const [toShow, setToShow] = useState([]);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (unlocked && unlocked.length > 0) {
      setToShow(unlocked);
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 3000);
    }
    return () => clearTimeout(hideTimer.current);
  }, [unlocked]);

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2
        bg-yellow-300 text-black border-4 border-yellow-500
        px-8 py-3 rounded-xl shadow-2xl z-50
        transition-opacity duration-700 ease-in-out
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="font-extrabold text-lg mb-2 uppercase tracking-wide">
        Achievement Unlocked!
      </div>
      <ul className="text-base">
        {toShow.map(id => (
          <li key={id} className="mb-1">{achievementLabels[id]}</li>
        ))}
      </ul>
    </div>
  );
}
