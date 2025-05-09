import React, { useEffect, useState } from 'react';

const achievementDetails = {
  perfectTown: { name: "Perfect Town", icon: "🏡", desc: "Fill all 16 tiles" },
  masterBuilder: { name: "Master Builder", icon: "🏗️", desc: "Score 50+ points" },
  varietyPack: { name: "Variety Pack", icon: "🎲", desc: "Place 3+ building types" },
  speedy: { name: "Speed Builder", icon: "⚡", desc: "Finish under 3 minutes" },
  farmLife: { name: "Farm Life", icon: "🌾", desc: "Place 3+ farms" }
};

const ALL_IDS = Object.keys(achievementDetails);

export default function PlayerAchievements() {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = window.firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      const res = await fetch("http://localhost:3000/player-data", {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const data = await res.json();
      setUnlocked(data.achievements || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="font-bold text-2xl mb-4 text-center">Your Achievements</h2>

      {loading ? (
        <div className="text-gray-500 text-center text-sm">Loading achievements...</div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {ALL_IDS.map(id => {
            const detail = achievementDetails[id];
            const isUnlocked = unlocked.includes(id);

            return (
              <div
                key={id}
                className={`
                  relative group w-48 p-4 rounded-lg text-center transition
                  ${isUnlocked 
                    ? 'bg-white border-2 border-yellow-400 text-gray-800 shadow-md hover:scale-105' 
                    : 'bg-gray-100 border border-gray-300 text-gray-400 opacity-70'}
                `}
              >
                <div className="text-3xl mb-2">
                  {isUnlocked ? detail.icon : "🔒"}
                </div>
                <div className={`font-bold text-md ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {detail.name}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-10 w-44">
                  {detail.desc}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
