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
  // Simple scoring logic: 5 pts per non-empty tile
  return grid.filter(cell => cell && cell !== null && cell !== undefined).length * 5;
}

export async function saveGame(grid, score, startedAt, finishedAt, idToken) {
  const board = serializeBoard(grid);

  try {
    const res = await fetch("http://localhost:5000/save-game", {
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

