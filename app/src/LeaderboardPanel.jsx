import React, { useEffect, useState } from 'react';

export default function LeaderboardPanel({ refreshTrigger }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch("http://localhost:3000/leaderboard");
        const data = await res.json();
        setLeaders(data || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    };

    fetchLeaders();
  }, [refreshTrigger]); // ✅ refetch whenever the trigger changes

  return (
    <div className="absolute top-6 right-6 bg-white text-gray-800 rounded-lg shadow-lg p-4 w-64">
      <h2 className="text-xl font-bold mb-2 text-center">🏆 Leaderboard</h2>
      <ol className="list-decimal pl-5 text-sm">
        {leaders.map((entry, i) => (
          <li key={i} className="mb-1">
            <span className="font-semibold">{entry.townName}</span>
            <span className="float-right">{entry.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
