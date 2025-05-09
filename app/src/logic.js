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
  let score = 0;
  let cottages = 0;
  let farms = 0;
  let chapels = 0;
  let taverns = 0;
  let hasCathedral = false;
  const gridSize = 4;

  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];

    switch (cell) {
      case "C":
        cottages += 1;
        break;
      case "A":
        farms += 1;
        break;
      case "P":
        chapels += 1;
        break;
      case "V":
        taverns += 1;
        break;
      case "W": {
        const adjacentIndexes = [];
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        if (row > 0) adjacentIndexes.push(i - gridSize);
        if (row < gridSize - 1) adjacentIndexes.push(i + gridSize);
        if (col > 0) adjacentIndexes.push(i - 1);
        if (col < gridSize - 1) adjacentIndexes.push(i + 1);

        for (const adj of adjacentIndexes) {
          if (grid[adj] === "C") score += 1;
        }
        break;
      }
      case "T": {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const uniqueBuildings = new Set();

        for (let c = 0; c < gridSize; c++) {
          const b = grid[row * gridSize + c];
          if (b && b !== "T") uniqueBuildings.add(b);
        }
        for (let r = 0; r < gridSize; r++) {
          const b = grid[r * gridSize + col];
          if (b && b !== "T") uniqueBuildings.add(b);
        }

        score += uniqueBuildings.size;
        break;
      }
      case "M":
        hasCathedral = true;
        score += 2;
        break;
      default:
        break;
    }
  }

  const cottagesFed = Math.min(cottages, farms * 4);
  score += cottagesFed * 3;
  score += chapels * cottagesFed;

  if (taverns === 1) score += 2;
  else if (taverns === 2) score += 5;
  else if (taverns === 3) score += 9;
  else if (taverns === 4) score += 14;
  else if (taverns >= 5) score += 20;

  if (!hasCathedral) {
    const emptyTiles = grid.filter(cell =>
      ['.', 'b', 'h', 'g', 's', 'w', null, ''].includes(cell)
    ).length;
    score -= emptyTiles;
  }

  return score;
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
