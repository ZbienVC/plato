import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../molecules/ProgressRing';

export function MacroDashboard({ targets, current }) {
  const remaining = Math.max(0, targets.calories - current.calories);
  const progress = targets.calories > 0 ? Math.min(1, current.calories / targets.calories) : 0;

  const macros = [
    { l: 'Protein', cur: current.protein, max: targets.protein, c: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
    { l: 'Carbs', cur: current.carbs, max: targets.carbs, c: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { l: 'Fat', cur: current.fat, max: targets.fat, c: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div className="p-5 pb-4 flex items-center gap-5">
        <ProgressRing progress={progress} size={88} strokeWidth={7}
          color="#14B8A6" bgColor="rgba(255,255,255,0.06)">
          <p className="text-[18px] font-black text-white tabular-nums leading-none">{current.calories}</p>
          <p className="text-[8px] font-bold uppercase tracking-widest text-teal-400/60 mt-1">eaten</p>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-[28px] font-black text-white tabular-nums leading-none">{remaining}</p>
          <p className="text-[13px] text-slate-400 mt-1">calories remaining</p>
          <p className="text-[11px] text-slate-600 mt-0.5">of {targets.calories} daily target</p>
        </div>
      </div>

      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div className="p-5 pt-4 space-y-3.5">
        {macros.map(m => {
          const pct = m.max > 0 ? Math.min(1, m.cur / m.max) : 0;
          return (
            <div key={m.l}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.c }} />
                  <span className="text-[12px] font-medium text-slate-400">{m.l}</span>
                </div>
                <span className="text-[12px] tabular-nums shrink-0">
                  <span className="font-bold text-white">{m.cur}g</span>
                  <span className="text-slate-600 ml-0.5">/ {m.max}g</span>
                </span>
              </div>
              <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{
                    backgroundColor: m.c,
                    boxShadow: `0 0 8px ${m.c}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
