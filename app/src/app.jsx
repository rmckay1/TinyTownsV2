import React from 'react';
import { useGameStore } from './store';
import { TownGrid } from './towngrid';
import { ResourceDeck } from './ResourceDeck';
import { BuildingCards } from './BuildingCards';
import { saveGame, calculateScore, translateEmojisToSymbols } from './logic';

export function App() {
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
      const symbolGrid = translateEmojisToSymbols(grid); // array of symbols
      const serializedBoard = symbolGrid.join('');       // string to save
      const score = calculateScore(symbolGrid);
      const finishedAt = new Date().toISOString();       // 💡 move this before saveGame
  
      await saveGame(serializedBoard, score, startedAt, finishedAt, idToken);
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
