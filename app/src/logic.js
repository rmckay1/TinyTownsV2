const TILE_TO_SYMBOL = {
  'wood': 'w',
  'brick': 'b',
  'wheat': 'h',
  'glass': 'g',
  'stone': 's',
  '💧': 'W',
  '🎭': 'T',
  '🏭': 'F',
  '🏠': 'C',
  '⛪': 'P',
  '🌾': 'A',
  '🍺': 'V',
  '🛐': 'M',
  null: '.'
};


export function translateEmojisToSymbols(grid) {
  if (!Array.isArray(grid)) {
    console.error("translateEmojisToSymbols expected array, got:", grid);
    return [];
  }

  // If it's a 2D array (array of rows), flatten it first
  const flatGrid = Array.isArray(grid[0]) ? grid.flat() : grid;

  return flatGrid.map(cell => TILE_TO_SYMBOL[cell] ?? '.');
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
      ['.', 'b', 'h', 'g', 's', 'w'].includes(cell)
    ).length;
    score -= emptyTiles;
  }

  return score;
}





export async function saveGame(board, score, startedAt, finishedAt, idToken) {
  try {
    const res = await fetch("http://localhost:3000/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        board, // already serialized
        score: String(score),
        startTime: startedAt,
        endTime: finishedAt
      })
    });

    const result = await res.json();
    console.log("Server response:", result);
  } catch (err) {
    console.error("Error saving game:", err);
  }
}

export async function unlockAchievement(achievementId, idToken) {
  try {
    await fetch("http://localhost:3000/unlock-achievement", {
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
  } catch (err) {
    console.error("Failed to unlock achievement:", achievementId, err);
  }
}

