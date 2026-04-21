'use client';

import React from 'react';
import { RuleConfig, ToolMode } from '@/types';
import { PRESET_RULES, PATTERNS } from '@/lib/rules';

interface ControlPanelProps {
  rule: RuleConfig;
  isRunning: boolean;
  speed: number;
  generation: number;
  population: number;
  gridWidth: number;
  gridHeight: number;
  tool: ToolMode;
  selectedPattern: string | null;
  onToggleRun: () => void;
  onStepOnce: () => void;
  onReset: () => void;
  onRandomize: (density?: number) => void;
  onSetRule: (rule: RuleConfig) => void;
  onSetSpeed: (speed: number) => void;
  onSetTool: (tool: ToolMode) => void;
  onSelectPattern: (pattern: string | null) => void;
  onResize: (w: number, h: number) => void;
}

const RULE_DESCRIPTIONS_KR: Record<string, string> = {
  "Conway's Game of Life": '고전 B3/S23 — 이웃 3명이면 탄생, 2-3명이면 생존',
  'HighLife': 'B36/S23 — 6명 이웃에서도 탄생. 복제자가 나타남!',
  'Day & Night': 'B3678/S34678 — 죽은/살은 셀이 대칭적으로 행동',
  'Seeds': 'B2/S — 2명 이웃에서 탄생하지만 절대 생존 못함. 폭발적!',
  'Diamoeba': 'B35678/S5678 — 다이아몬드형 아메바 구조 생성',
  'Wireworld': '전자회로 시뮬레이션 — 빈/선/전자머리/전자꼬리 4상태',
  "Brian's Brain": '3상태 자동기 — 발화→소멸→꺼짐. 아름다운 이동 패턴',
  "Langton's Ant": '개미 한 마리 — ~10,000스텝 후 고속도로 등장!',
};

const PATTERN_DESCRIPTIONS_KR: Record<string, string> = {
  glider: '가장 단순한 우주선 — 대각선 이동',
  lwss: '경량 우주선 — 수평 이동',
  pulsar: '주기-3 진동자 — 가장 흔한 패턴 중 하나',
  gosperGun: '최초의 유한 패턴 무한 성장',
  rpentomino: '메두사 — 1103세대 후 안정화!',
  acorn: '도토리 — 5206세대 후 안정화!',
};

export default function ControlPanel({
  rule,
  isRunning,
  speed,
  generation,
  population,
  gridWidth,
  gridHeight,
  tool,
  selectedPattern,
  onToggleRun,
  onStepOnce,
  onReset,
  onRandomize,
  onSetRule,
  onSetSpeed,
  onSetTool,
  onSelectPattern,
  onResize,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {/* 헤더 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          🧬 CellVerse
        </h1>
        <p className="text-xs text-zinc-500 mt-1">세포 자동기 실험실</p>
      </div>

      {/* 통계 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-zinc-400">세대</div>
          <div className="text-right font-mono text-cyan-400">{generation.toLocaleString()}</div>
          <div className="text-zinc-400">생존 셀</div>
          <div className="text-right font-mono text-green-400">{population.toLocaleString()}</div>
          <div className="text-zinc-400">그리드</div>
          <div className="text-right font-mono text-zinc-300">{gridWidth}×{gridHeight}</div>
          <div className="text-zinc-400">속도</div>
          <div className="text-right font-mono text-zinc-300">{speed}ms</div>
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex gap-2">
          <button
            onClick={onToggleRun}
            className={`flex-1 rounded-lg px-3 py-2 font-medium transition-all ${
              isRunning
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isRunning ? '⏸ 일시정지' : '▶ 실행'}
          </button>
          <button
            onClick={onStepOnce}
            className="rounded-lg bg-white/10 px-3 py-2 text-zinc-300 hover:bg-white/20 transition-all"
            title="한 단계 진행"
          >
            ⏭
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onRandomize(0.3)}
            className="flex-1 rounded-lg bg-purple-500/20 px-3 py-1.5 text-purple-400 hover:bg-purple-500/30 transition-all text-xs"
          >
            🎲 무작위
          </button>
          <button
            onClick={onReset}
            className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-zinc-300 hover:bg-white/20 transition-all text-xs"
          >
            🗑 초기화
          </button>
        </div>
        <div className="mt-3">
          <label className="text-xs text-zinc-400 block mb-1">속도: {speed}ms</label>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={speed}
            onChange={(e) => onSetSpeed(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      {/* 규칙 선택 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">규칙</h3>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {PRESET_RULES.map((r) => (
            <button
              key={r.name}
              onClick={() => onSetRule(r)}
              className={`text-left rounded-lg px-3 py-2 transition-all text-xs ${
                rule.name === r.name
                  ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{RULE_DESCRIPTIONS_KR[r.name] || r.description.slice(0, 50)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 도구 선택 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">도구</h3>
        <div className="flex gap-1">
          {(['draw', 'erase', 'pattern'] as ToolMode[]).map((t) => (
            <button
              key={t}
              onClick={() => onSetTool(t)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs transition-all ${
                tool === t
                  ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                  : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              {t === 'draw' ? '✏️ 그리기' : t === 'erase' ? '🧹 지우기' : '📐 패턴'}
            </button>
          ))}
        </div>

        {/* 패턴 선택 */}
        {tool === 'pattern' && (
          <div className="mt-2 flex flex-col gap-1 max-h-32 overflow-y-auto">
            {Object.entries(PATTERNS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => onSelectPattern(selectedPattern === key ? null : key)}
                className={`text-left rounded-lg px-2 py-1.5 text-[11px] transition-all ${
                  selectedPattern === key
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                }`}
              >
                {p.name} — {PATTERN_DESCRIPTIONS_KR[key] || p.description.slice(0, 40)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 그리드 크기 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">그리드 크기</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={gridWidth}
            onChange={(e) => onResize(parseInt(e.target.value) || 50, gridHeight)}
            className="w-16 rounded bg-white/10 px-2 py-1 text-xs text-center text-zinc-300 border border-white/10 focus:outline-none focus:border-cyan-500/50"
          />
          <span className="text-zinc-500">×</span>
          <input
            type="number"
            value={gridHeight}
            onChange={(e) => onResize(gridWidth, parseInt(e.target.value) || 50)}
            className="w-16 rounded bg-white/10 px-2 py-1 text-xs text-center text-zinc-300 border border-white/10 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* 상태 범례 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">상태</h3>
        <div className="flex flex-wrap gap-2">
          {rule.cellColors.map((color, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border border-white/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-zinc-400">
                {i === 0 ? '죽음' : i === 1 ? '살음' : rule.category === 'wireworld' && i === 2 ? '머리' : rule.category === 'wireworld' && i === 3 ? '꼬리' : `상태 ${i}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
