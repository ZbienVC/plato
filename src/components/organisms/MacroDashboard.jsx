import React from 'react';
import { ProgressRing } from '../molecules/ProgressRing';

export function MacroDashboard({ targets, current, dark = true }) {
  const calorieProgress = targets.calories > 0 ? Math.min(1, current.calories / targets.calories) : 0;
  const remaining = Math.max(0, targets.calories - current.calories);

  const macros = [
    { label: 'Protein', cur: current.protein, max: targets.protein, color: '#3b82f6', dot: 'bg-blue-400' },
    { label: 'Carbs', cur: current.carbs, max: targets.carbs, color: '#f59e0b', dot: 'bg-amber-400' },
    { label: 'Fat', cur: current.fat, max: targets.fat, color: '#a855f7', dot: 'bg-purple-400' },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
    }`}>
      {/* Calorie section */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-5">
          <ProgressRing
            progress={calorieProgress}
            size={88}
            strokeWidth={7}
            color="#10d9a0"
            bgColor={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
          >
            <p className={`text-[18px] font-black leading-none tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
              {current.calories}
            </p>
            <p className={`text-[8px] font-semibold uppercase tracking-wider mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              eaten
            </p>
          </ProgressRing>

          <div className="flex-1 min-w-0">
            <p className={`text-[26px] font-black leading-none tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
              {remaining}
            </p>
            <p className={`text-[12px] mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              calories remaining
            </p>
            <p className={`text-[11px] ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
              of {targets.calories} daily target
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`mx-5 ${dark ? 'border-t border-white/[0.06]' : 'border-t border-slate-100'}`} />

      {/* Macro bars */}
      <div className="p-5 pt-4 space-y-3.5">
        {macros.map(m => {
          const pct = m.max > 0 ? Math.min(1, m.cur / m.max) : 0;
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                  <span className={`text-[12px] font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {m.label}
                  </span>
                </div>
                <span className={`text-[12px] tabular-nums ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="font-bold">{m.cur}g</span>
                  <span className={`${dark ? 'text-slate-600' : 'text-slate-400'}`}> / {m.max}g</span>
                </span>
              </div>
              <div className={`h-[6px] rounded-full overflow-hidden ${dark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct * 100}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
