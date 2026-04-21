'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CellState, RuleConfig, ToolMode, SimulationState } from '@/types';
import { createGrid, cloneGrid, randomizeGrid, clearGrid, placePattern, getPopulation } from '@/lib/grid';
import { stepGrid, PRESET_RULES, PATTERNS, LANGTONS_ANT, createLifecycleRule } from '@/lib/rules';

export function useSimulation(initialWidth = 120, initialHeight = 80) {
  const [state, setState] = useState<SimulationState>({
    grid: createGrid(initialWidth, initialHeight),
    generation: 0,
    population: 0,
    isRunning: false,
    speed: 80,
    rule: PRESET_RULES[0],
    history: [],
  });

  const [tool, setTool] = useState<ToolMode>('draw');
  const [selectedPattern, setSelectedPattern] = useState<string | null>('glider');
  const [cellSize, setCellSize] = useState(8);
  const [gridSize, setGridSize] = useState({ width: initialWidth, height: initialHeight });

  // Use refs for values that shouldn't trigger re-renders of callbacks
  const antPosRef = useRef<{ x: number; y: number; dir: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable step function using refs
  const step = useCallback(() => {
    setState(prev => {
      if (prev.rule.name === LANGTONS_ANT.name) {
        // Langton's Ant — use ref to avoid dependency issues
        let ant = antPosRef.current || {
          x: Math.floor(prev.grid.width / 2),
          y: Math.floor(prev.grid.height / 2),
          dir: 0,
        };
        const newGrid = cloneGrid(prev.grid);
        const cell = newGrid.cells[ant.y][ant.x];
        if (cell === 0) {
          newGrid.cells[ant.y][ant.x] = 1;
          ant.dir = (ant.dir + 1) % 4;
        } else {
          newGrid.cells[ant.y][ant.x] = 0;
          ant.dir = (ant.dir + 3) % 4;
        }
        const moves = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        ant.x = (ant.x + moves[ant.dir][0] + prev.grid.width) % prev.grid.width;
        ant.y = (ant.y + moves[ant.dir][1] + prev.grid.height) % prev.grid.height;
        antPosRef.current = ant;

        return {
          ...prev,
          grid: newGrid,
          generation: prev.generation + 1,
          population: getPopulation(newGrid),
        };
      }

      const newGrid = stepGrid(prev.grid, prev.rule);
      return {
        ...prev,
        grid: newGrid,
        generation: prev.generation + 1,
        population: getPopulation(newGrid),
      };
    });
  }, []); // No dependencies — fully stable

  // Run/pause control
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (state.isRunning) {
      intervalRef.current = setInterval(step, state.speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.speed, step]);

  // Actions
  const toggleRun = useCallback(() => setState(p => ({ ...p, isRunning: !p.isRunning })), []);
  const setSpeed = useCallback((speed: number) => setState(p => ({ ...p, speed })), []);
  const reset = useCallback(() => {
    antPosRef.current = null;
    setState(p => ({
      ...p,
      grid: clearGrid(p.grid),
      generation: 0,
      population: 0,
      isRunning: false,
      history: [],
    }));
  }, []);
  const randomize = useCallback((density = 0.3) => {
    antPosRef.current = null;
    setState(p => ({
      ...p,
      grid: randomizeGrid(p.grid, density),
      generation: 0,
      population: getPopulation(randomizeGrid(p.grid, density)),
    }));
  }, []);
  const setRule = useCallback((rule: RuleConfig) => {
    antPosRef.current = null;
    setCellSize(rule.cellSize || 8);
    setState(p => ({
      ...p,
      rule,
      grid: createGrid(p.grid.width, p.grid.height),
      generation: 0,
      population: 0,
      isRunning: false,
      history: [],
    }));
  }, []);
  const stepOnce = useCallback(() => step(), [step]);
  const resizeGridState = useCallback((w: number, h: number) => {
    antPosRef.current = null;
    setGridSize({ width: w, height: h });
    setState(p => ({
      ...p,
      grid: createGrid(w, h),
      generation: 0,
      population: 0,
      isRunning: false,
    }));
  }, []);

  // Drawing on grid
  const paintCell = useCallback((x: number, y: number, value: CellState) => {
    setState(p => {
      if (x < 0 || x >= p.grid.width || y < 0 || y >= p.grid.height) return p;
      const newGrid = cloneGrid(p.grid);
      newGrid.cells[y][x] = value;
      return { ...p, grid: newGrid, population: getPopulation(newGrid) };
    });
  }, []);

  const placePatternAt = useCallback((x: number, y: number, patternKey?: string) => {
    const key = patternKey || selectedPattern;
    if (!key) return;
    const patternData = PATTERNS[key];
    if (!patternData) return;
    setState(p => {
      const newGrid = placePattern(p.grid, patternData.pattern, x, y);
      return { ...p, grid: newGrid, population: getPopulation(newGrid) };
    });
  }, [selectedPattern]);

  // Custom rule
  const createCustomRule = useCallback((name: string, birth: number[], survive: number[]) => {
    const rule = createLifecycleRule(name, `B${birth.join('')}/S${survive.join('')}`, birth, survive);
    setRule(rule);
  }, [setRule]);

  return {
    state,
    tool,
    setTool,
    selectedPattern,
    setSelectedPattern,
    cellSize,
    setCellSize,
    gridSize,
    toggleRun,
    setSpeed,
    reset,
    randomize,
    setRule,
    stepOnce,
    resizeGridState,
    paintCell,
    placePatternAt,
    createCustomRule,
  };
}
