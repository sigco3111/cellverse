'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Grid, RuleConfig, ToolMode } from '@/types';

interface GridCanvasProps {
  grid: Grid;
  rule: RuleConfig;
  cellSize: number;
  tool: ToolMode;
  selectedPattern: { pattern: number[][]; width: number; height: number } | null;
  paintCell: (x: number, y: number, value: number) => void;
  placePatternAt: (x: number, y: number) => void;
}

export default function GridCanvas({
  grid,
  rule,
  cellSize,
  tool,
  selectedPattern,
  paintCell,
  placePatternAt,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastDrawValueRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  const gridPixelWidth = grid.width * cellSize;
  const gridPixelHeight = grid.height * cellSize;

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      return {
        x: Math.floor(px / cellSize),
        y: Math.floor(py / cellSize),
      };
    },
    [cellSize]
  );

  // Render grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = rule.cellColors[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        if (cell > 0) {
          ctx.fillStyle = rule.cellColors[Math.min(cell, rule.cellColors.length - 1)];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - (cellSize > 4 ? 1 : 0), cellSize - (cellSize > 4 ? 1 : 0));
        }
      }
    }

    // Grid lines (only if cells are big enough)
    if (cellSize >= 6) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= grid.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridPixelHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= grid.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridPixelWidth, y * cellSize);
        ctx.stroke();
      }
    }

    // Pattern preview
    if (selectedPattern && mousePosRef.current && tool === 'pattern') {
      const { x: mx, y: my } = mousePosRef.current;
      ctx.globalAlpha = 0.4;
      for (let py = 0; py < selectedPattern.height; py++) {
        for (let px = 0; px < selectedPattern.width; px++) {
          if (selectedPattern.pattern[py][px] > 0) {
            ctx.fillStyle = rule.cellColors[1];
            ctx.fillRect(
              (mx + px) * cellSize,
              (my + py) * cellSize,
              cellSize - (cellSize > 4 ? 1 : 0),
              cellSize - (cellSize > 4 ? 1 : 0)
            );
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  }, [grid, rule, cellSize, gridPixelWidth, gridPixelHeight, selectedPattern, tool]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      isDrawingRef.current = true;

      if (tool === 'pattern') {
        placePatternAt(cell.x, cell.y);
        return;
      }

      const currentValue = grid.cells[cell.y]?.[cell.x] ?? 0;
      if (tool === 'draw') {
        const newValue = currentValue === 0 ? 1 : 0;
        paintCell(cell.x, cell.y, newValue);
        lastDrawValueRef.current = newValue;
      } else if (tool === 'erase') {
        paintCell(cell.x, cell.y, 0);
        lastDrawValueRef.current = 0;
      }
    },
    [getCellFromEvent, tool, grid, paintCell, placePatternAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cell = getCellFromEvent(e);
      if (cell) mousePosRef.current = cell;
      else mousePosRef.current = null;

      if (!isDrawingRef.current || !cell) return;
      if (tool === 'pattern') return;

      if (tool === 'draw' && lastDrawValueRef.current !== null) {
        paintCell(cell.x, cell.y, lastDrawValueRef.current);
      } else if (tool === 'erase') {
        paintCell(cell.x, cell.y, 0);
      }
    },
    [getCellFromEvent, tool, paintCell]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDrawValueRef.current = null;
  }, []);

  return (
    <div className="relative overflow-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={gridPixelWidth}
        height={gridPixelHeight}
        className="block cursor-crosshair"
        style={{
          width: `${Math.min(gridPixelWidth, 1200)}px`,
          height: `${Math.min(gridPixelHeight, 700)}px`,
          imageRendering: 'pixelated',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
