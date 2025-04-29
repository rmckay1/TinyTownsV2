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
  let chapels = 0;
  let taverns = 0;
  let hasCathedral = false;
  const gridSize = 4; // 4x4 grid

  // loop through every tile once
  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];

    switch (cell) {
      case "C":
        cottages += 1; // counting how many cottages we have
        break;

      case "A":
        farms += 1; // counting farms
        break;

      case "P":
        chapels += 1; // chapels get their bonus later
        break;

      case "V":
        taverns += 1; // taverns have a special scoring rule later
        break;

      case "W": {
        // wells give points for adjacent cottages
        const adjacentIndexes = [];
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        if (row > 0) adjacentIndexes.push(i - gridSize);     // up
        if (row < gridSize - 1) adjacentIndexes.push(i + gridSize); // down
        if (col > 0) adjacentIndexes.push(i - 1);             // left
        if (col < gridSize - 1) adjacentIndexes.push(i + 1);  // right

        for (const adj of adjacentIndexes) {
          if (grid[adj] === "C") {
            score += 1; // +1 per adjacent cottage
          }
        }
        break;
      }

      case "T": {
        // theatres score based on unique buildings in row and col
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const uniqueBuildings = new Set();

        // check all buildings in the same row
        for (let c = 0; c < gridSize; c++) {
          const b = grid[row * gridSize + c];
          if (b && b !== "T") uniqueBuildings.add(b);
        }
        // check all buildings in the same column
        for (let r = 0; r < gridSize; r++) {
          const b = grid[r * gridSize + col];
          if (b && b !== "T") uniqueBuildings.add(b);
        }

        score += uniqueBuildings.size; // +1 point per unique building
        break;
      }

      case "M":
        hasCathedral = true; // cathedral changes how empties are scored
        score += 2; // cathedral itself is worth 2 points
        break;

      // ignore factories, resources, empties, all score no points (empties handled at end)
      case "F":
      case "b":
      case "g":
      case "h":
      case "s":
      case "w":
      case ".":
      case null:
      case undefined:
        break;

      default:
        console.warn(`Unknown tile type: ${cell}`);
    }
  }

  // after looping, score cottages
  const cottagesFed = Math.min(cottages, farms * 4); // farms feed 4 cottages each
  score += cottagesFed * 3; // fed cottages worth 3 pts each

  // chapels score based on how many cottages are fed
  score += chapels * cottagesFed;

  // score taverns based on how many you have
  if (taverns === 1) score += 2;
  else if (taverns === 2) score += 5;
  else if (taverns === 3) score += 9;
  else if (taverns === 4) score += 14;
  else if (taverns >= 5) score += 20;

  // handle penalty for empty/resource tiles, unless you built cathedral
  if (!hasCathedral) {
    const emptyTiles = grid.filter(cell =>
      cell === '.' || cell === 'b' || cell === 'h' || cell === 'g' || cell === 's' || cell === 'w'
    ).length;
    score -= emptyTiles; // -1 per empty/resource tile
  }

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

