// src/PlayerProfilePopup.jsx
import React, { useEffect, useState } from 'react';

// Define achievement icons and names
const achievementDetails = {
  perfectTown:   { icon: "🏡", name: "Perfect Town" },
  masterBuilder: { icon: "🏗️", name: "Master Builder" },
  varietyPack:   { icon: "🎲", name: "Variety Pack" },
  speedy:        { icon: "⚡", name: "Speed Builder" },
  farmLife:      { icon: "🌾", name: "Farm Life" }
};

export function PlayerProfilePopup({ onClose }) {
  const [data, setData] = useState({ achievements: [], highestScore: null });

  useEffect(() => {
    async function fetchData() {
      const idToken = await window.firebaseAuth.currentUser.getIdToken();
      const res = await fetch("http://localhost:3000/player-data", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const json = await res.json();
      setData({
        achievements: json.achievements || [],
        highestScore: json.highestScore ?? 'N/A'
      });
    }
    fetchData();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-xs text-center text-black">
        <h2 className="text-xl font-bold mb-4">Player Profile</h2>
        <p className="mb-2"><strong>Highest Score:</strong> {data.highestScore}</p>
        <p className="mb-2 font-semibold">Achievements:</p>
        <div className="flex flex-col gap-2 mb-4">
          {data.achievements.length > 0 ? (
            data.achievements.map(id => {
              const detail = achievementDetails[id] || {};
              return (
                <div
                  key={id}
                  className="flex items-center justify-start gap-2 bg-yellow-100 px-3 py-1 rounded shadow-sm"
                >
                  <span className="text-xl">{detail.icon || '✅'}</span>
                  <span className="text-sm font-medium">{detail.name || id}</span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No achievements yet.</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
