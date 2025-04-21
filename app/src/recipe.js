export class Recipe {
    constructor(name, patterns, icon) {
      this.name = name;
      this.patterns = patterns;
      this.icon = icon;
    }
  
    matches(tiles) {
      for (const pattern of this.patterns) {
        if (this._matchPattern(pattern, tiles)) return true;
      }
      return false;
    }
  
    _matchPattern(pattern, tiles) {
      const rows = pattern.length;
      const cols = pattern[0].length;
      const selectedGrid = this._toGrid(tiles);
  
      if (!selectedGrid || selectedGrid.length !== rows || selectedGrid[0].length !== cols)
        return false;
  
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const recipeRes = pattern[r][c];
          const selectedRes = selectedGrid[r][c];
          if (recipeRes !== "" && selectedRes !== recipeRes) return false;
        }
      }
      return true;
    }
  
    _toGrid(tiles) {
      const coords = tiles.map(t => t.index).sort((a, b) => a - b);
      const minRow = Math.min(...coords.map(i => Math.floor(i / 4)));
      const minCol = Math.min(...coords.map(i => i % 4));
      const maxRow = Math.max(...coords.map(i => Math.floor(i / 4)));
      const maxCol = Math.max(...coords.map(i => i % 4));
  
      const rows = maxRow - minRow + 1;
      const cols = maxCol - minCol + 1;
  
      const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
      for (const tile of tiles) {
        const row = Math.floor(tile.index / 4) - minRow;
        const col = tile.index % 4 - minCol;
        grid[row][col] = tile.resource;
      }
  
      return grid;
    }
  }