const TILE_SYMBOLS = {
  wood: 'w',
  brick: 'b',
  wheat: 'h',
  glass: 'g',
  stone: 's',
  'Well': 'W',
  'Theatre': 'T',
  'Factory': 'F',
  'Cottage': 'C',
  'Chapel': 'P',
  'Farm': 'A',
  'Tavern': 'V',
  'Cathedral': 'M',
  null: '.',  // empty tile
  undefined: '.'
};

export function serializeBoard(grid) {
  return grid.map(cell => TILE_SYMBOLS[cell] ?? '.').join('');
}

export function calculateScore(grid) {
  let score = 0;
  let cottages = 0;
  let farms = 0;
  let wells = 0;
  const gridSize = 4; // 4x4 grid (adjust if needed)

  // First pass: count cottages, farms, wells and score other buildings
  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    if (!cell) continue;

    switch (cell) {
      case "Cottage":
        cottages += 1;
        break;

      case "Farm":
        farms += 1;
        break;

      case "Well": {
        // Check adjacent tiles for Cottages
        const adjacentIndexes = [];
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        if (row > 0) adjacentIndexes.push(i - gridSize); // up
        if (row < gridSize - 1) adjacentIndexes.push(i + gridSize); // down
        if (col > 0) adjacentIndexes.push(i - 1); // left
        if (col < gridSize - 1) adjacentIndexes.push(i + 1); // right

        for (const adj of adjacentIndexes) {
          if (grid[adj] === "Cottage") {
            score += 1;
          }
        }
        wells += 1;
        break;
      }

      case "Theatre": {
        // We'll find the row and column of this Theatre
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
      
        const uniqueBuildingsInRow = new Set();
        const uniqueBuildingsInCol = new Set();
      
        // Check the entire row
        for (let c = 0; c < gridSize; c++) {
          const buildingInRow = grid[row * gridSize + c];
          if (buildingInRow && buildingInRow !== "Theatre") {
            uniqueBuildingsInRow.add(buildingInRow);
          }
        }
      
        // Check the entire column
        for (let r = 0; r < gridSize; r++) {
          const buildingInCol = grid[r * gridSize + col];
          if (buildingInCol && buildingInCol !== "Theatre") {
            uniqueBuildingsInCol.add(buildingInCol);
          }
        }
      
        // Combine the unique buildings found in both the row and column
        const uniqueBuildings = new Set([...uniqueBuildingsInRow, ...uniqueBuildingsInCol]);
      
        // Add points for each unique building type
        score += uniqueBuildings.size;
        break;
      }
      

      case "Chapel":
        // Each Chapel is worth 2 points
        score += 2;
        break;

      case "Tavern":
        // Add 1 point for each adjacent Tavern
        // Similar to Theatre, we'll use the adjacency logic
        break;

      case "Cathedral":
        // Each Cathedral is worth 5 points
        score += 5;
        break;

      case "wood":
      case "brick":
      case "wheat":
      case "glass":
      case "stone":
      case null:
      case undefined:
        // Ignore resources and empty tiles
        break;

      default:
        console.warn(`Unknown tile type: ${cell}`);
    }
  }

  // FINAL step: handle cottage scoring based on available farms
  const cottagesFed = Math.min(cottages, farms * 4);
  score += cottagesFed * 3;

  return score;
}


export async function saveGame(grid, score, startedAt, finishedAt, idToken) {
  const board = serializeBoard(grid);

  try {
    const res = await fetch("http://localhost:3000/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        board,
        score: String(score), // ✅ send as string
        startTime: startedAt, // ✅ match backend field name
        endTime: finishedAt   // ✅ match backend field name
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

