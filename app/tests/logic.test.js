// tests/logic.test.js
import * as logic from '../src/logic.js';
import { describe, test, expect, beforeEach, vi } from 'vitest';

const {
  calculateScore,
  serializeBoard,
  translateEmojisToSymbols,
  checkAndUnlockAchievements
} = logic;

const DUMMY = 'fake-token';
const NOW = new Date().toISOString();

beforeEach(() => {
  // restore any previous mocks/spies
  vi.restoreAllMocks();

  // spy on unlockAchievement & updateHighestScore so we can verify calls
  vi.spyOn(logic, 'unlockAchievement').mockResolvedValue(true);
  vi.spyOn(logic, 'updateHighestScore').mockResolvedValue(undefined);
});

describe('calculateScore', () => {
  test('returns -16 for an empty board', () => {
    const grid = Array(16).fill(null);
    expect(calculateScore(grid)).toBe(-16);
  });

  test('scores well next to cottages', () => {
    // 3 non‐empty slots (C, W, C) + 13 nulls = 16 total
    const grid = ['C', 'W', 'C', ...Array(13).fill(null)];
    // well gives 2 points, no farms → 0 cottage feeding,
    // then 13 empty penalties: 2 - 13 = -11
    expect(calculateScore(grid)).toBe(2 - 13);
  });

  test('scores cottage + farm correctly', () => {
    const grid = ['C', 'A', ...Array(14).fill(null)];
    // 1 cottage fed by 1 farm: 3 pts, 14 empties: 3 - 14 = -11
    expect(calculateScore(grid)).toBe(3 - 14);
  });

  test('cathedral removes empty penalty', () => {
    const grid = Array(16).fill(null);
    grid[0] = 'M';
    // cathedral itself is 2 pts, and no empty penalty
    expect(calculateScore(grid)).toBe(2);
  });
});

describe('serializeBoard', () => {
  test('serializes full board properly', () => {
    const grid = [
      'wood',   // w
      'brick',  // b
      'wheat',  // h
      'glass',  // g
      'stone',  // s
      'wood',   // w
      'Cottage',// C
      'wood',   // w
      'Factory' // F
    ];
    expect(serializeBoard(grid)).toBe('wbhgswCwF');
  });
});

describe('translateEmojisToSymbols', () => {
  test('emoji to code mapping', () => {
    const input = ['🪵','🧱','🌾','🧊','🪨','🏠'];
    expect(translateEmojisToSymbols(input)).toEqual(
      ['w','b','h','g','s','C']
    );
  });
});

describe('checkAndUnlockAchievements', () => {
  test('unlocks perfectTown when board is full', async () => {
    const fullGrid = Array(16).fill('C');
    const unlocked = await checkAndUnlockAchievements(fullGrid, 60, NOW, NOW, DUMMY);
    expect(logic.unlockAchievement).toHaveBeenCalledWith('perfectTown', DUMMY);
    expect(unlocked).toContain('perfectTown');
  });

  test('unlocks masterBuilder when score is high', async () => {
    const anyGrid = Array(16).fill('C');
    const unlocked = await checkAndUnlockAchievements(anyGrid, 55, NOW, NOW, DUMMY);
    expect(logic.unlockAchievement).toHaveBeenCalledWith('masterBuilder', DUMMY);
    expect(unlocked).toContain('masterBuilder');
  });

  test('unlocks varietyPack for 3 building types', async () => {
    const grid = ['C','A','P', ...Array(13).fill(null)];
    const unlocked = await checkAndUnlockAchievements(grid, 0, NOW, NOW, DUMMY);
    expect(logic.unlockAchievement).toHaveBeenCalledWith('varietyPack', DUMMY);
    expect(unlocked).toContain('varietyPack');
  });

  test('unlocks speedy when game finishes under 3 mins', async () => {
    const start = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const end   = new Date().toISOString();
    const unlocked = await checkAndUnlockAchievements(
      Array(16).fill('C'),
      30,
      start,
      end,
      DUMMY
    );
    expect(logic.unlockAchievement).toHaveBeenCalledWith('speedy', DUMMY);
    expect(unlocked).toContain('speedy');
  });

  test('unlocks farmLife for 3+ farms', async () => {
    const grid = ['A','A','A', ...Array(13).fill(null)];
    const unlocked = await checkAndUnlockAchievements(grid, 0, NOW, NOW, DUMMY);
    expect(logic.unlockAchievement).toHaveBeenCalledWith('farmLife', DUMMY);
    expect(unlocked).toContain('farmLife');
  });

  test('does nothing if conditions aren’t met', async () => {
    const empty = Array(16).fill(null);
    const unlocked = await checkAndUnlockAchievements(empty, 0, NOW, NOW, DUMMY);
    expect(unlocked).toEqual([]);
    expect(logic.unlockAchievement).not.toHaveBeenCalled();
  });
});

// tests/logic.edgecases.test.js
import {
  calculateScore,
  serializeBoard,
  translateEmojisToSymbols,
} from '../src/logic.js';
import { describe, test, expect } from 'vitest';

describe('calculateScore (edge cases)', () => {
  test('tavern scoring: 1 tavern', () => {
    // one Tavern (V) + 15 empties → tavern=1 gives +2 pts, minus 15 empties
    const grid = ['V', ...Array(15).fill(null)];
    expect(calculateScore(grid)).toBe(2 - 15);
  });

  test('tavern scoring: 3 taverns', () => {
    // three V’s + 13 empties → taverns=3 gives +9 pts, minus 13 empties
    const grid = ['V','V','V', ...Array(13).fill(null)];
    expect(calculateScore(grid)).toBe(9 - 13);
  });
});

describe('serializeBoard (unexpected values)', () => {
  test('unknown resource falls back to "."', () => {
    expect(serializeBoard(['foo','bar',null])).toBe('...'); 
  });
});


