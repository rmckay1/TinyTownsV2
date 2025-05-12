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
    const grid = Array(16).fill('.');
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
    const input = ['wood','brick','wheat','glass','stone','🏠'];
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

// --- Mapping Tests ---
describe('translateEmojisToSymbols mapping', () => {
  it('maps UI emojis to symbols correctly', () => {
    const emojis = ['wood','brick','wheat','glass','stone','🏠','🎭','🏭','💒','🍺','🛐'];
    expect(translateEmojisToSymbols(emojis)).toEqual([
      'w','b','h','g','s','C','T','F','P','V','M'
    ]);
  });

  it('maps named tiles via TILE_SYMBOLS', () => {
    const names = ['wood','brick','Farm','Cathedral','foo'];
    expect(serializeBoard(names)).toBe('wbAM.');
  });
});

// --- Score Calculation Tests ---
describe('calculateScore scoring rules', () => {
  it('adds adjacency for wells and applies empty penalty', () => {
    const grid = Array(16).fill(null);
    // Place a well at index 5, cottages at 1,6
    grid[5] = 'W';
    grid[1] = 'C';
    grid[6] = 'C';
    // cottages=2, farms=0, chapels=0, taverns=0, hasCathedral=false
    // adjacency score=2; fed=0 so +0; taverns=0; penalty= - (16-3)= -13
    expect(calculateScore(grid)).toBe(2 - 13);
  });

  it('calculates farm feeding and chapel bonus', () => {
    const grid = Array(16).fill(null);
    // Three cottages and one farm and one chapel
    grid[0] = 'C'; grid[1] = 'C'; grid[2] = 'C';
    grid[3] = 'A'; // farm
    grid[4] = 'P'; // chapel
    // cottages=3, farms=1 -> fed=min(3,1*4)=3 -> +3*3=9; chapels=1 -> +1*3=3
    // total so far=12; penalty= -(16-5)= -11 => 1
    expect(calculateScore(grid)).toBe(12 - 11);
  });

  it('cathedral gives base +2 and waives empty penalty', () => {
    const grid = Array(16).fill(null);
    grid[7] = 'M';
    // only cathedral: +2, hasCathedral true, no penalty
    expect(calculateScore(grid)).toBe(2);
  });

  it('theatre counts unique row/col buildings', () => {
    const grid = Array(16).fill(null);
    // Place theatre at (1,1)->index 5
    grid[5] = 'T'; //should make 3
    // Place unique buildings in same row and col: at index 4 ('C'), at 6 ('C'), at index 1('A')
    grid[4] = 'C'; //should make 3
    grid[6] = 'F'; //0
    grid[1] = 'A'; //0
    // Unique non-T: C,F,A => 3; penalty=-(16-4)= -12 => 3-12 = -9
    expect(calculateScore(grid)).toBe(-16 + 6 + 4);
  });
});

// --- Achievement Unlocking Tests ---
describe('checkAndUnlockAchievements flow', () => {
  const dummyToken = 'tok';
  const now = new Date().toISOString();

  beforeEach(() => {
    vi.spyOn(logic, 'unlockAchievement').mockImplementation(async id => id);
    vi.spyOn(logic, 'updateHighestScore').mockResolvedValue();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unlocks perfectTown when grid full', async () => {
    const full = Array(16).fill('C');
    const unlocked = await checkAndUnlockAchievements(full, 10, now, now, dummyToken);
    expect(unlocked).toContain('perfectTown');
  });

  it('unlocks masterBuilder on high score', async () => {
    const grid = [null, null];
    const unlocked = await checkAndUnlockAchievements(grid, 100, now, now, dummyToken);
    expect(unlocked).toContain('masterBuilder');
  });

  it('unlocks varietyPack with 3 types', async () => {
    const grid = ['C','A','V', ...Array(13).fill(null)];
    const unlocked = await checkAndUnlockAchievements(grid, 0, now, now, dummyToken);
    expect(unlocked).toContain('varietyPack');
  });

  it('unlocks speedy when played quickly', async () => {
    const grid = [null,'C'];
    const later = new Date(Date.now() + 50000).toISOString(); // 50 sec later
    const unlocked = await checkAndUnlockAchievements(grid, 1, now, later, dummyToken);
    expect(unlocked).toContain('speedy');
  });

  it('unlocks farmLife when >=3 farms', async () => {
    const grid = ['A','A','A', ...Array(13).fill(null)];
    const unlocked = await checkAndUnlockAchievements(grid, 0, now, now, dummyToken);
    expect(unlocked).toContain('farmLife');
  });

  it('calls updateHighestScore at end', async () => {
    await checkAndUnlockAchievements([], 5, now, now, dummyToken);
    expect(logic.updateHighestScore).toHaveBeenCalledWith(5, dummyToken);
  });
});



