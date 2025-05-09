// src/logic.js

// Mapping of tiles/buildings to single‐character symbols
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
  undefined: '.',
};

// Turn a grid of strings into a serialized board string
export function serializeBoard(grid) {
  return grid.map(cell => TILE_SYMBOLS[cell] ?? '.').join('');
}

// Score calculation
export function calculateScore(grid) {
  let score = 0;
  let cottages = 0;
  let farms = 0;
  let chapels = 0;
  let taverns = 0;
  let hasCathedral = false;
  const N = 4;

  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    switch (cell) {
      case 'C':
        cottages++;
        break;
      case 'A':
        farms++;
        break;
      case 'P':
        chapels++;
        break;
      case 'V':
        taverns++;
        break;
      case 'W': {
        // +1 per adjacent cottage
        const row = Math.floor(i / N);
        const col = i % N;
        const adj = [];
        if (row > 0)      adj.push(i - N);
        if (row < N - 1)  adj.push(i + N);
        if (col > 0)      adj.push(i - 1);
        if (col < N - 1)  adj.push(i + 1);
        for (const j of adj) {
          if (grid[j] === 'C') score++;
        }
        break;
      }
      case 'T': {
        // +# of unique non-T buildings in same row/column
        const row = Math.floor(i / N);
        const col = i % N;
        const seen = new Set();
        for (let c = 0; c < N; c++) {
          const b = grid[row * N + c];
          if (b && b !== 'T') seen.add(b);
        }
        for (let r = 0; r < N; r++) {
          const b = grid[r * N + col];
          if (b && b !== 'T') seen.add(b);
        }
        score += seen.size;
        break;
      }
      case 'M':
        hasCathedral = true;
        score += 2;
        break;
      default:
        break;
    }
  }

  // Feed cottages by farms
  const fed = Math.min(cottages, farms * 4);
  score += fed * 3;        // 3 pts per fed cottage
  score += chapels * fed;  // +1 pt per chapel per fed cottage

  // Tavern tier scoring
  if      (taverns === 1) score += 2;
  else if (taverns === 2) score += 5;
  else if (taverns === 3) score += 9;
  else if (taverns === 4) score += 14;
  else if (taverns >= 5)  score += 20;

  // Empty‐tile penalty (unless you built a cathedral)
  if (!hasCathedral) {
    const emptyCount = grid.filter(cell => cell == null).length;
    score -= emptyCount;
  }

  return score;
}

// Map emojis (from the UI) back to symbols
export function translateEmojisToSymbols(grid) {
  const emojiMap = {
    'wood': 'w', // wood
    'brick': 'b', // brick
    'wheat': 'h', // wheat
    'glass': 'g', // glass
    'stone': 's', // stone
    '🕳️': 'W', // Well
    '🏠': 'C', // Cottage
    '🎭': 'T', // Theatre
    '🏭': 'F', // Factory
    '💒': 'P', // Chapel
    '🍺': 'V', // Tavern
    '⛪': 'M', // Cathedral
  };
  return grid.map(cell => emojiMap[cell] || cell || '.');
}

// Network calls for saving game & achievements
export async function saveGame(board, score, startTime, endTime, idToken) {
  const res = await fetch("http://localhost:3000/save-game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ board, score: String(score), startTime, endTime }),
  });
  return res.json();
}

export async function unlockAchievement(achievementId, idToken) {
  const res = await fetch("http://localhost:3000/unlock-achievement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ achievementId, timestamp: new Date().toISOString() }),
  });
  if (res.status === 200) {
    const data = await res.json();
    return data.newlyUnlocked ? achievementId : null;
  }
  return null;
}

export async function updateHighestScore(score, idToken) {
  await fetch("http://localhost:3000/update-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ score: String(score) }),
  });
}

// Core achievement logic: dynamically import self so Vitest spies are honored
export async function checkAndUnlockAchievements(
  grid,
  score,
  startedAt,
  finishedAt,
  idToken
) {
  const nonEmpty   = grid.filter(x => x != null && x !== '.').length;
  const elapsedSec = (new Date(finishedAt) - new Date(startedAt)) / 1000;
  const types      = new Set(grid.filter(x => /^[A-Z]$/.test(x)));

  // Decide which achievements to try
  const toTry = [];
  if (nonEmpty === grid.length)           toTry.push('perfectTown');
  if (score >= 50)                         toTry.push('masterBuilder');
  if (types.size >= 3)                     toTry.push('varietyPack');
  if (elapsedSec < 180 && nonEmpty > 0)    toTry.push('speedy');
  if (grid.filter(x => x === 'A').length >= 3) toTry.push('farmLife');

  const unlocked = [];
  // dynamic import of ourselves – this is the key so that
  // `vi.spyOn(logic, 'unlockAchievement')` from your tests will actually be called
  const logic = await import('./logic.js');
  for (const id of toTry) {
    const got = await logic.unlockAchievement(id, idToken);
    if (got) unlocked.push(id);
  }
  await logic.updateHighestScore(score, idToken);
  return unlocked;
}
