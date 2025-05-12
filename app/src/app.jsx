// src/app.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ResourceDeck } from './ResourceDeck';
import { TownGrid } from './TownGrid';
import { BuildingCards } from './BuildingCards';
import PlayerAchievements from './PlayerAchievements';
import LeaderboardPanel from './LeaderboardPanel';
import { saveGame, calculateScore, translateEmojisToSymbols } from './logic';
import { useGameStore } from './store';
import { FactoryResourceSelection } from './FactoryOverrideButtons';  // Import the new component

export function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = window.firebaseAuth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  if (!user) return <LoginScreen />;
  return <GameUI user={user} />;
}

function LoginScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center">Tiny Towns</h2>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() =>
            window.firebaseAuth.signInWithEmailAndPassword(
              document.getElementById('email').value,
              document.getElementById('password').value
            )
          }
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        >
          Login
        </button>
        <button
          onClick={() =>
            window.firebaseAuth.createUserWithEmailAndPassword(
              document.getElementById('email').value,
              document.getElementById('password').value
            )
          }
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
        >
          Register
        </button>
        <button
          onClick={() => {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            window.firebaseAuth.signInWithPopup(provider);
          }}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}

function GameUI({ user }) {
  // Zustand selectors
  const resetGrid = useGameStore(s => s.resetGrid);
  const grid = useGameStore(s => s.grid);
  const startedAt = useGameStore(s => s.startedAt);
  const factoryBuildingPlaced = useGameStore(s => s.factoryBuildingPlaced);
  const [leaderKey, setLeaderKey] = useState(0);

  // Compute current score
  const symbolGrid = useMemo(() => translateEmojisToSymbols(grid), [grid]);
  const score = useMemo(() => calculateScore(symbolGrid), [symbolGrid]);

  // on mount: initialize the game
  useEffect(() => {
    resetGrid();
  }, [resetGrid]);

  const handleEndGame = async () => {
    const idToken = await user.getIdToken();
    const board = symbolGrid.join('');
    const scoreValue = calculateScore(symbolGrid);
    const endTime = new Date().toISOString();

    // save the game
    await saveGame(board, scoreValue, startedAt, endTime, idToken);

    // ask for a town name & submit it
    const townName = prompt("Name your town to submit it to the leaderboard:")?.trim();
    if (townName) {
      await fetch("http://localhost:3000/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ townName, score: scoreValue })
      });
      setLeaderKey(k => k + 1);
    }

    resetGrid();
    alert("Game saved!");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* header */}
      <header className="flex justify-between items-center px-4 py-3 bg-gray-800 text-gray-200">
        <div>
          Welcome, <span className="font-semibold">{user.displayName || user.email}</span>
        </div>
        <div className="space-x-2">
          <button
            onClick={resetGrid}
            className="px-3 py-1 bg-green-500 rounded hover:bg-green-600"
          >
            Restart
          </button>
          <button
            onClick={handleEndGame}
            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
          >
            End Game
          </button>
          <button
            onClick={() => window.firebaseAuth.signOut()}
            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* main content: achievements | deck & grid | leaderboard */}
      <main className="flex flex-1 overflow-hidden px-6 py-4">
        <div className="w-1/3 pr-4 overflow-auto">
          <PlayerAchievements />
        </div>
        <div className="w-1/3 flex flex-col items-center justify-center space-y-4">
          {/* Current score display */}
          <div className="text-xl font-bold text-white">Score: {score}</div>

          {/* resource deck & grid */}
          <ResourceDeck />
          <TownGrid />
        </div>
        <div className="w-1/3 pl-4 overflow-auto">
          <LeaderboardPanel refreshTrigger={leaderKey} />
        </div>
      </main>

      {/* building cards along bottom */}
      <footer className="bg-gray-800 px-6 py-4">
        <BuildingCards />
      </footer>

      {/* Show Factory resource selection popup if needed */}
      {factoryBuildingPlaced && <FactoryResourceSelection />}
    </div>
  );
}
