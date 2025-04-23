import { checkWinner, saveGame } from "../src/logic.js";
// import { unlockAchievement } from "./your-module"; // update with actual path

// Mock fetch globally
global.fetch = vi.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('checkWinner', () => {
  test('detects a horizontal win for X', () => {
    expect(checkWinner(["X", "X", "X", "", "", "", "", "", ""])).toBe("X");
  });

  test('detects a vertical win for O', () => {
    expect(checkWinner(["O", "", "", "O", "", "", "O", "", ""])).toBe("O");
  });

  test('detects a diagonal win for X', () => {
    expect(checkWinner(["X", "", "", "", "X", "", "", "", "X"])).toBe("X");
  });

  test('returns null for a draw', () => {
    expect(checkWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"])).toBe(null);
  });
});

describe('saveGame', () => {
  test('sends correct POST request with headers and body', async () => {
    const mockBoard = ["X", "O", "X", null, null, null, "O", null, "X"];
    const mockWinner = "X";
    const mockToken = "test-id-token";

    fetch.mockResolvedValueOnce({ ok: true });

    const before = new Date();

    await saveGame(mockBoard, mockWinner, mockToken);

    const call = fetch.mock.calls[0];
    const body = JSON.parse(call[1].body);
    const sentTimestamp = new Date(body.timestamp);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockToken}`,
      },
      body: JSON.stringify({
        board: mockBoard,
        winner: mockWinner,
        timestamp: body.timestamp,
      }),
    });

    expect(sentTimestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

// describe("unlockAchievement", () => {
//   test("sends correct POST request with headers and body", async () => {
//     const mockAchievementId = "perfect_town";
//     const mockGameId = "abc123";
//     const mockToken = "test-id-token";

//     fetch.mockResolvedValueOnce({ ok: true });

//     const before = new Date();

//     await unlockAchievement(mockAchievementId, mockGameId, mockToken);

//     const call = fetch.mock.calls[0];
//     const body = JSON.parse(call[1].body);
//     const sentTimestamp = new Date(body.achievedAt);

//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenCalledWith("http://localhost:3000/unlock-achievement", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${mockToken}`,
//       },
//       body: JSON.stringify({
//         achievementId: mockAchievementId,
//         gameId: mockGameId,
//         achievedAt: body.achievedAt,
//       }),
//     });

//     expect(sentTimestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
//   });
// });
