const TILE_SYMBOLS = {
  wood: 'w',
  brick: 'b',
  wheat: 'h',
  glass: 'g',
  stone: 's',
  Well: 'W',
  Theatre: 'T',
  Factory: 'F',
  Cottage: 'C',
  Chapel: 'P',
  Farm: 'A',
  Tavern: 'V',
  Cathedral: 'M',
  null: '.',
  undefined: '.'
};

export function serializeBoard(grid) {
  return grid.map(cell => TILE_SYMBOLS[cell] ?? '.').join('');
}

export function calculateScore(grid) {
  return grid.filter(cell => cell && cell.match(/[A-Z]/)).length * 5;
}

export function translateEmojisToSymbols(grid) {
  const emojiMap = {
    '🏠': 'C',
    '🎭': 'T',
    '🏭': 'F',
    '💒': 'P',
    '🌾': 'A',
    '🍺': 'V',
    '⛪': 'M',
    '🧱': 'b',
    '🪵': 'w',
    '🧊': 'g',
    '🌾': 'h',
    '🪨': 's'
  };
  return grid.map(cell => emojiMap[cell] || cell || '.');
}

export async function saveGame(board, score, startTime, endTime, idToken) {
  try {
    const res = await fetch("http://localhost:3000/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        board,
        score: String(score),
        startTime,
        endTime
      })
    });
    const result = await res.json();
    return result;
  } catch (err) {
    console.error("Error saving game:", err);
  }
}

export async function unlockAchievement(achievementId, idToken) {
  try {
    const res = await fetch("http://localhost:3000/unlock-achievement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        achievementId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (res.status === 200) {
      const data = await res.json();
      return data.newlyUnlocked ? achievementId : null;
    }
  } catch (err) {
    console.error("Failed to unlock achievement:", achievementId, err);
  }
}

export async function checkAndUnlockAchievements(grid, score, startedAt, finishedAt, idToken) {
  const timeElapsed = (new Date(finishedAt) - new Date(startedAt)) / 1000;
  const achievements = [];

  const nonEmpty = grid.filter(x => x && x !== '.' && x !== null).length;
  const buildingTypes = new Set(grid.filter(x => x?.match(/[A-Z]/)));

  if (nonEmpty === 16) achievements.push("perfectTown");
  if (score >= 50) achievements.push("masterBuilder");
  if (buildingTypes.size >= 3) achievements.push("varietyPack");
  if (timeElapsed < 180) achievements.push("speedy");
  if (grid.filter(cell => cell === 'A').length >= 3) achievements.push("farmLife");

  const unlocked = [];

  for (const id of achievements) {
    const result = await unlockAchievement(id, idToken);
    if (result) unlocked.push(result);
  }

  await updateHighestScore(score, idToken);
  return unlocked;
}

export async function updateHighestScore(score, idToken) {
  try {
    await fetch("http://localhost:3000/update-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        score: String(score)
      }),
    });
  } catch (err) {
    console.error("Failed to update highest score", err);
  }
}
