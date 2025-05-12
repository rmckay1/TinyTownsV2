// src/LeaderboardPanel.jsx
import React, { useState, useEffect } from 'react';

export default function LeaderboardPanel({ refreshTrigger }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/leaderboard');
        if (!res.ok) {
          console.error('Error fetching leaderboard:', res.status, res.statusText);
          return;
        }
        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    })();
  }, [refreshTrigger]);

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-lg p-4 max-w-xs mx-auto">
      <h2 className="text-xl font-bold mb-2 text-center">🏆 Leaderboard</h2>
      <ol className="list-decimal list-inside text-sm">
        {leaders.map((entry, index) => (
          <li key={index}>
            <span className="font-medium">{entry.townName}</span>: {entry.score}
          </li>
        ))}
      </ol>
    </div>
  );
}
