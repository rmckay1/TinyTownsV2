// src/LeaderboardPanel.jsx
import React, { useEffect, useState } from 'react';

export default function LeaderboardPanel({ refreshTrigger }) {
  const [leaders, setLeaders] = useState([]);
  console.log("leaders is " + leaders);
  console.log("setLeaders is " + setLeaders);

useEffect(() => {
  const fetchLeaders = async () => {
    try {
      const res = await fetch("http://localhost:3000/leaderboard");
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      // If the response is OK, parse the JSON
      if (res.ok) {
        const data = await res.json();
        console.log("Leaderboard data:", data);
        setLeaders(data);
      } else {
        console.error("Error fetching leaderboard:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  fetchLeaders();
}, [refreshTrigger]);

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-lg p-4 w-full max-w-xs mx-auto">
      <h2 className="text-xl font-bold mb-2 text-center">🏆 Leaderboard</h2>
      <ol className="list-decimal pl-5 text-sm">
        {leaders.map((entry, i) => (
          <li key={i} className="mb-1 flex justify-between">
            <span className="font-semibold">{entry.townName}</span>
            <span>{entry.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
