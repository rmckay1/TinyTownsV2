import { beforeEach, describe, expect, test, vi } from 'vitest';
import { saveGame, unlockAchievement, updateHighestScore } from '../src/logic.js';

global.fetch = vi.fn();

describe('saveGame()', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('POSTs to /save-game and returns JSON', async () => {
    const fakeResponse = { success: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeResponse)
    });

    const result = await saveGame('board123', 42, '2025-01-01T00:00:00Z', '2025-01-01T00:01:00Z', 'token-abc');

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/save-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-abc'
      },
      body: JSON.stringify({
        board: 'board123',
        score: '42',
        startTime: '2025-01-01T00:00:00Z',
        endTime:   '2025-01-01T00:01:00Z'
      })
    });

    expect(result).toEqual(fakeResponse);
  });
});

describe('unlockAchievement()', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('returns achievementId on newlyUnlocked=true', async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ newlyUnlocked: true })
    });

    const got = await unlockAchievement('farmLife', 'tok-123');
    expect(fetch).toHaveBeenCalledOnce();
    expect(got).toBe('farmLife');
  });

  test('returns null on newlyUnlocked=false', async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ newlyUnlocked: false })
    });

    const got = await unlockAchievement('farmLife', 'tok-123');
    expect(got).toBeNull();
  });

  test('returns null on non-200 status', async () => {
    fetch.mockResolvedValueOnce({ status: 500 });
    const got = await unlockAchievement('farmLife', 'tok-123');
    expect(got).toBeNull();
  });
});

describe('updateHighestScore()', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('POSTs to /update-score with the right body', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    await updateHighestScore(99, 'token-xyz');

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/update-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-xyz'
      },
      body: JSON.stringify({ score: '99' })
    });
  });
});
