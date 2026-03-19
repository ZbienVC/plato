import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../molecules/ProgressRing';

export function MacroDashboard({ targets, current }) {
  const remaining = Math.max(0, targets.calories - current.calories);
  const progress = targets.calories > 0 ? Math.min(1, current.calories / targets.calories) : 0;

  const macros = [
    { l: 'Protein', cur: current.protein, max: targets.protein, c: '#3B82F6', dot: 'bg-blue-400' },
    { l: 'Carbs', cur: current.carbs, max: targets.carbs, c: '#F59E0B', dot: 'bg-amber-400' },
    { l: 'Fat', cur: current.fat, max: targets.fat, c: '#A855F7', dot: 'bg-purple-400' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 pb-4 flex items-center gap-5">
        <ProgressRing progress={progress} size={86} strokeWidth={7} color="#14B8A6" bgColor="rgba(255,255,255,0.04)">
          <p className="text-[17px] font-black text-white tabular-nums leading-none">{current.calories}</p>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 mt-1">eaten</p>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-[26px] font-black text-white tabular-nums leading-none">{remaining}</p>
          <p className="text-[12px] text-slate-400 mt-1">calories remaining</p>
          <p className="text-[11px] text-slate-600">of {targets.calories} target</p>
        </div>
      </div>

      <div className="mx-5 border-t border-white/[0.06]" />

      <div className="p-5 pt-4 space-y-3">
        {macros.map(m => {
          const pct = m.max > 0 ? Math.min(1, m.cur / m.max) : 0;
          return (
            <div key={m.l}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                  <span className="text-[12px] text-slate-400">{m.l}</span>
                </div>
                <span className="text-[11px] tabular-nums text-slate-300 shrink-0">
                  <span className="font-bold">{m.cur}</span>
                  <span className="text-slate-600">/{m.max}g</span>
                </span>
              </div>
              <div className="h-[5px] rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ backgroundColor: m.c }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
