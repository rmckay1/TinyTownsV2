import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';
import { TownGrid } from './TownGrid';
import { ResourceDeck } from './ResourceDeck';
import { BuildingCards } from './BuildingCards';
import {
  saveGame,
  calculateScore,
  serializeBoard,
  translateEmojisToSymbols,
  checkAndUnlockAchievements
} from './logic';
import AchievementBanner from './AchievementBanner';
import PlayerAchievements from './PlayerAchievements';

export function App() {
  const [unlocked, setUnlocked] = useState([]);
  const [showBanner, setShowBanner] = useState(false);
  const {
    grid,
    resetGrid,
    startedAt
  } = useGameStore(state => ({
    grid: state.grid,
    resetGrid: state.resetGrid,
    startedAt: state.startedAt
  }));

  const handleEndGame = async () => {
    const auth = window.firebaseAuth;
    const user = auth.currentUser;

    if (!user) {
      alert("You must be signed in to save your game.");
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const symbolGrid = translateEmojisToSymbols(grid);
      const serializedBoard = serializeBoard(symbolGrid);
      const score = calculateScore(symbolGrid);
      const finishedAt = new Date().toISOString();

      await saveGame(serializedBoard, score, startedAt, finishedAt, idToken);
      const newAchievements = await checkAndUnlockAchievements(symbolGrid, score, startedAt, finishedAt, idToken);

      if (newAchievements.length > 0) {
        setUnlocked(newAchievements);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }

      alert("Game saved successfully!");
      resetGrid();
    } catch (error) {
      console.error("Failed to end game:", error);
      alert("Failed to save game.");
    }
  };

  return (
    <div className="text-center py-6">
      <h1 className="text-3xl font-bold mb-4">Tiny Towns</h1>
      <ResourceDeck />
      <TownGrid />
      <BuildingCards />
      <PlayerAchievements />
      {showBanner && <AchievementBanner unlocked={unlocked} />}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={resetGrid}
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Restart
        </button>
        <button
          onClick={handleEndGame}
          className="bg-red-500 px-4 py-2 rounded text-white"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
