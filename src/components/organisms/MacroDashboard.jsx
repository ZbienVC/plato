import React from 'react';
import { ProgressRing } from '../molecules/ProgressRing';

/**
 * Macro Dashboard — calorie ring + macro bars
 * Clean, no emojis, premium feel
 */
export function MacroDashboard({ targets, current, dark = true }) {
  const calorieProgress = targets.calories > 0 ? Math.min(1, current.calories / targets.calories) : 0;
  const remaining = Math.max(0, targets.calories - current.calories);

  const macros = [
    { label: 'Protein', current: current.protein, target: targets.protein, color: '#3b82f6', bgColor: 'bg-blue-500' },
    { label: 'Carbs', current: current.carbs, target: targets.carbs, color: '#f59e0b', bgColor: 'bg-amber-500' },
    { label: 'Fat', current: current.fat, target: targets.fat, color: '#a855f7', bgColor: 'bg-purple-500' },
  ];

  return (
    <div className={`p-5 rounded-2xl border ${
      dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
    }`}>
      {/* Top row: ring + remaining */}
      <div className="flex items-center gap-5 mb-5">
        <ProgressRing
          progress={calorieProgress}
          size={90}
          strokeWidth={8}
          color="#10d9a0"
          bgColor={dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
        >
          <div className="text-center">
            <p className={`text-[20px] font-black leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
              {current.calories}
            </p>
            <p className={`text-[9px] font-semibold uppercase tracking-wider mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              eaten
            </p>
          </div>
        </ProgressRing>

        <div className="flex-1">
          <p className={`text-[28px] font-black leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
            {remaining}
          </p>
          <p className={`text-[12px] font-medium mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            calories remaining
          </p>
          <p className={`text-[11px] mt-0.5 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
            of {targets.calories} daily goal
          </p>
        </div>
      </div>

      {/* Macro bars */}
      <div className="space-y-3">
        {macros.map(m => {
          const progress = m.target > 0 ? Math.min(1, m.current / m.target) : 0;
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${m.bgColor}`} />
                  <span className={`text-[12px] font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {m.label}
                  </span>
                </div>
                <span className={`text-[12px] font-bold tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {m.current}g <span className={`font-normal ${dark ? 'text-slate-500' : 'text-slate-400'}`}>/ {m.target}g</span>
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress * 100}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
