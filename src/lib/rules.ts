import { RuleConfig, Grid, CellState } from '@/types';
import { countAliveNeighbors, getNeighbors, cloneGrid } from './grid';

// ==========================================
// Conway's Game of Life
// ==========================================
export const GAME_OF_LIFE: RuleConfig = {
  name: "Conway's Game of Life",
  description: 'Classic B3/S23 — cells are born with 3 neighbors, survive with 2-3',
  category: 'lifecycle',
  defaultSpeed: 80,
  cellStates: 2,
  cellColors: ['#1a1a2e', '#00d4ff'],
  birthRule: [3],
  surviveRule: [2, 3],
  neighborhood: 'moore',
  cellSize: 8,
};

// ==========================================
// HighLife — B36/S23
// ==========================================
export const HIGH_LIFE: RuleConfig = {
  name: 'HighLife',
  description: 'B36/S23 — like Life but also born with 6 neighbors. Creates replicators!',
  category: 'lifecycle',
  defaultSpeed: 80,
  cellStates: 2,
  cellColors: ['#0d1117', '#f0883e'],
  birthRule: [3, 6],
  surviveRule: [2, 3],
  neighborhood: 'moore',
  cellSize: 8,
};

// ==========================================
// Day & Night — B3678/S34678
// ==========================================
export const DAY_AND_NIGHT: RuleConfig = {
  name: 'Day & Night',
  description: 'B3678/S34678 — symmetric rule: dead cells act like live cells in Life',
  category: 'lifecycle',
  defaultSpeed: 60,
  cellStates: 2,
  cellColors: ['#fef3c7', '#1e1b4b'],
  birthRule: [3, 6, 7, 8],
  surviveRule: [3, 4, 6, 7, 8],
  neighborhood: 'moore',
  cellSize: 6,
};

// ==========================================
// Seeds — B2/S (no survival)
// ==========================================
export const SEEDS: RuleConfig = {
  name: 'Seeds',
  description: 'B2/S — cells born with 2 neighbors but never survive. Creates explosive chaos!',
  category: 'lifecycle',
  defaultSpeed: 40,
  cellStates: 2,
  cellColors: ['#0a0a0a', '#a855f7'],
  birthRule: [2],
  surviveRule: [],
  neighborhood: 'moore',
  cellSize: 5,
};

// ==========================================
// Diamoeba — B35678/S5678
// ==========================================
export const DIAMOEBA: RuleConfig = {
  name: 'Diamoeba',
  description: 'B35678/S5678 — creates diamond-shaped amoeba-like structures',
  category: 'lifecycle',
  defaultSpeed: 60,
  cellStates: 2,
  cellColors: ['#1e293b', '#06b6d4'],
  birthRule: [3, 5, 6, 7, 8],
  surviveRule: [5, 6, 7, 8],
  neighborhood: 'moore',
  cellSize: 6,
};

// ==========================================
// Wireworld
// ==========================================
export const WIREWORLD: RuleConfig = {
  name: 'Wireworld',
  description: 'Electronic circuit simulation — 4 states: empty, wire, electron head, electron tail',
  category: 'wireworld',
  defaultSpeed: 100,
  cellStates: 4,
  cellColors: ['#1a1a2e', '#fbbf24', '#3b82f6', '#ef4444'],
  neighborhood: 'moore',
  cellSize: 8,
  transitionFn: (grid: Grid, x: number, y: number, _neighbors: { x: number; y: number }[]): CellState => {
    const current = grid.cells[y][x];
    if (current === 0) return 0; // empty stays empty
    if (current === 1) {
      // wire becomes electron head if exactly 1 or 2 neighbor is electron head
      const neighbors = getNeighbors(grid, x, y);
      const headCount = neighbors.filter(p => grid.cells[p.y][p.x] === 2).length;
      return headCount === 1 || headCount === 2 ? 2 : 1;
    }
    if (current === 2) return 3; // electron head → tail
    if (current === 3) return 1; // electron tail → wire
    return 0;
  },
};

// ==========================================
// Langton's Ant (simplified 2D version)
// ==========================================
export const LANGTONS_ANT: RuleConfig = {
  name: "Langton's Ant",
  description: "A simple ant on a grid — turns and flips cells. Emergent highway after ~10k steps!",
  category: 'ant',
  defaultSpeed: 10,
  cellStates: 2,
  cellColors: ['#f8fafc', '#1a1a2e'],
  neighborhood: 'moore',
  cellSize: 4,
};

// ==========================================
// Brian's Brain
// ==========================================
export const BRIANS_BRAIN: RuleConfig = {
  name: "Brian's Brain",
  description: "3-state automaton: firing→dying→off. Creates beautiful moving patterns",
  category: 'lifecycle',
  defaultSpeed: 60,
  cellStates: 3,
  cellColors: ['#0f172a', '#facc15', '#475569'],
  neighborhood: 'moore',
  cellSize: 6,
  transitionFn: (grid: Grid, x: number, y: number, _neighbors: { x: number; y: number }[]): CellState => {
    const current = grid.cells[y][x];
    if (current === 0) {
      // Off → On if exactly 2 neighbors are firing
      const neighbors = getNeighbors(grid, x, y);
      const firingCount = neighbors.filter(p => grid.cells[p.y][p.x] === 1).length;
      return firingCount === 2 ? 1 : 0;
    }
    if (current === 1) return 2; // Firing → Dying
    if (current === 2) return 0; // Dying → Off
    return 0;
  },
};

// ==========================================
// Custom Rule Builder helper
// ==========================================
export function createLifecycleRule(
  name: string,
  description: string,
  birth: number[],
  survive: number[],
  colors?: [string, string],
  cellSize?: number
): RuleConfig {
  return {
    name,
    description,
    category: 'lifecycle',
    defaultSpeed: 80,
    cellStates: 2,
    cellColors: colors || ['#1a1a2e', '#00d4ff'],
    birthRule: birth,
    surviveRule: survive,
    neighborhood: 'moore',
    cellSize: cellSize || 8,
  };
}

// Step function dispatcher
export function stepGrid(grid: Grid, rule: RuleConfig): Grid {
  const newGrid = cloneGrid(grid);

  if (rule.transitionFn) {
    // Custom transition function
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const neighbors = getNeighbors(grid, x, y, rule.neighborhood);
        newGrid.cells[y][x] = rule.transitionFn(grid, x, y, neighbors);
      }
    }
  } else if (rule.birthRule && rule.surviveRule) {
    // Lifecycle rules (B/S notation)
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const neighbors = countAliveNeighbors(grid, x, y);
        const alive = grid.cells[y][x] > 0;
        if (alive) {
          newGrid.cells[y][x] = rule.surviveRule.includes(neighbors) ? 1 : 0;
        } else {
          newGrid.cells[y][x] = rule.birthRule.includes(neighbors) ? 1 : 0;
        }
      }
    }
  }

  return newGrid;
}

// All presets
export const PRESET_RULES: RuleConfig[] = [
  GAME_OF_LIFE,
  HIGH_LIFE,
  DAY_AND_NIGHT,
  SEEDS,
  DIAMOEBA,
  WIREWORLD,
  BRIANS_BRAIN,
  LANGTONS_ANT,
];

// ==========================================
// Classic Patterns (for Game of Life & variants)
// ==========================================
export const PATTERNS: Record<string, { name: string; pattern: number[][]; description: string }> = {
  glider: {
    name: 'Glider',
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
    description: 'The simplest spaceship — moves diagonally',
  },
  lwss: {
    name: 'LWSS',
    pattern: [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    description: 'Lightweight spaceship — moves horizontally',
  },
  pulsar: {
    name: 'Pulsar',
    pattern: (() => {
      const p = Array.from({ length: 15 }, () => Array(15).fill(0));
      const pts = [
        [2,0],[3,0],[4,0],[8,0],[9,0],[10,0],
        [0,2],[5,2],[7,2],[12,2],
        [0,3],[5,3],[7,3],[12,3],
        [0,4],[5,4],[7,4],[12,4],
        [2,5],[3,5],[4,5],[8,5],[9,5],[10,5],
      ];
      pts.forEach(([x,y]) => {
        p[y][x] = 1; p[14-y][x] = 1; p[y][14-x] = 1; p[14-y][14-x] = 1;
      });
      return p;
    })(),
    description: 'Period-3 oscillator — one of the most common',
  },
  gosperGun: {
    name: 'Gosper Glider Gun',
    pattern: (() => {
      const p = Array.from({ length: 9 }, () => Array(36).fill(0));
      const pts = [
        [24,0],[22,1],[24,1],[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
        [11,3],[15,3],[20,3],[21,3],[34,3],[35,3],[0,4],[1,4],[10,4],
        [16,4],[20,4],[21,4],[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],
        [22,5],[24,5],[10,6],[16,6],[24,6],[11,7],[15,7],[12,8],[13,8],
      ];
      pts.forEach(([x,y]) => { p[y][x] = 1; });
      return p;
    })(),
    description: 'The first known finite pattern with infinite growth',
  },
  rpentomino: {
    name: 'R-pentomino',
    pattern: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    description: 'Methuselah — takes 1103 generations to stabilize!',
  },
  acorn: {
    name: 'Acorn',
    pattern: [
      [0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 0, 1, 1, 1],
    ],
    description: 'Methuselah — takes 5206 generations to stabilize',
  },
};

// Wireworld patterns
export const WIREWORLD_PATTERNS: Record<string, { name: string; pattern: number[][]; description: string }> = {
  diode: {
    name: 'Diode',
    pattern: [
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    description: 'One-way electron flow',
  },
  loop: {
    name: 'Signal Loop',
    pattern: [
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
    ],
    description: 'Electron loops endlessly',
  },
};
