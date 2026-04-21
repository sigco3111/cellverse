import { Grid, Point, CellState } from '@/types';

export function createGrid(width: number, height: number): Grid {
  const cells: CellState[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = new Array(width).fill(0);
  }
  return { width, height, cells };
}

export function cloneGrid(grid: Grid): Grid {
  return {
    width: grid.width,
    height: grid.height,
    cells: grid.cells.map(row => [...row]),
  };
}

export function resizeGrid(grid: Grid, newWidth: number, newHeight: number): Grid {
  const newGrid = createGrid(newWidth, newHeight);
  for (let y = 0; y < Math.min(grid.height, newHeight); y++) {
    for (let x = 0; x < Math.min(grid.width, newWidth); x++) {
      newGrid.cells[y][x] = grid.cells[y][x];
    }
  }
  return newGrid;
}

export function getNeighbors(
  grid: Grid,
  x: number,
  y: number,
  type: 'moore' | 'vonneumann' | 'hexagonal' = 'moore'
): Point[] {
  const neighbors: Point[] = [];
  const dirs =
    type === 'moore'
      ? [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      : type === 'vonneumann'
      ? [[-1,0],[1,0],[0,-1],[0,1]]
      : [[-1,-1],[-1,0],[0,-1],[0,1],[1,0],[1,1]]; // hex approximation

  for (const [dx, dy] of dirs) {
    const nx = (x + dx + grid.width) % grid.width;
    const ny = (y + dy + grid.height) % grid.height;
    neighbors.push({ x: nx, y: ny });
  }
  return neighbors;
}

export function countAliveNeighbors(grid: Grid, x: number, y: number): number {
  const neighbors = getNeighbors(grid, x, y);
  return neighbors.reduce((count, p) => count + (grid.cells[p.y][p.x] > 0 ? 1 : 0), 0);
}

export function getPopulation(grid: Grid): number {
  return grid.cells.reduce((sum, row) => sum + row.filter(c => c > 0).length, 0);
}

export function randomizeGrid(grid: Grid, density: number = 0.3): Grid {
  const newGrid = cloneGrid(grid);
  for (let y = 0; y < newGrid.height; y++) {
    for (let x = 0; x < newGrid.width; x++) {
      newGrid.cells[y][x] = Math.random() < density ? 1 : 0;
    }
  }
  return newGrid;
}

export function clearGrid(grid: Grid): Grid {
  return createGrid(grid.width, grid.height);
}

// Pattern placement
export function placePattern(grid: Grid, pattern: number[][], startX: number, startY: number): Grid {
  const newGrid = cloneGrid(grid);
  for (let py = 0; py < pattern.length; py++) {
    for (let px = 0; px < pattern[py].length; px++) {
      const x = startX + px;
      const y = startY + py;
      if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
        newGrid.cells[y][x] = pattern[py][px];
      }
    }
  }
  return newGrid;
}

// Load pattern from RLE (Run Length Encoded) — Game of Life standard
export function parseRLE(rle: string): number[][] {
  const rows: number[][] = [];
  let currentRow: number[] = [];
  let currentNum = '';

  const cleaned = rle.replace(/\s/g, '').split('$');

  for (const rowStr of cleaned) {
    if (!rowStr) {
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [];
      continue;
    }
    let num = '';
    for (const ch of rowStr) {
      if (/\d/.test(ch)) {
        num += ch;
      } else {
        const count = num ? parseInt(num) : 1;
        const val = ch === 'b' ? 0 : 1;
        currentRow.push(...Array(count).fill(val));
        num = '';
      }
    }
    if (rowStr && !rle.includes('$' + rowStr) || true) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  return rows.length > 0 ? rows : [[]];
}
