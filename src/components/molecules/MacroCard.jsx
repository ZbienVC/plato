import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

/**
 * Single macro progress card with animated fill bar
 * Tappable to expand detail view
 */
export function MacroCard({
  label,
  current = 0,
  target = 0,
  color,
  unit = 'g',
  breakdown = [], // [{ label: 'Breakfast', value: 28 }, ...]
  suggestion,
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const progress = target > 0 ? Math.min(1, current / target) : 0;
  const remaining = Math.max(0, target - current);

  useEffect(() => {
    // Animate bar width
    const timer = setTimeout(() => setAnimatedWidth(progress * 100), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`flex-1 cursor-pointer transition-all duration-200 ${className}`}
    >
      {/* Compact view */}
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          {label}
        </p>
        <p className="text-lg font-black tabular-nums" style={{ color }}>
          {Math.round(current)}{unit}
        </p>
        <p className="text-[10px] text-slate-500 mb-2">
          of {target}{unit}
        </p>
        {/* Progress bar */}
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${animatedWidth}%`,
              background: color,
              boxShadow: `0 0 8px ${color}40`,
            }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          {remaining}{unit} left
        </p>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fadeIn">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">{item.label}</span>
              <div className="flex items-center gap-2 flex-1 ml-3">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${target > 0 ? (item.value / target) * 100 : 0}%`,
                      background: color,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-white w-8 text-right">
                  {item.value}{unit}
                </span>
              </div>
            </div>
          ))}
          {suggestion && (
            <p className="text-xs text-emerald-400 mt-2">💡 {suggestion}</p>
          )}
        </div>
      )}
    </div>
  );
}
