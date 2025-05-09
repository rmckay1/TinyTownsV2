// tests/recipes.test.js
import { theatreRec } from '../src/recipes.js';

describe('Recipe matching', () => {
  test('Theatre does not match if one tile is wrong', () => {
    const tiles = [
      { index: 1, resource: 'brick' },
      { index: 2, resource: 'wood'  },  // wrong resource
      { index: 3, resource: 'brick' },
      { index: 6, resource: 'brick' },
    ];
    expect(theatreRec.matches(tiles)).toBe(false);
  });

  // Orientation 0 (pattern[0]): 2×3
  //  . S .
  //  W G W
  test('Theatre matches orientation 0: stone above wood–glass–wood', () => {
    const tiles = [
      { index: 1, resource: 'stone' },
      { index: 4, resource: 'wood' },
      { index: 5, resource: 'glass' },
      { index: 6, resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 1 (pattern[1]): 3×2
  //  W .
  //  G S
  //  W .
  test('Theatre matches orientation 1: stem left', () => {
    const tiles = [
      { index: 0, resource: 'wood' },
      { index: 4, resource: 'glass' },
      { index: 5, resource: 'stone' },
      { index: 8, resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 2 (pattern[2]): 2×3
  //  W G W
  //  . S .
  test('Theatre matches orientation 2: wood–glass–wood above stone', () => {
    const tiles = [
      { index: 0, resource: 'wood' },
      { index: 1, resource: 'glass' },
      { index: 2, resource: 'wood' },
      { index: 5, resource: 'stone' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 3 (pattern[3]): 3×2
  //  . W
  //  S G
  //  . W
  test('Theatre matches orientation 3: stem right', () => {
    const tiles = [
      { index: 1,  resource: 'wood' },
      { index: 4,  resource: 'stone' },
      { index: 5,  resource: 'glass' },
      { index: 9,  resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 4 (pattern[4] is same shape as [0], offset)
  //  . S .
  //  W G W
  test('Theatre matches orientation 4: offset version of orientation 0', () => {
    const tiles = [
      { index: 5,  resource: 'stone' },
      { index: 8,  resource: 'wood' },
      { index: 9,  resource: 'glass' },
      { index: 10, resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 5 (pattern[5] is same as [2], offset)
  //  W G W
  //  . S .
  test('Theatre matches orientation 5: offset version of orientation 2', () => {
    const tiles = [
      { index: 5,  resource: 'wood' },
      { index: 6,  resource: 'glass' },
      { index: 7,  resource: 'wood' },
      { index: 10, resource: 'stone' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 6 (pattern[6] is same as [3], offset)
  //  . W
  //  S G
  //  . W
  test('Theatre matches orientation 6: offset version of orientation 3', () => {
    const tiles = [
      { index: 7,  resource: 'wood' },
      { index: 10, resource: 'stone' },
      { index: 11, resource: 'glass' },
      { index: 15, resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });

  // Orientation 7 (pattern[7] is same as [1], offset)
  //  W .
  //  G S
  //  W .
  test('Theatre matches orientation 7: offset version of orientation 1', () => {
    const tiles = [
      { index: 6,  resource: 'wood' },
      { index: 10, resource: 'glass' },
      { index: 11, resource: 'stone' },
      { index: 14, resource: 'wood' },
    ];
    expect(theatreRec.matches(tiles)).toBe(true);
  });
});
