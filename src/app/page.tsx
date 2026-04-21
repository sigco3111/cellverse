'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import GridCanvas from '@/components/GridCanvas';
import ControlPanel from '@/components/ControlPanel';
import CustomRuleBuilder from '@/components/CustomRuleBuilder';
import { PATTERNS } from '@/lib/rules';

export default function Home() {
  const sim = useSimulation(120, 80);
  const [showCustomRule, setShowCustomRule] = useState(false);

  const selectedPatternData = useMemo(() => {
    if (!sim.selectedPattern || sim.tool !== 'pattern') return null;
    const p = PATTERNS[sim.selectedPattern];
    if (!p) return null;
    return {
      pattern: p.pattern,
      width: p.pattern[0]?.length || 0,
      height: p.pattern.length,
    };
  }, [sim.selectedPattern, sim.tool]);

  // 키보드 단축키
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        sim.toggleRun();
        break;
      case 'KeyN':
        sim.stepOnce();
        break;
      case 'KeyR':
        sim.randomize(0.3);
        break;
      case 'KeyC':
        sim.reset();
        break;
    }
  }, [sim]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* 배경 글로우 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CellVerse
              </h1>
              <p className="text-[10px] text-zinc-500">세포 자동기 실험실</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomRule(true)}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
          >
            ⚙️ 규칙 만들기
          </button>
        </div>

        {/* 메인 레이아웃 */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* 컨트롤 패널 */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <ControlPanel
              rule={sim.state.rule}
              isRunning={sim.state.isRunning}
              speed={sim.state.speed}
              generation={sim.state.generation}
              population={sim.state.population}
              gridWidth={sim.gridSize.width}
              gridHeight={sim.gridSize.height}
              tool={sim.tool}
              selectedPattern={sim.selectedPattern}
              onToggleRun={sim.toggleRun}
              onStepOnce={sim.stepOnce}
              onReset={sim.reset}
              onRandomize={sim.randomize}
              onSetRule={sim.setRule}
              onSetSpeed={sim.setSpeed}
              onSetTool={sim.setTool}
              onSelectPattern={sim.setSelectedPattern}
              onResize={sim.resizeGridState}
            />
          </div>

          {/* 캔버스 */}
          <div className="flex-1 min-w-0">
            <GridCanvas
              grid={sim.state.grid}
              rule={sim.state.rule}
              cellSize={sim.cellSize}
              tool={sim.tool}
              selectedPattern={selectedPatternData}
              paintCell={sim.paintCell}
              placePatternAt={sim.placePatternAt}
            />

            {/* 단축키 안내 */}
            <div className="mt-2 flex gap-4 text-[10px] text-zinc-600">
              <span>Space: 실행/정지</span>
              <span>N: 다음 단계</span>
              <span>R: 무작위</span>
              <span>C: 초기화</span>
            </div>
          </div>
        </div>
      </div>

      {/* 규칙 만들기 모달 */}
      {showCustomRule && (
        <CustomRuleBuilder
          onCreate={sim.createCustomRule}
          onClose={() => setShowCustomRule(false)}
        />
      )}
    </main>
  );
}
