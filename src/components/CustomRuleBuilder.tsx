'use client';

import React, { useMemo } from 'react';

interface CustomRuleBuilderProps {
  onCreate: (name: string, birth: number[], survive: number[]) => void;
  onClose: () => void;
}

const PRESETS: Record<string, { b: number[]; s: number[]; label: string }> = {
  'Life (B3/S23)': { b: [3], s: [2, 3], label: '고전 라이프' },
  'HighLife (B36/S23)': { b: [3, 6], s: [2, 3], label: '하이라이프' },
  'Day&Night (B3678/S34678)': { b: [3, 6, 7, 8], s: [3, 4, 6, 7, 8], label: '낮과 밤' },
  'Seeds (B2/S)': { b: [2], s: [], label: '씨앗' },
  'Diamoeba (B35678/S5678)': { b: [3, 5, 6, 7, 8], s: [5, 6, 7, 8], label: '아메바' },
  'Maze (B3/S12345)': { b: [3], s: [1, 2, 3, 4, 5], label: '미로' },
  'Anneal (B4678/S35678)': { b: [4, 6, 7, 8], s: [3, 5, 6, 7, 8], label: '소결' },
  'Replicator (B1357/S1357)': { b: [1, 3, 5, 7], s: [1, 3, 5, 7], label: '복제기' },
};

export default function CustomRuleBuilder({ onCreate, onClose }: CustomRuleBuilderProps) {
  const [name, setName] = React.useState('나만의 규칙');
  const [birth, setBirth] = React.useState<boolean[]>(Array(9).fill(false));
  const [survive, setSurvive] = React.useState<boolean[]>(Array(9).fill(false));

  const birthStr = birth.map((v, i) => (v ? i : null)).filter(v => v !== null).join('');
  const surviveStr = survive.map((v, i) => (v ? i : null)).filter(v => v !== null).join('');

  const toggleCell = (arr: boolean[], index: number, setter: (v: boolean[]) => void) => {
    const newArr = [...arr];
    newArr[index] = !newArr[index];
    setter(newArr);
  };

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setBirth(Array(9).fill(false).map((_, i) => p.b.includes(i)));
    setSurvive(Array(9).fill(false).map((_, i) => p.s.includes(i)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">⚙️ 규칙 만들기</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">✕</button>
        </div>

        {/* 이름 */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 mb-4"
          placeholder="규칙 이름"
        />

        {/* 표기법 */}
        <div className="text-center font-mono text-lg text-cyan-400 mb-4 bg-white/5 rounded-lg py-2">
          B{birthStr || '∅'}/S{surviveStr || '∅'}
        </div>

        {/* 탄생 규칙 */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">
            탄생 — 이웃이 N명이면 셀이 태어남
          </label>
          <div className="flex gap-1.5 justify-center">
            {birth.map((v, i) => (
              <button
                key={i}
                onClick={() => toggleCell(birth, i, setBirth)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  v
                    ? 'bg-green-500/30 text-green-400 ring-1 ring-green-500/50'
                    : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* 생존 규칙 */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">
            생존 — 이웃이 N명이면 셀이 살아남음
          </label>
          <div className="flex gap-1.5 justify-center">
            {survive.map((v, i) => (
              <button
                key={i}
                onClick={() => toggleCell(survive, i, setSurvive)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  v
                    ? 'bg-blue-500/30 text-blue-400 ring-1 ring-blue-500/50'
                    : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* 빠른 프리셋 */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">빠른 프리셋</label>
          <div className="flex flex-wrap gap-1">
            {Object.entries(PRESETS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all"
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* 만들기 */}
        <button
          onClick={() => {
            const b = birth.map((v, i) => (v ? i : -1)).filter((v) => v >= 0);
            const s = survive.map((v, i) => (v ? i : -1)).filter((v) => v >= 0);
            onCreate(name, b, s);
            onClose();
          }}
          disabled={birthStr.length === 0 && surviveStr.length === 0}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-30"
        >
          만들기 & 적용
        </button>
      </div>
    </div>
  );
}
