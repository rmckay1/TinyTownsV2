// src/PlayerAchievements.jsx
import React, { useEffect, useState } from 'react';

const achievementDetails = {
  perfectTown: { name: "Perfect Town", icon: "🏡", desc: "Fill all 16 tiles" },
  masterBuilder: { name: "Master Builder", icon: "🏗️", desc: "Score 50+ points" },
  varietyPack: { name: "Variety Pack", icon: "🎲", desc: "Place 3+ building types" },
  speedy: { name: "Speed Builder", icon: "⚡", desc: "Finish under 3 minutes" },
  farmLife: { name: "Farm Life", icon: "🌾", desc: "Place 3+ farms" }
};

export default function PlayerAchievements() {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    const unsubscribe = window.firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUnlocked([]);
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch("http://localhost:3000/player-data", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      setUnlocked(data.achievements || []);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Your Achievements</h2>
      <div className="grid grid-cols-2 gap-2 max-w-max mx-auto">
        {Object.entries(achievementDetails).map(([id, detail]) => {
          const isUnlocked = unlocked.includes(id);
          return (
            <div
              key={id}
              className="relative group w-24 h-24"
            >
              <div className={`
                rounded-lg overflow-hidden w-full h-full flex flex-col items-center justify-center
                ${isUnlocked
                  ? 'bg-white border-2 border-yellow-400 text-gray-800 shadow'
                  : 'bg-gray-700 border border-gray-600 text-gray-400'}
              `}>
                <div className="text-3xl">{isUnlocked ? detail.icon : '🔒'}</div>
                <div className="mt-1 text-sm text-center px-1">{detail.name}</div>
              </div>

              {/* tooltip: wider fixed width so it doesn’t need to be so tall */}
              <div className="
                absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2
                opacity-0 group-hover:opacity-100 transition-opacity
                pointer-events-none bg-black text-white text-xs px-3 py-1
                rounded z-50 whitespace-normal w-32 text-center
              ">
                {detail.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
