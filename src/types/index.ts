// CellVerse — Cellular Automata Lab

export type CellState = number; // 0 = dead, 1+ = alive states (multi-state)

export interface Point {
  x: number;
  y: number;
}

export interface Grid {
  width: number;
  height: number;
  cells: CellState[][];
}

export interface RuleConfig {
  name: string;
  description: string;
  category: 'lifecycle' | 'ant' | 'wireworld' | 'custom';
  defaultSpeed: number;
  cellStates: number; // number of possible states per cell
  cellColors: string[]; // color for each state index
  // For lifecycle rules (Game of Life variants)
  birthRule?: number[];
  surviveRule?: number[];
  // For multi-state rules
  transitionFn?: (grid: Grid, x: number, y: number, neighbors: Point[]) => CellState;
  // Neighborhood type
  neighborhood?: 'moore' | 'vonneumann' | 'hexagonal';
  // Cell size
  cellSize?: number;
}

export interface SimulationState {
  grid: Grid;
  generation: number;
  population: number;
  isRunning: boolean;
  speed: number; // ms per step
  rule: RuleConfig;
  history: Grid[];
}

export type ToolMode = 'draw' | 'erase' | 'pan' | 'pattern';
